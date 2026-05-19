import React from 'react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, ShoppingBag, Play, Radio, Megaphone, ExternalLink } from 'lucide-react';

export interface ProfileCardData {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  description: string;
  mobileNumber: string;
  externalLinks: string[];
  chatId: string;
  networkId: string;
  marketId: string;
  mediaId: string;
  vibesId: string;
  adsId: string;
  goodsImage?: string;
  goodsPrice?: string;
}

interface ProfileCardProps {
  data: ProfileCardData;
  className?: string;
}

export default function ProfileCard({ data, className }: ProfileCardProps) {
  // 2 inches height by 7 inches width at 96dpi is roughly 192px by 672px
  return (
    <div 
      className={clsx(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-2xl border border-white/10 flex",
        "w-full max-w-[672px] h-[192px]",
        className
      )}
    >
      {/* Left side: Avatar & Basic Info */}
      <div className="w-1/3 p-4 flex flex-col items-center justify-center border-r border-white/10 bg-white/5">
        <img 
          src={data.avatar} 
          alt={data.userName} 
          className="w-16 h-16 rounded-full border-2 border-[var(--color-supreme-gold)] object-cover mb-2 shadow-lg"
        />
        <h3 className="text-sm font-display font-bold text-center truncate w-full">{data.userName}</h3>
        {data.mobileNumber && (
          <p className="text-[10px] text-gray-400 mt-1">{data.mobileNumber}</p>
        )}
        <Link 
          to={`/chat?id=${data.chatId}`}
          className="mt-3 flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-supreme-gold)] hover:bg-yellow-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm"
        >
          <MessageCircle className="w-3 h-3" /> Chat
        </Link>
      </div>

      {/* Middle: Description & Links & Optional Goods */}
      <div className="w-1/3 p-4 flex flex-col justify-between border-r border-white/10 relative">
        <div className="flex-1">
          <h4 className="text-[10px] font-bold text-[var(--color-supreme-gold)] uppercase tracking-widest mb-1">About</h4>
          <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
            {data.description || 'No description provided.'}
          </p>
        </div>
        
        {data.goodsImage && (
          <div className="mt-2 flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-white/5">
            <img src={data.goodsImage} alt="Goods" className="w-10 h-10 rounded object-cover" />
            {data.goodsPrice && (
              <span className="text-xs font-bold text-[var(--color-supreme-gold)]">{data.goodsPrice}</span>
            )}
          </div>
        )}

        {data.externalLinks && data.externalLinks.length > 0 && (
          <div className="flex gap-2 mt-2">
            {data.externalLinks.map((link, idx) => link && (
              <a 
                key={idx} 
                href={link.startsWith('http') ? link : `https://${link}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                title={link}
              >
                <ExternalLink className="w-3 h-3 text-[var(--color-supreme-gold)]" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Right side: IDs */}
      <div className="w-1/3 p-4 flex flex-col justify-center gap-2 bg-gradient-to-bl from-[var(--color-supreme-gold)]/10 to-transparent">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Supreme IDs</h4>
        <div className="grid grid-cols-2 gap-2">
          <Link to={`/chat?id=${data.chatId}`} className="group flex flex-col">
            <span className="text-[8px] text-gray-500 uppercase flex items-center gap-1"><MessageCircle className="w-2 h-2"/> Chat</span>
            <span className="text-[10px] font-mono font-bold text-white group-hover:text-[var(--color-supreme-gold)] truncate">{data.chatId || '-'}</span>
          </Link>
          <Link to={`/network?id=${data.networkId}`} className="group flex flex-col">
            <span className="text-[8px] text-gray-500 uppercase flex items-center gap-1"><Users className="w-2 h-2"/> Network</span>
            <span className="text-[10px] font-mono font-bold text-white group-hover:text-[var(--color-supreme-gold)] truncate">{data.networkId || '-'}</span>
          </Link>
          <Link to={`/market?id=${data.marketId}`} className="group flex flex-col">
            <span className="text-[8px] text-gray-500 uppercase flex items-center gap-1"><ShoppingBag className="w-2 h-2"/> Market</span>
            <span className="text-[10px] font-mono font-bold text-white group-hover:text-[var(--color-supreme-gold)] truncate">{data.marketId || '-'}</span>
          </Link>
          <Link to={`/media?id=${data.mediaId}`} className="group flex flex-col">
            <span className="text-[8px] text-gray-500 uppercase flex items-center gap-1"><Play className="w-2 h-2"/> Media</span>
            <span className="text-[10px] font-mono font-bold text-white group-hover:text-[var(--color-supreme-gold)] truncate">{data.mediaId || '-'}</span>
          </Link>
          <Link to={`/media?vibes=${data.vibesId}`} className="group flex flex-col">
            <span className="text-[8px] text-gray-500 uppercase flex items-center gap-1"><Radio className="w-2 h-2"/> Vibes</span>
            <span className="text-[10px] font-mono font-bold text-white group-hover:text-[var(--color-supreme-gold)] truncate">{data.vibesId || '-'}</span>
          </Link>
          <Link to={`/ads?id=${data.adsId}`} className="group flex flex-col">
            <span className="text-[8px] text-gray-500 uppercase flex items-center gap-1"><Megaphone className="w-2 h-2"/> Ads</span>
            <span className="text-[10px] font-mono font-bold text-white group-hover:text-[var(--color-supreme-gold)] truncate">{data.adsId || '-'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
