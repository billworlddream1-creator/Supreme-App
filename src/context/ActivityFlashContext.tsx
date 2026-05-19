import React, { createContext, useContext, useState, useEffect } from 'react';

interface ActivityFlashSettings {
  isEnabled: boolean;
  flashDuration: number; // in seconds
  pauseDuration: number; // in seconds
  flashCountBeforePause: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  theme: 'glass' | 'light' | 'dark' | 'gold';
}

interface ActivityFlashContextType {
  settings: ActivityFlashSettings;
  updateSettings: (newSettings: Partial<ActivityFlashSettings>) => void;
}

const defaultSettings: ActivityFlashSettings = {
  isEnabled: true,
  flashDuration: 25, // 25 seconds
  pauseDuration: 120, // 2 minutes
  flashCountBeforePause: 3, // 3 flashes
  position: 'top-right',
  theme: 'glass',
};

const ActivityFlashContext = createContext<ActivityFlashContextType | undefined>(undefined);

export function ActivityFlashProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ActivityFlashSettings>(() => {
    try {
      const saved = localStorage.getItem('supreme_activity_flash_settings_v4');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('supreme_activity_flash_settings_v4', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<ActivityFlashSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <ActivityFlashContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ActivityFlashContext.Provider>
  );
}

export function useActivityFlash() {
  const context = useContext(ActivityFlashContext);
  if (context === undefined) {
    throw new Error('useActivityFlash must be used within an ActivityFlashProvider');
  }
  return context;
}
