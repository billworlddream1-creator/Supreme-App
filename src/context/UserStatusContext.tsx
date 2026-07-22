import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  isFeatured: boolean;
  statusText?: string;
}

interface UserStatusContextType {
  statuses: Record<string, UserStatus>;
  getUserStatus: (userId: string) => UserStatus;
  toggleOnline: (userId: string) => void;
  toggleFeatured: (userId: string) => void;
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export function UserStatusProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>({
    n1: { userId: 'n1', isOnline: true, isFeatured: true, statusText: 'Online' },
    n2: { userId: 'n2', isOnline: true, isFeatured: false, statusText: 'Online' },
    n3: { userId: 'n3', isOnline: false, isFeatured: true, statusText: 'Offline' },
    n4: { userId: 'n4', isOnline: true, isFeatured: false, statusText: 'Online' },
    n5: { userId: 'n5', isOnline: false, isFeatured: false, statusText: 'Offline' },
    n6: { userId: 'n6', isOnline: true, isFeatured: true, statusText: 'Online' },
  });

  const getUserStatus = (userId: string): UserStatus => {
    return statuses[userId] || { userId, isOnline: false, isFeatured: false, statusText: 'Offline' };
  };

  const toggleOnline = (userId: string) => {
    setStatuses(prev => {
      const current = prev[userId] || { userId, isOnline: false, isFeatured: false };
      return {
        ...prev,
        [userId]: {
          ...current,
          isOnline: !current.isOnline,
          statusText: !current.isOnline ? 'Online' : 'Offline'
        }
      };
    });
  };

  const toggleFeatured = (userId: string) => {
    setStatuses(prev => {
      const current = prev[userId] || { userId, isOnline: false, isFeatured: false };
      return {
        ...prev,
        [userId]: {
          ...current,
          isFeatured: !current.isFeatured
        }
      };
    });
  };

  return (
    <UserStatusContext.Provider value={{ statuses, getUserStatus, toggleOnline, toggleFeatured }}>
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatus() {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
}
