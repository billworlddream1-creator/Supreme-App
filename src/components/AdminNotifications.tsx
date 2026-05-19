import React, { useState } from 'react';
import { Send, Bell, Info, ShieldAlert, Heart, MessageCircle, AtSign, Check } from 'lucide-react';
import { useNotification, NotificationType } from '../context/NotificationContext';

export default function AdminNotifications() {
  const { addNotification } = useNotification();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<NotificationType>('system');
  const [link, setLink] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addNotification({
      title,
      description,
      type,
      link: link || undefined,
    });

    setSuccess(true);
    setTitle('');
    setDescription('');
    setLink('');
    
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-amber-500" />
        <div>
          <h2 className="text-2xl font-bold text-amber-500">Inject Notifications</h2>
          <p className="text-red-200/60">Send messages directly to the General Notification area.</p>
        </div>
      </div>

      <div className="bg-red-900/30 p-6 rounded-2xl border border-amber-500/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-amber-500/80 mb-1">Notification Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., System Update, Special Announcement"
              className="w-full bg-black/50 border border-red-800/30 rounded-xl px-4 py-3 text-amber-100 placeholder-red-900/50 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-500/80 mb-1">Message Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter the notification message..."
              rows={4}
              className="w-full bg-black/50 border border-red-800/30 rounded-xl px-4 py-3 text-amber-100 placeholder-red-900/50 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-amber-500/80 mb-1">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full bg-black/50 border border-red-800/30 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-500/50 appearance-none"
              >
                <option value="system">System (Gold Info)</option>
                <option value="alert">Alert (Red Shield)</option>
                <option value="message">Message (Blue Chat)</option>
                <option value="activity">Activity (Pink Heart)</option>
                <option value="mention">Mention (Orange At)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-500/80 mb-1">Link (Optional)</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g., /network, /profile"
                className="w-full bg-black/50 border border-red-800/30 rounded-xl px-4 py-3 text-amber-100 placeholder-red-900/50 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {success ? (
              <span className="text-green-400 font-bold flex items-center gap-2">
                <Check className="w-5 h-5" /> Notification Sent!
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" /> Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
