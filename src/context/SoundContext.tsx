import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SoundSettings {
  intruderAlert: boolean;
  newUserSignup: boolean;
  paymentRequest: boolean;
  failedLogin: boolean;
  voiceType: 'male' | 'female';
}

interface SoundContextType {
  settings: SoundSettings;
  updateSettings: (newSettings: Partial<SoundSettings>) => void;
  playIntruderAlert: () => void;
  playNewUserSignup: () => void;
  playPaymentRequest: () => void;
  playFailedLogin: () => void;
  playSound: (type: 'success' | 'error' | 'achievement' | 'celebration' | 'notification' | 'purchase' | 'correct' | 'wrong') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Sound URLs (using more reliable sources)
const SOUNDS = {
  INTRUDER: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/alarm.mp3',
  SIGNUP: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/success.mp3',
  PAYMENT: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/cash-register.mp3',
  FAILED: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/error.mp3',
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SoundSettings>({
    intruderAlert: true,
    newUserSignup: true,
    paymentRequest: true,
    failedLogin: true,
    voiceType: 'female',
  });

  useEffect(() => {
    const stored = localStorage.getItem('supreme_sound_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse sound settings", e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<SoundSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('supreme_sound_settings', JSON.stringify(updated));
  };

  const playSound = useCallback((url: string) => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = url;
    audio.load();
    audio.play().catch(e => {
      if (e.name !== 'NotAllowedError') {
        console.warn("Sound playback failed:", e.message);
      }
    });
  }, []);

  const playIntruderAlert = useCallback(() => {
    if (settings.intruderAlert) playSound(SOUNDS.INTRUDER);
  }, [settings.intruderAlert, playSound]);

  const playNewUserSignup = useCallback(() => {
    if (settings.newUserSignup) playSound(SOUNDS.SIGNUP);
  }, [settings.newUserSignup, playSound]);

  const playPaymentRequest = useCallback(() => {
    if (settings.paymentRequest) playSound(SOUNDS.PAYMENT);
  }, [settings.paymentRequest, playSound]);

  const playFailedLogin = useCallback(() => {
    if (settings.failedLogin) playSound(SOUNDS.FAILED);
  }, [settings.failedLogin, playSound]);

  const playSoundEffect = useCallback((type: 'success' | 'error' | 'achievement' | 'celebration' | 'notification' | 'purchase' | 'correct' | 'wrong') => {
    const urls = {
      success: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/success.mp3',
      error: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/error.mp3',
      achievement: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/achievement.mp3',
      celebration: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/celebration.mp3',
      notification: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/notification.mp3',
      purchase: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/cash-register.mp3',
      correct: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/success.mp3',
      wrong: 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/error.mp3',
    };
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = urls[type];
    audio.load();
    audio.play().catch(e => {
      // Silently fail if sound cannot be played (e.g. autoplay policy)
      if (e.name !== 'NotAllowedError') {
        console.warn("Sound playback failed:", e.message);
      }
    });
  }, []);

  return (
    <SoundContext.Provider value={{ 
      settings, updateSettings, 
      playIntruderAlert, playNewUserSignup, playPaymentRequest, playFailedLogin,
      playSound: playSoundEffect
    }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
