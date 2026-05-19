import React, { createContext, useContext, useState, useEffect } from 'react';

export type NotificationType = 'message' | 'mention' | 'activity' | 'system' | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
  avatar?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Elon Musk',
    description: 'Sent you a direct message: "Are we still on for the launch?"',
    time: '2m ago',
    read: false,
    link: '/chat',
    avatar: 'https://picsum.photos/seed/elon/50'
  },
  {
    id: '2',
    type: 'system',
    title: 'System Update',
    description: 'Supreme Platform v2.0 is now live with enhanced AI tools.',
    time: '1h ago',
    read: false,
    link: '/ai-tools'
  },
  {
    id: '3',
    type: 'mention',
    title: 'Sarah Connor',
    description: 'Mentioned you in a post: "@John check this out!"',
    time: '3h ago',
    read: true,
    link: '/network',
    avatar: 'https://picsum.photos/seed/sarah/50'
  },
  {
    id: '4',
    type: 'activity',
    title: 'New Follower',
    description: 'Tony Stark started following you.',
    time: '5h ago',
    read: true,
    link: '/supreme-users',
    avatar: 'https://picsum.photos/seed/stark/50'
  },
  {
    id: '5',
    type: 'alert',
    title: 'Security Alert',
    description: 'New login detected from Dubai, UAE.',
    time: '1d ago',
    read: true,
    link: '/profile'
  }
];

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('supreme_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('supreme_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
