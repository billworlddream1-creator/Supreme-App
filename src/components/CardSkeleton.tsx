import React from 'react';
import { motion } from 'motion/react';

interface CardSkeletonProps {
  type: 'video' | 'post';
}

export default function CardSkeleton({ type }: CardSkeletonProps) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden bg-white/80 border border-gray-200 shadow-sm flex flex-col animate-pulse">
      {/* Media Area */}
      <div className={`bg-gray-200 ${type === 'video' ? 'aspect-video' : 'aspect-square'} w-full`} />
      
      {/* Content Area */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-8" />
            <div className="h-4 bg-gray-200 rounded w-8" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}
