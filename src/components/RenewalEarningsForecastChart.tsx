import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  Clock,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Zap,
  PieChart
} from 'lucide-react';
import clsx from 'clsx';

interface PromotionItem {
  id: string;
  title: string;
  type: 'sound' | 'short';
  earningExpiresAt?: string;
  downloads?: number;
  usagesCount?: number;
  uses?: number;
  totalRenewalSpent?: number;
  downloadsWhileExpired?: number;
  usagesWhileExpired?: number;
  usesWhileExpired?: number;
}

interface RenewalEarningsForecastChartProps {
  promotions: PromotionItem[];
  walletBalance: number;
  onOpenRenewalModal?: (item: PromotionItem) => void;
}

const SCENARIOS = {
  conservative: { label: 'Conservative (1x Baseline)', monthlyGrowthRate: 0.01 },
  steady: { label: 'Steady Growth (+5%/mo)', monthlyGrowthRate: 0.05 },
  viral: { label: 'Viral Surge (+12%/mo)', monthlyGrowthRate: 0.12 },
};

export default function RenewalEarningsForecastChart({
  promotions,
  walletBalance,
  onOpenRenewalModal,
}: RenewalEarningsForecastChartProps) {
  const [horizonMonths, setHorizonMonths] = useState<number>(12);
  const [scenario, setScenario] = useState<'conservative' | 'steady' | 'viral'>('steady');
  const [showDecayComparison, setShowDecayComparison] = useState<boolean>(true);

  // Calculate baseline metrics from promotions
  const activeCount = useMemo(() => {
    const now = Date.now();
    return promotions.filter(
      (p) => !p.earningExpiresAt || new Date(p.earningExpiresAt).getTime() > now
    ).length;
  }, [promotions]);

  const expiredCount = useMemo(() => {
    const now = Date.now();
    return promotions.filter(
      (p) => p.earningExpiresAt && new Date(p.earningExpiresAt).getTime() <= now
    ).length;
  }, [promotions]);

  // Forecast data generation
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    const growthRate = SCENARIOS[scenario].monthlyGrowthRate;

    // Estimate baseline monthly uses per item ($2.50 per 500 uses = $0.005 per use)
    // Calculate total recorded historical uses
    let totalUsesRecorded = 0;
    promotions.forEach((p) => {
      const uses = (p.downloads || 0) + (p.usagesCount || 0) + (p.uses || 0);
      totalUsesRecorded += uses > 0 ? uses : 500; // fallback default
    });

    const averageUsesPerItemPerMonth = promotions.length > 0
      ? Math.max(120, Math.round(totalUsesRecorded / (promotions.length * 3)))
      : 250;

    const royaltyPerUse = 0.005; // $2.50 per 500 uses

    let cumulativeRenewed = 0;
    let cumulativeUnrenewed = 0;

    for (let i = 0; i < horizonMonths; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = futureDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });

      // Determine active items count in month i without renewal vs with renewal
      let activeWithoutRenewalCount = 0;
      promotions.forEach((p) => {
        if (!p.earningExpiresAt) {
          activeWithoutRenewalCount += 1;
        } else {
          const expMs = new Date(p.earningExpiresAt).getTime();
          if (expMs > futureDate.getTime()) {
            activeWithoutRenewalCount += 1;
          }
        }
      });

      // Total items count assuming all active/renewed
      const activeWithRenewalCount = promotions.length > 0 ? promotions.length : 3;

      // Compounded monthly usage multiplier
      const growthFactor = Math.pow(1 + growthRate, i);

      // Monthly earnings WITH renewal strategy
      const monthlyWithRenewal = Math.round(
        activeWithRenewalCount * averageUsesPerItemPerMonth * growthFactor * royaltyPerUse * 100
      ) / 100;

      // Monthly earnings WITHOUT renewal (decaying as items expire)
      const monthlyWithoutRenewal = Math.round(
        activeWithoutRenewalCount * averageUsesPerItemPerMonth * growthFactor * royaltyPerUse * 100
      ) / 100;

      cumulativeRenewed += monthlyWithRenewal;
      cumulativeUnrenewed += monthlyWithoutRenewal;

      // Uncredited risk gap
      const monthlyRiskGap = Math.max(0, monthlyWithRenewal - monthlyWithoutRenewal);

      data.push({
        month: monthLabel,
        renewedEarnings: monthlyWithRenewal,
        unrenewedEarnings: monthlyWithoutRenewal,
        atRiskGap: monthlyRiskGap,
        cumulativeWithRenewal: Math.round(cumulativeRenewed),
        cumulativeWithoutRenewal: Math.round(cumulativeUnrenewed),
        activeTracksCount: activeWithRenewalCount,
        unrenewedTracksCount: activeWithoutRenewalCount,
      });
    }

    return data;
  }, [promotions, horizonMonths, scenario]);

  // Aggregate forecasting summary statistics
  const summary = useMemo(() => {
    const totalProjectedWithRenewal = chartData.reduce((acc, curr) => acc + curr.renewedEarnings, 0);
    const totalProjectedWithoutRenewal = chartData.reduce((acc, curr) => acc + curr.unrenewedEarnings, 0);
    const totalPotentialLost = Math.max(0, totalProjectedWithRenewal - totalProjectedWithoutRenewal);

    // Average estimated renewal investment for expired tracks ($10 / track for 1 yr)
    const estimatedRenewalCost = expiredCount * 10;
    const estimatedRoi = estimatedRenewalCost > 0
      ? ((totalPotentialLost / estimatedRenewalCost) * 100).toFixed(0)
      : '1,250';

    return {
      totalProjectedWithRenewal: totalProjectedWithRenewal.toFixed(2),
      totalProjectedWithoutRenewal: totalProjectedWithoutRenewal.toFixed(2),
      totalPotentialLost: totalPotentialLost.toFixed(2),
      estimatedRenewalCost,
      estimatedRoi,
      monthlyAverage: (totalProjectedWithRenewal / horizonMonths).toFixed(2),
    };
  }, [chartData, expiredCount, horizonMonths]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-white/20 shadow-2xl space-y-2.5 max-w-xs text-xs">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {label} Forecast
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              {dataPoint.activeTracksCount} Tracks Active
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="text-gray-300 font-sans">With 100% Renewals:</span>
              <span className="font-extrabold text-sm">${dataPoint.renewedEarnings.toFixed(2)} / mo</span>
            </div>

            {showDecayComparison && (
              <div className="flex justify-between items-center text-amber-400">
                <span className="text-gray-300 font-sans">Without Renewal (Expired):</span>
                <span className="font-bold">${dataPoint.unrenewedEarnings.toFixed(2)} / mo</span>
              </div>
            )}

            {dataPoint.atRiskGap > 0 && (
              <div className="flex justify-between items-center text-rose-400 pt-1 border-t border-white/10">
                <span className="text-gray-300 font-sans flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" /> At-Risk Loss:
                </span>
                <span className="font-bold">-${dataPoint.atRiskGap.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 text-[10px] text-gray-400 font-sans flex justify-between">
            <span>Cumulative Earnings:</span>
            <strong className="text-amber-300">${dataPoint.cumulativeWithRenewal.toLocaleString()}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Recharts Predictive Modeling
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              $2.50 / 500 Uses Royalty Model
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-2">
            Super Sounds & Shorts Royalty Forecast
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Project future passive royalty revenue based on current song and clip usages, 1-year expiration timelines, and extension billing tiers.
          </p>
        </div>

        {/* Dynamic Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Selector */}
          <div className="bg-black/40 p-1.5 rounded-2xl border border-white/10 flex items-center gap-1 text-xs">
            {[6, 12, 24].map((m) => (
              <button
                key={m}
                onClick={() => setHorizonMonths(m)}
                className={clsx(
                  'px-3 py-1.5 rounded-xl font-extrabold transition-all',
                  horizonMonths === m
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-105'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {m} Months
              </button>
            ))}
          </div>

          {/* Growth Scenario Dropdown */}
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as any)}
            className="bg-black/60 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-2xl focus:outline-none focus:border-amber-400"
          >
            {Object.entries(SCENARIOS).map(([key, val]) => (
              <option key={key} value={key} className="bg-slate-900 text-white">
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Projected {horizonMonths}-Mo Revenue
          </div>
          <div className="text-2xl font-black text-emerald-300">${summary.totalProjectedWithRenewal}</div>
          <p className="text-[10px] text-gray-400">Avg ${summary.monthlyAverage}/month passive earnings</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Unrenewed Risk Loss
          </div>
          <div className="text-2xl font-black text-amber-300">${summary.totalPotentialLost}</div>
          <p className="text-[10px] text-gray-400">Earnings forfeited if expired tracks pause</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Estimated Renewal ROI
          </div>
          <div className="text-2xl font-black text-purple-300">+{summary.estimatedRoi}%</div>
          <p className="text-[10px] text-gray-400">Estimated return per $10 renewal fee</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Monetized Catalog
          </div>
          <div className="text-2xl font-black text-teal-300">
            {activeCount} Active / {expiredCount} Expired
          </div>
          <p className="text-[10px] text-gray-400">Total {promotions.length} registered content items</p>
        </div>
      </div>

      {/* Main Recharts Area / Composed Chart */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <strong className="text-white">Active Renewal Revenue</strong>
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={showDecayComparison}
                onChange={(e) => setShowDecayComparison(e.target.checked)}
                className="rounded border-gray-700 bg-black text-amber-500 focus:ring-0"
              />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>Show Natural Expiration Decay</span>
            </label>
          </div>

          <span className="text-[11px] text-gray-400 italic">
            *Forecast models royalty earnings ($0.005/use) with compounding reach multiplier.
          </span>
        </div>

        <div className="h-[320px] w-full bg-black/40 rounded-2xl p-4 border border-white/10">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRenewed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorUnrenewed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={(val) => `$${val}`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="renewedEarnings"
                name="With Renewal"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRenewed)"
              />

              {showDecayComparison && (
                <Area
                  type="monotone"
                  dataKey="unrenewedEarnings"
                  name="Without Renewal"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorUnrenewed)"
                />
              )}

              <Line
                type="monotone"
                dataKey="atRiskGap"
                name="Forfeited Earnings Gap"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Call to Action Banner inside Chart */}
      {expiredCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-300 text-sm">
                {expiredCount} Song/Clip{expiredCount > 1 ? 's' : ''} Currently Expired & Earnings Paused
              </h4>
              <p className="text-gray-300 mt-0.5">
                Renewing billing for 1 to 5 years instantly unlocks uncredited royalty streams and restores top feed placement!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const expiredItem = promotions.find(
                (p) => p.earningExpiresAt && new Date(p.earningExpiresAt).getTime() <= Date.now()
              );
              if (expiredItem && onOpenRenewalModal) {
                onOpenRenewalModal(expiredItem);
              }
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-lg hover:brightness-110 transition-all shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Renew Expired Tracks Now ($10)
          </button>
        </div>
      )}
    </div>
  );
}
