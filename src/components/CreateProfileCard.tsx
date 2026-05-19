import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { X, Upload, Save, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import ProfileCard, { ProfileCardData } from './ProfileCard';

interface CreateProfileCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProfileCard({ isOpen, onClose }: CreateProfileCardProps) {
  const { user, updateUser } = useAuth();
  
  // Load existing data from localStorage or user context
  const existingCardStr = localStorage.getItem(`profile_card_${user?.id}`);
  const existingCard: Partial<ProfileCardData> = existingCardStr ? JSON.parse(existingCardStr) : {};

  const [formData, setFormData] = useState<ProfileCardData>({
    id: existingCard.id || `PC-${Date.now()}`,
    userId: user?.id || '',
    userName: user?.name || '',
    avatar: existingCard.avatar || user?.avatar || '',
    description: existingCard.description || '',
    mobileNumber: existingCard.mobileNumber || '',
    externalLinks: existingCard.externalLinks || ['', ''],
    chatId: existingCard.chatId || user?.chatId || '',
    networkId: existingCard.networkId || user?.networkId || '',
    marketId: existingCard.marketId || user?.marketId || '',
    mediaId: existingCard.mediaId || user?.mediaId || '',
    vibesId: existingCard.vibesId || user?.vibesId || '',
    adsId: existingCard.adsId || user?.adsId || '',
    goodsImage: existingCard.goodsImage || '',
    goodsPrice: existingCard.goodsPrice || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSubscription, setShowSubscription] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user has active subscription
  const hasActiveSub = () => {
    if (!user?.profileCardSub) return false;
    return new Date(user.profileCardSub.expiresAt) > new Date();
  };

  const handleSubscribe = (plan: 'monthly' | '6months' | 'yearly', months: number) => {
    setIsProcessing(true);
    // Simulate Stripe payment processing
    setTimeout(() => {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);
      
      updateUser({
        profileCardSub: {
          plan,
          expiresAt: expiresAt.toISOString()
        }
      });
      setIsProcessing(false);
      setShowSubscription(false);
      toast.success('Payment successful! Your Profile Card subscription is now active.');
    }, 1500);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.externalLinks];
    newLinks[index] = value;
    setFormData({ ...formData, externalLinks: newLinks });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.chatId) newErrors.chatId = 'Required';
    if (!formData.networkId) newErrors.networkId = 'Required';
    if (!formData.marketId) newErrors.marketId = 'Required';
    if (!formData.mediaId) newErrors.mediaId = 'Required';
    if (!formData.vibesId) newErrors.vibesId = 'Required';
    if (!formData.adsId) newErrors.adsId = 'Required';
    
    const wordCount = formData.description.trim().split(/\s+/).length;
    if (wordCount > 150) newErrors.description = 'Max 150 words allowed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      localStorage.setItem(`profile_card_${user?.id}`, JSON.stringify(formData));
      
      // Also update user context with the IDs if they changed
      updateUser({
        chatId: formData.chatId,
        networkId: formData.networkId,
        marketId: formData.marketId,
        mediaId: formData.mediaId,
        vibesId: formData.vibesId,
        adsId: formData.adsId,
        avatar: formData.avatar
      });
      
      toast.success('Profile Card saved successfully!');
      onClose();
    }
  };

  if (!hasActiveSub() || showSubscription) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-2xl font-display font-bold text-gray-900">Profile Card Subscription</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[var(--color-supreme-gold)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-[var(--color-supreme-gold)]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Your Supreme Profile Card</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Get a premium Profile Card that appears randomly in the dashboard area every 10 minutes. Update it as many times as you want during your subscription period!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Monthly */}
              <div className="p-6 rounded-2xl border-2 border-gray-100 hover:border-[var(--color-supreme-gold)] transition-colors flex flex-col items-center cursor-pointer" onClick={() => handleSubscribe('monthly', 1)}>
                <h4 className="font-bold text-gray-900 mb-2">Monthly</h4>
                <p className="text-3xl font-display font-bold text-[var(--color-supreme-gold)] mb-4">$2.80</p>
                <button disabled={isProcessing} className="w-full py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {isProcessing ? 'Processing...' : 'Select'}
                </button>
              </div>
              
              {/* 6 Months */}
              <div className="p-6 rounded-2xl border-2 border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/5 relative flex flex-col items-center cursor-pointer" onClick={() => handleSubscribe('6months', 6)}>
                <div className="absolute -top-3 bg-[var(--color-supreme-gold)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Popular</div>
                <h4 className="font-bold text-gray-900 mb-2">6 Months</h4>
                <p className="text-3xl font-display font-bold text-[var(--color-supreme-gold)] mb-4">$5.80</p>
                <button disabled={isProcessing} className="w-full py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-50">
                  {isProcessing ? 'Processing...' : 'Select'}
                </button>
              </div>

              {/* Yearly */}
              <div className="p-6 rounded-2xl border-2 border-gray-100 hover:border-[var(--color-supreme-gold)] transition-colors flex flex-col items-center cursor-pointer" onClick={() => handleSubscribe('yearly', 12)}>
                <h4 className="font-bold text-gray-900 mb-2">Yearly</h4>
                <p className="text-3xl font-display font-bold text-[var(--color-supreme-gold)] mb-4">$10.80</p>
                <button disabled={isProcessing} className="w-full py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {isProcessing ? 'Processing...' : 'Select'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4" />
              Payments are securely processed via Stripe.
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <h2 className="text-2xl font-display font-bold text-gray-900">Create Profile Card</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Profile Image URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.avatar}
                  onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Username (Auto)</label>
              <input 
                type="text" 
                value={formData.userName}
                disabled
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Motivational Word / Business Description (Max 150 words)</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none h-24 resize-none"
                placeholder="Describe yourself or your business..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                <input 
                  type="text" 
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">External Link 1</label>
                <input 
                  type="text" 
                  value={formData.externalLinks[0] || ''}
                  onChange={(e) => handleLinkChange(0, e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">External Link 2</label>
                <input 
                  type="text" 
                  value={formData.externalLinks[1] || ''}
                  onChange={(e) => handleLinkChange(1, e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Goods & Services (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={formData.goodsImage || ''}
                    onChange={(e) => setFormData({...formData, goodsImage: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                  <input 
                    type="text" 
                    value={formData.goodsPrice || ''}
                    onChange={(e) => setFormData({...formData, goodsPrice: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none"
                    placeholder="e.g. $49.99"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Supreme IDs Validation</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'chatId', label: 'Chat ID' },
                  { key: 'networkId', label: 'Network ID' },
                  { key: 'marketId', label: 'Marketplace ID' },
                  { key: 'mediaId', label: 'Media ID' },
                  { key: 'vibesId', label: 'Vibes ID' },
                  { key: 'adsId', label: 'Ads ID' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{field.label}</label>
                    <input 
                      type="text" 
                      value={(formData as any)[field.key]}
                      onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                      className={clsx(
                        "w-full p-2 bg-gray-50 border rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]",
                        errors[field.key] ? "border-red-500" : "border-gray-200"
                      )}
                    />
                    {errors[field.key] && <p className="text-red-500 text-[10px] mt-1">{errors[field.key]}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-start">
            <div className="w-full mb-6 p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subscription Status</p>
                <p className="text-sm font-bold text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4" /> Active ({user?.profileCardSub?.plan})
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expires On</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {user?.profileCardSub?.expiresAt ? new Date(user.profileCardSub.expiresAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Live Preview</h3>
            <div className="w-full flex justify-center scale-90 origin-top">
              <ProfileCard data={formData} />
            </div>
            <p className="text-xs text-gray-400 mt-8 text-center max-w-sm">
              This card will appear randomly in the dashboard area every 10 minutes to other users. You can update it as many times as you want while your subscription is active.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg flex items-center gap-2"
          >
            <Save className="w-5 h-5" /> Save Profile Card
          </button>
        </div>
      </motion.div>
    </div>
  );
}
