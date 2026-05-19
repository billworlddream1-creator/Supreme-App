// Ads Manager - Create and manage promotional campaigns
// Force build update v3
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Upload, Wand2, Plus, Trash2, CheckCircle2, 
  AlertCircle, Clock, Layout as LayoutIcon, Palette, 
  Search, X, Maximize2, ExternalLink, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAds, Ad } from '../context/AdsContext';
import { clsx } from 'clsx';
import AdBanner from '../components/AdBanner';
import { event } from '../utils/analytics';
import { generateAdContent, generateAdVideo } from '../services/geminiService';
import PreviewMedia from '../components/PreviewMedia';

const AD_SIZES = [
  { id: 'leaderboard', name: 'Leaderboard', width: '728px', height: '90px', aspect: 'aspect-[728/90]' },
  { id: 'banner', name: 'Banner', width: '468px', height: '60px', aspect: 'aspect-[468/60]' },
  { id: 'large-rectangle', name: 'Large Rectangle', width: '336px', height: '280px', aspect: 'aspect-[336/280]' },
  { id: 'medium-rectangle', name: 'Medium Rectangle', width: '300px', height: '250px', aspect: 'aspect-[300/250]' },
  { id: 'square', name: 'Square', width: '250px', height: '250px', aspect: 'aspect-square' },
  { id: 'skyscraper', name: 'Skyscraper', width: '120px', height: '600px', aspect: 'aspect-[120/600]' },
  { id: 'wide-skyscraper', name: 'Wide Skyscraper', width: '160px', height: '600px', aspect: 'aspect-[160/600]' },
];

const COLOR_PALETTE = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
  'bg-pink-500', 'bg-rose-500', 'bg-gray-500', 'bg-slate-500', 'bg-zinc-500',
  'bg-stone-500', 'bg-neutral-500', 'bg-black', 'bg-gray-900', 'bg-blue-900',
  'bg-red-900', 'bg-green-900', 'bg-purple-900', 'bg-indigo-900', 'bg-teal-900',
];

export default function AdsManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ads, createAd, deleteAd } = useAds();
  const { userSubscriptions } = useSubscription();

  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creationMode, setCreationMode] = useState<'banner' | 'upload' | 'ai' | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedSize, setSelectedSize] = useState<Ad['size']>('medium-rectangle');
  const [selectedColor, setSelectedColor] = useState('bg-black');
  const [content, setContent] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState<'video' | 'text'>('text');
  
  // Scheduling & Targeting
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activeHours, setActiveHours] = useState<number[]>([]);
  const [targeting, setTargeting] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);

  // Digital Signpost Experience State
  const [zoomedAds, setZoomedAds] = useState<Ad[]>([]);
  const [zoomTimer, setZoomTimer] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: any;
    if (zoomedAds.length > 0 && zoomTimer > 0) {
      timer = setInterval(() => {
        setZoomTimer(prev => {
          if (prev <= 0.1) {
            setZoomedAds([]);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [zoomedAds, zoomTimer]);

  const filteredAds = useMemo(() => {
    return ads.filter(ad => 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ads, searchQuery]);

  const handleRestrictedAction = (action: () => void) => {
    // Restrictions removed as per request to allow Users and Dealers
    action();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File too large', { description: 'Maximum file size is 50MB' });
        return;
      }
      setVideoFile(file);
      setTitle(file.name.split('.')[0]);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setContent('');
    setVideoFile(null);
    setAiPrompt('');
    setIsCreating(false);
    setCreationMode(null);
    setStartTime('');
    setEndTime('');
    setActiveHours([]);
    setTargeting('');
    setError(null);
  };

  const handleBannerSubmit = async () => {
    if (!title || !url || !content) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsGenerating(true);
      await createAd({
        userId: user?.id || 'anonymous',
        type: 'text',
        level: 1,
        size: selectedSize,
        backgroundColor: selectedColor,
        content: JSON.stringify({ text: content, color: '#ffffff' }),
        title,
        url,
        subscriptionId: 'free',
        startTime,
        endTime,
        activeHours,
        targeting: targeting.split(',').map(t => t.trim()).filter(t => t)
      });
      event({ action: 'create_ad', category: 'Ads', label: 'banner' });
      resetForm();
      toast.success('Ad campaign created successfully!');
    } catch (err) {
      setError('Failed to create ad campaign');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!title || !url || !videoFile) {
      setError('Please provide a title, destination URL, and media file');
      return;
    }

    try {
      setIsGenerating(true);
      const isVideo = videoFile.type.startsWith('video/');
      const mockUrl = URL.createObjectURL(videoFile);
      
      await createAd({
        userId: user?.id || 'anonymous',
        type: isVideo ? 'video' : 'image',
        level: 1,
        size: 'medium-rectangle',
        backgroundColor: 'bg-black',
        content: mockUrl,
        title,
        url,
        subscriptionId: 'free',
        startTime,
        endTime,
        activeHours,
        targeting: targeting.split(',').map(t => t.trim()).filter(t => t)
      });
      event({ action: 'create_ad', category: 'Ads', label: 'upload' });
      resetForm();
      toast.success('Ad campaign uploaded successfully!');
    } catch (err) {
      setError('Failed to upload ad campaign');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) {
      setError('Please describe your ad concept');
      return;
    }

    try {
      setIsGenerating(true);
      if (aiType === 'video') {
        const videoUrl = await generateAdVideo(aiPrompt);
        await createAd({
          userId: user?.id || 'anonymous',
          type: 'video',
          level: 3,
          size: 'medium-rectangle',
          backgroundColor: 'bg-black',
          content: videoUrl || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          title: title || 'AI Generated Video Ad',
          url,
          subscriptionId: 'free',
          startTime,
          endTime,
          activeHours,
          targeting: targeting.split(',').map(t => t.trim()).filter(t => t)
        });
        event({ action: 'create_ad', category: 'Ads', label: 'ai_video' });
      } else {
        const adContent = await generateAdContent(aiPrompt);
        await createAd({
          userId: user?.id || 'anonymous',
          type: 'text',
          level: 2,
          size: 'large-rectangle',
          backgroundColor: 'bg-gradient-to-br from-purple-600 to-blue-600 font-display text-center rounded-2xl',
          content: JSON.stringify({ 
            text: adContent.description, 
            color: '#ffffff',
            title: adContent.title,
            cta: adContent.cta
          }),
          title: adContent.title,
          url,
          subscriptionId: 'free',
          startTime,
          endTime,
          activeHours,
          targeting: targeting.split(',').map(t => t.trim()).filter(t => t)
        });
        event({ action: 'create_ad', category: 'Ads', label: 'ai_text' });
      }

      resetForm();
      toast.success('AI Ad generated and launched!');
    } catch (err) {
      setError('AI generation failed. Please try a different prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getAdStatus = (ad: Ad) => {
    const now = new Date();
    const start = ad.startTime ? new Date(ad.startTime) : null;
    const end = ad.endTime ? new Date(ad.endTime) : null;

    if (start && now < start) return { label: 'Scheduled', color: 'bg-amber-100 text-amber-700' };
    if (end && now > end) return { label: 'Expired', color: 'bg-gray-100 text-gray-700' };
    
    if (ad.activeHours && ad.activeHours.length > 0) {
      const currentHour = now.getHours();
      if (!ad.activeHours.includes(currentHour)) {
        return { label: 'Off-Peak', color: 'bg-blue-100 text-blue-700' };
      }
    }

    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  const handleDoubleClick = (ad: Ad) => {
    setZoomedAds(() => {
      const currentHour = new Date().getHours();
      const now = new Date();
      
      const activeAds = ads.filter(a => {
        const expires = a.endTime ? new Date(a.endTime) : new Date(Date.now() + 86400000);
        const starts = a.startTime ? new Date(a.startTime) : new Date(0);
        const isWithinTimeRange = now >= starts && now <= expires;
        const isWithinActiveHours = !a.activeHours || a.activeHours.length === 0 || a.activeHours.includes(currentHour);
        return expires > now && isWithinTimeRange && isWithinActiveHours;
      });

      const otherAds = activeAds.filter(a => a.id !== ad.id).sort(() => 0.5 - Math.random()).slice(0, 3);
      return [ad, ...otherAds];
    });
    setZoomTimer(25 + Math.random() * 5); // 25-30 seconds
  };

  const toggleHour = (h: number) => {
    setActiveHours(prev => 
      prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)]">Ads Manager</h1>
          <p className="text-gray-500 mt-1">Create and manage your promotional campaigns. <span className="text-[var(--color-supreme-gold)] font-bold">Double-click any ad to zoom.</span></p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => handleRestrictedAction(() => setIsCreating(true))}
            className="px-6 py-2.5 bg-[var(--color-supreme-text)] text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
          >
            <Plus className="w-5 h-5" /> New Campaign
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-8 rounded-3xl bg-white border border-gray-100 shadow-xl"
          >
            {!creationMode ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setCreationMode('banner')}
                  className="p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LayoutIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-1">Standard Banner</h3>
                    <p className="text-sm text-gray-500">Design a static text-based ad banner</p>
                  </div>
                </button>
                <button
                  onClick={() => setCreationMode('upload')}
                  className="p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[var(--color-supreme-gold)] hover:bg-amber-50 transition-all group flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-[var(--color-supreme-gold)]" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-1">Upload Media</h3>
                    <p className="text-sm text-gray-500">Upload your own video or image creative</p>
                  </div>
                </button>
                <button
                  onClick={() => setCreationMode('ai')}
                  className="p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wand2 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-1">AI Generator</h3>
                    <p className="text-sm text-gray-500">Let Gemini generate high-impact visuals</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Title</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Summer 2024 Promo"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Destination URL</label>
                    <input 
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {creationMode === 'banner' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ad Size</label>
                        <select 
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value as Ad['size'])}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
                        >
                          {AD_SIZES.map(size => (
                            <option key={size.id} value={size.id}>{size.name} ({size.width} x {size.height})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Background Theme</label>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_PALETTE.map(color => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={clsx(
                                "w-8 h-8 rounded-full border-2 transition-all",
                                color,
                                selectedColor === color ? "border-purple-600 scale-110" : "border-transparent"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Banner Message</label>
                      <div className="relative">
                        <textarea 
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Your advertising message here..."
                          className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all min-h-[120px]"
                        />
                        <div 
                          className={clsx(
                            "absolute bottom-4 right-4 p-4 rounded-lg text-white font-bold text-sm shadow-xl pointer-events-none max-w-[200px]",
                            selectedColor
                          )}
                        >
                          {content || 'Preview Text'}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {creationMode === 'upload' ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Media File</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center gap-2 bg-gray-50"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-600 font-medium">{videoFile ? videoFile.name : 'Click to browse files'}</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="video/*,image/*"
                      className="hidden"
                    />
                  </div>
                ) : creationMode === 'ai' ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Generation Type</label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setAiType('video')}
                          className={clsx(
                            "flex-1 py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2",
                            aiType === 'video' ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-100 hover:border-purple-300"
                          )}
                        >
                          <Video className="w-5 h-5" /> Video
                        </button>
                        <button
                          onClick={() => setAiType('text')}
                          className={clsx(
                            "flex-1 py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2",
                            aiType === 'text' ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-100 hover:border-purple-300"
                          )}
                        >
                          <LayoutIcon className="w-5 h-5" /> Text/Banner
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">AI Prompt</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder={`Describe the ${aiType} ad you want to generate...`}
                      />
                      {aiType === 'video' && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> AI generated videos take about 30 seconds.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Scheduling & Targeting */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Scheduling & Targeting
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                      <input 
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                      <input 
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Active Hours (24h Window)</label>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1">
                        {Array.from({ length: 24 }).map((_, h) => (
                          <button
                            key={h}
                            onClick={() => toggleHour(h)}
                            className={clsx(
                              "py-1 text-[10px] font-bold rounded border transition-all",
                              activeHours.includes(h) 
                                ? "bg-purple-500 text-white border-purple-500" 
                                : "bg-white text-gray-400 border-gray-100 hover:border-purple-200"
                            )}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Targeting Tags (comma separated)</label>
                      <input 
                        type="text"
                        value={targeting}
                        onChange={(e) => setTargeting(e.target.value)}
                        placeholder="e.g. music, tech, fashion"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-2 text-sm font-bold">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => setCreationMode(null)}
                    className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100"
                  >
                    Back
                  </button>
                  <button
                    onClick={creationMode === 'banner' ? handleBannerSubmit : creationMode === 'upload' ? handleUploadSubmit : handleAiGenerate}
                    disabled={isGenerating}
                    className={clsx(
                      "px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-lg",
                      creationMode === 'ai' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-black hover:bg-gray-900',
                      "disabled:opacity-50"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {creationMode === 'ai' ? <Wand2 className="w-5 h-5" /> : creationMode === 'banner' ? <LayoutIcon className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                        {creationMode === 'ai' ? 'Generate' : 'Create Campaign'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAds.map((ad) => (
              <div 
                key={ad.id} 
                onDoubleClick={() => handleDoubleClick(ad)}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col group bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
              >
                {ad.type === 'video' || ad.type === 'image' ? (
                  <PreviewMedia ad={ad} />
                ) : (
                  <div className="relative aspect-video flex items-center justify-center p-4 overflow-hidden bg-gray-100">
                    <div 
                      className={clsx(
                        "flex items-center justify-center p-4 font-bold text-center shadow-lg rounded-lg overflow-hidden transition-transform group-hover:scale-[1.02]",
                        ad.backgroundColor,
                        AD_SIZES.find(s => s.id === ad.size)?.aspect
                      )}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        fontSize: 'min(1.2rem, 4vw)',
                        color: ad.content.startsWith('{') ? JSON.parse(ad.content).color : 'white'
                      }}
                    >
                      {ad.content.startsWith('{') ? JSON.parse(ad.content).text : ad.content}
                    </div>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-1 text-gray-900">{ad.title}</h3>
                    <button 
                      onClick={() => handleRestrictedAction(() => setAdToDelete(ad.id))}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium">
                    {(() => {
                      const status = getAdStatus(ad);
                      return (
                        <div className="flex items-center gap-2">
                          <div className={clsx("w-2 h-2 rounded-full", status.color.split(' ')[0].replace('bg-', 'bg-'))} />
                          <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", status.color)}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })()}
                    <span>•</span>
                    <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clicks</span>
                      <span className="text-sm font-bold text-gray-900">{ad.clicks}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</span>
                      <span className="text-sm font-bold text-green-600">${ad.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredAds.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-3xl">
                <LayoutIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold">No ads found.</p>
                <p className="text-sm">Try adjusting your search or create a new campaign.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {adToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Delete Campaign?</h2>
              <p className="text-gray-500 text-center mb-8">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setAdToDelete(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button 
                  onClick={() => {
                    deleteAd(adToDelete);
                    setAdToDelete(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zoomed Ads Overlay */}
      <AnimatePresence>
        {zoomedAds.length > 0 && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-[16/9] bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-0 grid grid-cols-2 gap-6 p-10">
                {zoomedAds.map((ad, idx) => (
                  <motion.div
                    key={`${ad.id}-${idx}`}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="relative group h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/40"
                  >
                    <AdBanner ad={ad} className="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-end pb-8 gap-4">
                      <h4 className="text-white font-bold">{ad.title}</h4>
                      <button 
                        onClick={() => window.open(ad.url, '_blank')}
                        className="bg-white text-black px-8 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <ExternalLink className="w-5 h-5" /> Visit site
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="absolute top-8 right-8 flex items-center gap-6 z-20">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                    <motion.circle
                      cx="28" cy="28" r="24" fill="none" stroke="gold" strokeWidth="4"
                      strokeDasharray="150.8"
                      animate={{ strokeDashoffset: 150.8 * (1 - zoomTimer / 30) }}
                    />
                  </svg>
                  <span className="absolute text-white font-mono text-sm font-bold">{Math.ceil(zoomTimer)}</span>
                </div>
                <button onClick={() => setZoomedAds([])} className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl"><X className="w-8 h-8" /></button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
