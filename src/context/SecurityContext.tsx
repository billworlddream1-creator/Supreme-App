import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SecurityEvent {
  id: string;
  type: 'brute-force' | 'sql-injection' | 'xss' | 'unauthorized-access' | 'malicious-bot';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  manner: string;
  timestamp: string;
  status: 'active' | 'blocked' | 'monitored';
}

interface SecurityContextType {
  events: SecurityEvent[];
  blockedIps: string[];
  blockIp: (ip: string) => void;
  unblockIp: (ip: string) => void;
  addEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [blockedIps, setBlockedIps] = useState<string[]>([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem('security_events');
    const storedBlocked = localStorage.getItem('blocked_ips');

    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents));
      } catch (e) {}
    } else {
      // Mock initial data
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'brute-force',
          severity: 'high',
          ip: '192.168.1.105',
          location: { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
          manner: 'Repeated failed login attempts on admin panel',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'blocked'
        },
        {
          id: '2',
          type: 'sql-injection',
          severity: 'critical',
          ip: '45.33.22.11',
          location: { city: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074 },
          manner: 'Malicious payload detected in search query',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          status: 'blocked'
        },
        {
          id: '3',
          type: 'unauthorized-access',
          severity: 'medium',
          ip: '103.44.55.66',
          location: { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
          manner: 'Attempted access to /api/admin without token',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: 'monitored'
        }
      ];
      setEvents(mockEvents);
      setBlockedIps(['192.168.1.105', '45.33.22.11']);
    }

    if (storedBlocked) {
      try {
        setBlockedIps(JSON.parse(storedBlocked));
      } catch (e) {}
    }
  }, []);

  const blockIp = (ip: string) => {
    if (!blockedIps.includes(ip)) {
      const updated = [...blockedIps, ip];
      setBlockedIps(updated);
      localStorage.setItem('blocked_ips', JSON.stringify(updated));
      
      // Update event status
      const updatedEvents = events.map(e => e.ip === ip ? { ...e, status: 'blocked' as const } : e);
      setEvents(updatedEvents);
      localStorage.setItem('security_events', JSON.stringify(updatedEvents));
    }
  };

  const unblockIp = (ip: string) => {
    const updated = blockedIps.filter(i => i !== ip);
    setBlockedIps(updated);
    localStorage.setItem('blocked_ips', JSON.stringify(updated));
    
    // Update event status
    const updatedEvents = events.map(e => e.ip === ip ? { ...e, status: 'monitored' as const } : e);
    setEvents(updatedEvents);
    localStorage.setItem('security_events', JSON.stringify(updatedEvents));
  };

  const addEvent = (eventData: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const newEvent: SecurityEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...eventData
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    localStorage.setItem('security_events', JSON.stringify(updated));
  };

  return (
    <SecurityContext.Provider value={{ events, blockedIps, blockIp, unblockIp, addEvent }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
