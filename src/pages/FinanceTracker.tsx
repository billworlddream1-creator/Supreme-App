import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, AlertTriangle, 
  Bell, Plus, ArrowUpRight, ArrowDownRight, Activity, ShieldAlert,
  Settings, Filter, Calendar, ChevronDown, CheckCircle2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

// Mock Data
const SPENDING_DATA = [
  { name: 'Housing', value: 1200, color: '#3b82f6' },
  { name: 'Food', value: 450, color: '#10b981' },
  { name: 'Transport', value: 200, color: '#f59e0b' },
  { name: 'Entertainment', value: 150, color: '#8b5cf6' },
  { name: 'Utilities', value: 250, color: '#ef4444' },
];

const MONTHLY_TRENDS = [
  { month: 'Jan', income: 4000, spending: 2400, investment: 500 },
  { month: 'Feb', income: 4200, spending: 2100, investment: 800 },
  { month: 'Mar', income: 4100, spending: 2800, investment: 600 },
  { month: 'Apr', income: 4500, spending: 2200, investment: 1000 },
  { month: 'May', income: 4300, spending: 2500, investment: 700 },
  { month: 'Jun', income: 4800, spending: 2300, investment: 1200 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, type: 'expense', title: 'Grocery Store', amount: -120.50, date: 'Today, 2:30 PM', category: 'Food' },
  { id: 2, type: 'income', title: 'Salary Deposit', amount: 4200.00, date: 'Yesterday', category: 'Income' },
  { id: 3, type: 'expense', title: 'Electric Bill', amount: -85.20, date: 'Oct 24', category: 'Utilities' },
  { id: 4, type: 'investment', title: 'S&P 500 Index', amount: -500.00, date: 'Oct 22', category: 'Investment' },
  { id: 5, type: 'expense', title: 'Restaurant', amount: -65.00, date: 'Oct 21', category: 'Food' },
];

const ALERTS = [
  { id: 1, title: 'Unusual Spending Detected', message: 'You spent 40% more on Dining out this week.', type: 'warning', date: '2 hours ago' },
  { id: 2, title: 'Large Transfer', message: 'A transfer of $500 was made to Investments.', type: 'info', date: '1 day ago' },
  { id: 3, title: 'Subscription Increase', message: 'Your Netflix subscription increased by $2.', type: 'alert', date: '3 days ago' },
];

export default function FinanceTracker() {
  const [activeTab, setActiveTab] = useState<'overview' | 'spending' | 'investments' | 'alerts'>('overview');
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('500');
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  // Transaction form state
  const [txType, setTxType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txMerchant, setTxMerchant] = useState('');
  const [txDate, setTxDate] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txStatus, setTxStatus] = useState<'pending' | 'completed'>('completed');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveAlertSettings = () => {
    toast.success(`Alert threshold updated to $${alertThreshold}`);
    setShowAlertSettings(false);
  };

  const handleSaveTransaction = () => {
    if (!txAmount || !txMerchant || !txDate || !txCategory) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Transaction saved successfully');
    setShowAddTransaction(false);
    // Reset form
    setTxAmount('');
    setTxMerchant('');
    setTxDate('');
    setTxCategory('');
    setTxStatus('completed');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative flex items-center justify-center w-24 h-24 mb-4">
          <motion.div
            className="absolute inset-0 border-4 border-[var(--color-supreme-gold)]/20 rounded-full"
          />
          <motion.div
            className="absolute inset-0 border-4 border-[var(--color-supreme-gold)] rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <Activity className="w-8 h-8 text-[var(--color-supreme-gold)]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Finan Tracker</h2>
        <p className="text-gray-500 text-sm mt-2">Loading your financial data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[var(--color-supreme-gold)]/10 rounded-2xl">
              <Activity className="w-8 h-8 text-[var(--color-supreme-gold)]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Tracker Mode</h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            Track your spending, monitor income, manage investments, and set up smart alerts for unusual transactions.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAlertSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alert Settings</span>
          </button>
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl shadow-lg shadow-[var(--color-supreme-gold)]/20 hover:bg-yellow-600 transition-colors font-bold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {(['overview', 'spending', 'investments', 'alerts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap",
              activeTab === tab 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      +12.5%
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Income (This Month)</p>
                  <h3 className="text-3xl font-black text-gray-900">$4,800.00</h3>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      +5.2%
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Spending (This Month)</p>
                  <h3 className="text-3xl font-black text-gray-900">$2,300.00</h3>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      +8.4%
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Investments</p>
                  <h3 className="text-3xl font-black text-gray-900">$12,450.00</h3>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Income vs Spending</h3>
                    <select 
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value as any)}
                      className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[var(--color-supreme-gold)] focus:border-[var(--color-supreme-gold)] block p-2"
                    >
                      <option value="1M">Last Month</option>
                      <option value="3M">Last 3 Months</option>
                      <option value="6M">Last 6 Months</option>
                      <option value="1Y">Last Year</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MONTHLY_TRENDS}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          formatter={(value: number) => [`$${value}`, '']}
                        />
                        <Legend iconType="circle" />
                        <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="spending" name="Spending" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={SPENDING_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {SPENDING_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `$${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-3">
                    {SPENDING_DATA.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">${item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                  <button className="text-sm font-bold text-[var(--color-supreme-gold)] hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {RECENT_TRANSACTIONS.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          tx.type === 'income' ? "bg-green-100 text-green-600" :
                          tx.type === 'investment' ? "bg-blue-100 text-blue-600" :
                          "bg-red-100 text-red-600"
                        )}>
                          {tx.type === 'income' ? <ArrowDownRight className="w-6 h-6" /> :
                           tx.type === 'investment' ? <TrendingUp className="w-6 h-6" /> :
                           <ArrowUpRight className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{tx.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{tx.date}</span>
                            <span>•</span>
                            <span>{tx.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className={clsx(
                        "font-bold text-lg",
                        tx.amount > 0 ? "text-green-600" : "text-gray-900"
                      )}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spending' && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-full mb-4">
                <DollarSign className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Spending Analysis</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Break down your expenses by category, merchant, and time period to find saving opportunities.
              </p>
              
              <div className="h-[400px] w-full max-w-4xl mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_TRENDS}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="spending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Monthly Spending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                <TrendingUp className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Portfolio</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Track your stocks, crypto, and other assets. See your growth over time.
              </p>
              
              <div className="h-[400px] w-full max-w-4xl mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_TRENDS}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="investment" stroke="#3b82f6" strokeWidth={4} name="Investment Growth" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Alerts</h3>
                  <button 
                    onClick={() => setShowAlertSettings(true)}
                    className="text-sm font-bold text-[var(--color-supreme-gold)] hover:underline"
                  >
                    Configure Alerts
                  </button>
                </div>
                
                <div className="space-y-4">
                  {ALERTS.map((alert) => (
                    <div key={alert.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        alert.type === 'warning' ? "bg-yellow-100 text-yellow-600" :
                        alert.type === 'alert' ? "bg-red-100 text-red-600" :
                        "bg-blue-100 text-blue-600"
                      )}>
                        {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                         alert.type === 'alert' ? <ShieldAlert className="w-5 h-5" /> :
                         <Bell className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900">{alert.title}</h4>
                          <span className="text-xs text-gray-500">{alert.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Alert Settings Modal */}
      <AnimatePresence>
        {showAlertSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Alert Settings</h3>
                <button onClick={() => setShowAlertSettings(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Unusual Transaction Threshold ($)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Get notified when a single transaction exceeds this amount.
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none transition-all font-bold text-gray-900"
                      placeholder="e.g. 500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">Notification Types</label>
                  
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[var(--color-supreme-gold)] focus:ring-[var(--color-supreme-gold)]" />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-gray-900">Large Transactions</div>
                      <div className="text-xs text-gray-500">Alerts for transactions over threshold</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[var(--color-supreme-gold)] focus:ring-[var(--color-supreme-gold)]" />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-gray-900">Unusual Spending Patterns</div>
                      <div className="text-xs text-gray-500">Alerts when category spending spikes</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[var(--color-supreme-gold)] focus:ring-[var(--color-supreme-gold)]" />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-gray-900">Subscription Increases</div>
                      <div className="text-xs text-gray-500">Alerts when recurring bills go up</div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleSaveAlertSettings}
                  className="w-full py-3 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors shadow-lg shadow-[var(--color-supreme-gold)]/20"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md my-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Transaction</h3>
                <button onClick={() => setShowAddTransaction(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-2">
                  {(['expense', 'income', 'investment'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTxType(type)}
                      className={clsx(
                        "py-2 px-3 rounded-xl text-sm font-bold capitalize transition-colors border",
                        txType === type 
                          ? type === 'income' ? "bg-green-50 border-green-200 text-green-700"
                            : type === 'investment' ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-red-50 border-red-200 text-red-700"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none transition-all font-bold text-gray-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Merchant / Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Merchant / Title</label>
                  <input
                    type="text"
                    value={txMerchant}
                    onChange={(e) => setTxMerchant(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="e.g. Grocery Store"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none transition-all text-gray-900"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none transition-all text-gray-900"
                    >
                      <option value="">Select...</option>
                      <option value="Food">Food & Dining</option>
                      <option value="Housing">Housing</option>
                      <option value="Transport">Transportation</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Income">Income</option>
                      <option value="Investment">Investment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="completed"
                        checked={txStatus === 'completed'}
                        onChange={() => setTxStatus('completed')}
                        className="text-[var(--color-supreme-gold)] focus:ring-[var(--color-supreme-gold)]"
                      />
                      <span className="text-sm text-gray-700">Completed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="pending"
                        checked={txStatus === 'pending'}
                        onChange={() => setTxStatus('pending')}
                        className="text-[var(--color-supreme-gold)] focus:ring-[var(--color-supreme-gold)]"
                      />
                      <span className="text-sm text-gray-700">Pending</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSaveTransaction}
                  className="w-full py-3 mt-4 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors shadow-lg shadow-[var(--color-supreme-gold)]/20"
                >
                  Save Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
