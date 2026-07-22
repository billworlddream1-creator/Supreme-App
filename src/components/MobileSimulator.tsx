import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCw, 
  Smartphone, 
  Tablet, 
  Sparkles, 
  Check, 
  Grid3X3, 
  Maximize2, 
  Battery, 
  Wifi, 
  Signal, 
  Info,
  Sliders,
  ChevronRight,
  ZoomIn,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface MobileSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialPath: string;
}

interface DeviceConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  bezel: string;
  radius: string;
  type: 'phone' | 'tablet';
  hasDynamicIsland?: boolean;
}

const DEVICES: DeviceConfig[] = [
  {
    id: 'iphone15',
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    bezel: 'border-[12px] border-neutral-900',
    radius: 'rounded-[50px]',
    type: 'phone',
    hasDynamicIsland: true
  },
  {
    id: 'galaxy24',
    name: 'Galaxy S24 Ultra',
    width: 412,
    height: 892,
    bezel: 'border-[8px] border-neutral-950',
    radius: 'rounded-[32px]',
    type: 'phone',
    hasDynamicIsland: false
  },
  {
    id: 'ipadmini',
    name: 'iPad Mini',
    width: 768,
    height: 1024,
    bezel: 'border-[18px] border-neutral-900',
    radius: 'rounded-[28px]',
    type: 'tablet',
    hasDynamicIsland: false
  }
];

export default function MobileSimulator({ isOpen, onClose, initialPath }: MobileSimulatorProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(DEVICES[0]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(88);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Live status bar clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 12 instead of 0
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync baterry discharge slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => (prev > 5 ? prev - 1 : 99));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  // Derive iframe source URL with the current page hash
  const getIframeUrl = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}${initialPath}`;
  };

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    setIsIframeLoading(false);
    const iframeWindow = e.currentTarget.contentWindow;
    if (!iframeWindow) return;

    // Synchronize iframe navigation state with parent URL hash
    const syncUrls = () => {
      try {
        const iframeHash = iframeWindow.location.hash;
        if (iframeHash && window.location.hash !== iframeHash) {
          window.history.replaceState(null, '', iframeHash);
        }
      } catch (err) {
        // Handle cross-origin warnings if any (shouldn't happen on same origin)
        console.warn("URL sync error:", err);
      }
    };

    try {
      iframeWindow.addEventListener('hashchange', syncUrls);
      // Synchronize immediately on load
      syncUrls();
    } catch (e) {
      console.warn("Could not bind hashchange listener to iframe:", e);
    }
  };

  const currentWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
  const currentHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

  return (
    <div id="mobile-simulator-overlay" className="fixed inset-0 z-[9999] bg-neutral-950 flex flex-col md:flex-row overflow-hidden font-sans select-none">
      {/* Designer Studio Grid Background */}
      {showGrid && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
      )}

      {/* Control Panel (Siderail) */}
      <div className="w-full md:w-80 shrink-0 bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-800 p-6 flex flex-col justify-between z-10 shadow-2xl relative">
        <div className="space-y-6">
          {/* Studio Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Smartphone className="text-neutral-900 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-none">SUPREME</h2>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Mobile Studio</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all"
              title="Close Simulator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-px bg-neutral-800" />

          {/* Device Selection */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Select Device</label>
            <div className="grid grid-cols-1 gap-2">
              {DEVICES.map((dev) => {
                const isSelected = selectedDevice.id === dev.id;
                return (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    className={clsx(
                      "flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group",
                      isSelected 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold shadow-lg shadow-amber-500/5" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {dev.type === 'tablet' ? (
                        <Tablet className="w-4 h-4" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                      <div>
                        <p className="text-xs font-bold leading-tight text-white">{dev.name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{dev.width} × {dev.height} px</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-neutral-950" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation & Aspect Controls */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Layout Controls</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsLandscape(!isLandscape)}
                className="flex items-center justify-center gap-2 py-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all text-xs font-bold"
              >
                <RotateCw className={clsx("w-4 h-4 transition-transform duration-300", isLandscape && "rotate-90")} />
                <span>{isLandscape ? 'Landscape' : 'Portrait'}</span>
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={clsx(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-bold",
                  showGrid 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                    : "bg-neutral-950 border-neutral-800 text-white hover:bg-neutral-800 hover:border-neutral-700"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Grid Alignment</span>
              </button>
            </div>
          </div>

          {/* Scale Adjustment */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Simulator Scale</label>
            <div className="flex items-center gap-2">
              {[0.7, 0.85, 1.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={clsx(
                    "flex-1 py-2 text-xs font-mono font-bold rounded-lg border transition-all",
                    scale === s 
                      ? "bg-neutral-100 border-white text-neutral-950" 
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  {s * 100}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="mt-8 p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 space-y-2">
          <div className="flex gap-2 text-amber-500">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Device Sandbox</h4>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Click, swipe, and explore the app. Navigation inside the simulated frame stays synced with your browser's address bar.
          </p>
        </div>
      </div>

      {/* Main Interactive Workspace Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 md:p-12 relative bg-neutral-950">
        {/* Absolute coordinates tags */}
        <div className="absolute top-4 left-6 text-[10px] font-mono text-neutral-500 uppercase tracking-widest hidden md:block">
          Workspace Sandbox: {currentWidth} x {currentHeight} px
        </div>

        {/* The Phone Container */}
        <div 
          className="transition-all duration-500 ease-out flex items-center justify-center"
          style={{ transform: `scale(${scale})` }}
        >
          <div 
            className={clsx(
              "relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-neutral-800 transition-all duration-500 overflow-hidden",
              selectedDevice.bezel,
              selectedDevice.radius
            )}
            style={{ 
              width: `${currentWidth}px`, 
              height: `${currentHeight}px` 
            }}
          >
            {/* Status Bar (Interactive Mockup for Mobile Realism) */}
            <div className="absolute top-0 inset-x-0 h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-between px-6 select-none border-b border-gray-100/10">
              <div className="text-xs font-bold text-gray-900 dark:text-white font-mono flex items-center gap-1.5">
                <span>{currentTime}</span>
                <span className="text-[9px] text-amber-500 font-extrabold uppercase bg-amber-500/10 px-1 rounded">5G</span>
              </div>

              {/* Dynamic Island Notch Area */}
              {selectedDevice.hasDynamicIsland && !isLandscape && (
                <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-28 h-6 bg-black rounded-full shadow-inner flex items-center justify-end px-3">
                  <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-neutral-800" />
                </div>
              )}

              {/* Galaxy camera punch-hole */}
              {selectedDevice.id === 'galaxy24' && !isLandscape && (
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3.5 h-3.5 bg-black rounded-full shadow-inner" />
              )}

              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-bold">{batteryLevel}%</span>
                  <Battery className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Iframe Loading Overlay */}
            {isIframeLoading && (
              <div className="absolute inset-0 bg-neutral-900 z-[90] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Initializing Device...</p>
              </div>
            )}

            {/* Simulated Glass Reflection Flare */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-50 rounded-inherit mix-blend-overlay" />

            {/* Live Web Application Frame */}
            <iframe
              ref={iframeRef}
              src={getIframeUrl()}
              className="w-full h-full pt-11 border-none bg-white select-none"
              title="Mobile Device Sandbox"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
