import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { useAuth } from './AuthContext';

export interface MonthlyAwardRequirement {
  id: string;
  label: string;
  target: number;
  current: number;
  icon: string;
}

export interface MonthlyAwardPrize {
  rank: number;
  amount: number;
  requirements: {
    friends: number;
    likes: number;
    videos: number;
    activityHours: number;
    subscribers: number;
  };
}

export interface MonthlyAwardSettings {
  entryFee: number;
  targetSubscribers: number;
  durationDays: number; // 31 or 62
  isPaused: boolean;
  startDate: string;
  prizes: MonthlyAwardPrize[];
  currentCycleId: number;
}

export interface Participant {
  userId: string;
  userName: string;
  userEmail?: string;
  joinedAt: string;
  cycleId: number;
  stats: {
    friends: number;
    likes: number;
    videos: number;
    activityHours: number;
    subscribers: number;
  };
}

export interface AwardWinner extends Participant {
  awardId: string;
  awardType: 'monthly' | 'yearly';
  period: string;
  rank: number;
  score: number;
  claimedAt: string;
}

interface MonthlyAwardsContextType {
  settings: MonthlyAwardSettings;
  participants: Participant[];
  winnersHistory: AwardWinner[];
  isEnrolled: boolean;
  enroll: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<MonthlyAwardSettings>) => void;
  getTopPerformers: (limit?: number) => Participant[];
  daysRemaining: number;
  currentSubscribers: number;
  concludeAndRestart: () => void;
  concludeYearlyAwards: () => void;
  addManualWinner: (winner: AwardWinner) => void;
}

const DEFAULT_PRIZES: MonthlyAwardPrize[] = [
  {
    rank: 1,
    amount: 1500,
    requirements: { friends: 200, likes: 25000, videos: 50, activityHours: 50, subscribers: 15000 }
  },
  {
    rank: 2,
    amount: 1300,
    requirements: { friends: 175, likes: 20000, videos: 40, activityHours: 40, subscribers: 12000 }
  },
  {
    rank: 3,
    amount: 1200,
    requirements: { friends: 150, likes: 20000, videos: 35, activityHours: 35, subscribers: 10000 }
  },
  {
    rank: 4,
    amount: 1100,
    requirements: { friends: 125, likes: 20000, videos: 30, activityHours: 30, subscribers: 7000 }
  },
  {
    rank: 5,
    amount: 1000,
    requirements: { friends: 120, likes: 15000, videos: 25, activityHours: 25, subscribers: 5000 }
  }
];

const MonthlyAwardsContext = createContext<MonthlyAwardsContextType | undefined>(undefined);

export function MonthlyAwardsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { balance, sendPayment } = useWallet();
  
  const [settings, setSettings] = useState<MonthlyAwardSettings>({
    entryFee: 10,
    targetSubscribers: 1000,
    durationDays: 31,
    isPaused: false,
    startDate: new Date().toISOString(),
    prizes: DEFAULT_PRIZES,
    currentCycleId: 1
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winnersHistory, setWinnersHistory] = useState<AwardWinner[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('monthly_awards_settings');
    const storedParticipants = localStorage.getItem('monthly_awards_participants');
    const storedWinners = localStorage.getItem('monthly_awards_winners_history');
    
    let currentSettings = settings;
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      currentSettings = { ...settings, ...parsed };
      setSettings(currentSettings);
    }

    if (storedWinners) {
      setWinnersHistory(JSON.parse(storedWinners));
    } else {
      // Seed some mock data for Hall of Fame if empty
      const mockWinners: AwardWinner[] = [
        {
          userId: 'user-1',
          userName: 'Marcus Sterling',
          userEmail: 'marcus@supreme.com',
          joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          cycleId: 1,
          stats: { friends: 250, likes: 35000, videos: 85, activityHours: 120, subscribers: 18000 },
          awardId: 'AWARD-MOCK-1',
          awardType: 'monthly',
          period: 'January 2024',
          rank: 1,
          score: 46000,
          claimedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'user-2',
          userName: 'Elena Vance',
          userEmail: 'elena@supreme.com',
          joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          cycleId: 1,
          stats: { friends: 210, likes: 28000, videos: 65, activityHours: 95, subscribers: 14000 },
          awardId: 'AWARD-MOCK-2',
          awardType: 'monthly',
          period: 'January 2024',
          rank: 2,
          score: 36600,
          claimedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'user-1',
          userName: 'Marcus Sterling',
          userEmail: 'marcus@supreme.com',
          joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          cycleId: 0,
          stats: { friends: 1500, likes: 250000, videos: 450, activityHours: 800, subscribers: 120000 },
          awardId: 'AWARD-MOCK-YEAR-1',
          awardType: 'yearly',
          period: '2023',
          rank: 1,
          score: 310000,
          claimedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setWinnersHistory(mockWinners);
      localStorage.setItem('monthly_awards_winners_history', JSON.stringify(mockWinners));
    }

    if (storedParticipants) {
      const parsed = JSON.parse(storedParticipants);
      // Filter participants for the current cycle only
      const currentCycleParticipants = parsed.filter((p: Participant) => p.cycleId === currentSettings.currentCycleId);
      setParticipants(currentCycleParticipants);
      
      if (user && currentCycleParticipants.some((p: Participant) => p.userId === user.id)) {
        setIsEnrolled(true);
      } else {
        setIsEnrolled(false);
      }
    }
  }, [user]);

  const concludeAndRestart = () => {
    // Save current top performers to history before clearing
    const topPerformers = getTopPerformers(5);
    const monthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const newWinners: AwardWinner[] = topPerformers.map((p, index) => ({
      ...p,
      awardId: `AWARD-${Date.now()}-${index}`,
      awardType: 'monthly',
      period: monthYear,
      rank: index + 1,
      score: p.stats.likes + p.stats.friends * 10 + p.stats.videos * 100,
      claimedAt: new Date().toISOString()
    }));

    const updatedHistory = [...newWinners, ...winnersHistory];
    setWinnersHistory(updatedHistory);
    localStorage.setItem('monthly_awards_winners_history', JSON.stringify(updatedHistory));

    const newSettings: MonthlyAwardSettings = {
      ...settings,
      startDate: new Date().toISOString(),
      durationDays: 31, // Reset to 31 for new cycle
      currentCycleId: settings.currentCycleId + 1
    };
    
    setSettings(newSettings);
    setParticipants([]);
    setIsEnrolled(false);
    
    localStorage.setItem('monthly_awards_settings', JSON.stringify(newSettings));
    // We could keep old participants in history, but for now we just clear the current list in state
    // and let the next storage update handle it.
    localStorage.setItem('monthly_awards_participants', JSON.stringify([]));
  };

  const concludeYearlyAwards = () => {
    // Similar to monthly but for yearly
    const topPerformers = getTopPerformers(10); // Top 10 for yearly
    const year = new Date().getFullYear().toString();
    
    const newWinners: AwardWinner[] = topPerformers.map((p, index) => ({
      ...p,
      awardId: `YEARLY-AWARD-${Date.now()}-${index}`,
      awardType: 'yearly',
      period: year,
      rank: index + 1,
      score: p.stats.likes + p.stats.friends * 10 + p.stats.videos * 100,
      claimedAt: new Date().toISOString()
    }));

    const updatedHistory = [...newWinners, ...winnersHistory];
    setWinnersHistory(updatedHistory);
    localStorage.setItem('monthly_awards_winners_history', JSON.stringify(updatedHistory));
  };

  const updateSettings = (newSettings: Partial<MonthlyAwardSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('monthly_awards_settings', JSON.stringify(updated));
  };

  const enroll = async () => {
    if (!user || isEnrolled) return false;
    
    const success = sendPayment(settings.entryFee, `Monthly Awards Cycle #${settings.currentCycleId} Entry Fee`, 'Awards');
    if (success) {
      const newParticipant: Participant = {
        userId: user.id,
        userName: user.name,
        joinedAt: new Date().toISOString(),
        cycleId: settings.currentCycleId,
        stats: {
          friends: 0,
          likes: 0,
          videos: 0,
          activityHours: 0,
          subscribers: 0
        }
      };
      
      const updated = [...participants, newParticipant];
      setParticipants(updated);
      setIsEnrolled(true);
      localStorage.setItem('monthly_awards_participants', JSON.stringify(updated));
      return true;
    }
    return false;
  };

  const getTopPerformers = (limit: number = 5) => {
    return [...participants].sort((a, b) => {
      const scoreA = a.stats.likes + a.stats.friends * 10 + a.stats.videos * 100;
      const scoreB = b.stats.likes + b.stats.friends * 10 + b.stats.videos * 100;
      return scoreB - scoreA;
    }).slice(0, limit);
  };

  const calculateDaysRemaining = () => {
    const start = new Date(settings.startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let remaining = settings.durationDays - diffDays;
    
    // Auto-extend logic if target not met at day 31
    if (diffDays >= 31 && participants.length < settings.targetSubscribers && settings.durationDays === 31) {
      updateSettings({ durationDays: 62 });
      remaining = 62 - diffDays;
    }
    
    // Auto-restart logic if duration exceeded
    if (remaining <= 0) {
      // In a real app, we might want to trigger this via a button or a specific check
      // But for this demo, we can auto-restart if someone views the page after expiry
      // However, to avoid infinite loops in render, we should be careful.
      // We'll return 0 and let the UI or a separate effect handle the restart.
      return 0;
    }
    
    return Math.max(0, remaining);
  };

  // Effect to handle automatic restart when days reach 0
  useEffect(() => {
    const remaining = calculateDaysRemaining();
    if (remaining === 0 && !settings.isPaused) {
      // Check if it's actually past the end date
      const start = new Date(settings.startDate);
      const now = new Date();
      const diffTime = now.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= settings.durationDays) {
        concludeAndRestart();
      }
    }
  }, [settings.startDate, settings.durationDays, participants.length]);

  const addManualWinner = (winner: AwardWinner) => {
    const updated = [winner, ...winnersHistory];
    setWinnersHistory(updated);
    localStorage.setItem('monthly_awards_winners_history', JSON.stringify(updated));
  };

  return (
    <MonthlyAwardsContext.Provider value={{
      settings,
      participants,
      winnersHistory,
      isEnrolled,
      enroll,
      updateSettings,
      getTopPerformers,
      daysRemaining: calculateDaysRemaining(),
      currentSubscribers: participants.length,
      concludeAndRestart,
      concludeYearlyAwards,
      addManualWinner
    }}>
      {children}
    </MonthlyAwardsContext.Provider>
  );
}

export function useMonthlyAwards() {
  const context = useContext(MonthlyAwardsContext);
  if (context === undefined) {
    throw new Error('useMonthlyAwards must be used within a MonthlyAwardsProvider');
  }
  return context;
}
