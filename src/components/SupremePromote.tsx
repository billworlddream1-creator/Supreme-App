import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Video, FileText, Copy, Download, CheckCircle2, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { generateContent } from '../services/aiService';

const CATEGORIES = [
  'Supreme chat',
  'Supreme networking',
  'Supreme Coin',
  'Heart to Heart',
  'business tools',
  'industrial tools',
  'Supreme Coin Optimum',
  'Forex Optimum',
  'Mining optimum',
  'Project Power',
  'monthly Awards',
  'yearly awards',
  'Fast & Furious',
  'Supreme Promote'
];

export default function SupremePromote() {
  const { user } = useAuth();
  const [socialHandle, setSocialHandle] = useState('');
  const [supremeHandle, setSupremeHandle] = useState('');
  const [userRank, setUserRank] = useState('Elite');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [format, setFormat] = useState<'text' | 'video'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [daysOnPlatform, setDaysOnPlatform] = useState(0);
  const [generationsThisWeek, setGenerationsThisWeek] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.rank) setUserRank(data.rank);
          
          // Calculate days on platform
          const createdAt = data.createdAt?.toDate() || new Date();
          const diffTime = Math.abs(new Date().getTime() - createdAt.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysOnPlatform(diffDays);

          // Check generations this week (rolling 7 days)
          const genTimestamps: any[] = data.promoteGenerationTimestamps || [];
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const recentGens = genTimestamps.filter(ts => ts.toDate() > sevenDaysAgo);
          setGenerationsThisWeek(recentGens.length);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [user]);

  const handleGenerate = async () => {
    if (!user) return;
    
    if (daysOnPlatform < 31) {
      toast.error(`You must be on the platform for at least 31 days to use this feature. (Current: ${daysOnPlatform} days)`);
      return;
    }

    if (generationsThisWeek >= 2) {
      toast.error('You have reached the maximum of 2 generations per week.');
      return;
    }

    if (!socialHandle || !supremeHandle) {
      toast.error('Please provide both your Social Media Handle and Supreme Media Handle.');
      return;
    }

    setIsGenerating(true);
    
    try {
      let prompt = '';
      if (format === 'text') {
        prompt = `Write a promotional text post about the "${selectedCategory}" feature on the Supreme Platform. 
        The post should be engaging, persuasive, and between 250 to 500 words. 
        Include the user's social media handle (${socialHandle}), their Supreme handle (${supremeHandle}), and mention their rank (${userRank}).
        Make it sound exciting and encourage others to join the Supreme Platform.`;
      } else {
        prompt = `Write a video script for a promotional video about the "${selectedCategory}" feature on the Supreme Platform. 
        The video should be under 10 minutes (so the script should be concise but detailed). 
        Include visual cues, voiceover text, and a strong call to action. 
        Include the user's social media handle (${socialHandle}), their Supreme handle (${supremeHandle}), and mention their rank (${userRank}).
        Make it sound exciting and encourage others to join the Supreme Platform.`;
      }

      const content = await generateContent(prompt);
      if (!content) throw new Error('No content generated');

      setGeneratedContent(content);

      const now = serverTimestamp();

      // Update user document with new timestamp
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const currentTimestamps = userDoc.data()?.promoteGenerationTimestamps || [];
      
      await updateDoc(doc(db, 'users', user.uid), {
        promoteGenerationTimestamps: [...currentTimestamps, now]
      });

      // Create tracking record for Admin
      await addDoc(collection(db, 'promote_tracking'), {
        userId: user.uid,
        userEmail: user.email,
        supremeHandle,
        externalHandle: socialHandle,
        category: selectedCategory,
        format,
        userRank,
        createdAt: now,
        status: 'pending_reward'
      });
      
      setGenerationsThisWeek(prev => prev + 1);
      toast.success('Promotion content generated successfully! Admin has been notified for tracking.');

    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Supreme_Promote_${selectedCategory.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Content downloaded!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-black to-purple-900 p-8 rounded-[40px] text-white shadow-2xl border border-purple-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
              <Megaphone className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              SUPREME PROMOTE
            </h2>
          </div>
          <p className="text-purple-200/80 max-w-2xl text-lg">
            Generate high-quality promotional text and video scripts for your favorite Supreme features. 
            Share them on your social media to earn rewards and grow your network.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--color-supreme-gold)]" />
              Promotion Settings
            </h3>
            
            <div className="space-y-4">
              {/* Status Info */}
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Days on Platform</span>
                  <span className={clsx("font-bold", daysOnPlatform >= 31 ? "text-emerald-400" : "text-amber-400")}>
                    {daysOnPlatform} / 31
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Generations This Week</span>
                  <span className="font-bold text-blue-400">{generationsThisWeek} / 2</span>
                </div>
              </div>

              {/* Handles */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Other Social Media Handle
                </label>
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Supreme Media Handle
                </label>
                <input
                  type="text"
                  value={supremeHandle}
                  onChange={(e) => setSupremeHandle(e.target.value)}
                  placeholder="@supremehandle"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Feature to Promote
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Format Selection */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Content Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormat('text')}
                    className={clsx(
                      "py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all",
                      format === 'text' 
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/50" 
                        : "bg-black/50 text-gray-400 border border-white/10 hover:bg-white/5"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Text (250-500w)
                  </button>
                  <button
                    onClick={() => setFormat('video')}
                    className={clsx(
                      "py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all",
                      format === 'video' 
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/50" 
                        : "bg-black/50 text-gray-400 border border-white/10 hover:bg-white/5"
                    )}
                  >
                    <Video className="w-4 h-4" />
                    Video Script
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || daysOnPlatform < 31 || generationsThisWeek >= 2}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
              
              {daysOnPlatform < 31 && (
                <p className="text-xs text-amber-400 text-center flex items-center justify-center gap-1 mt-2">
                  <ShieldAlert className="w-3 h-3" />
                  Requires 31 days on platform
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Generated Content
            </h3>
            
            {generatedContent && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                  title="Download as text file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-6 min-h-[400px] overflow-y-auto custom-scrollbar">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-purple-400/60 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="font-medium animate-pulse">Crafting your promotional content...</p>
              </div>
            ) : generatedContent ? (
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                  {generatedContent}
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <Megaphone className="w-12 h-12 opacity-20" />
                <p>Fill out the settings and generate your promotional content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
