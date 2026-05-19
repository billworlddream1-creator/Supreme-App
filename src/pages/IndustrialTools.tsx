import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, DollarSign, Briefcase, Settings, 
  ShieldCheck, Key, LogIn, Plus, Trash2, Edit3, 
  TrendingUp, Activity, UserMinus, UserPlus, 
  ChevronRight, BarChart3, PieChart, Wallet,
  Shield, UserCheck, Loader2, Image as ImageIcon,
  LayoutDashboard, CheckCircle2, Menu, ChevronLeft
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Types ---

import DigitalTools from '../components/DigitalTools';

type IndustrialRole = 'main-admin' | 'mini-admin' | 'manager' | 'operator' | 'worker' | null;

interface IndustrialStaff {
  id: string;
  name: string;
  role: 'mini-admin' | 'manager' | 'operator' | 'worker';
  key: string;
  salary: number;
  status: 'present' | 'absent' | 'suspended';
  activities: string[];
  image: string;
  department?: string;
}

interface CompanyActivity {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  status: 'pending' | 'in-progress' | 'completed';
  date: string;
}

// --- Mock Data ---

const INITIAL_STAFF: IndustrialStaff[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'mini-admin',
    key: 'MINI-123',
    salary: 5000,
    status: 'present',
    activities: ['Supervise Floor A'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    department: 'Administration'
  },
  {
    id: '2',
    name: 'Sarah Connor',
    role: 'manager',
    key: 'MGR-456',
    salary: 4000,
    status: 'present',
    activities: ['Production Planning'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    department: 'Production'
  },
  {
    id: '3',
    name: 'Mike Ross',
    role: 'operator',
    key: 'OPT-789',
    salary: 3200,
    status: 'absent',
    activities: ['CNC Machine Operation'],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    department: 'Maintenance'
  },
  {
    id: '4',
    name: 'Emma Watson',
    role: 'worker',
    key: 'WKR-101',
    salary: 2500,
    status: 'present',
    activities: ['Assembly Line'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    department: 'Assembly'
  }
];

const INITIAL_ACTIVITIES: CompanyActivity[] = [
  {
    id: 'a1',
    title: 'Morning Briefing',
    description: 'Daily safety check and task assignment',
    assignedTo: ['1', '2', '3'],
    status: 'completed',
    date: new Date().toISOString()
  },
  {
    id: 'a2',
    title: 'Inventory Audit',
    description: 'Quarterly stock check for raw materials',
    assignedTo: ['2'],
    status: 'in-progress',
    date: new Date().toISOString()
  }
];

// --- Components ---

const LoadingScreen = ({ message = "Build and Expand" }: { message?: string }) => (
  <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      <div className="w-24 h-24 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      <Building2 className="absolute inset-0 m-auto w-10 h-10 text-amber-500 animate-pulse" />
    </motion.div>
    <motion.h2 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-8 text-2xl font-display font-bold text-white tracking-[0.2em] uppercase"
    >
      {message}
    </motion.h2>
    <div className="mt-4 flex gap-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
          className="w-2 h-2 bg-amber-500 rounded-full"
        />
      ))}
    </div>
  </div>
);

const IndustrialLogin = ({ onLogin }: { onLogin: (role: IndustrialRole) => void }) => {
  const [mainKey, setMainKey] = useState('');
  const [staffKey, setStaffKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (mainKey === 'SUPREME-ADMIN') {
        onLogin('main-admin');
      } else if (mainKey === 'MINI-123') {
        onLogin('mini-admin');
      } else {
        setError('Invalid Admin Key');
        setLoading(false);
      }
    }, 1500);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const foundStaff = INITIAL_STAFF.find(s => s.key === staffKey);
      if (foundStaff) {
        onLogin(foundStaff.role);
      } else {
        setError('Invalid Staff Key');
        setLoading(false);
      }
    }, 1500);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Admin Login */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gray-900 p-8 rounded-3xl border border-amber-500/20 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">Administrative</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Main & Mini Admin</p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password"
                  value={mainKey}
                  onChange={(e) => setMainKey(e.target.value)}
                  placeholder="Enter Admin Key"
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
            <button className="w-full py-4 bg-amber-500 text-gray-900 font-bold rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Authorize Admin
            </button>
          </form>
        </motion.div>

        {/* Staff Login */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gray-900 p-8 rounded-3xl border border-blue-500/20 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">Workforce</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Staff Members</p>
            </div>
          </div>

          <form onSubmit={handleStaffLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Staff Key</label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password"
                  value={staffKey}
                  onChange={(e) => setStaffKey(e.target.value)}
                  placeholder="Enter Staff Key"
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <button className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-400 transition-all flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Staff Access
            </button>
          </form>
        </motion.div>

        {error && (
          <div className="col-span-full text-center p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default function IndustrialTools() {
  const [role, setRole] = useState<IndustrialRole>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'payroll' | 'activities' | 'admin' | 'utilities'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [staff, setStaff] = useState<IndustrialStaff[]>(INITIAL_STAFF);
  const [activities, setActivities] = useState<CompanyActivity[]>(INITIAL_ACTIVITIES);

  const hasPermission = (action: 'view_dashboard' | 'manage_staff' | 'manage_payroll' | 'manage_activities' | 'admin_controls' | 'view_utilities') => {
    if (role === 'main-admin') return true;
    if (role === 'mini-admin') return action !== 'admin_controls';
    if (role === 'manager') return ['view_dashboard', 'manage_staff', 'manage_activities'].includes(action);
    if (role === 'operator') return ['view_dashboard', 'manage_activities'].includes(action);
    if (role === 'worker') return action === 'view_dashboard';
    if (action === 'view_utilities') return ['main-admin', 'mini-admin', 'manager'].includes(role as string);
    return false;
  };
  
  // Modal States
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<IndustrialStaff | null>(null);
  const [adjustingSalary, setAdjustingSalary] = useState<IndustrialStaff | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActivityData, setNewActivityData] = useState({ title: '', description: '', assignedTo: [] as string[] });
  const [newStaffData, setNewStaffData] = useState({ 
    name: '', 
    role: 'worker' as IndustrialStaff['role'], 
    salary: 0,
    department: 'Production'
  });

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Management Functions
  const handleAddStaff = () => {
    const newStaff: IndustrialStaff = {
      id: Math.random().toString(36).substr(2, 9),
      name: newStaffData.name,
      role: newStaffData.role,
      key: `${newStaffData.role.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      salary: newStaffData.salary,
      status: 'present',
      activities: [],
      image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?w=100&h=100&fit=crop`,
      department: newStaffData.department
    };
    setStaff([...staff, newStaff]);
    setIsAddStaffOpen(false);
    setNewStaffData({ name: '', role: 'worker', salary: 0, department: 'Production' });
  };

  const handleUpdateStaff = (updated: IndustrialStaff) => {
    setStaff(staff.map(s => s.id === updated.id ? updated : s));
    setEditingStaff(null);
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    setNotification({ message: 'Staff member removed successfully.', type: 'success' });
  };

  const handleAdjustSalary = (id: string, newSalary: number) => {
    setStaff(staff.map(s => s.id === id ? { ...s, salary: newSalary } : s));
    setAdjustingSalary(null);
  };

  const handlePromote = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, role: 'mini-admin', key: `MINI-${Math.floor(1000 + Math.random() * 9000)}` } : s));
  };

  const handleStatusChange = (id: string, status: IndustrialStaff['status']) => {
    setStaff(staff.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleAddActivity = () => {
    if (newActivityData.title && newActivityData.description) {
      const newActivity: CompanyActivity = {
        id: `ACT-${Date.now()}`,
        title: newActivityData.title,
        description: newActivityData.description,
        assignedTo: newActivityData.assignedTo,
        status: 'pending',
        date: new Date().toISOString()
      };
      setActivities([...activities, newActivity]);
      setIsAddActivityOpen(false);
      setNewActivityData({ title: '', description: '', assignedTo: [] });
    }
  };

  const handleUpdateActivityStatus = (id: string, status: CompanyActivity['status']) => {
    setActivities(activities.map(a => a.id === id ? { ...a, status } : a));
  };

  // Stats
  const netWorth = 24500000;
  const growth = 12.5;
  const presentStaff = staff.filter(s => s.status === 'present').length;
  const absentStaff = staff.filter(s => s.status === 'absent').length;
  const suspendedStaff = staff.filter(s => s.status === 'suspended').length;

  const handleLogin = (newRole: IndustrialRole) => {
    setRole(newRole);
  };

  if (!role) return <IndustrialLogin onLogin={handleLogin} />;

  const getRoleColor = (r: IndustrialRole) => {
    switch (r) {
      case 'main-admin': return 'bg-amber-500';
      case 'mini-admin': return 'bg-blue-500';
      case 'manager': return 'bg-purple-500';
      case 'operator': return 'bg-indigo-500';
      case 'worker': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        className="bg-gray-900 text-white flex flex-col relative transition-all duration-300"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className={clsx("flex items-center gap-3", isSidebarCollapsed && "hidden")}>
            <Building2 className="w-8 h-8 text-amber-500" />
            <h1 className="text-xl font-display font-bold tracking-tighter">INDUSTRIAL</h1>
          </div>
          {isSidebarCollapsed && <Building2 className="w-8 h-8 text-amber-500 mx-auto" />}
        </div>

        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-gray-900 shadow-lg z-20 hover:scale-110 transition-transform"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <nav className="flex-1 p-4 space-y-2">
          {hasPermission('view_dashboard') && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'dashboard' ? "bg-amber-500 text-gray-900" : "text-gray-400 hover:bg-white/5",
                isSidebarCollapsed && "justify-center px-0"
              )}
              title={isSidebarCollapsed ? "Dashboard" : ""}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>
          )}
          
          {hasPermission('manage_staff') && (
            <button 
              onClick={() => setActiveTab('staff')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'staff' ? "bg-amber-500 text-gray-900" : "text-gray-400 hover:bg-white/5",
                isSidebarCollapsed && "justify-center px-0"
              )}
              title={isSidebarCollapsed ? "Staff Management" : ""}
            >
              <Users className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Staff Management</span>}
            </button>
          )}

          {hasPermission('manage_payroll') && (
            <button 
              onClick={() => setActiveTab('payroll')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'payroll' ? "bg-amber-500 text-gray-900" : "text-gray-400 hover:bg-white/5",
                isSidebarCollapsed && "justify-center px-0"
              )}
              title={isSidebarCollapsed ? "Payroll System" : ""}
            >
              <DollarSign className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Payroll System</span>}
            </button>
          )}

          {hasPermission('manage_activities') && (
            <button 
              onClick={() => setActiveTab('activities')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'activities' ? "bg-amber-500 text-gray-900" : "text-gray-400 hover:bg-white/5",
                isSidebarCollapsed && "justify-center px-0"
              )}
              title={isSidebarCollapsed ? "Work Activities" : ""}
            >
              <Activity className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Work Activities</span>}
            </button>
          )}

          {hasPermission('admin_controls') && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'admin' ? "bg-amber-500 text-gray-900" : "text-gray-400 hover:bg-white/5",
                isSidebarCollapsed && "justify-center px-0"
              )}
              title={isSidebarCollapsed ? "Administrative" : ""}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Administrative</span>}
            </button>
          )}

          {hasPermission('view_utilities') && (
            <button 
              onClick={() => setActiveTab('utilities')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'utilities' ? "bg-amber-500 text-gray-900" : "text-gray-400 hover:bg-white/5",
                isSidebarCollapsed && "justify-center px-0"
              )}
              title={isSidebarCollapsed ? "Utilities" : ""}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Utilities</span>}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setRole(null)}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all",
              isSidebarCollapsed && "justify-center px-0"
            )}
            title={isSidebarCollapsed ? "Exit System" : ""}
          >
            <UserMinus className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Exit System</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={clsx(
                "fixed top-20 right-8 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border",
                notification.type === 'success' ? "bg-green-600 text-white border-green-500" : "bg-red-600 text-white border-red-500"
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-tight">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Status</p>
              <p className="text-sm font-bold text-green-600">Secure Connection</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </header>

        <main className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-green-50 rounded-2xl">
                        <Wallet className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        +{growth}%
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Net Worth</p>
                    <h3 className="text-2xl font-display font-bold text-gray-900">${(netWorth / 1000000).toFixed(1)}M</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Present Staff</p>
                    <h3 className="text-2xl font-display font-bold text-gray-900">{presentStaff} / {staff.length}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="p-3 bg-red-50 rounded-2xl w-fit mb-4">
                      <UserMinus className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Absent / Suspended</p>
                    <h3 className="text-2xl font-display font-bold text-gray-900">{absentStaff} / {suspendedStaff}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="p-3 bg-amber-50 rounded-2xl w-fit mb-4">
                      <Activity className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Activities</p>
                    <h3 className="text-2xl font-display font-bold text-gray-900">{activities.length} Active</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Growth Chart */}
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-display font-bold text-gray-900">Company Growth Analysis</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase">Monthly</span>
                        <span className="px-3 py-1 bg-amber-500 text-gray-900 rounded-full text-[10px] font-bold uppercase">Yearly</span>
                      </div>
                    </div>
                    <div className="h-64 flex items-end gap-4">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="w-full bg-amber-500/20 rounded-t-lg relative group"
                          >
                            <div className="absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                          </motion.div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-display font-bold text-gray-900">Financial Health</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Monthly Payroll</p>
                        <p className="text-xl font-bold text-gray-900">${staff.reduce((acc, s) => acc + s.salary, 0).toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Operating Costs</p>
                        <p className="text-xl font-bold text-gray-900">$125,000</p>
                      </div>
                      <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Projected Revenue</p>
                        <p className="text-xl font-bold text-amber-600">$450,000</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('payroll')}
                      className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all text-sm"
                    >
                      Manage Payroll
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activities */}
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-display font-bold text-gray-900">Recent Activities</h3>
                      <button 
                        onClick={() => setActiveTab('activities')}
                        className="text-xs font-bold text-amber-600 hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {activities.slice(0, 4).map(a => (
                        <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                          <div className={clsx(
                            "p-2 rounded-xl",
                            a.status === 'completed' ? "bg-green-100 text-green-600" : 
                            a.status === 'in-progress' ? "bg-blue-100 text-blue-600" :
                            "bg-amber-100 text-amber-600"
                          )}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{a.title}</p>
                            <p className="text-[10px] text-gray-500">{new Date(a.date).toLocaleDateString()}</p>
                          </div>
                          <span className={clsx(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            a.status === 'completed' ? "bg-green-100 text-green-600" : 
                            a.status === 'in-progress' ? "bg-blue-100 text-blue-600" :
                            "bg-amber-100 text-amber-600"
                          )}>
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Department Overview */}
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-display font-bold text-gray-900 mb-6">Department Distribution</h3>
                    <div className="space-y-6">
                      {['Production', 'Maintenance', 'Assembly', 'Administration'].map(dept => {
                        const count = staff.filter(s => s.department === dept).length;
                        const percentage = (count / staff.length) * 100;
                        return (
                          <div key={dept} className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                              <span className="text-gray-500">{dept}</span>
                              <span className="text-gray-900">{count} Staff</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className="h-full bg-amber-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'staff' && (
              <motion.div 
                key="staff"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-display font-bold text-gray-900">Workforce Management</h3>
                  {hasPermission('manage_staff') && (
                    <button 
                      onClick={() => setIsAddStaffOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-gray-900 rounded-2xl font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                    >
                      <UserPlus className="w-5 h-5" />
                      Add New Staff
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Staff Member</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Tasks</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {staff.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={s.image} alt={s.name} className="w-10 h-10 rounded-xl object-cover" />
                              <span className="text-sm font-bold text-gray-900">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={clsx(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              s.role === 'mini-admin' ? "bg-blue-100 text-blue-600" : 
                              s.role === 'manager' ? "bg-purple-100 text-purple-600" :
                              s.role === 'operator' ? "bg-indigo-100 text-indigo-600" :
                              "bg-gray-100 text-gray-600"
                            )}>
                              {s.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {activities.filter(a => a.assignedTo.includes(s.id)).length > 0 ? (
                                  activities.filter(a => a.assignedTo.includes(s.id)).map(a => (
                                    <span key={a.id} className={clsx(
                                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase border",
                                      a.status === 'completed' ? "bg-green-50 text-green-600 border-green-200" :
                                      a.status === 'in-progress' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                      "bg-amber-50 text-amber-600 border-amber-200"
                                    )}>
                                      {a.title}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-gray-400 italic">No active tasks</span>
                                )}
                              </div>
                              {activities.filter(a => a.assignedTo.includes(s.id)).length > 0 && (
                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ 
                                      width: `${(activities.filter(a => a.assignedTo.includes(s.id) && a.status === 'completed').length / activities.filter(a => a.assignedTo.includes(s.id)).length) * 100}%` 
                                    }}
                                    className="h-full bg-green-500"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={clsx(
                                "w-2 h-2 rounded-full",
                                s.status === 'present' ? "bg-green-500" : s.status === 'absent' ? "bg-red-500" : "bg-gray-400"
                              )} />
                              <select 
                                value={s.status}
                                onChange={(e) => handleStatusChange(s.id, e.target.value as any)}
                                className="bg-transparent text-xs font-medium text-gray-600 capitalize outline-none cursor-pointer"
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingStaff(s)}
                                className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {hasPermission('manage_staff') && (
                                <button 
                                  onClick={() => handleDeleteStaff(s.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'payroll' && (
              <motion.div 
                key="payroll"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-display font-bold text-gray-900">Workers Payroll System</h3>
                  <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Monthly Payroll</p>
                        <p className="text-sm font-bold text-gray-900">${staff.reduce((acc, s) => acc + s.salary, 0).toLocaleString()}</p>
                      </div>
                    </div>
                    {hasPermission('manage_payroll') && (
                      <button 
                        onClick={() => {
                          setNotification({ message: 'Monthly payroll processed successfully for all staff members.', type: 'success' });
                        }}
                        className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold text-sm hover:bg-green-500 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Process All Payments
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-4">
                        <img src={s.image} alt={s.name} className="w-12 h-12 rounded-2xl object-cover" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{s.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.role}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monthly Salary</span>
                          <span className="text-lg font-display font-bold text-green-600">${s.salary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Payment Status</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-bold uppercase tracking-tighter">Paid</span>
                        </div>
                      </div>
                      {hasPermission('manage_payroll') && (
                        <button 
                          onClick={() => setAdjustingSalary(s)}
                          className="w-full py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Adjust Salary
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div 
                key="activities"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-display font-bold text-gray-900">Company Daily Activities</h3>
                  {hasPermission('manage_activities') && (
                    <button 
                      onClick={() => setIsAddActivityOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-gray-900 rounded-2xl font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                    >
                      <Plus className="w-5 h-5" />
                      Create Activity
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activities.map(a => (
                    <div key={a.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-50 rounded-2xl">
                          <Activity className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                          a.status === 'completed' ? "bg-green-100 text-green-600" : 
                          a.status === 'in-progress' ? "bg-blue-100 text-blue-600" :
                          "bg-amber-100 text-amber-600"
                        )}>
                          {a.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{a.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{a.description}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Staff</p>
                          <select 
                            value={a.status}
                            onChange={(e) => handleUpdateActivityStatus(a.id, e.target.value as any)}
                            className="bg-transparent text-[10px] font-bold text-amber-600 uppercase outline-none cursor-pointer hover:underline"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <div className="flex -space-x-2">
                          {a.assignedTo.map(staffId => {
                            const s = staff.find(st => st.id === staffId);
                            return s ? (
                              <img key={staffId} src={s.image} alt={s.name} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" title={s.name} />
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'admin' && hasPermission('admin_controls') && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Key Generation */}
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-50 rounded-2xl">
                        <Key className="w-6 h-6 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-gray-900">Key Generation System</h3>
                    </div>
                    <p className="text-sm text-gray-500">Generate secure access keys for new mini-admins and staff members.</p>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-900">Mini Admin Key</p>
                          <p className="text-[10px] text-gray-400">High-level supervisory access</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-gray-800 transition-all">
                          Generate
                        </button>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-900">Staff Access Key</p>
                          <p className="text-[10px] text-gray-400">Standard operational access</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-gray-800 transition-all">
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Role Assignment */}
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-2xl">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-gray-900">Role & Permissions</h3>
                    </div>
                    <p className="text-sm text-gray-500">Assign mini-admin roles and manage system-wide permissions.</p>

                    <div className="space-y-4">
                      {staff.filter(s => !['main-admin', 'mini-admin'].includes(s.role)).slice(0, 2).map(s => (
                        <div key={s.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={s.image} alt={s.name} className="w-8 h-8 rounded-xl object-cover" />
                            <span className="text-xs font-bold text-gray-900">{s.name}</span>
                          </div>
                          <button 
                            onClick={() => handlePromote(s.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-blue-400 transition-all"
                          >
                            Promote to Mini Admin
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Administrative Logs */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-6">Administrative Audit Logs</h3>
                  <div className="space-y-4">
                    {[
                      { action: 'Salary Updated', user: 'Main Admin', target: 'John Smith', time: '2 hours ago' },
                      { action: 'New Key Generated', user: 'Main Admin', target: 'Mini Admin Access', time: '5 hours ago' },
                      { action: 'Staff Suspended', user: 'Mini Admin', target: 'Mike Ross', time: '1 day ago' }
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <p className="text-xs font-bold text-gray-900">{log.action}</p>
                          <span className="text-[10px] text-gray-400">by {log.user}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-500">{log.target}</p>
                          <p className="text-[8px] text-gray-400 uppercase">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'utilities' && (
              <motion.div
                key="utilities"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DigitalTools />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-display font-bold text-gray-900">Add New Staff Member</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={newStaffData.name}
                    onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    value={newStaffData.role}
                    onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  >
                    <option value="worker">Worker</option>
                    <option value="operator">Operator</option>
                    <option value="manager">Manager</option>
                    <option value="mini-admin">Mini Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                  <select 
                    value={newStaffData.department}
                    onChange={(e) => setNewStaffData({ ...newStaffData, department: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  >
                    <option value="Production">Production</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Assembly">Assembly</option>
                    <option value="Administration">Administration</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monthly Salary ($)</label>
                  <input 
                    type="number"
                    value={newStaffData.salary}
                    onChange={(e) => setNewStaffData({ ...newStaffData, salary: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsAddStaffOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddStaff}
                  className="flex-1 py-3 bg-amber-500 text-gray-900 rounded-2xl text-sm font-bold hover:bg-amber-400 transition-all"
                >
                  Create Staff
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-display font-bold text-gray-900">Edit Staff Data</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  >
                    <option value="worker">Worker</option>
                    <option value="operator">Operator</option>
                    <option value="manager">Manager</option>
                    <option value="mini-admin">Mini Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                  <select 
                    value={editingStaff.department}
                    onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  >
                    <option value="Production">Production</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Assembly">Assembly</option>
                    <option value="Administration">Administration</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleUpdateStaff(editingStaff)}
                  className="flex-1 py-3 bg-amber-500 text-gray-900 rounded-2xl text-sm font-bold hover:bg-amber-400 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {adjustingSalary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-display font-bold text-gray-900">Adjust Salary: {adjustingSalary.name}</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Monthly Salary ($)</label>
                <input 
                  type="number"
                  value={adjustingSalary.salary}
                  onChange={(e) => setAdjustingSalary({ ...adjustingSalary, salary: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setAdjustingSalary(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAdjustSalary(adjustingSalary.id, adjustingSalary.salary)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-2xl text-sm font-bold hover:bg-green-500 transition-all"
                >
                  Update Salary
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isAddActivityOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-display font-bold text-gray-900">Create New Activity</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Activity Title</label>
                  <input 
                    type="text"
                    value={newActivityData.title}
                    onChange={(e) => setNewActivityData({ ...newActivityData, title: e.target.value })}
                    placeholder="e.g. Warehouse Inventory Audit"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={newActivityData.description}
                    onChange={(e) => setNewActivityData({ ...newActivityData, description: e.target.value })}
                    placeholder="Describe the task..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all h-24 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign To Staff</label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-2xl p-2 space-y-1">
                    {staff.map(s => (
                      <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newActivityData.assignedTo.includes(s.id)}
                          onChange={(e) => {
                            const updated = e.target.checked 
                              ? [...newActivityData.assignedTo, s.id]
                              : newActivityData.assignedTo.filter(id => id !== s.id);
                            setNewActivityData({ ...newActivityData, assignedTo: updated });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-xs font-bold text-gray-700">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsAddActivityOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddActivity}
                  className="flex-1 py-3 bg-amber-500 text-gray-900 rounded-2xl text-sm font-bold hover:bg-amber-400 transition-all"
                >
                  Create Activity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
