import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';

export type GreetingMood = 
  | 'birthday'
  | 'new_user'
  | 'subscribed'
  | 'unsubscribed_longterm'
  | 'returning_inactive'
  | 'reward_unjoined'
  | 'reward_joined'
  | 'welcome_back';

export type AITone = 'supreme' | 'inspiring' | 'royal' | 'friendly' | 'energetic';

export interface GreetingData {
  mood: GreetingMood;
  headline: string;
  subtext: string;
  badgeLabel: string;
  badgeIcon: string;
  badgeColor: string;
  actionLabel: string;
  actionRoute: string;
  triggerReason: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  aiTone: AITone;
  isAiGenerated?: boolean;
}

export interface GreetingHistoryEntry {
  id: string;
  mood: GreetingMood;
  timestamp: string;
  headline: string;
  subtext: string;
  triggerReason: string;
  isAiGenerated?: boolean;
}

interface GreetingContextType {
  activeMood: GreetingMood;
  greetingData: GreetingData;
  overrideMood: GreetingMood | null;
  setOverrideMood: (mood: GreetingMood | null) => void;
  aiTone: AITone;
  setAiTone: (tone: AITone) => void;
  isGeneratingAI: boolean;
  customAiPhrase: string | null;
  generateAIGreeting: (forcedTone?: AITone) => Promise<void>;
  resetAIGreeting: () => void;
  isTrackerOpen: boolean;
  setIsTrackerOpen: (open: boolean) => void;
  historyLogs: GreetingHistoryEntry[];
  updateUserBirthday: (birthday: string) => Promise<void>;
  toggleRewardProgram: (joined: boolean) => Promise<void>;
  metrics: {
    isBirthdayToday: boolean;
    isNewUser: boolean; // < 24 hours
    isSubscribed: boolean;
    isUnsubscribedLongterm: boolean; // > 30 days old without sub
    isInactiveOneWeek: boolean; // >= 7 days inactive
    hasJoinedRewardProgram: boolean;
    daysSinceCreation: number;
    daysSinceLastLogin: number;
  };
  adminForcedMood: GreetingMood | null;
  setAdminForcedMood: (mood: GreetingMood | null) => void;
  adminCustomAnnouncement: string | null;
  setAdminCustomAnnouncement: (announcement: string | null) => void;
  adminForcedTone: AITone | null;
  setAdminForcedTone: (tone: AITone | null) => void;
  resetAdminControls: () => void;
}

const GreetingContext = createContext<GreetingContextType | undefined>(undefined);

export function GreetingProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const { isSubscribed: checkSubStatus, userSubscriptions } = useSubscription();

  const [overrideMood, setOverrideMood] = useState<GreetingMood | null>(null);
  const [aiTone, setAiTone] = useState<AITone>('supreme');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [customAiPhrase, setCustomAiPhrase] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [historyLogs, setHistoryLogs] = useState<GreetingHistoryEntry[]>([]);

  // Admin forced controls state initialized from localStorage
  const [adminForcedMood, setAdminForcedMoodState] = useState<GreetingMood | null>(() => {
    return (localStorage.getItem('supreme_admin_forced_greeting_mood') as GreetingMood) || null;
  });
  const [adminCustomAnnouncement, setAdminCustomAnnouncementState] = useState<string | null>(() => {
    return localStorage.getItem('supreme_admin_custom_announcement') || null;
  });
  const [adminForcedTone, setAdminForcedToneState] = useState<AITone | null>(() => {
    return (localStorage.getItem('supreme_admin_forced_tone') as AITone) || null;
  });

  const setAdminForcedMood = useCallback((mood: GreetingMood | null) => {
    setAdminForcedMoodState(mood);
    if (mood) {
      localStorage.setItem('supreme_admin_forced_greeting_mood', mood);
    } else {
      localStorage.removeItem('supreme_admin_forced_greeting_mood');
    }
  }, []);

  const setAdminCustomAnnouncement = useCallback((announcement: string | null) => {
    setAdminCustomAnnouncementState(announcement);
    if (announcement) {
      localStorage.setItem('supreme_admin_custom_announcement', announcement);
    } else {
      localStorage.removeItem('supreme_admin_custom_announcement');
    }
  }, []);

  const setAdminForcedTone = useCallback((tone: AITone | null) => {
    setAdminForcedToneState(tone);
    if (tone) {
      localStorage.setItem('supreme_admin_forced_tone', tone);
    } else {
      localStorage.removeItem('supreme_admin_forced_tone');
    }
  }, []);

  const resetAdminControls = useCallback(() => {
    setAdminForcedMoodState(null);
    setAdminCustomAnnouncementState(null);
    setAdminForcedToneState(null);
    localStorage.removeItem('supreme_admin_forced_greeting_mood');
    localStorage.removeItem('supreme_admin_custom_announcement');
    localStorage.removeItem('supreme_admin_forced_tone');
  }, []);

  // Time of day calculation
  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const timeOfDay = getTimeOfDay();

  // Evaluate user metrics & mood conditions
  const metrics = useMemo(() => {
    if (!user) {
      return {
        isBirthdayToday: false,
        isNewUser: false,
        isSubscribed: false,
        isUnsubscribedLongterm: false,
        isInactiveOneWeek: false,
        hasJoinedRewardProgram: false,
        daysSinceCreation: 0,
        daysSinceLastLogin: 0,
      };
    }

    const now = new Date();

    // 1. Birthday evaluation
    let isBirthdayToday = false;
    if (user.birthday) {
      const birthDate = new Date(user.birthday);
      isBirthdayToday = 
        now.getMonth() === birthDate.getMonth() && 
        now.getDate() === birthDate.getDate();
    }

    // 2. Creation age calculation (< 24h for new user, > 30d for unsubscribed longterm)
    let createdAtDate = new Date();
    if (user.createdAt) {
      if (typeof user.createdAt.toDate === 'function') {
        createdAtDate = user.createdAt.toDate();
      } else if (typeof user.createdAt === 'string' || typeof user.createdAt === 'number') {
        createdAtDate = new Date(user.createdAt);
      } else if (user.createdAt.seconds) {
        createdAtDate = new Date(user.createdAt.seconds * 1000);
      }
    } else {
      // Fallback from localStorage
      const storedCreated = localStorage.getItem(`user_created_at_${user.uid}`);
      if (storedCreated) {
        createdAtDate = new Date(storedCreated);
      } else {
        localStorage.setItem(`user_created_at_${user.uid}`, now.toISOString());
      }
    }

    const ageInMs = now.getTime() - createdAtDate.getTime();
    const daysSinceCreation = Math.max(0, Math.floor(ageInMs / (1000 * 60 * 60 * 24)));
    const hoursSinceCreation = ageInMs / (1000 * 60 * 60);
    const isNewUser = hoursSinceCreation < 24;

    // 3. Subscription status
    const hasActiveSub = checkSubStatus('general') || 
      (userSubscriptions && userSubscriptions.length > 0) || 
      user.role === 'premium-user' || 
      !!user.profileCardSub || 
      !!user.appealSubscription;

    const isUnsubscribedLongterm = daysSinceCreation >= 30 && !hasActiveSub;

    // 4. Inactivity tracking (did not login for >= 1 week / 7 days)
    let lastLoginDate = new Date();
    const storedLastLogin = localStorage.getItem(`user_last_login_${user.uid}`);
    if (user.lastLogin) {
      if (typeof user.lastLogin.toDate === 'function') {
        lastLoginDate = user.lastLogin.toDate();
      } else if (typeof user.lastLogin === 'string' || typeof user.lastLogin === 'number') {
        lastLoginDate = new Date(user.lastLogin);
      }
    } else if (storedLastLogin) {
      lastLoginDate = new Date(storedLastLogin);
    }

    const msSinceLastLogin = now.getTime() - lastLoginDate.getTime();
    const daysSinceLastLogin = Math.max(0, Math.floor(msSinceLastLogin / (1000 * 60 * 60 * 24)));
    
    // Check stored inactivity flag recorded at login session start
    const storedInactiveDays = parseInt(localStorage.getItem(`user_inactivity_days_${user.uid}`) || '0', 10);
    const isInactiveOneWeek = daysSinceLastLogin >= 7 || storedInactiveDays >= 7;

    // 5. Reward Program participation
    const storedRewardProgram = localStorage.getItem(`user_reward_program_${user.uid}`) === 'true';
    const hasJoinedRewardProgram = user.hasJoinedRewardProgram ?? storedRewardProgram ?? false;

    return {
      isBirthdayToday,
      isNewUser,
      isSubscribed: hasActiveSub,
      isUnsubscribedLongterm,
      isInactiveOneWeek,
      hasJoinedRewardProgram,
      daysSinceCreation,
      daysSinceLastLogin,
    };
  }, [user, checkSubStatus, userSubscriptions]);

  // Determine active mood according to priority logic
  const evaluatedMood: GreetingMood = useMemo(() => {
    if (metrics.isBirthdayToday) return 'birthday';
    if (metrics.isNewUser) return 'new_user';
    if (metrics.isInactiveOneWeek) return 'returning_inactive';
    if (metrics.isSubscribed) return 'subscribed';
    if (metrics.isUnsubscribedLongterm) return 'unsubscribed_longterm';
    if (!metrics.hasJoinedRewardProgram) return 'reward_unjoined';
    if (metrics.hasJoinedRewardProgram) return 'reward_joined';
    return 'welcome_back';
  }, [metrics]);

  const activeMood = overrideMood || adminForcedMood || evaluatedMood;
  const effectiveTone = adminForcedTone || aiTone;

  // Build baseline greeting text per mood
  const userName = user?.name || 'User';

  const timeSalutation = 
    timeOfDay === 'morning' ? `Good Morning, ${userName}!` :
    timeOfDay === 'afternoon' ? `Good Afternoon, ${userName}!` :
    timeOfDay === 'evening' ? `Good Evening, ${userName}!` : `Good Night, ${userName}!`;

  const defaultGreetingData: Record<GreetingMood, Omit<GreetingData, 'mood' | 'timeOfDay' | 'aiTone'>> = useMemo(() => {
    return {
      birthday: {
        headline: `${timeSalutation} Happy Birthday! 🎉🎂`,
        subtext: `The entire Supreme Network honors you today! May your year ahead be crowned with gold, luxury, and triumph.`,
        badgeLabel: '🎂 Birthday Celebration',
        badgeIcon: 'Cake',
        badgeColor: 'from-pink-500 to-amber-500 text-white shadow-pink-500/20',
        actionLabel: 'Claim Gift 🎁',
        actionRoute: '/wallet',
        triggerReason: `Today's date matches your recorded birthday date (${user?.birthday || 'Set Birthday'}).`,
      },
      new_user: {
        headline: `${timeSalutation} Welcome to Supreme! 🌟`,
        subtext: `We are thrilled to welcome you to our exclusive ecosystem. Explore your new digital empire today.`,
        badgeLabel: '✨ New Citizen Welcome',
        badgeIcon: 'Sparkles',
        badgeColor: 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
        actionLabel: 'Explore Empire 🚀',
        actionRoute: '/network',
        triggerReason: `New account registered within the past 24 hours (${metrics.daysSinceCreation === 0 ? 'Just registered' : '1 day old'}).`,
      },
      subscribed: {
        headline: `${timeSalutation} Well done for subscribing! 💎`,
        subtext: `Your elite subscription status is active! Enjoy priority visibility, zero transaction friction, and premier VIP analytics.`,
        badgeLabel: '👑 Subscribed Champion',
        badgeIcon: 'Crown',
        badgeColor: 'from-amber-500 to-yellow-600 text-white shadow-amber-500/20',
        actionLabel: 'VIP Perks ⚡',
        actionRoute: '/pricing',
        triggerReason: `Verified active subscription plan or payment on record.`,
      },
      unsubscribed_longterm: {
        headline: `${timeSalutation} You have not subscribed yet ⚡`,
        subtext: `Elevate your Supreme tier today to unlock automated trading, unlimited media, and exclusive deals.`,
        badgeLabel: '📢 Subscription Invite',
        badgeIcon: 'Zap',
        badgeColor: 'from-purple-600 to-indigo-600 text-white shadow-purple-500/20',
        actionLabel: 'Subscribe Now 🚀',
        actionRoute: '/pricing',
        triggerReason: `Account registered over 30 days ago (${metrics.daysSinceCreation} days) without an active subscription plan.`,
      },
      returning_inactive: {
        headline: `${timeSalutation} Haven't seen you for a while! 👋`,
        subtext: `Welcome back! Your ecosystem has been accumulating activity. Check your latest network gains.`,
        badgeLabel: '⏳ Homecoming Leader',
        badgeIcon: 'Clock',
        badgeColor: 'from-blue-600 to-cyan-600 text-white shadow-blue-500/20',
        actionLabel: 'Catch Up 📰',
        actionRoute: '/insight',
        triggerReason: `Inactivity detected for 1 week or more (${metrics.daysSinceLastLogin > 0 ? `${metrics.daysSinceLastLogin} days` : '1 week+'}) prior to return.`,
      },
      reward_unjoined: {
        headline: `${timeSalutation} Have you joined the reward program? 🏆`,
        subtext: `Don't leave free daily coins and weekly award pools on the table! Join the official Supreme Reward Program.`,
        badgeLabel: '🎁 Reward Invite',
        badgeIcon: 'Gift',
        badgeColor: 'from-rose-500 to-red-600 text-white shadow-rose-500/20',
        actionLabel: 'Join Rewards 🎯',
        actionRoute: '/rewards',
        triggerReason: `You have not enrolled in the Supreme Award & Reward Program yet.`,
      },
      reward_joined: {
        headline: `${timeSalutation} You may be our next ambassador 👑`,
        subtext: `Your active participation in the reward program keeps you climbing the ranks. Keep active to secure your crown!`,
        badgeLabel: '⚡ Supreme Ambassador',
        badgeIcon: 'Award',
        badgeColor: 'from-amber-400 to-orange-500 text-white shadow-amber-500/20',
        actionLabel: 'Rewards Hub 🌟',
        actionRoute: '/rewards',
        triggerReason: `Enrolled in the Supreme Reward Program with active ambassador potential.`,
      },
      welcome_back: {
        headline: `${timeSalutation} Welcome back to Supreme! ⚡`,
        subtext: `Your digital empire continues to grow. Manage your assets, tools, and network connections seamlessly.`,
        badgeLabel: '👑 Returning Leader',
        badgeIcon: 'Shield',
        badgeColor: 'from-zinc-800 to-black text-white shadow-black/20',
        actionLabel: 'Manage Empire 🛠️',
        actionRoute: '/business-tools',
        triggerReason: `Standard returning user active session.`,
      },
    };
  }, [userName, timeSalutation, metrics, user?.birthday]);

  const greetingData: GreetingData = useMemo(() => {
    const base = defaultGreetingData[activeMood];
    const triggerReason = adminForcedMood 
      ? `Controlled via Supreme Admin Console override.` 
      : base.triggerReason;

    return {
      ...base,
      mood: activeMood,
      subtext: adminCustomAnnouncement || customAiPhrase || base.subtext,
      triggerReason,
      timeOfDay,
      aiTone: effectiveTone,
      isAiGenerated: !!customAiPhrase,
    };
  }, [activeMood, defaultGreetingData, customAiPhrase, adminCustomAnnouncement, adminForcedMood, timeOfDay, effectiveTone]);

  // Record history log whenever active mood changes
  useEffect(() => {
    if (!user) return;

    const newLog: GreetingHistoryEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      mood: activeMood,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      headline: greetingData.headline,
      subtext: greetingData.subtext,
      triggerReason: greetingData.triggerReason,
      isAiGenerated: !!customAiPhrase,
    };

    setHistoryLogs(prev => {
      // Prevent duplicate back-to-back logs of same mood
      if (prev.length > 0 && prev[0].mood === activeMood && !customAiPhrase) {
        return prev;
      }
      return [newLog, ...prev.slice(0, 29)];
    });
  }, [activeMood, user, customAiPhrase]);

  // AI Generator Function
  const generateAIGreeting = useCallback(async (forcedTone?: AITone) => {
    const selectedTone = forcedTone || aiTone;
    setIsGeneratingAI(true);

    try {
      // Call server backend AI chat endpoint or generate dynamic contextual text
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a short 1-sentence inspirational greeting subtext for a user named ${userName}. 
          The greeting mood is "${activeMood}".
          The desired tone is "${selectedTone}".
          Time of day is "${timeOfDay}".
          Keep it under 25 words, confident, luxurious, and encouraging. Return ONLY the text message without quotes.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.text) {
          const cleanText = data.text.replace(/^["']|["']$/g, '').trim();
          setCustomAiPhrase(cleanText);
          setIsGeneratingAI(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Server AI generation fallback triggered:", err);
    }

    // Dynamic AI Fallback Synthesizer with rich variations
    const timeGreeting = timeOfDay === 'morning' ? 'Good morning' : timeOfDay === 'afternoon' ? 'Good afternoon' : timeOfDay === 'evening' ? 'Good evening' : 'Late night greetings';
    
    const tonePrefixes: Record<AITone, string[]> = {
      supreme: [
        `${timeGreeting}, ${userName}! Rule your day with absolute precision and unmatched vision.`,
        `Greetings ${userName}! The Supreme network aligns with your ambition today.`,
      ],
      inspiring: [
        `${timeGreeting}, ${userName}! Every step you take today brings you closer to ultimate greatness.`,
        `Rise above expectations, ${userName}. Your potential knows no boundaries.`,
      ],
      royal: [
        `Royal greetings, ${userName}. Your place in the Supreme royalty is honored and celebrated.`,
        `Step into your throne, ${userName}. Excellence is your birthright.`,
      ],
      friendly: [
        `${timeGreeting}, ${userName}! Hope you're having an awesome day across Supreme.`,
        `Great to see you back, ${userName}! Let's make today unforgettable.`,
      ],
      energetic: [
        `Boom! ${timeGreeting}, ${userName}! Energy is high and opportunities are ready!`,
        `Power up, ${userName}! Today is filled with winning momentum and rewards!`,
      ]
    };

    const options = tonePrefixes[selectedTone] || tonePrefixes.supreme;
    const picked = options[Math.floor(Math.random() * options.length)];
    
    setTimeout(() => {
      setCustomAiPhrase(picked);
      setIsGeneratingAI(false);
    }, 600);
  }, [userName, activeMood, timeOfDay, aiTone]);

  const resetAIGreeting = useCallback(() => {
    setCustomAiPhrase(null);
  }, []);

  // Profile update helpers
  const updateUserBirthday = useCallback(async (birthday: string) => {
    if (updateUser) {
      await updateUser({ birthday });
    }
  }, [updateUser]);

  const toggleRewardProgram = useCallback(async (joined: boolean) => {
    if (user && updateUser) {
      localStorage.setItem(`user_reward_program_${user.uid}`, joined ? 'true' : 'false');
      await updateUser({ hasJoinedRewardProgram: joined });
    }
  }, [user, updateUser]);

  return (
    <GreetingContext.Provider
      value={{
        activeMood,
        greetingData,
        overrideMood,
        setOverrideMood,
        aiTone,
        setAiTone,
        isGeneratingAI,
        customAiPhrase,
        generateAIGreeting,
        resetAIGreeting,
        isTrackerOpen,
        setIsTrackerOpen,
        historyLogs,
        updateUserBirthday,
        toggleRewardProgram,
        metrics,
        adminForcedMood,
        setAdminForcedMood,
        adminCustomAnnouncement,
        setAdminCustomAnnouncement,
        adminForcedTone,
        setAdminForcedTone,
        resetAdminControls,
      }}
    >
      {children}
    </GreetingContext.Provider>
  );
}

export function useGreeting() {
  const context = useContext(GreetingContext);
  if (!context) {
    throw new Error('useGreeting must be used within a GreetingProvider');
  }
  return context;
}
