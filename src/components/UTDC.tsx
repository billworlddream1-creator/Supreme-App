import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Send, AlertCircle, CheckCircle2, ShieldAlert, Lock as LockIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const COMPLAINT_CATEGORIES = [
  'General Inquiry',
  'Bug Report',
  'Harassment / Abuse',
  'Billing Issue',
  'Feature Request',
  'Other'
];

export default function UTDC() {
  const { user } = useAuth();
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if user has been on the platform for 3 months (approx 90 days)
  const accessCheck = useMemo(() => {
    if (!user?.createdAt) return { hasAccess: false, daysRemaining: 90 };
    
    // Handle both Firestore Timestamp and JS Date
    const creationDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
    const now = new Date();
    
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const monthsRequired = 3;
    const daysRequired = monthsRequired * 30; // 90 days
    
    return {
      hasAccess: diffDays >= daysRequired || user.role === 'admin' || user.role === 'mini-admin',
      daysRemaining: Math.max(0, daysRequired - diffDays),
      joiningDate: creationDate.toLocaleDateString()
    };
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your complaint message.');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending to the hidden email: billworlddream1@gmail.com
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Your complaint has been forwarded to site management.');
      
      // Reset form after a delay
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        setCategory(COMPLAINT_CATEGORIES[0]);
      }, 3000);
    }, 1500);
  };

  if (!accessCheck.hasAccess) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center space-y-6">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockIcon className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">UTDC Access Restricted</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Supreme UTDC can only be accessed by elite members who have been on the platform for <span className="text-gray-900 font-bold">3 months</span> or more.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 max-w-sm mx-auto">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <Clock className="w-4 h-4" /> Wait Duration
            </div>
            <div className="text-4xl font-display font-bold text-gray-900">
              {accessCheck.daysRemaining} <span className="text-lg text-gray-400">Days</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Joined: {accessCheck.joiningDate}</p>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            This security measure ensures that only established members can access our direct administrative complaint channel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-[var(--color-supreme-gold)] font-display font-bold text-2xl tracking-widest">SUP</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              UTDC
            </h2>
            <p className="text-gray-500 text-sm">User To Admin Complaint</p>
          </div>
        </div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center space-y-4"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Complaint Submitted</h3>
            <p className="text-gray-500 max-w-md">
              Thank you for reaching out. Your message has been securely forwarded to the site management team.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 leading-relaxed">
                Use this form to tender your complaint directly to the site management. 
                All submissions are strictly confidential and are forwarded securely to our administration team.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Complaint Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent transition-all outline-none"
              >
                {COMPLAINT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent transition-all outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Complaint
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
