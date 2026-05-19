import React, { useState, useEffect } from 'react';
import { Loader2, Crown } from 'lucide-react';

interface FeatureLoaderProps {
  text: string;
  children: React.ReactNode;
}

export default function FeatureLoader({ text, children }: FeatureLoaderProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] w-full bg-white/5 backdrop-blur-[2px]">
        <div className="relative flex flex-col items-center justify-center gap-8">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[var(--color-supreme-gold)]/10 blur-3xl animate-pulse rounded-full w-64 h-64" />
            <Loader2 className="w-56 h-56 text-[var(--color-supreme-gold)] animate-spin opacity-20" strokeWidth={0.5} />
            <Loader2 className="absolute w-40 h-40 text-[var(--color-supreme-gold)] animate-spin-slow" strokeWidth={1} />
            <div className="absolute flex flex-col items-center gap-2">
              <Crown className="w-8 h-8 text-[var(--color-supreme-gold)] animate-bounce mb-2" />
              <span className="font-display font-black text-[var(--color-supreme-gold)] text-xs tracking-[0.3em] uppercase animate-pulse text-center max-w-[120px] leading-tight drop-shadow-sm">
                {text}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)]/40 animate-bounce" 
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
