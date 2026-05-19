import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Users, CreditCard, Plus, Trash2, Pause, Play, 
  Edit2, Save, X, Search, Filter, CheckCircle2, AlertCircle,
  Calendar, DollarSign, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  features: string[];
  status: 'active' | 'paused' | 'archived';
}

interface UserSubscription {
  id: string;
  userName: string;
  userEmail: string;
  planId: string;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  startDate: string;
  nextBilling: string;
}

const INITIAL_PLANS: SubscriptionPlan[] = [
  { 
    id: 'p1', 
    name: 'Basic Connector', 
    price: 9.99, 
    period: 'monthly', 
    features: ['Standard Earnings', 'Basic Analytics', '100 Connections/mo'],
    status: 'active'
  },
  { 
    id: 'p2', 
    name: 'Premium Dealer', 
    price: 49.99, 
    period: 'monthly', 
    features: ['Double Earnings', 'Advanced Analytics', 'Unlimited Connections', 'Priority Support'],
    status: 'active'
  },
  { 
    id: 'p3', 
    name: 'Elite Admin', 
    price: 99.99, 
    period: 'monthly', 
    features: ['Max Earnings', 'Full Admin Suite', 'Custom Branding', 'Direct Payouts'],
    status: 'active'
  }
];

const MOCK_USER_SUBS: UserSubscription[] = [
  { id: 's1', userName: 'Alex Johnson', userEmail: 'alex@example.com', planId: 'p2', status: 'active', startDate: '2024-01-15', nextBilling: '2024-04-15' },
  { id: 's2', userName: 'Sarah Williams', userEmail: 'sarah@example.com', planId: 'p1', status: 'paused', startDate: '2023-11-20', nextBilling: '2024-04-20' },
  { id: 's3', userName: 'Michael Chen', userEmail: 'michael@example.com', planId: 'p3', status: 'active', startDate: '2024-02-01', nextBilling: '2024-05-01' },
];

export default function AdminSubscriptionManager() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'mini-admin';

  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [userSubs, setUserSubs] = useState<UserSubscription[]>(MOCK_USER_SUBS);
  const [activeTab, setActiveTab] = useState<'plans' | 'users'>('plans');
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAdmin) {
    return (
      <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-900">Access Restricted</h2>
        <p className="text-red-600 mt-2">Only administrators can manage site subscriptions.</p>
      </div>
    );
  }

  const handleTogglePlanStatus = (id: string) => {
    setPlans(plans.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p
    ));
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm('Are you sure you want to archive this plan?')) {
      setPlans(plans.map(p => p.id === id ? { ...p, status: 'archived' } : p));
    }
  };

  const handleUpdateUserSub = (id: string, status: UserSubscription['status']) => {
    setUserSubs(userSubs.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gray-900 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Subscription Management</h2>
              <p className="text-xs text-gray-400">Admin Control Panel v1.2</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('plans')}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeTab === 'plans' ? "bg-amber-500 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"
              )}
            >
              Plans & Pricing
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeTab === 'users' ? "bg-amber-500 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"
              )}
            >
              User Subscriptions
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Subs</p>
            <p className="text-2xl font-bold">1,284</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Revenue</p>
            <p className="text-2xl font-bold text-green-400">$12.4K</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Churn Rate</p>
            <p className="text-2xl font-bold text-red-400">2.4%</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'plans' ? (
            <motion.div 
              key="plans"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Available Plans</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                  <Plus className="w-4 h-4" /> Add New Plan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.filter(p => p.status !== 'archived').map((plan) => (
                  <div key={plan.id} className="p-5 rounded-3xl border border-gray-100 bg-gray-50 space-y-4 relative group">
                    <div className="flex justify-between items-start">
                      <div className={clsx(
                        "px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-tighter",
                        plan.status === 'active' ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {plan.status}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-amber-500 transition-colors">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                      <p className="text-2xl font-display font-bold text-amber-600">
                        ${plan.price} <span className="text-xs text-gray-400 font-sans">/{plan.period}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {f}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => handleTogglePlanStatus(plan.id)}
                      className={clsx(
                        "w-full py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2",
                        plan.status === 'active' 
                          ? "bg-amber-100 text-amber-600 hover:bg-amber-200" 
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      )}
                    >
                      {plan.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {plan.status === 'active' ? 'Pause Plan' : 'Resume Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plan</th>
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Billing</th>
                      <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {userSubs.filter(s => 
                      s.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      s.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((sub) => (
                      <tr key={sub.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                              {sub.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{sub.userName}</p>
                              <p className="text-[10px] text-gray-400">{sub.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-medium text-gray-600">
                            {plans.find(p => p.id === sub.planId)?.name}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className={clsx(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-tighter",
                            sub.status === 'active' ? "bg-green-100 text-green-600" : 
                            sub.status === 'paused' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                          )}>
                            <div className={clsx(
                              "w-1 h-1 rounded-full",
                              sub.status === 'active' ? "bg-green-600" : 
                              sub.status === 'paused' ? "bg-amber-600" : "bg-red-600"
                            )} />
                            {sub.status}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {sub.nextBilling}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {sub.status === 'active' ? (
                              <button 
                                onClick={() => handleUpdateUserSub(sub.id, 'paused')}
                                className="p-2 bg-white border border-gray-100 rounded-lg text-amber-500 hover:bg-amber-50"
                                title="Pause Subscription"
                              >
                                <Pause className="w-3 h-3" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUpdateUserSub(sub.id, 'active')}
                                className="p-2 bg-white border border-gray-100 rounded-lg text-green-500 hover:bg-green-50"
                                title="Resume Subscription"
                              >
                                <Play className="w-3 h-3" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleUpdateUserSub(sub.id, 'cancelled')}
                              className="p-2 bg-white border border-gray-100 rounded-lg text-red-500 hover:bg-red-50"
                              title="Cancel Subscription"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <p className="text-[10px] text-gray-500">
          Changes to plans will affect new subscribers immediately. Existing subscribers will be notified of price changes 30 days in advance.
        </p>
      </div>
    </div>
  );
}
