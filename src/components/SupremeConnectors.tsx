import React, { useState } from 'react';
import { Users, Link as LinkIcon, Copy, Trophy, TrendingUp, Award, Share2, MessageCircle, Twitter, Facebook, X, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

const MOCK_LEADERBOARD = [
  { id: '1', name: 'Alex Johnson', connections: 1240, rank: 1, score: 15400, avatar: 'https://picsum.photos/seed/user1/100' },
  { id: '2', name: 'Sarah Williams', connections: 980, rank: 2, score: 12100, avatar: 'https://picsum.photos/seed/user2/100' },
  { id: '3', name: 'Michael Chen', connections: 850, rank: 3, score: 10500, avatar: 'https://picsum.photos/seed/user3/100' },
  { id: '4', name: 'Emma Davis', connections: 720, rank: 4, score: 8900, avatar: 'https://picsum.photos/seed/user4/100' },
  { id: '5', name: 'James Wilson', connections: 640, rank: 5, score: 7800, avatar: 'https://picsum.photos/seed/user5/100' },
  { id: '6', name: 'Olivia Brown', connections: 590, rank: 6, score: 7200, avatar: 'https://picsum.photos/seed/user6/100' },
  { id: '7', name: 'Liam Garcia', connections: 510, rank: 7, score: 6500, avatar: 'https://picsum.photos/seed/user7/100' },
  { id: '8', name: 'Sophia Miller', connections: 480, rank: 8, score: 6100, avatar: 'https://picsum.photos/seed/user8/100' },
];

export default function SupremeConnectors() {
  const { user } = useAuth();
  const { isBoosted } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const inviteLink = `https://supreme.app/invite/${user?.id || 'guest'}`;
  const userConnections = 85;
  
  const baseEarnings = Math.floor(userConnections / 100) * 5.00;
  const earnings = isBoosted ? baseEarnings * 1.05 : baseEarnings;
  const boostAmount = earnings - baseEarnings;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Supreme!',
          text: 'Connect with me on the Supreme platform and start earning rewards.',
          url: inviteLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  const socialLinks = [
    { icon: MessageCircle, color: 'bg-[#25D366]', label: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(`Join me on Supreme! ${inviteLink}`)}` },
    { icon: Twitter, color: 'bg-[#1DA1F2]', label: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on Supreme! ${inviteLink}`)}` },
    { icon: Facebook, color: 'bg-[#1877F2]', label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}` },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Supreme Connectors
          </h3>
          <p className="text-xs text-gray-500 mt-1">Grow your network and earn rewards</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display font-bold text-[var(--color-supreme-gold)]">{userConnections}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Connections</p>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold">Connection Campaign</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-[var(--color-supreme-gold)]">${earnings.toFixed(2)}</span>
              {isBoosted && boostAmount > 0 && (
                <span className="text-[10px] text-amber-400 font-bold">+${boostAmount.toFixed(2)} Boost</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            Invite friends and earn <span className="text-[var(--color-supreme-gold)] font-bold">$5.00</span> for every 100 successful connections.
            {isBoosted && <span className="text-amber-400 font-bold ml-1">+ 5% Boost Active</span>}
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
              <div className="p-2 bg-white/5 rounded-xl">
                <LinkIcon className="w-4 h-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                readOnly 
                value={inviteLink} 
                className="bg-transparent border-none outline-none text-sm text-gray-300 w-full truncate px-1"
              />
              <button 
                onClick={handleCopy}
                className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all shrink-0 border border-white/10"
                title="Copy Link"
              >
                {copied ? <span className="text-xs font-bold px-1 text-[var(--color-supreme-gold)]">Copied!</span> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="flex-1 py-3 bg-[var(--color-supreme-gold)] text-white rounded-2xl text-sm font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Share2 className="w-4 h-4" />
                Invite Friends
              </button>
              
              <div className="flex gap-2">
                {socialLinks.map((social, idx) => (
                  <a 
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      "p-3 rounded-2xl text-white transition-transform hover:scale-110 active:scale-95",
                      social.color
                    )}
                    title={`Share on ${social.label}`}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--color-supreme-gold)]/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-[var(--color-supreme-gold)]/30 transition-colors">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly Growth</p>
          <p className="text-sm font-bold text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12 New
          </p>
        </div>
        <button 
          onClick={() => setShowLeaderboard(true)}
          className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-[var(--color-supreme-gold)]/30 transition-colors text-left"
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Global Rank</p>
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-gray-900 group-hover:text-[var(--color-supreme-gold)] transition-colors">#1,240</p>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-supreme-gold)]" />
          </div>
        </button>
      </div>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowLeaderboard(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-50 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col relative"
            >
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="absolute top-4 right-4 z-50 p-2.5 bg-white/80 hover:bg-white text-gray-900 rounded-full backdrop-blur-md transition-all shadow-md border border-gray-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 pb-0 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-display font-bold flex items-center gap-3 mb-2">
                    <Trophy className="w-8 h-8 text-[var(--color-supreme-gold)]" /> Supreme Leaderboard
                  </h2>
                  <p className="text-gray-400 mb-8">Top connectors globally. Compete to earn exclusive rewards and badges.</p>
                  
                  {/* Podium for Top 3 */}
                  <div className="flex justify-center items-end gap-2 sm:gap-6 h-48 mb-6">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center relative z-10 w-1/4 max-w-[120px]">
                      <div className="relative mb-2">
                        <img src={MOCK_LEADERBOARD[1].avatar} alt={MOCK_LEADERBOARD[1].name} className="w-16 h-16 rounded-full border-4 border-gray-300 object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 border-2 border-gray-900">2</div>
                      </div>
                      <p className="text-xs font-bold text-white truncate w-full text-center">{MOCK_LEADERBOARD[1].name}</p>
                      <p className="text-[10px] text-[var(--color-supreme-gold)] font-bold mb-2">{MOCK_LEADERBOARD[1].score.toLocaleString()} pts</p>
                      <div className="w-full h-24 bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-xl border-t border-gray-600 flex items-center justify-center">
                        <span className="text-2xl font-display font-bold text-gray-500 opacity-50">2</span>
                      </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center relative z-20 w-1/3 max-w-[140px]">
                      <div className="absolute -top-6 text-[var(--color-supreme-gold)] animate-bounce">
                        <Award className="w-8 h-8" />
                      </div>
                      <div className="relative mb-2">
                        <img src={MOCK_LEADERBOARD[0].avatar} alt={MOCK_LEADERBOARD[0].name} className="w-20 h-20 rounded-full border-4 border-[var(--color-supreme-gold)] object-cover shadow-[0_0_15px_rgba(255,215,0,0.5)]" referrerPolicy="no-referrer" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--color-supreme-gold)] rounded-full flex items-center justify-center text-sm font-bold text-black border-2 border-gray-900">1</div>
                      </div>
                      <p className="text-sm font-bold text-white truncate w-full text-center">{MOCK_LEADERBOARD[0].name}</p>
                      <p className="text-xs text-[var(--color-supreme-gold)] font-bold mb-2">{MOCK_LEADERBOARD[0].score.toLocaleString()} pts</p>
                      <div className="w-full h-32 bg-gradient-to-t from-[var(--color-supreme-gold)]/40 to-[var(--color-supreme-gold)]/10 rounded-t-xl border-t border-[var(--color-supreme-gold)]/50 flex items-center justify-center shadow-[0_-10px_20px_rgba(255,215,0,0.1)]">
                        <span className="text-4xl font-display font-bold text-[var(--color-supreme-gold)] opacity-50">1</span>
                      </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center relative z-10 w-1/4 max-w-[120px]">
                      <div className="relative mb-2">
                        <img src={MOCK_LEADERBOARD[2].avatar} alt={MOCK_LEADERBOARD[2].name} className="w-16 h-16 rounded-full border-4 border-amber-700 object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-gray-900">3</div>
                      </div>
                      <p className="text-xs font-bold text-white truncate w-full text-center">{MOCK_LEADERBOARD[2].name}</p>
                      <p className="text-[10px] text-[var(--color-supreme-gold)] font-bold mb-2">{MOCK_LEADERBOARD[2].score.toLocaleString()} pts</p>
                      <div className="w-full h-20 bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-xl border-t border-gray-600 flex items-center justify-center">
                        <span className="text-2xl font-display font-bold text-gray-500 opacity-50">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex border-b border-gray-200 bg-white px-6 shrink-0">
                <button className="px-6 py-4 text-sm font-bold text-[var(--color-supreme-gold)] border-b-2 border-[var(--color-supreme-gold)]">Global</button>
                <button className="px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Regional</button>
                <button className="px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Friends</button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50 flex-1">
                <div className="space-y-3">
                  {MOCK_LEADERBOARD.slice(3).map((entry, i) => (
                    <div 
                      key={entry.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-8 text-center font-display font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                        #{entry.rank}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm shrink-0">
                        <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate text-lg">{entry.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {entry.connections.toLocaleString()} Connections</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-500" /> 85% Win Rate</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                        <p className="text-lg font-bold text-green-600">{entry.score.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-white border-t border-gray-200 shrink-0">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-black rounded-2xl border border-gray-800 shadow-xl text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-supreme-gold)] text-black flex items-center justify-center font-display font-bold text-xl shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                      #1240
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Current Rank</p>
                      <p className="text-base font-bold text-white flex items-center gap-2">
                        Top 5% of Connectors <TrendingUp className="w-4 h-4 text-green-400" />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--color-supreme-gold)]">4,250 pts to next rank</p>
                    <button className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/10">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
