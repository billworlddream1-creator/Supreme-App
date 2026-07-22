import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  MessageCircle, 
  Heart, 
  Info, 
  AtSign, 
  Check, 
  X,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useNotification, Notification, NotificationType } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'message': return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'mention': return <AtSign className="w-4 h-4 text-orange-500" />;
    case 'activity': return <Heart className="w-4 h-4 text-pink-500" />;
    case 'system': return <Info className="w-4 h-4 text-[var(--color-supreme-gold)]" />;
    case 'alert': return <ShieldAlert className="w-4 h-4 text-red-500" />;
  }
};

const NotificationItem = React.memo(({ 
  notification, 
  onClick, 
  onDelete 
}: { 
  notification: Notification, 
  onClick: (n: Notification) => void, 
  onDelete: (e: React.MouseEvent, id: string) => void 
}) => (
  <div 
    onClick={() => onClick(notification)}
    className={clsx(
      "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative group",
      !notification.read && "bg-blue-50/30"
    )}
  >
    <div className="flex gap-3">
      <div className="relative shrink-0">
        {notification.avatar ? (
          <img src={notification.avatar} alt="" loading="lazy" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center border border-gray-100",
            notification.type === 'system' ? "bg-[var(--color-supreme-gold)]/10" : "bg-gray-100"
          )}>
            {getIcon(notification.type)}
          </div>
        )}
        {/* Type Badge */}
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
          {getIcon(notification.type)}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className={clsx("text-sm font-bold truncate pr-6", !notification.read ? "text-[var(--color-supreme-text)]" : "text-gray-600")}>
            {notification.title}
          </h4>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{notification.time}</span>
        </div>
        <p className={clsx("text-xs line-clamp-2", !notification.read ? "text-gray-800 font-medium" : "text-gray-500")}>
          {notification.description}
        </p>
      </div>
    </div>

    {/* Unread Indicator */}
    {!notification.read && (
      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
    )}

    {/* Delete Button (Hover) */}
    <button 
      onClick={(e) => onDelete(e, notification.id)}
      className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-white shadow-md rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
));

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const [filter, setFilter] = useState<'all' | 'mentions' | 'system'>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = useMemo(() => notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'mentions') return n.type === 'mention' || n.type === 'message';
    if (filter === 'system') return n.type === 'system' || n.type === 'alert';
    return true;
  }), [notifications, filter]);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => {
          if (!user) {
            navigate('/login');
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[var(--color-supreme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]"
        aria-label={isOpen ? "Close notifications" : "Open notifications"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-white text-[10px] font-bold items-center justify-center border-2 border-white shadow-sm" aria-label={`${unreadCount} unread notifications`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-[var(--color-supreme-text)]">Notifications</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-[var(--color-supreme-gold)] hover:text-[var(--color-supreme-text)] transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/settings');
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full text-gray-400"
                  title="App Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-1 border-b border-gray-100">
              {(['all', 'mentions', 'system'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors",
                    filter === f 
                      ? "bg-[var(--color-supreme-text)] text-white" 
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div 
              className="max-h-[400px] overflow-y-auto custom-scrollbar"
              role="list"
              aria-label="Notifications list"
            >
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div role="listitem" key={notification.id}>
                    <NotificationItem 
                      notification={notification} 
                      onClick={handleNotificationClick} 
                      onDelete={handleDeleteNotification} 
                    />
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <button className="text-xs font-bold text-gray-500 hover:text-[var(--color-supreme-text)] transition-colors">
                View All History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
