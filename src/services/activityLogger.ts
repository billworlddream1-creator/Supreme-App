import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  Timestamp, 
  doc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

export type ActivityCategory = 'system_events' | 'user_roles' | 'feature_access' | 'security_alerts' | 'financial' | 'general';
export type ActivitySeverity = 'low' | 'medium' | 'high' | 'critical';
export type ActivityStatus = 'success' | 'warning' | 'error' | 'info';

export interface ActivityLog {
  id: string;
  category: ActivityCategory;
  action: string;
  details: string;
  targetUser?: string;
  targetUserId?: string;
  adminEmail: string;
  severity: ActivitySeverity;
  status: ActivityStatus;
  timestamp: Date | Timestamp | any;
  ip?: string;
  resolved?: boolean;
}

const COLLECTION_NAME = 'recent_activities';

export const defaultSeedActivities: Omit<ActivityLog, 'id'>[] = [
  {
    category: 'user_roles',
    action: 'Mini-Admin Permissions Assigned',
    details: 'Granted "user-management" mini-admin role to Sarah Chen (sarah.chen@gmt.com) with user suspension and status audit rights.',
    targetUser: 'Sarah Chen (sarah.chen@gmt.com)',
    targetUserId: 'usr-sarah-782',
    adminEmail: 'billworlddream1@gmail.com',
    severity: 'medium',
    status: 'success',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 5)), // 5 mins ago
    ip: '12.245.92.1',
    resolved: true
  },
  {
    category: 'feature_access',
    action: 'Feature Access Locked',
    details: 'Restricted feature module "hardware-mining" for Marcus Wright (marcus.wright@gmt.com) following excessive API rate violations.',
    targetUser: 'Marcus Wright (marcus.wright@gmt.com)',
    targetUserId: 'usr-marcus-910',
    adminEmail: 'billworlddream1@gmail.com',
    severity: 'high',
    status: 'warning',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 18)), // 18 mins ago
    ip: '12.245.92.1',
    resolved: false
  },
  {
    category: 'system_events',
    action: 'Platform Settings Updated',
    details: 'Adjusted platform fee percentage to 2.0% and set global forex minimum withdrawal to $25.00.',
    adminEmail: 'billworlddream1@gmail.com',
    severity: 'medium',
    status: 'info',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 45)), // 45 mins ago
    ip: '12.245.92.1',
    resolved: true
  },
  {
    category: 'security_alerts',
    action: 'Brute-Force Intrusion Mitigated',
    details: 'Automated WAF blocked 14 sequential failed authentication requests originating from IP 198.51.100.4 targeting support portal.',
    adminEmail: 'security-gateway@gmt.com',
    severity: 'critical',
    status: 'error',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 120)), // 2h ago
    ip: '198.51.100.4',
    resolved: false
  },
  {
    category: 'user_roles',
    action: 'User Account Suspended',
    details: 'Suspended account darko_99@gmail.com due to confirmed market policy advertisement violation.',
    targetUser: 'Darko Vance (darko_99@gmail.com)',
    targetUserId: 'usr-darko-331',
    adminEmail: 'billworlddream1@gmail.com',
    severity: 'high',
    status: 'error',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 240)), // 4h ago
    ip: '12.245.92.1',
    resolved: true
  },
  {
    category: 'feature_access',
    action: 'Supreme GMT Module Restored',
    details: 'Re-enabled "supreme-gmt" time synchronization and messaging feature for Alex Rivera after appeal approval.',
    targetUser: 'Alex Rivera (alex.rivera@gmt.com)',
    targetUserId: 'usr-alex-104',
    adminEmail: 'billworlddream1@gmail.com',
    severity: 'low',
    status: 'success',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 360)), // 6h ago
    ip: '12.245.92.1',
    resolved: true
  },
  {
    category: 'system_events',
    action: 'Database Seeding Operation Executed',
    details: 'Admin triggered synthetic database seeding operation creating 5,000 user profiles and dealer nodes.',
    adminEmail: 'billworlddream1@gmail.com',
    severity: 'low',
    status: 'info',
    timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 720)), // 12h ago
    ip: '12.245.92.1',
    resolved: true
  }
];

export async function logRecentActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'> & { timestamp?: any }) {
  try {
    const payload = {
      ...activity,
      timestamp: activity.timestamp || Timestamp.now(),
      ip: activity.ip || '127.0.0.1',
      resolved: activity.resolved ?? (activity.severity === 'low' || activity.status === 'success')
    };

    // Add to recent_activities collection
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

    // Also write to admin_audit_logs for audit consistency
    try {
      await addDoc(collection(db, 'admin_audit_logs'), {
        category: activity.category === 'user_roles' || activity.category === 'feature_access' ? 'security' : activity.category === 'system_events' ? 'system' : 'plan',
        action: activity.action,
        details: activity.details + (activity.targetUser ? ` Target: ${activity.targetUser}` : ''),
        adminEmail: activity.adminEmail,
        timestamp: payload.timestamp,
        severity: activity.severity,
        ip: payload.ip,
        resolved: payload.resolved
      });
    } catch (e) {
      console.warn('Dual audit log write failed:', e);
    }

    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('Error logging recent activity:', err);
    return null;
  }
}

export function subscribeToRecentActivities(onUpdate: (logs: ActivityLog[]) => void, limitCount = 50) {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, limit(limitCount));

  const fallbackLogs: ActivityLog[] = defaultSeedActivities.map((item, idx) => ({
    id: `seed-${idx}`,
    ...item
  }));

  return onSnapshot(q, (snapshot) => {
    try {
      if (!snapshot || snapshot.empty) {
        onUpdate(fallbackLogs);
        return;
      }

      const fetched: ActivityLog[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          category: data.category || 'system_events',
          action: data.action || 'System Action',
          details: data.details || '',
          targetUser: data.targetUser || '',
          targetUserId: data.targetUserId || '',
          adminEmail: data.adminEmail || 'admin@gmt.com',
          severity: data.severity || 'low',
          status: data.status || 'info',
          timestamp: data.timestamp,
          ip: data.ip || '127.0.0.1',
          resolved: data.resolved ?? false
        });
      });

      // Sort in memory by timestamp descending
      fetched.sort((a, b) => {
        const tA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
        const tB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
        return tB - tA;
      });

      onUpdate(fetched);
    } catch (err) {
      console.warn('Error parsing activity logs snapshot:', err);
      onUpdate(fallbackLogs);
    }
  }, (error) => {
    console.warn('Recent activities Firestore listener notice:', error);
    onUpdate(fallbackLogs);
  });
}

export async function seedActivities() {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const existing = await getDocs(colRef);
    if (!existing.empty) return;

    for (const item of defaultSeedActivities) {
      await addDoc(colRef, item);
    }
  } catch (err) {
    console.error('Error seeding default activities:', err);
  }
}

export async function deleteActivityLog(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (err) {
    console.error('Error deleting activity log:', err);
    throw err;
  }
}

export async function toggleActivityResolved(id: string, currentResolved: boolean) {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      resolved: !currentResolved
    });
  } catch (err) {
    console.error('Error updating activity log resolution:', err);
    throw err;
  }
}
