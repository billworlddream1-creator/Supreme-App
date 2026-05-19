import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, Search, Tag, CheckCircle2, ShieldAlert, Zap, Clock, CreditCard, DollarSign, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import SupremePromote from './SupremePromote';

interface GiftCard {
  id: string;
  code: string;
  value: number;
  cost: number;
  rank: string;
  ownerId: string;
  status: 'active' | 'listed' | 'sold' | 'used';
  createdAt: any;
}

const RANK_CONFIG = {
  'Elite': { valueMultiplier: 0.50, costMultiplier: 0.20, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'Bronze': { valueMultiplier: 0.55, costMultiplier: 0.25, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Silver': { valueMultiplier: 0.60, costMultiplier: 0.35, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  'Diamond': { valueMultiplier: 0.70, costMultiplier: 0.50, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  'Gold': { valueMultiplier: 0.80, costMultiplier: 0.65, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'Crowned': { valueMultiplier: 1.00, costMultiplier: 0.90, color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

export default function FastAndFurious() {
  const { user } = useAuth();
  const [rankingIdInput, setRankingIdInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [myCards, setMyCards] = useState<GiftCard[]>([]);
  const [marketplaceCards, setMarketplaceCards] = useState<GiftCard[]>([]);
  const [userRank, setUserRank] = useState<string>('Elite'); // Default for demo
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'gift_cards' | 'promote'>('gift_cards');

  useEffect(() => {
    if (user?.rankingId) {
      setRankingIdInput(user.rankingId);
    }
  }, [user?.rankingId]);

  useEffect(() => {
    if (!user) return;

    // Fetch user's rank and last generated time
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.rank && data.rank !== 'Royal') {
            setUserRank(data.rank);
          }
          if (data.lastGiftCardGenerated) {
            setLastGenerated(data.lastGiftCardGenerated.toDate());
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();

    // Listen to user's gift cards
    const qMyCards = query(collection(db, 'gift_cards'), where('ownerId', '==', user.uid));
    const unsubMyCards = onSnapshot(qMyCards, (snapshot) => {
      const cards: GiftCard[] = [];
      snapshot.forEach((doc) => cards.push({ id: doc.id, ...doc.data() } as GiftCard));
      setMyCards(cards);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'gift_cards'));

    // Listen to marketplace (listed cards)
    const qMarketplace = query(collection(db, 'gift_cards'), where('status', '==', 'listed'));
    const unsubMarketplace = onSnapshot(qMarketplace, (snapshot) => {
      const cards: GiftCard[] = [];
      snapshot.forEach((doc) => cards.push({ id: doc.id, ...doc.data() } as GiftCard));
      setMarketplaceCards(cards);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'gift_cards'));

    return () => {
      unsubMyCards();
      unsubMarketplace();
    };
  }, [user]);

  const generateGiftCard = async () => {
    if (!user) return;
    
    // Validate Ranking ID
    if (!rankingIdInput || rankingIdInput !== user?.rankingId) {
      toast.error('Invalid Ranking ID. Please use your official Supreme Ranking ID from your wallet.');
      return;
    }

    if (userRank === 'Royal') {
      toast.error('Royal ranking is excluded from this feature.');
      return;
    }

    // Check 6 months cooldown
    if (lastGenerated) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (lastGenerated > sixMonthsAgo) {
        toast.error('You can only generate a gift card once every 6 months.');
        return;
      }
    }

    const config = RANK_CONFIG[userRank as keyof typeof RANK_CONFIG] || RANK_CONFIG['Elite'];
    const baseValue = 100; // Base value to calculate from
    const cardValue = baseValue * config.valueMultiplier;
    const cardCost = baseValue * config.costMultiplier;
    const uniqueCode = `FF-${userRank.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      await addDoc(collection(db, 'gift_cards'), {
        code: uniqueCode,
        value: cardValue,
        cost: cardCost,
        rank: userRank,
        ownerId: user.uid,
        status: 'active',
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        lastGiftCardGenerated: serverTimestamp()
      });

      toast.success(`Successfully generated ${userRank} Gift Card worth $${cardValue}!`);
      setRankingIdInput('');
      setLastGenerated(new Date());
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gift_cards');
    }
  };

  const listCardForSale = async (cardId: string) => {
    try {
      await updateDoc(doc(db, 'gift_cards', cardId), {
        status: 'listed'
      });
      toast.success('Gift card listed on the marketplace!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gift_cards/${cardId}`);
    }
  };

  const buyCard = async (card: GiftCard) => {
    if (!user) return;
    if (card.ownerId === user.uid) {
      toast.error("You cannot buy your own gift card.");
      return;
    }

    // In a real app, deduct wallet balance here
    try {
      await updateDoc(doc(db, 'gift_cards', card.id), {
        ownerId: user.uid,
        status: 'active'
      });
      toast.success(`Successfully purchased gift card for $${card.cost}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gift_cards/${card.id}`);
    }
  };

  const filteredMarketplace = marketplaceCards.filter(card => 
    card.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.rank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Sub-Tabs */}
      <div className="flex bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl w-full sm:w-fit mx-auto overflow-x-auto no-scrollbar border border-white/10 shadow-2xl">
        {[
          { id: 'gift_cards', label: 'Gift Cards', icon: Gift },
          { id: 'promote', label: 'Supreme Promote', icon: Megaphone }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={clsx(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeSubTab === tab.id 
                ? "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20 scale-[1.02]" 
                : "text-red-200/40 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className={clsx("w-4 h-4", activeSubTab === tab.id ? "text-white" : "text-red-400")} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'promote' ? (
        <SupremePromote />
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-red-900 via-black to-red-900 p-8 rounded-[40px] text-white shadow-2xl border border-red-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30">
              <Zap className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              FAST & FURIOUS
            </h2>
          </div>
          <p className="text-red-200/80 max-w-2xl text-lg">
            Generate, trade, and redeem exclusive Gift Cards based on your platform ranking. 
            Higher ranks unlock greater value and exclusive marketplace opportunities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generate Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--color-supreme-gold)]/20 rounded-xl border border-[var(--color-supreme-gold)]/30">
                <Gift className="w-6 h-6 text-[var(--color-supreme-gold)]" />
              </div>
              <h3 className="text-xl font-bold text-white">Generate Gift Card</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Your Current Rank</p>
                <p className={clsx("text-xl font-black", RANK_CONFIG[userRank as keyof typeof RANK_CONFIG]?.color || 'text-white')}>
                  {userRank}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Enter Ranking ID
                </label>
                <input
                  type="text"
                  value={rankingIdInput}
                  onChange={(e) => setRankingIdInput(e.target.value)}
                  placeholder="e.g. ELT-XXXX-XXXX"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                />
                {!user?.rankingId && (
                  <p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest">
                    No Ranking ID found. Please generate one in your wallet first.
                  </p>
                )}
              </div>

              <button
                onClick={generateGiftCard}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Generate Now
              </button>

              {lastGenerated && (
                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last generated: {lastGenerated.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* My Cards */}
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--color-supreme-gold)]" />
              My Inventory
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {myCards.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No gift cards in inventory.</p>
              ) : (
                myCards.map(card => (
                  <div key={card.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className={clsx("absolute top-0 left-0 w-1 h-full", RANK_CONFIG[card.rank as keyof typeof RANK_CONFIG]?.bg)} />
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <div>
                        <p className="font-mono text-sm font-bold text-white">{card.code}</p>
                        <p className={clsx("text-xs font-bold", RANK_CONFIG[card.rank as keyof typeof RANK_CONFIG]?.color)}>
                          {card.rank} Tier
                        </p>
                      </div>
                      <span className={clsx(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        card.status === 'active' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                      )}>
                        {card.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pl-2 mt-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Value</p>
                        <p className="text-lg font-black text-white">${card.value.toFixed(2)}</p>
                      </div>
                      {card.status === 'active' && (
                        <button
                          onClick={() => listCardForSale(card.id)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Sell for ${card.cost.toFixed(2)}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Marketplace Section */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Tag className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Gift Card Marketplace</h3>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMarketplace.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No gift cards currently listed on the marketplace.</p>
                </div>
              ) : (
                filteredMarketplace.map(card => (
                  <div key={card.id} className="p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className={clsx("w-2 h-2 rounded-full", RANK_CONFIG[card.rank as keyof typeof RANK_CONFIG]?.bg)} />
                        <span className={clsx("text-xs font-bold uppercase tracking-widest", RANK_CONFIG[card.rank as keyof typeof RANK_CONFIG]?.color)}>
                          {card.rank}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{card.code.substring(0, 8)}...</span>
                    </div>
                    
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Card Value</p>
                        <p className="text-2xl font-black text-white">${card.value.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Selling Price</p>
                        <p className="text-lg font-bold text-[var(--color-supreme-gold)]">${card.cost.toFixed(2)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => buyCard(card)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Purchase Card
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
        </div>
      )}
    </div>
  );
}
