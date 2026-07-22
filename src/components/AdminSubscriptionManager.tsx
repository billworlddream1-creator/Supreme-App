import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Users, CreditCard, Plus, Trash2, Pause, Play, 
  Edit2, Save, X, Search, Filter, CheckCircle2, AlertCircle,
  Calendar, DollarSign, ShieldCheck, ArrowUpRight, Pickaxe,
  Crown, PlayCircle, Bot, ShoppingBag, PlusCircle, Check
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useSubscription, PlanType, SubscriptionPlan } from '../context/SubscriptionContext';
import { db } from '../firebase';
import { collection, getDocs, Timestamp, addDoc } from 'firebase/firestore';

const CATEGORY_DETAILS = {
  'mining': { label: 'Mining plans', icon: Pickaxe, color: 'text-orange-400 border-orange-500/20 bg-orange-500/10' },
  'general': { label: 'General Subs', icon: Crown, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
  'streaming': { label: 'Streaming plans', icon: PlayCircle, color: 'text-red-400 border-red-500/20 bg-red-500/10' },
  'ai-ads': { label: 'Ai Ads plans', icon: Bot, color: 'text-purple-400 border-purple-500/20 bg-purple-500/10' },
  'marketplace': { label: 'Market plans', icon: ShoppingBag, color: 'text-blue-400 border-blue-500/20 bg-blue-500/10' }
};

export default function AdminSubscriptionManager() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'mini-admin' || user?.email === 'billworlddream1@gmail.com';

  const { 
    plans, 
    allSubscriptions, 
    addPlan, 
    updatePlan, 
    deletePlan, 
    updateSubscription 
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<'plans' | 'users'>('plans');
  const [selectedCategory, setSelectedCategory] = useState<PlanType>('general');
  const [searchTerm, setSearchTerm] = useState('');
  
  // User mapping state
  const [usersMap, setUsersMap] = useState<Record<string, { name: string; email: string }>>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null); // null means adding
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formDurationMonths, setFormDurationMonths] = useState(1);
  const [formDurationDays, setFormDurationDays] = useState(0);
  const [formCredits, setFormCredits] = useState(0);
  const [formStreamingHours, setFormStreamingHours] = useState(0);
  const [formCanDownload, setFormCanDownload] = useState(false);
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Fetch users list to map IDs to names/emails
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        const mapping: Record<string, { name: string; email: string }> = {};
        snap.forEach(docSnap => {
          const d = docSnap.data();
          mapping[docSnap.id] = {
            name: d.displayName || d.name || 'Anonymous User',
            email: d.email || 'no-email@example.com'
          };
        });
        setUsersMap(mapping);
      } catch (err) {
        console.error("Error fetching users map:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  if (!isAdmin) {
    return (
      <div className="p-8 bg-red-950/20 rounded-3xl border border-red-500/20 text-center backdrop-blur-xl">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-400">Access Restricted</h2>
        <p className="text-red-300/60 mt-2">Only administrators can manage site subscriptions.</p>
      </div>
    );
  }

  // Filter plans based on category
  const filteredPlans = plans.filter(p => p.type === selectedCategory);

  const openAddForm = () => {
    setEditingPlanId(null);
    setFormName('');
    setFormPrice(10);
    setFormDurationMonths(1);
    setFormDurationDays(0);
    setFormCredits(0);
    setFormStreamingHours(0);
    setFormCanDownload(false);
    setFormFeatures([]);
    setNewFeatureText('');
    setIsFormOpen(true);
  };

  const openEditForm = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setFormName(plan.name);
    setFormPrice(plan.price);
    setFormDurationMonths(plan.durationMonths);
    setFormDurationDays(plan.durationDays || 0);
    setFormCredits(plan.creditsPerDay || 0);
    setFormStreamingHours(plan.streamingHoursPerDay || 0);
    setFormCanDownload(plan.canDownload || false);
    // Generate default visual features if empty
    setFormFeatures(plan.creditsPerDay ? [`${plan.creditsPerDay} Credits Per Day`] : ['Premium Access']);
    setNewFeatureText('');
    setIsFormOpen(true);
  };

  const addFeature = () => {
    if (newFeatureText.trim()) {
      setFormFeatures([...formFeatures, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const removeFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== index));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const planPayload: Omit<SubscriptionPlan, 'id'> = {
      type: selectedCategory,
      name: formName,
      price: Number(formPrice),
      durationMonths: Number(formDurationMonths),
      durationDays: formDurationDays ? Number(formDurationDays) : undefined,
      creditsPerDay: formCredits ? Number(formCredits) : undefined,
      streamingHoursPerDay: formStreamingHours ? Number(formStreamingHours) : undefined,
      canDownload: formCanDownload || undefined,
    };

    try {
      if (editingPlanId) {
        await updatePlan(editingPlanId, planPayload);
      } else {
        await addPlan(planPayload);
      }

      // Audit Log
      await addDoc(collection(db, 'admin_audit_logs'), {
        category: 'plan',
        action: editingPlanId ? 'Updated Subscription Plan' : 'Created Subscription Plan',
        details: `${editingPlanId ? 'Updated' : 'Created'} "${formName}" subscription plan under category "${selectedCategory}" at $${formPrice}/month (Duration: ${formDurationMonths} months).`,
        adminEmail: user?.email || 'admin@gmt.com',
        timestamp: Timestamp.now(),
        severity: 'medium',
        ip: 'Internal',
        resolved: true
      });
    } catch (err) {
      console.error('Failed to save subscription plan / write audit log:', err);
    }
    
    setIsFormOpen(false);
  };

  const handleTogglePlanPause = async (plan: SubscriptionPlan) => {
    try {
      await updatePlan(plan.id, { isPaused: !plan.isPaused });
      
      // Audit Log
      await addDoc(collection(db, 'admin_audit_logs'), {
        category: 'plan',
        action: plan.isPaused ? 'Resumed Subscription Plan' : 'Paused Subscription Plan',
        details: `${plan.isPaused ? 'Resumed' : 'Paused'} subscription plan "${plan.name}" (ID: ${plan.id}) under category "${plan.type}".`,
        adminEmail: user?.email || 'admin@gmt.com',
        timestamp: Timestamp.now(),
        severity: 'medium',
        ip: 'Internal',
        resolved: true
      });
    } catch (err) {
      console.error('Failed to toggle plan pause status / write audit log:', err);
    }
  };

  const handleDeletePlanConfirm = async (planId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this plan?")) {
      try {
        const targetPlan = plans.find(p => p.id === planId);
        const planName = targetPlan ? targetPlan.name : 'Unknown';
        const planCategory = targetPlan ? targetPlan.type : 'Unknown';

        await deletePlan(planId);

        // Audit Log
        await addDoc(collection(db, 'admin_audit_logs'), {
          category: 'plan',
          action: 'Deleted Subscription Plan',
          details: `Deleted subscription plan "${planName}" (ID: ${planId}) under category "${planCategory}".`,
          adminEmail: user?.email || 'admin@gmt.com',
          timestamp: Timestamp.now(),
          severity: 'high',
          ip: 'Internal',
          resolved: true
        });
      } catch (err) {
        console.error('Failed to delete plan / write audit log:', err);
      }
    }
  };

  // User subscription operations
  const handleToggleUserSubscription = async (sub: any) => {
    const action = sub.isActive ? 'pause' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user's subscription?`)) {
      try {
        const userEmail = usersMap[sub.userId]?.email || 'unknown';
        await updateSubscription(sub.id, { isActive: !sub.isActive });

        // Audit Log
        await addDoc(collection(db, 'admin_audit_logs'), {
          category: 'plan',
          action: sub.isActive ? 'Paused User Subscription' : 'Activated User Subscription',
          details: `${sub.isActive ? 'Paused' : 'Activated'} subscription for user "${userEmail}" (Sub ID: ${sub.id}).`,
          adminEmail: user?.email || 'admin@gmt.com',
          timestamp: Timestamp.now(),
          severity: 'medium',
          ip: 'Internal',
          resolved: true
        });
      } catch (err) {
        console.error('Failed to toggle user subscription / write audit log:', err);
      }
    }
  };

  const handleCancelUserSubscription = async (sub: any) => {
    if (window.confirm("Are you sure you want to cancel this subscription? (This will deactivate it immediately)")) {
      try {
        const userEmail = usersMap[sub.userId]?.email || 'unknown';
        await updateSubscription(sub.id, { isActive: false });

        // Audit Log
        await addDoc(collection(db, 'admin_audit_logs'), {
          category: 'plan',
          action: 'Cancelled User Subscription',
          details: `Cancelled active subscription for user "${userEmail}" (Sub ID: ${sub.id}) immediately.`,
          adminEmail: user?.email || 'admin@gmt.com',
          timestamp: Timestamp.now(),
          severity: 'medium',
          ip: 'Internal',
          resolved: true
        });
      } catch (err) {
        console.error('Failed to cancel user subscription / write audit log:', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-[var(--color-supreme-gold)]" />
            Subscription Control Center
          </h3>
          <p className="text-sm text-gray-400">Configure plans, pricing, categories and manage users subscriptions dynamically</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('plans')}
            className={clsx(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'plans' ? "bg-[var(--color-supreme-gold)] text-black shadow-lg" : "text-gray-400 hover:text-white"
            )}
          >
            <CreditCard className="w-4 h-4" />
            Manage Plans
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={clsx(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'users' ? "bg-[var(--color-supreme-gold)] text-black shadow-lg" : "text-gray-400 hover:text-white"
            )}
          >
            <Users className="w-4 h-4" />
            User Subscriptions
          </button>
        </div>
      </div>

      {activeTab === 'plans' ? (
        <div className="space-y-8">
          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Object.entries(CATEGORY_DETAILS) as [PlanType, typeof CATEGORY_DETAILS['general']][]).map(([type, details]) => {
              const Icon = details.icon;
              const isSelected = selectedCategory === type;
              const count = plans.filter(p => p.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedCategory(type)}
                  className={clsx(
                    "flex flex-col items-center justify-center p-5 rounded-3xl border text-center transition-all relative overflow-hidden group",
                    isSelected 
                      ? "bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 border-[var(--color-supreme-gold)] shadow-xl shadow-yellow-950/10"
                      : "bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10"
                  )}
                >
                  <div className={clsx("p-3 rounded-2xl mb-3 border", isSelected ? "bg-[var(--color-supreme-gold)] text-black border-yellow-400" : details.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={clsx("text-xs font-bold uppercase tracking-wider", isSelected ? "text-white" : "text-gray-400")}>
                    {details.label}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 font-mono font-bold">
                    {count} {count === 1 ? 'plan' : 'plans'}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-supreme-gold)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Category Details Banner */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Active Category:</span>
                <span className="text-[var(--color-supreme-gold)] uppercase tracking-wide">
                  {CATEGORY_DETAILS[selectedCategory]?.label}
                </span>
              </h4>
              <p className="text-xs text-gray-400">Configure parameters, create new tiers, and pause/resume existing tiers for this group.</p>
            </div>
            <button
              onClick={openAddForm}
              className="px-5 py-3 bg-[var(--color-supreme-gold)] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New {CATEGORY_DETAILS[selectedCategory]?.label.split(' ')[0]} Plan
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div 
                key={plan.id} 
                className={clsx(
                  "bg-white/5 backdrop-blur-xl rounded-3xl border p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300",
                  plan.isPaused ? "opacity-60 border-white/5 bg-black/40" : "border-white/10 hover:border-white/20 hover:bg-white/10"
                )}
              >
                {/* Status Indicator */}
                <div className="flex justify-between items-start mb-6">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest",
                    plan.isPaused ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  )}>
                    {plan.isPaused ? 'Paused' : 'Active'}
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => openEditForm(plan)}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleTogglePlanPause(plan)}
                      className={clsx(
                        "p-2 bg-white/5 border border-white/10 rounded-xl transition-colors",
                        plan.isPaused ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                      )}
                      title={plan.isPaused ? "Resume Plan" : "Pause Plan"}
                    >
                      {plan.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleDeletePlanConfirm(plan.id)}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h5 className="text-xl font-bold text-white mb-1">{plan.name}</h5>
                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="text-3xl font-black text-[var(--color-supreme-gold)]">${plan.price}</span>
                    <span className="text-xs text-gray-400">
                      / {plan.durationDays ? `${plan.durationDays} days` : plan.durationMonths === 1 ? 'mo' : `${plan.durationMonths} mos`}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {/* Attributes */}
                    {plan.creditsPerDay && (
                      <div className="flex items-center gap-2.5 text-xs text-gray-300">
                        <Bot className="w-4 h-4 text-purple-400" />
                        <span>{plan.creditsPerDay} AI credits per day</span>
                      </div>
                    )}
                    {plan.streamingHoursPerDay && (
                      <div className="flex items-center gap-2.5 text-xs text-gray-300">
                        <PlayCircle className="w-4 h-4 text-red-400" />
                        <span>{plan.streamingHoursPerDay} hours daily streaming limit</span>
                      </div>
                    )}
                    {plan.canDownload !== undefined && (
                      <div className="flex items-center gap-2.5 text-xs text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span>{plan.canDownload ? 'Downloads enabled' : 'Streaming only'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-xs text-gray-400 border-t border-white/5 pt-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Duration: {plan.durationDays ? `${plan.durationDays} Days` : `${plan.durationMonths} Month(s)`}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredPlans.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-[2.5rem] bg-white/5">
                <AlertCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <h5 className="text-base font-bold text-white mb-1">No plans in this category</h5>
                <p className="text-xs text-gray-400">Click "Add New" above to create the first subscription plan.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Users Subscriptions Tracking tab */
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
            <div>
              <h4 className="text-lg font-bold text-white">Live User Subscriptions</h4>
              <p className="text-xs text-gray-400">Active billing schedules, pricing structures and subscription lifecycles</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search user email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
              />
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="text-center py-12 text-gray-400 font-bold">Loading subscribers databases...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="pb-4">Subscriber</th>
                    <th className="pb-4">Subscription Plan</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">End Date</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allSubscriptions.filter(sub => {
                    const userInfo = usersMap[sub.subscriberId];
                    const text = (userInfo?.name + ' ' + userInfo?.email + ' ' + sub.planId).toLowerCase();
                    return text.includes(searchTerm.toLowerCase());
                  }).map((sub) => {
                    const userInfo = usersMap[sub.subscriberId] || { name: 'Anonymous User', email: sub.subscriberId };
                    const matchedPlan = plans.find(p => p.id === sub.planId);
                    const endDateString = sub.endDate instanceof Timestamp 
                      ? sub.endDate.toDate().toLocaleDateString()
                      : new Date(sub.endDate).toLocaleDateString();

                    return (
                      <tr key={sub.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] font-bold border border-[var(--color-supreme-gold)]/20 flex items-center justify-center">
                              {userInfo.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{userInfo.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{userInfo.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-semibold text-white">
                            {matchedPlan?.name || sub.planId}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-white/5 text-gray-400 border border-white/10">
                            {sub.type}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-xs text-gray-400 font-mono">{endDateString}</span>
                        </td>
                        <td className="py-4">
                          <span className={clsx(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest",
                            sub.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                          )}>
                            <span className={clsx("w-1 h-1 rounded-full", sub.isActive ? "bg-emerald-400" : "bg-red-400")} />
                            {sub.isActive ? 'Active' : 'Cancelled'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleUserSubscription(sub)}
                              className={clsx(
                                "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                                sub.isActive 
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20" 
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              )}
                            >
                              {sub.isActive ? 'Pause' : 'Activate'}
                            </button>
                            {sub.isActive && (
                              <button
                                onClick={() => handleCancelUserSubscription(sub)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {allSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 font-bold">
                        No active user subscriptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-6 text-white shadow-2xl relative"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-[var(--color-supreme-gold)]/10 rounded-2xl border border-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)]">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">{editingPlanId ? 'Edit Plan Settings' : 'Create New Subscription Plan'}</h4>
                  <p className="text-xs text-gray-500">Add options, prices, and parameters to the {CATEGORY_DETAILS[selectedCategory]?.label} tier</p>
                </div>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plan Name</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Advanced Rig Premium"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price ($ USD)</label>
                    <input 
                      type="number" 
                      required
                      min="0.01"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(parseFloat(e.target.value))}
                      placeholder="e.g. 19.99"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Category</label>
                    <div className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-[var(--color-supreme-gold)] font-bold uppercase tracking-wide">
                      {selectedCategory}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration (Months)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formDurationMonths}
                      onChange={(e) => setFormDurationMonths(parseInt(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration (Days, override)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formDurationDays}
                      onChange={(e) => setFormDurationDays(parseInt(e.target.value))}
                      placeholder="Optional"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>
                </div>

                {selectedCategory === 'ai-ads' && (
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Credits per day</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formCredits}
                      onChange={(e) => setFormCredits(parseInt(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>
                )}

                {selectedCategory === 'streaming' && (
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hours daily streaming</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="0"
                        value={formStreamingHours}
                        onChange={(e) => setFormStreamingHours(parseFloat(e.target.value))}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                      <label className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formCanDownload}
                          onChange={(e) => setFormCanDownload(e.target.checked)}
                          className="rounded border-white/10 text-[var(--color-supreme-gold)] focus:ring-0 bg-transparent"
                        />
                        <span className="text-xs text-gray-300">Allow Downloads</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[var(--color-supreme-gold)] text-black hover:bg-yellow-400 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Subscription Plan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
