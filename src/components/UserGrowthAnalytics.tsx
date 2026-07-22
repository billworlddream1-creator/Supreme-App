import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  UserPlus, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Sparkles, 
  Crown, 
  Target, 
  Clock, 
  Layers, 
  HelpCircle,
  Activity,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { clsx } from 'clsx';

// Type definitions
type Timeframe = '7d' | '30d' | '90d' | '1y';
type ChartType = 'cumulative' | 'daily' | 'segments' | 'conversions';

export default function UserGrowthAnalytics() {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [chartType, setChartType] = useState<ChartType>('cumulative');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(null);

  // Filter line toggles
  const [showStandard, setShowStandard] = useState(true);
  const [showDealers, setShowDealers] = useState(true);
  const [showPremium, setShowPremium] = useState(true);

  // 1. Core High-Fidelity Data Generators
  const data7d = useMemo(() => [
    { name: 'Mon', total: 12100, daily: 140, dealers: 12, premium: 35, convRate: 2.1 },
    { name: 'Tue', total: 12220, daily: 120, dealers: 8, premium: 42, convRate: 2.3 },
    { name: 'Wed', total: 12380, daily: 160, dealers: 15, premium: 50, convRate: 2.5 },
    { name: 'Thu', total: 12490, daily: 110, dealers: 10, premium: 38, convRate: 2.2 },
    { name: 'Fri', total: 12640, daily: 150, dealers: 18, premium: 55, convRate: 2.6 },
    { name: 'Sat', total: 12720, daily: 80, dealers: 5, premium: 28, convRate: 1.9 },
    { name: 'Sun', total: 12850, daily: 130, dealers: 11, premium: 48, convRate: 2.4 },
  ], []);

  const data30d = useMemo(() => {
    const arr = [];
    let startVal = 10800;
    for (let i = 1; i <= 30; i++) {
      const dailyNew = Math.floor(100 + Math.sin(i / 2) * 40 + Math.random() * 30);
      const dealers = Math.floor(5 + Math.random() * 8);
      const premium = Math.floor(20 + Math.sin(i / 3) * 10 + Math.random() * 15);
      startVal += dailyNew;
      arr.push({
        name: `Day ${i}`,
        total: startVal,
        daily: dailyNew,
        dealers: dealers,
        premium: premium,
        convRate: parseFloat((1.8 + Math.sin(i / 5) * 0.4 + Math.random() * 0.3).toFixed(2))
      });
    }
    return arr;
  }, []);

  const data90d = useMemo(() => {
    const arr = [];
    let startVal = 8500;
    for (let i = 1; i <= 12; i++) {
      const dailyNew = Math.floor(700 + Math.sin(i / 1.5) * 150 + Math.random() * 100);
      const dealers = Math.floor(40 + Math.random() * 30);
      const premium = Math.floor(150 + Math.random() * 80);
      startVal += dailyNew;
      arr.push({
        name: `Wk ${i}`,
        total: startVal,
        daily: dailyNew,
        dealers: dealers,
        premium: premium,
        convRate: parseFloat((2.0 + Math.sin(i / 4) * 0.5).toFixed(2))
      });
    }
    return arr;
  }, []);

  const data1y = useMemo(() => [
    { name: 'Jul', total: 5200, daily: 1200, dealers: 110, premium: 450, convRate: 1.8 },
    { name: 'Aug', total: 6500, daily: 1300, dealers: 120, premium: 520, convRate: 1.9 },
    { name: 'Sep', total: 7800, daily: 1300, dealers: 115, premium: 500, convRate: 2.0 },
    { name: 'Oct', total: 8900, daily: 1100, dealers: 95, premium: 410, convRate: 2.1 },
    { name: 'Nov', total: 10100, daily: 1200, dealers: 130, premium: 490, convRate: 2.2 },
    { name: 'Dec', total: 11500, daily: 1400, dealers: 150, premium: 610, convRate: 2.4 },
    { name: 'Jan', total: 12850, daily: 1350, dealers: 145, premium: 580, convRate: 2.5 },
  ], []);

  const currentData = useMemo(() => {
    switch (timeframe) {
      case '7d': return data7d;
      case '90d': return data90d;
      case '1y': return data1y;
      case '30d':
      default:
        return data30d;
    }
  }, [timeframe, data7d, data30d, data90d, data1y]);

  // Derived Summary metrics based on current data
  const statsSummary = useMemo(() => {
    const len = currentData.length;
    const finalVal = currentData[len - 1]?.total || 0;
    const initialVal = currentData[0]?.total || 0;
    const netGrowth = finalVal - initialVal;
    const growthPercent = ((netGrowth / initialVal) * 100).toFixed(1);

    const totalNewDealers = currentData.reduce((acc, curr) => acc + curr.dealers, 0);
    const totalNewPremium = currentData.reduce((acc, curr) => acc + curr.premium, 0);
    const avgConvRate = (currentData.reduce((acc, curr) => acc + curr.convRate, 0) / len).toFixed(2);

    return {
      finalVal,
      netGrowth,
      growthPercent,
      totalNewDealers,
      totalNewPremium,
      avgConvRate
    };
  }, [currentData]);

  // Roles distribution for Pie Chart
  const pieData = [
    { name: 'Standard Users', value: 9420, color: '#3b82f6', percent: '75.6%', desc: 'Ad-supported community tier with general core features.' },
    { name: 'Premium Members', value: 2185, color: 'var(--color-supreme-gold)', percent: '17.5%', desc: 'Subscribed users with multi-module console privileges.' },
    { name: 'Market Dealers', value: 753, color: '#10b981', percent: '6.0%', desc: 'Verified commercial upload and trading operators.' },
    { name: 'System Admins', value: 100, color: '#a855f7', percent: '0.9%', desc: 'Staff with command execution and platform control access.' },
  ];

  const milestoneProgress = useMemo(() => {
    const target = 15000;
    const current = statsSummary.finalVal;
    const percent = Math.min(100, Math.floor((current / target) * 100));
    return { target, current, percent };
  }, [statsSummary.finalVal]);

  return (
    <div className="bg-gradient-to-b from-gray-950 to-black rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl p-6 sm:p-8 space-y-8">
      
      {/* Header section with layout adjustments */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] text-[10px] font-black uppercase tracking-widest border border-[var(--color-supreme-gold)]/20">
              Supreme Intelligence Panel
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE METRICS
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-3">
            User Growth &amp; Conversion Analytics
            <Sparkles className="w-5 h-5 text-[var(--color-supreme-gold)]" />
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time visual tracking of user registration speed, commercial dealer onboarding, and premium service tier converts.
          </p>
        </div>

        {/* Filters and Timeframe controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/5">
            {(['cumulative', 'daily', 'conversions', 'segments'] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize",
                  chartType === type 
                    ? "bg-[var(--color-supreme-gold)] text-black font-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {type === 'segments' ? 'Segments Split' : type === 'conversions' ? 'Conv. Rate' : type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-white/5">
            {(['7d', '30d', '90d', '1y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={clsx(
                  "w-11 py-2 rounded-xl text-xs font-mono font-bold transition-all uppercase",
                  timeframe === tf 
                    ? "bg-white/10 text-white font-black border border-white/10"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics KPI Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-[var(--color-supreme-gold)]/20 transition-all cursor-pointer relative group overflow-hidden"
          onMouseEnter={() => setHoveredMetric('total')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/10">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold font-mono">
              <ArrowUpRight className="w-3 h-3" />
              {statsSummary.growthPercent}%
            </span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Total Users Peak</p>
          <p className="text-3xl font-black text-white mt-1 font-mono tracking-tight">{statsSummary.finalVal.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 mt-2">
            Net +{statsSummary.netGrowth.toLocaleString()} in the last period.
          </p>
          <div className="absolute bottom-0 left-0 h-[2px] bg-blue-500 transition-all duration-300 w-0 group-hover:w-full" />
        </div>

        {/* Metric 2 */}
        <div 
          className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-[var(--color-supreme-gold)]/20 transition-all cursor-pointer relative group overflow-hidden"
          onMouseEnter={() => setHoveredMetric('dealers')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold font-mono">
              <ArrowUpRight className="w-3 h-3" />
              +{(statsSummary.totalNewDealers / 5).toFixed(0)}/d
            </span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">New Market Dealers</p>
          <p className="text-3xl font-black text-white mt-1 font-mono tracking-tight">+{statsSummary.totalNewDealers}</p>
          <p className="text-[11px] text-gray-400 mt-2">
            Elevating core business volume.
          </p>
          <div className="absolute bottom-0 left-0 h-[2px] bg-emerald-500 transition-all duration-300 w-0 group-hover:w-full" />
        </div>

        {/* Metric 3 */}
        <div 
          className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-[var(--color-supreme-gold)]/20 transition-all cursor-pointer relative group overflow-hidden"
          onMouseEnter={() => setHoveredMetric('premium')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-[var(--color-supreme-gold)] border border-amber-500/10">
              <Crown className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] text-yellow-400 font-bold font-mono">
              <ArrowUpRight className="w-3 h-3" />
              +{(statsSummary.totalNewPremium / 10).toFixed(0)}/d
            </span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Premium Converts</p>
          <p className="text-3xl font-black text-white mt-1 font-mono tracking-tight">+{statsSummary.totalNewPremium}</p>
          <p className="text-[11px] text-gray-400 mt-2">
            Active premium subscription tier.
          </p>
          <div className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-supreme-gold)] transition-all duration-300 w-0 group-hover:w-full" />
        </div>

        {/* Metric 4 */}
        <div 
          className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-[var(--color-supreme-gold)]/20 transition-all cursor-pointer relative group overflow-hidden"
          onMouseEnter={() => setHoveredMetric('velocity')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] text-purple-400 font-bold font-mono">
              {statsSummary.avgConvRate}% Avg
            </span>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Conversion Velocity</p>
          <p className="text-3xl font-black text-white mt-1 font-mono tracking-tight">{(statsSummary.finalVal / 1000 * parseFloat(statsSummary.avgConvRate)).toFixed(0)}</p>
          <p className="text-[11px] text-gray-400 mt-2">
            Monthly premium upgrade pace index.
          </p>
          <div className="absolute bottom-0 left-0 h-[2px] bg-purple-500 transition-all duration-300 w-0 group-hover:w-full" />
        </div>
      </div>

      {/* Main Interactive Charts Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 2/3: Selected Trend Visualizer */}
        <div className="xl:col-span-2 bg-black/40 border border-white/5 p-6 sm:p-8 rounded-[2rem] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider text-xs font-black">
                {chartType === 'cumulative' && 'Cumulative Registrations Stream'}
                {chartType === 'daily' && 'Daily Signups & Dealer Onboarding Pacing'}
                {chartType === 'conversions' && 'Conversion Rate Fluctuations'}
                {chartType === 'segments' && 'Platform Segment Breakdown'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Visualizing results mapped across {timeframe === '7d' ? 'this week' : timeframe === '30d' ? 'last 30 days' : timeframe === '90d' ? 'last 3 months' : 'last fiscal year'}.
              </p>
            </div>

            {/* Line Selection Toggles for Cumulative/Daily view */}
            {chartType !== 'segments' && chartType !== 'conversions' && (
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setShowStandard(!showStandard)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5",
                    showStandard 
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                      : "bg-black/40 border-white/5 text-gray-600 hover:text-gray-400"
                  )}
                >
                  <span className={clsx("w-1.5 h-1.5 rounded-full", showStandard ? "bg-blue-500" : "bg-gray-600")} />
                  Users
                </button>
                <button 
                  onClick={() => setShowDealers(!showDealers)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5",
                    showDealers 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-black/40 border-white/5 text-gray-600 hover:text-gray-400"
                  )}
                >
                  <span className={clsx("w-1.5 h-1.5 rounded-full", showDealers ? "bg-emerald-500" : "bg-gray-600")} />
                  Dealers
                </button>
                <button 
                  onClick={() => setShowPremium(!showPremium)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5",
                    showPremium 
                      ? "bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)]/30 text-[var(--color-supreme-gold)]" 
                      : "bg-black/40 border-white/5 text-gray-600 hover:text-gray-400"
                  )}
                >
                  <span className={clsx("w-1.5 h-1.5 rounded-full", showPremium ? "bg-[var(--color-supreme-gold)]" : "bg-gray-600")} />
                  Premium
                </button>
              </div>
            )}
          </div>

          <div className="h-[340px] w-full bg-black/20 p-2 rounded-2xl border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'cumulative' ? (
                <AreaChart data={currentData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-supreme-gold)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-supreme-gold)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }}
                    domain={['auto', 'auto']}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '11px' }}
                  />
                  {showStandard && (
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      name="Cumulative Users"
                    />
                  )}
                  {showPremium && (
                    <Area 
                      type="monotone" 
                      dataKey="premium" 
                      stroke="var(--color-supreme-gold)" 
                      strokeWidth={2} 
                      fillOpacity={0.5} 
                      fill="url(#colorPremium)" 
                      name="Active Premium"
                    />
                  )}
                </AreaChart>
              ) : chartType === 'daily' ? (
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '11px' }}
                  />
                  {showStandard && <Bar dataKey="daily" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Users" />}
                  {showDealers && <Bar dataKey="dealers" fill="#10b981" radius={[4, 4, 0, 0]} name="New Dealers" />}
                  {showPremium && <Bar dataKey="premium" fill="var(--color-supreme-gold)" radius={[4, 4, 0, 0]} name="Premium Converts" />}
                </BarChart>
              ) : chartType === 'conversions' ? (
                <AreaChart data={currentData}>
                  <defs>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }}
                    unit="%"
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="convRate" 
                    stroke="#a855f7" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorConv)" 
                    name="Conversion Velocity"
                  />
                </AreaChart>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-around h-full gap-4 py-4">
                  <div className="w-[180px] h-[180px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          onMouseEnter={(_, idx) => setSelectedPieIndex(idx)}
                          onMouseLeave={() => setSelectedPieIndex(null)}
                        >
                          {pieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              opacity={selectedPieIndex === null || selectedPieIndex === index ? 1 : 0.4}
                              className="transition-all duration-300"
                              style={{ outline: 'none' }}
                            />
                          ))}
                        </Pie>
                      </RePieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-gray-500 uppercase font-black">Segment</span>
                      <span className="text-sm font-black text-white font-mono">
                        {selectedPieIndex !== null ? pieData[selectedPieIndex].percent : 'Overview'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 max-w-sm">
                    {pieData.map((item, idx) => (
                      <div 
                        key={idx}
                        onMouseEnter={() => setSelectedPieIndex(idx)}
                        onMouseLeave={() => setSelectedPieIndex(null)}
                        className={clsx(
                          "p-2.5 rounded-xl border transition-all cursor-pointer",
                          selectedPieIndex === idx 
                            ? "bg-white/5 border-white/10" 
                            : "bg-transparent border-transparent"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs font-bold text-white">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-black text-gray-400">{item.value.toLocaleString()} ({item.percent})</span>
                        </div>
                        {selectedPieIndex === idx && (
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1/3: Predictive & Milestone Panel */}
        <div className="space-y-6">
          
          {/* Milestone Target Tracker */}
          <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Growth Milestone Target</h3>
              <Target className="w-4 h-4 text-[var(--color-supreme-gold)]" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <p className="text-3xl font-black text-white font-mono tracking-tight">{milestoneProgress.current.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Target: {milestoneProgress.target.toLocaleString()}</p>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-[var(--color-supreme-gold)] rounded-full transition-all duration-1000"
                  style={{ width: `${milestoneProgress.percent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                <span>{milestoneProgress.percent}% Completed</span>
                <span className="font-bold text-white font-mono">{(milestoneProgress.target - milestoneProgress.current).toLocaleString()} Remaining</span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex gap-3 items-center">
              <div className="p-2 rounded-xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-gray-300">Milestone Pacing Status</p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium leading-normal">
                  On track to hit 15,000 registered users in 12 days based on average growth speed!
                </p>
              </div>
            </div>
          </div>

          {/* User Registration Peak Analytics */}
          <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Registration Hot-Hours</h3>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>

            <div className="space-y-3">
              {[
                { time: '18:00 - 21:00 UTC', label: 'Evening Peak Density', count: '41% of signups', active: true },
                { time: '12:00 - 15:00 UTC', label: 'Mid-Day Lunch Uplink', count: '29% of signups', active: false },
                { time: '02:00 - 05:00 UTC', label: 'Night-Shift Registrants', count: '18% of signups', active: false },
              ].map((hour, idx) => (
                <div key={idx} className={clsx(
                  "p-3 rounded-2xl border flex items-center justify-between gap-3",
                  hour.active 
                    ? "bg-purple-500/5 border-purple-500/20" 
                    : "bg-transparent border-transparent"
                )}>
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{hour.time}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{hour.label}</p>
                  </div>
                  <span className={clsx(
                    "px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono tracking-tight shrink-0",
                    hour.active ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-gray-400"
                  )}>
                    {hour.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Conversion Insights */}
          <div className="bg-gradient-to-r from-amber-600/15 via-purple-900/10 to-transparent border border-amber-500/10 p-5 rounded-[2rem] flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-[var(--color-supreme-gold)] mt-0.5 border border-amber-500/10 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-amber-400 uppercase tracking-wider">Conversion Velocity Tip</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Dealers verify profiles within 48 hours. Providing standard premium trials to non-premium active users on day 5 boosts conversion probability by <span className="text-emerald-400 font-bold">+24.3%</span>.
              </p>
              <div className="pt-2">
                <button className="text-[10px] font-black uppercase text-[var(--color-supreme-gold)] tracking-wider hover:underline flex items-center gap-1">
                  View Promotional Strategies <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
