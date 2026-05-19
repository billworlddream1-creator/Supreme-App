import React, { useState } from 'react';
import { useSecurity, SecurityEvent } from '../context/SecurityContext';
import { 
  ShieldAlert, ShieldCheck, MapPin, Globe, 
  Terminal, Lock, Unlock, AlertTriangle, 
  Search, Filter, ExternalLink, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

export default function SecurityMonitor() {
  const { events, blockedIps, blockIp, unblockIp } = useSecurity();
  const [filter, setFilter] = useState<SecurityEvent['severity'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(e => {
    const matchesFilter = filter === 'all' || e.severity === filter;
    const matchesSearch = e.ip.includes(searchTerm) || e.manner.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-red-900/30 rounded-2xl border border-amber-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><ShieldAlert className="w-5 h-5" /></div>
            <h3 className="font-bold text-amber-100">Active Threats</h3>
          </div>
          <p className="text-3xl font-bold text-white">{events.filter(e => e.status === 'active').length}</p>
          <p className="text-sm text-red-200/40 mt-1">Requiring immediate attention</p>
        </div>
        <div className="p-6 bg-red-900/30 rounded-2xl border border-amber-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><ShieldCheck className="w-5 h-5" /></div>
            <h3 className="font-bold text-amber-100">Blocked IPs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{blockedIps.length}</p>
          <p className="text-sm text-red-200/40 mt-1">Currently restricted from access</p>
        </div>
        <div className="p-6 bg-red-900/30 rounded-2xl border border-amber-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Globe className="w-5 h-5" /></div>
            <h3 className="font-bold text-amber-100">Global Coverage</h3>
          </div>
          <p className="text-3xl font-bold text-white">{new Set(events.map(e => e.location.country)).size}</p>
          <p className="text-sm text-red-200/40 mt-1">Countries monitored</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by IP, country, or attack type..."
            className="w-full pl-11 pr-4 py-2 rounded-xl bg-red-950/50 border border-amber-500/20 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-500/50" />
          <div className="flex bg-red-950/50 p-1 rounded-lg border border-amber-500/20">
            {(['all', 'low', 'medium', 'high', 'critical'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={clsx(
                  "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                  filter === s ? "bg-amber-500 text-red-950" : "text-red-200/50 hover:text-amber-500"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <motion.div 
            layout
            key={event.id}
            className="p-4 bg-red-900/20 rounded-2xl border border-amber-500/10 flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="flex gap-4">
              <div className={clsx(
                "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0",
                getSeverityColor(event.severity)
              )}>
                <Terminal className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-amber-100">{event.ip}</h4>
                  <span className={clsx(
                    "text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase",
                    getSeverityColor(event.severity)
                  )}>
                    {event.severity}
                  </span>
                  {event.status === 'blocked' && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-500 uppercase">
                      Blocked
                    </span>
                  )}
                </div>
                <p className="text-sm text-red-200/70">{event.manner}</p>
                <div className="flex items-center gap-4 text-[10px] text-red-200/40 font-bold uppercase">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location.city}, {event.location.country}</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {event.type.replace('-', ' ')}</span>
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              {blockedIps.includes(event.ip) ? (
                <button 
                  onClick={() => unblockIp(event.ip)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold hover:bg-green-500/20 transition-colors"
                >
                  <Unlock className="w-4 h-4" /> Unblock IP
                </button>
              ) : (
                <button 
                  onClick={() => blockIp(event.ip)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors"
                >
                  <Lock className="w-4 h-4" /> Block IP
                </button>
              )}
              <button className="p-2 text-red-200/20 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="py-20 text-center space-y-4 border-2 border-dashed border-red-800/30 rounded-3xl">
            <ShieldCheck className="w-12 h-12 text-red-800/30 mx-auto" />
            <p className="text-red-200/30 italic">No security threats detected matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
