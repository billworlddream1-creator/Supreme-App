import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  increment, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export type ActivityType = 'post' | 'comment' | 'like' | 'share';

export interface WeeklyEngagement {
  userId: string;
  weekId: string;
  posts: number;
  comments: number;
  likes: number;
  shares: number;
  score: number;
  lastUpdated: Timestamp;
}

export function getWeekId(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

export const t10Service = {
  async trackActivity(userId: string, type: ActivityType) {
    const weekId = getWeekId();
    const engagementId = `${userId}_${weekId}`;
    const engagementRef = doc(db, 'weekly_engagement', engagementId);

    const scoreMap: Record<ActivityType, number> = {
      post: 100,
      comment: 20,
      like: 5,
      share: 50
    };

    try {
      const docSnap = await getDoc(engagementRef);
      if (docSnap.exists()) {
        await updateDoc(engagementRef, {
          [type + 's']: increment(1),
          score: increment(scoreMap[type]),
          lastUpdated: Timestamp.now()
        });
      } else {
        await setDoc(engagementRef, {
          userId,
          weekId,
          posts: type === 'post' ? 1 : 0,
          comments: type === 'comment' ? 1 : 0,
          likes: type === 'like' ? 1 : 0,
          shares: type === 'share' ? 1 : 0,
          score: scoreMap[type],
          lastUpdated: Timestamp.now()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `weekly_engagement/${engagementId}`);
    }
  },

  async getTopEngagers(weekId: string = getWeekId()) {
    try {
      const q = query(
        collection(db, 'weekly_engagement'),
        where('weekId', '==', weekId)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as WeeklyEngagement));
      docs.sort((a, b) => (b.score || 0) - (a.score || 0));
      return docs.slice(0, 10);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'weekly_engagement');
      return [];
    }
  },

  async distributeWeeklyRewards() {
    // Get previous week ID
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weekId = getWeekId(lastWeek);

    const distRef = doc(db, 'reward_distributions', weekId);

    try {
      const distSnap = await getDoc(distRef);
      if (distSnap.exists()) {
        return { success: false, message: 'Rewards already distributed for this week.' };
      }

      const topEngagers = await this.getTopEngagers(weekId);
      if (topEngagers.length === 0) {
        return { success: false, message: 'No engagers found for the previous week.' };
      }

      const winners = topEngagers.map(e => e.userId);
      const amountPerWinner = 1.00;

      // Use a transaction to ensure atomic updates
      await runTransaction(db, async (transaction) => {
        // 1. Mark as distributed
        transaction.set(distRef, {
          weekId,
          distributedAt: Timestamp.now(),
          winners,
          amountPerWinner
        });

        // 2. Update each winner's balance and add transaction record
        for (const userId of winners) {
          const userRef = doc(db, 'users', userId);
          const userSnap = await transaction.get(userRef);
          
          if (userSnap.exists()) {
            const currentBalance = userSnap.data().balance || 0;
            transaction.update(userRef, {
              balance: currentBalance + amountPerWinner
            });

            const txRef = doc(collection(db, 'transactions'));
            transaction.set(txRef, {
              userId,
              amount: amountPerWinner,
              type: 'receive',
              description: `T10 Weekly Engagement Reward (${weekId})`,
              category: 'Reward',
              status: 'completed',
              date: Timestamp.now()
            });
          }
        }
      });

      return { success: true, winnersCount: winners.length };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reward_distributions');
      return { success: false, error };
    }
  }
};
