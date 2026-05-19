import { db, auth, collection, addDoc, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { UAParser } from 'ua-parser-js';

export interface ConnectivityLog {
  userId: string;
  ip: string;
  country: string;
  city: string;
  networkType: string;
  networkStrength: string;
  browser: string;
  browserVersion: string;
  device: string;
  os: string;
  timestamp: any;
  userAgent: string;
}

const STORAGE_KEY = 'supreme_last_connectivity_log';

export async function logConnectivity() {
  const user = auth.currentUser;
  if (!user) return;

  // Anti-flooding: Only log once every 15 minutes per session or if IP changes
  const lastLog = localStorage.getItem(STORAGE_KEY);
  if (lastLog) {
    const { timestamp } = JSON.parse(lastLog);
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - timestamp < fifteenMinutes) {
      return;
    }
  }

  try {
    // 1. Get IP and Location info from a public API
    const geoResponse = await fetch('https://ipapi.co/json/');
    const geoData = await geoResponse.json();

    // 2. Get Browser and Device Info
    const parser = new UAParser();
    const result = parser.getResult();

    // 3. Get Network Info (partial support, fallback to 'unknown')
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const networkType = conn?.type || 'unknown';
    const networkStrength = conn?.effectiveType || 'unknown';

    const logData = {
      userId: user.uid,
      ip: geoData.ip || 'unknown',
      country: geoData.country_name || geoData.country || 'unknown',
      city: geoData.city || 'unknown',
      networkType,
      networkStrength,
      browser: result.browser.name || 'unknown',
      browserVersion: result.browser.version || 'unknown',
      device: result.device.model || result.device.type || 'Desktop',
      os: `${result.os.name || ''} ${result.os.version || ''}`.trim() || 'unknown',
      timestamp: Timestamp.now(),
      userAgent: navigator.userAgent
    };

    const path = 'connectivity_logs';
    await addDoc(collection(db, path), logData);
    
    // Update storage to prevent redundant logs
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      timestamp: Date.now(),
      ip: logData.ip
    }));

    console.log('[Connectivity] Connection log recorded for account security.');
  } catch (error) {
    // We don't throw here to avoid disrupting user experience if a third party geo API fails
    console.warn('[Connectivity] Failed to record connection analytics:', error);
  }
}
