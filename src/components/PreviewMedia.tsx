import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { Ad } from '../context/AdsContext';

interface PreviewMediaProps {
  ad: Ad;
}

const PreviewMedia: React.FC<PreviewMediaProps> = ({ ad }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!ad.content) return null;

  if (ad.type === 'video') {
    return (
      <div className="relative aspect-video bg-black">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse z-10">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        )}
        <video 
          src={ad.content || undefined} 
          className={clsx("w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity", !isLoaded && "opacity-0")}
          controls
          onLoadedData={() => setIsLoaded(true)}
        />
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            Video Ad
          </span>
        </div>
      </div>
    );
  }

  if (ad.type === 'image') {
    return (
      <div className="relative aspect-video bg-black">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse z-10">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        )}
        <img 
          src={ad.content || undefined} 
          className={clsx("w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity", !isLoaded && "opacity-0")}
          alt={ad.title}
          onLoad={() => setIsLoaded(true)}
        />
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            Image Ad
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default PreviewMedia;
