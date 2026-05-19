import React from 'react';
import { useActivityFlash } from '../context/ActivityFlashContext';
import { Settings, Clock, Zap, Hash, Power, Layout, Palette } from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminActivityFlashManager() {
  const { settings, updateSettings } = useActivityFlash();

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--color-supreme-gold)]" />
            Activity Flash Screen Settings
          </h3>
          <p className="text-sm text-gray-500">Control the dashboard activity notification flashes</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={settings.isEnabled}
            onChange={(e) => updateSettings({ isEnabled: e.target.checked })}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-supreme-gold)]"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Clock className="w-4 h-4 text-gray-400" /> Flash Speed (Seconds)
          </label>
          <input 
            type="number" 
            min="1" 
            max="120"
            value={settings.flashDuration}
            onChange={(e) => updateSettings({ flashDuration: Number(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
          />
          <p className="text-xs text-gray-500">How long each notification stays on screen (25s recommended).</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Hash className="w-4 h-4 text-gray-400" /> Flash Count
          </label>
          <input 
            type="number" 
            min="1"
            value={settings.flashCountBeforePause}
            onChange={(e) => updateSettings({ flashCountBeforePause: Number(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
          />
          <p className="text-xs text-gray-500">Number of flashes before pausing.</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Power className="w-4 h-4 text-gray-400" /> Pause Time (Seconds)
          </label>
          <input 
            type="number" 
            min="10"
            value={settings.pauseDuration}
            onChange={(e) => updateSettings({ pauseDuration: Number(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
          />
          <p className="text-xs text-gray-500">Duration to pause after the flash count is reached (120s = 2 mins).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Layout className="w-4 h-4 text-gray-400" /> Screen Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => updateSettings({ position: pos })}
                className={clsx(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  settings.position === pos 
                    ? "bg-[var(--color-supreme-gold)] border-amber-400 text-black shadow-sm" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                {pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Palette className="w-4 h-4 text-gray-400" /> Visual Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['glass', 'light', 'dark', 'gold'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme: theme })}
                className={clsx(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  settings.theme === theme 
                    ? "bg-[var(--color-supreme-gold)] border-amber-400 text-black shadow-sm" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
