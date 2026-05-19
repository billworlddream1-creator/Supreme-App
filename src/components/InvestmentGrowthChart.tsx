import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaProps
} from 'recharts';
import { TrendingUp, ArrowUpRight, DollarSign } from 'lucide-react';

const data = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 4500 },
  { month: 'Mar', value: 4200 },
  { month: 'Apr', value: 5800 },
  { month: 'May', value: 6200 },
  { month: 'Jun', value: 7500 },
  { month: 'Jul', value: 8100 },
  { month: 'Aug', value: 7800 },
  { month: 'Sep', value: 9200 },
  { month: 'Oct', value: 10500 },
  { month: 'Nov', value: 11200 },
  { month: 'Dec', value: 12500 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xl">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-lg font-bold text-[var(--color-supreme-gold)]">
          ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> +12.5% from last month
        </p>
      </div>
    );
  }
  return null;
};

export default function InvestmentGrowthChart() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Investment Growth
          </h3>
          <p className="text-sm text-gray-500">Visual representation of your portfolio performance over the last 12 months.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100">
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Total Growth</p>
            <p className="text-lg font-bold text-green-700">+212.5%</p>
          </div>
          <div className="px-4 py-2 bg-[var(--color-supreme-gold)]/10 rounded-xl border border-[var(--color-supreme-gold)]/20">
            <p className="text-[10px] font-bold text-[var(--color-supreme-gold)] uppercase tracking-wider">Portfolio Value</p>
            <p className="text-lg font-bold text-[var(--color-supreme-text)]">$12,500</p>
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full bg-white/50 rounded-2xl p-4 border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b8860b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#b8860b"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Best Month</p>
          <p className="text-lg font-bold text-gray-900">December</p>
          <p className="text-xs text-green-600 font-medium">+$1,300 profit</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Average Monthly</p>
          <p className="text-lg font-bold text-gray-900">$7,533</p>
          <p className="text-xs text-blue-600 font-medium">+8.4% avg. growth</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Projected (Next Mo)</p>
          <p className="text-lg font-bold text-gray-900">$13,800</p>
          <p className="text-xs text-purple-600 font-medium">Based on current trend</p>
        </div>
      </div>
    </div>
  );
}
