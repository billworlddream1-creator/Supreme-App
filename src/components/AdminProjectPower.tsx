import React from 'react';
import { motion } from 'motion/react';
import { Rocket, DollarSign, TrendingUp, Users, Calendar, ArrowUpRight, BarChart3, Target, Activity } from 'lucide-react';
import clsx from 'clsx';

interface ProjectStats {
  id: string;
  name: string;
  creator: string;
  raised: number;
  goal: number;
  category: string;
  backers: number;
  createdAt: string;
  growth: number;
}

const MOCK_PROJECTS: ProjectStats[] = [
  {
    id: '1',
    name: 'Eco-Smart Home Hub',
    creator: 'GreenTech Solutions',
    raised: 125000,
    goal: 150000,
    category: 'Green Tech',
    backers: 842,
    createdAt: '2024-02-15',
    growth: 12.5
  },
  {
    id: '2',
    name: 'AI Content Engine',
    creator: 'Neural Labs',
    raised: 85000,
    goal: 50000,
    category: 'AI/ML',
    backers: 1205,
    createdAt: '2024-03-01',
    growth: 45.2
  },
  {
    id: '3',
    name: 'Quantum Mobile OS',
    creator: 'Future Systems',
    raised: 450000,
    goal: 1000000,
    category: 'Software',
    backers: 3420,
    createdAt: '2024-01-20',
    growth: 8.4
  },
  {
    id: '4',
    name: 'Urban Vertical Farm',
    creator: 'AgriNext',
    raised: 62000,
    goal: 75000,
    category: 'Agriculture',
    backers: 450,
    createdAt: '2024-03-10',
    growth: 22.1
  }
];

export default function AdminProjectPower() {
  const bestFunded = [...MOCK_PROJECTS].sort((a, b) => b.raised - a.raised);
  const bestCreated = [...MOCK_PROJECTS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalRaised = MOCK_PROJECTS.reduce((acc, p) => acc + p.raised, 0);
  const totalBackers = MOCK_PROJECTS.reduce((acc, p) => acc + p.backers, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-500">Project Power Analytics</h2>
          <p className="text-red-200/60">Track funding performance and project creation trends.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-red-900/40 rounded-xl border border-amber-500/20 text-center">
            <p className="text-[10px] text-amber-500/50 font-bold uppercase">Total Projects</p>
            <p className="text-xl font-bold text-white">{MOCK_PROJECTS.length}</p>
          </div>
          <div className="px-4 py-2 bg-red-900/40 rounded-xl border border-amber-500/20 text-center">
            <p className="text-[10px] text-amber-500/50 font-bold uppercase">Total Raised</p>
            <p className="text-xl font-bold text-green-400">${totalRaised.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Funded Projects */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-amber-100">Best Funded Projects</h3>
          </div>
          <div className="space-y-3">
            {bestFunded.map((project, i) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-red-950/30 rounded-2xl border border-amber-500/10 hover:border-amber-500/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-amber-100 group-hover:text-amber-500 transition-colors">{project.name}</h4>
                    <p className="text-xs text-red-200/40">by {project.creator}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">${project.raised.toLocaleString()}</p>
                    <p className="text-[10px] text-red-200/40 uppercase font-bold">{((project.raised / project.goal) * 100).toFixed(1)}% of goal</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-red-900/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((project.raised / project.goal) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                  />
                </div>
                <div className="flex justify-between items-center mt-3 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-amber-500/50 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {project.backers} Backers
                  </span>
                  <span className="text-amber-500/50 flex items-center gap-1">
                    <Target className="w-3 h-3" /> {project.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Best Created Projects (Recent/Trending) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-amber-100">Recently Created & Trending</h3>
          </div>
          <div className="space-y-3">
            {bestCreated.map((project, i) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-red-950/30 rounded-2xl border border-amber-500/10 hover:border-amber-500/30 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-100">{project.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-red-200/40 font-bold uppercase">
                        <Calendar className="w-3 h-3" /> Created {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-400 font-bold">
                      <TrendingUp className="w-4 h-4" />
                      +{project.growth}%
                    </div>
                    <p className="text-[10px] text-red-200/40 uppercase font-bold">Weekly Growth</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                    {project.category}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-red-900/30 text-red-200/60 text-[10px] font-bold border border-red-800/30">
                    {project.backers} Members
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Funding', value: `$${(totalRaised / MOCK_PROJECTS.length).toLocaleString()}`, icon: BarChart3 },
          { label: 'Avg Backers', value: Math.round(totalBackers / MOCK_PROJECTS.length), icon: Users },
          { label: 'Success Rate', value: '78%', icon: TrendingUp },
          { label: 'Active Campaigns', value: '124', icon: Activity },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-red-900/20 rounded-2xl border border-amber-500/10 flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-amber-500/50 font-bold uppercase">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
