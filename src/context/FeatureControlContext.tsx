import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeatureId = 
  | 'supreme-gmt'
  | 'celeb-hub'
  | 'market'
  | 'discover'
  | 'project-power'
  | 'streams'
  | 'utilities'
  | 'core'
  | 'network'
  | 'ai-tools'
  | 'chat'
  | 'industrial-tools'
  | 'supreme-coin-optimum'
  | 'hardware-mining'
  | 'media'
  | 'ads'
  | 'hall-of-fame';

export interface FeatureStatus {
  isPaused: boolean;
  reason: string;
  unlockTime?: string; // ISO string
}

interface FeatureControlContextType {
  featureStatuses: Record<FeatureId, FeatureStatus>;
  updateFeatureStatus: (id: FeatureId, status: Partial<FeatureStatus>) => void;
  isFeaturePaused: (id: FeatureId) => boolean;
  getFeatureStatus: (id: FeatureId) => FeatureStatus;
}

const defaultStatuses: Record<FeatureId, FeatureStatus> = {
  'supreme-gmt': { isPaused: false, reason: '' },
  'celeb-hub': { isPaused: false, reason: '' },
  'market': { isPaused: false, reason: '' },
  'discover': { isPaused: false, reason: '' },
  'project-power': { isPaused: false, reason: '' },
  'streams': { isPaused: false, reason: '' },
  'utilities': { isPaused: false, reason: '' },
  'core': { isPaused: false, reason: '' },
  'network': { isPaused: false, reason: '' },
  'ai-tools': { isPaused: false, reason: '' },
  'chat': { isPaused: false, reason: '' },
  'industrial-tools': { isPaused: false, reason: '' },
  'supreme-coin-optimum': { isPaused: false, reason: '' },
  'hardware-mining': { isPaused: false, reason: '' },
  'media': { isPaused: false, reason: '' },
  'ads': { isPaused: false, reason: '' },
  'hall-of-fame': { isPaused: false, reason: '' },
};

const FeatureControlContext = createContext<FeatureControlContextType | undefined>(undefined);

export const FeatureControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [featureStatuses, setFeatureStatuses] = useState<Record<FeatureId, FeatureStatus>>(() => {
    const saved = localStorage.getItem('supreme_feature_control');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaultStatuses to ensure new features are included
      return { ...defaultStatuses, ...parsed };
    }
    return defaultStatuses;
  });

  useEffect(() => {
    localStorage.setItem('supreme_feature_control', JSON.stringify(featureStatuses));
  }, [featureStatuses]);

  const updateFeatureStatus = (id: FeatureId, status: Partial<FeatureStatus>) => {
    setFeatureStatuses(prev => ({
      ...prev,
      [id]: { ...prev[id], ...status }
    }));
  };

  const isFeaturePaused = (id: FeatureId) => {
    const status = featureStatuses[id];
    if (!status || !status.isPaused) return false;
    
    if (status.unlockTime) {
      const now = new Date();
      const unlock = new Date(status.unlockTime);
      if (now >= unlock) {
        // Auto-resume if time passed
        return false;
      }
    }
    
    return true;
  };

  const getFeatureStatus = (id: FeatureId) => featureStatuses[id] || { isPaused: false, reason: '' };

  return (
    <FeatureControlContext.Provider value={{ featureStatuses, updateFeatureStatus, isFeaturePaused, getFeatureStatus }}>
      {children}
    </FeatureControlContext.Provider>
  );
};

export const useFeatureControl = () => {
  const context = useContext(FeatureControlContext);
  if (!context) {
    throw new Error('useFeatureControl must be used within a FeatureControlProvider');
  }
  return context;
};
