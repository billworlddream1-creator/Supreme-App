import React, { useState, useRef } from 'react';
import { Upload, Video, Scissors, Music, Wand2, AlertCircle, CheckCircle2, X, FileText, Image as ImageIcon, Calendar, Sparkles, LayoutGrid, Clock, Hash, Languages, Globe, ChevronDown, Activity, Gauge, ShieldAlert, ShieldCheck, Fingerprint, History, Plus, Trash, Copy, Eye, Send, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import WysiwygEditor from './WysiwygEditor';
import { useAuth } from '../context/AuthContext';
import { generateContent } from '../services/aiService';

type StudioTab = 'video' | 'post' | 'ai' | 'media';

export default function CreatorStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StudioTab>('video');
  
  // Video Upload State
  const [videoType, setVideoType] = useState<'vibes' | 'media-tube'>('vibes');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [step, setStep] = useState<'upload' | 'edit' | 'publish'>('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [isPublished, setIsPublished] = useState(false);
  const [activeEditTool, setActiveEditTool] = useState<'none' | 'trim' | 'audio' | 'effects'>('none');
  const [trimRange, setTrimRange] = useState({ start: 0, end: 100 });
  const [selectedAudio, setSelectedAudio] = useState('original');
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [drafts, setDrafts] = useState<{id: string, title: string, type: string, date: string}[]>([]);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'drafts' | 'security'>('all');

  // Time Analyzer State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMetrics, setAnalysisMetrics] = useState<{duration: number, resolution: string, fps: number, isOriginal: boolean} | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<{id: string, file: string, type: string, time: string}[]>([]);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  // Post Editor State
  const [postContent, setPostContent] = useState('');
  const [postTitleText, setPostTitleText] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  // AI Polish states
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishStyle, setPolishStyle] = useState('supreme-sparkle');
  const [polishedPreview, setPolishedPreview] = useState<string | null>(null);
  const [originalContentForBackup, setOriginalContentForBackup] = useState<string | null>(null);
  const [showPolishModal, setShowPolishModal] = useState(false);
  
  // Publish destination states
  const [publishDestinations, setPublishDestinations] = useState<string[]>(['vibes']);
  const [targetAudience, setTargetAudience] = useState('free');
  const [isSuccessPublishModal, setIsSuccessPublishModal] = useState(false);
  const [publishedArticleData, setPublishedArticleData] = useState<any>(null);

  // AI Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [aiType, setAiType] = useState<'text' | 'video'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 
    'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Italian', 'Dutch', 'Turkish'
  ];
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioFile = e.target.files?.[0];
    if (audioFile && audioFile.type.startsWith('audio/')) {
      setSelectedAudio(audioFile.name);
      alert(`Custom audio "${audioFile.name}" selected!`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setValidationError('Please select a valid video file.');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    
    // Anti-reupload validation simulation
    // In a real app, this would check file hashes or metadata
    if (selectedFile.name.toLowerCase().includes('downloaded_from_supreme')) {
      setValidationError('Security Alert: This video appears to have been downloaded from the platform. Re-uploading platform content is strictly prohibited.');
      return;
    }

    setVideoUrl(url);
    setFile(selectedFile);
    setValidationError(null);
    setIsValidating(true);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const duration = video.duration;
    
    if (isNaN(duration) || duration === Infinity) {
      setIsValidating(false);
      setValidationError('Could not determine video duration. Please try another file.');
      setVideoUrl(null);
      setFile(null);
      return;
    }

    // Start Analysis Phase
    setIsValidating(false);
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulated "Fingerprint Check" - in a real app this would scan binary content
    const isPlatformContent = file?.name.toLowerCase().includes('downloaded_from_supreme') || 
                              file?.size === 5423122; // Random simulated target size

    setAnalysisMetrics({
      duration,
      resolution: `${video.videoWidth}x${video.videoHeight}`,
      fps: 30,
      isOriginal: !isPlatformContent
    });

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (isPlatformContent) {
            handleSecurityViolation(file?.name || 'Unknown');
          }
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  const handleSecurityViolation = (fileName: string) => {
    const alert = {
      id: `SEC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      file: fileName,
      type: 'Platform Copyright Violation',
      time: new Date().toLocaleTimeString()
    };
    setSecurityAlerts(prev => [alert, ...prev]);
    setValidationError('Security Violation: Fingerprint analysis confirms this content was previously downloaded from Supreme. Re-uploading is disabled to protect platform integrity.');
  };

  const handleStartEditing = () => {
    if (!analysisMetrics) return;
    const { duration } = analysisMetrics;

    if (videoType === 'vibes') {
      // Vibes: 5 seconds to 59 minutes
      if (duration < 5) {
        setValidationError('Vibes video is too short. Minimum duration is 5 seconds.');
        setVideoUrl(null);
        setFile(null);
      } else if (duration > 3540) {
        setValidationError('Vibes video is too long. Maximum duration is 59 minutes.');
        setVideoUrl(null);
        setFile(null);
      } else {
        setValidationError(null);
        setStep('edit');
      }
    } else {
      // Media Tube: 1 hour to 6 hours
      if (duration < 3600) {
        setValidationError('Media Tube video is too short. Minimum duration is 1 hour.');
        setVideoUrl(null);
        setFile(null);
      } else if (duration > 21600) {
        setValidationError('Media Tube video is too long. Maximum duration is 6 hours.');
        setVideoUrl(null);
        setFile(null);
      } else {
        setValidationError(null);
        setStep('edit');
      }
    }
    setIsAnalyzing(false);
  };

  const handleVideoError = () => {
    setIsValidating(false);
    setValidationError('Error loading video file. It might be corrupted or in an unsupported format.');
    setVideoUrl(null);
    setFile(null);
  };

  const handlePublish = () => {
    if (!title.trim()) {
      setValidationError('Title is required to publish.');
      return;
    }
    setValidationError(null);
    
    // Generate unique Video ID
    const uniqueId = `SUP-VID-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setGeneratedVideoId(uniqueId);
    
    setIsPublished(true);
    setStep('publish');
  };

  const handleSaveDraft = () => {
    if (!title.trim() && !file) return;
    setIsDraftSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const newDraft = {
        id: `DRAFT-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        title: title || 'Untitled Draft',
        type: videoType,
        date: new Date().toLocaleDateString()
      };
      setDrafts([newDraft, ...drafts]);
      setIsDraftSaving(false);
      alert('Draft saved successfully! You can find it in the "Drafts" tab of your Media Library.');
    }, 1000);
  };

  const resetStudio = () => {
    setFile(null);
    setVideoUrl(null);
    setValidationError(null);
    setIsValidating(false);
    setStep('upload');
    setTitle('');
    setDescription('');
    setIsPublished(false);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const responseText = await generateContent(aiPrompt);
      setGeneratedContent(responseText);
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslate = async () => {
    if (!postContent.trim()) return;
    setIsTranslating(true);
    try {
      const responseText = await generateContent(
        `Translate the following text to ${targetLanguage}. Keep the tone and context. Only return the translated text: \n\n${postContent}`
      );
      setPostContent(responseText);
    } catch (error) {
      console.error("Translation Error:", error);
    } finally {
      setIsTranslating(false);
      setShowLanguageSelect(false);
    }
  };

  const handleAIPolish = async () => {
    if (!postContent.trim()) return;
    setIsPolishing(true);
    setOriginalContentForBackup(postContent);
    
    let instruction = "";
    if (polishStyle === 'grammar') {
      instruction = "Politely fix grammar, spelling, and sentence structure. Maintain original meaning absolutely, just make it perfect, elegant, and clean HTML.";
    } else if (polishStyle === 'supreme-sparkle') {
      instruction = "Improve flow, bold key insights, and add subtle formatting to make the content look incredibly prestigious, persuasive, and beautifully written with responsive spans and divs in HTML. Keep it engaging and exciting.";
    } else if (polishStyle === 'clickbait') {
      instruction = "Add highly engaging headings, hooks, and bullet points. Format beautifully with HTML tags, bold key arguments, and insert a few relevant hashtags for maximum viral potential.";
    } else if (polishStyle === 'expert') {
      instruction = "Rewrite the content in a formal, expert, and academic-professional tone, ensuring high authority. Structure nicely using paragraphs and bold terms with HTML.";
    } else if (polishStyle === 'concise') {
      instruction = "Condense and edit for extreme brevity and clarity, keeping only the most impactful sentences and structuring with crisp inline list points in HTML. Make it punchy.";
    } else if (polishStyle === 'expand') {
      instruction = "Expand and enrich the core ideas, introducing deeper context, structured headings, and highly analytical points to double its educational value. Use HTML styling.";
    }

    try {
      const prompt = `Rewrite the following article based on this specific goal: "${instruction}". Strictly preserve all inline HTML tags and images already nested in the content. Re-output the formatted HTML results:\n\n${postContent}`;
      const response = await generateContent(prompt, {
        model: "gemini-3.5-flash",
        systemInstruction: "You are the Supreme Editor, the platform's leading AI content reviewer. You optimize, professionalize, and rewrite article contents into clean HTML blocks containing paragraphs, lists, bold words, and styles. Do not include markdown codeblocks (such as \`\`\`html) in your response, just return the raw compiled HTML text directly."
      });
      setPolishedPreview(response);
      setShowPolishModal(true);
    } catch (e) {
      console.error("AI Polish failed", e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handlePublishPost = () => {
    if (!postTitleText.trim()) {
      alert("Post Title is required to publish.");
      return;
    }
    if (!postContent.trim()) {
      alert("Post Content cannot be empty.");
      return;
    }

    const compiledData = {
      title: postTitleText,
      content: postContent,
      cover: coverImage,
      destinations: publishDestinations,
      audience: targetAudience,
      date: scheduleDate || new Date().toLocaleDateString(),
      time: scheduleTime || new Date().toLocaleTimeString(),
      id: `SUP-ART-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };

    setPublishedArticleData(compiledData);
    setIsSuccessPublishModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-display font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Creator Studio
          </h2>
          {user?.mediaId && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Media ID</span>
                <span className="text-xs font-mono font-bold text-[var(--color-supreme-gold)]">{user.mediaId}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setActiveTab('video')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
              activeTab === 'video' ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Video className="w-4 h-4" /> Video Upload
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
              activeTab === 'post' ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <FileText className="w-4 h-4" /> Post Editor
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
              activeTab === 'ai' ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Sparkles className="w-4 h-4" /> AI Generator
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
              activeTab === 'media' ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <LayoutGrid className="w-4 h-4" /> Media Library
          </button>
        </div>
      </div>

      <div className="p-6 md:p-10">
        {activeTab === 'video' && (
          <>
            {step === 'upload' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                    <button
                      onClick={() => { setVideoType('vibes'); resetStudio(); }}
                      className={clsx("px-6 py-2 rounded-lg font-bold text-sm transition-all", videoType === 'vibes' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                    >
                      Vibes (Shorts)
                    </button>
                    <button
                      onClick={() => { setVideoType('media-tube'); resetStudio(); }}
                      className={clsx("px-6 py-2 rounded-lg font-bold text-sm transition-all", videoType === 'media-tube' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                    >
                      Media Tube (Long-form)
                    </button>
                  </div>
                </div>

                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    "w-full max-w-xl border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300",
                    validationError ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-gray-300 bg-gray-50 hover:border-[var(--color-supreme-gold)] hover:bg-white"
                  )}
                >
                  <Upload className={clsx("w-16 h-16 mx-auto mb-6", validationError ? "text-red-400" : "text-gray-400")} />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Upload {videoType === 'vibes' ? 'Vibes' : 'Media Tube'} Video
                  </h3>
                  <p className="text-gray-500 mb-4">Drag and drop your video file here, or click to browse.</p>
                  <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {videoType === 'vibes' ? (
                      <>
                        <span>Min: 5s</span>
                        <span>•</span>
                        <span>Max: 59m</span>
                      </>
                    ) : (
                      <>
                        <span>Min: 1h</span>
                        <span>•</span>
                        <span>Max: 6h</span>
                      </>
                    )}
                    <span>•</span>
                    <span>MP4, WebM, MOV</span>
                  </div>
                </div>

                {validationError && (
                  <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{validationError}</span>
                  </div>
                )}

                {isValidating && (
                  <div className="mt-6 flex items-center gap-2 text-[var(--color-supreme-gold)]">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="font-bold">Extracting video metadata...</span>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="mt-8 w-full max-w-xl bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                        <h4 className="font-bold text-gray-800">Supreme Time Analyzer</h4>
                      </div>
                      <span className="text-xs font-black text-[var(--color-supreme-gold)]">{analysisProgress}%</span>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisProgress}%` }}
                        className="h-full bg-[var(--color-supreme-gold)]"
                      />
                    </div>

                    {analysisProgress === 100 && analysisMetrics && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                            <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p>
                            <p className="text-xs font-black text-gray-800">{Math.floor(analysisMetrics.duration / 60)}:{(analysisMetrics.duration % 60).toFixed(0).padStart(2, '0')}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                            <LayoutGrid className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Resolution</p>
                            <p className="text-xs font-black text-gray-800">{analysisMetrics.resolution}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                            <Gauge className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">FPS</p>
                            <p className="text-xs font-black text-gray-800">{analysisMetrics.fps}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                            {analysisMetrics.isOriginal ? (
                              <ShieldCheck className="w-4 h-4 text-green-500 mx-auto mb-1" />
                            ) : (
                              <ShieldAlert className="w-4 h-4 text-red-500 mx-auto mb-1" />
                            )}
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Security</p>
                            <p className={clsx("text-xs font-black", analysisMetrics.isOriginal ? "text-green-600" : "text-red-600")}>
                              {analysisMetrics.isOriginal ? 'Original' : 'Blocked'}
                            </p>
                          </div>
                        </div>

                        {analysisMetrics.isOriginal ? (
                          <button 
                            onClick={handleStartEditing}
                            className="w-full py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:shadow-lg transition-all"
                          >
                            Continue to Editor
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-medium flex items-start gap-3">
                              <Fingerprint className="w-5 h-5 flex-shrink-0" />
                              <p>Supreme Intelligent Fingerprinting has identified this asset as platform-owned content. Re-uploading is restricted to maintain content exclusivity.</p>
                            </div>
                            <button 
                              onClick={resetStudio}
                              className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                              Dismiss and Upload Different File
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Hidden video element for duration validation */}
                {videoUrl && step === 'upload' && (
                  <video 
                    src={videoUrl} 
                    onLoadedMetadata={handleLoadedMetadata} 
                    onError={handleVideoError}
                    className="hidden" 
                  />
                )}
              </div>
            )}

            {step === 'edit' && videoUrl && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Video Preview & Tools */}
                <div className="space-y-6">
                  <div className="aspect-[9/16] max-h-[500px] mx-auto bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative">
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => setActiveEditTool(activeEditTool === 'trim' ? 'none' : 'trim')}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                        activeEditTool === 'trim' ? "bg-[var(--color-supreme-gold)]/10 ring-2 ring-[var(--color-supreme-gold)]" : "hover:bg-gray-100 text-gray-600"
                      )}
                    >
                      <Scissors className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                      <span className="text-xs font-bold">Trim</span>
                    </button>
                    <button 
                      onClick={() => setActiveEditTool(activeEditTool === 'audio' ? 'none' : 'audio')}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                        activeEditTool === 'audio' ? "bg-purple-100 ring-2 ring-purple-500" : "hover:bg-gray-100 text-gray-600"
                      )}
                    >
                      <Music className="w-5 h-5 text-purple-500" />
                      <span className="text-xs font-bold">Audio</span>
                    </button>
                    <button 
                      onClick={() => setActiveEditTool(activeEditTool === 'effects' ? 'none' : 'effects')}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                        activeEditTool === 'effects' ? "bg-blue-100 ring-2 ring-blue-500" : "hover:bg-gray-100 text-gray-600"
                      )}
                    >
                      <Wand2 className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-bold">Effects</span>
                    </button>
                  </div>

                  {/* Edit Panels */}
                  <AnimatePresence mode="wait">
                    {activeEditTool === 'trim' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4"
                      >
                        <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                          <span>Start: {trimRange.start}%</span>
                          <span>End: {trimRange.end}%</span>
                        </div>
                        <div className="relative h-2 bg-gray-200 rounded-full">
                          <div 
                            className="absolute h-full bg-[var(--color-supreme-gold)] rounded-full"
                            style={{ 
                              left: `${trimRange.start}%`, 
                              right: `${100 - trimRange.end}%` 
                            }}
                          />
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={trimRange.start}
                            onChange={(e) => setTrimRange(prev => ({ ...prev, start: Math.min(parseInt(e.target.value), prev.end - 5) }))}
                            className="absolute w-full top-0 appearance-none bg-transparent pointer-events-auto h-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-supreme-gold)] [&::-webkit-slider-thumb]:rounded-full"
                          />
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={trimRange.end}
                            onChange={(e) => setTrimRange(prev => ({ ...prev, end: Math.max(parseInt(e.target.value), prev.start + 5) }))}
                            className="absolute w-full top-0 appearance-none bg-transparent pointer-events-auto h-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-supreme-gold)] [&::-webkit-slider-thumb]:rounded-full"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 italic">Drag sliders to trim your video for the perfect vibe.</p>
                      </motion.div>
                    )}

                    {activeEditTool === 'audio' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4"
                      >
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Background Music</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['original', 'supreme-bass', 'lofi-vibe', 'cinematic', 'epic-surge', 'lofi-night'].map(track => (
                            <button
                              key={track}
                              onClick={() => setSelectedAudio(track)}
                              className={clsx(
                                "py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all border",
                                selectedAudio === track ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                              )}
                            >
                              {track.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <input 
                            type="file" 
                            accept="audio/*" 
                            className="hidden" 
                            ref={audioInputRef}
                            onChange={handleAudioUpload}
                          />
                          <button 
                            onClick={() => audioInputRef.current?.click()}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Upload className="w-4 h-4" /> Upload Custom Audio
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeEditTool === 'effects' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4"
                      >
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Video Filters</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['none', 'vintage', 'noir', 'vibrant', 'dreamy', 'glitch', 'sepia', 'cool', 'warm', 'cyberpunk', 'retro', 'vhs'].map(effect => (
                            <button
                              key={effect}
                              onClick={() => setSelectedEffect(effect)}
                              className={clsx(
                                "py-2 px-2 rounded-lg text-[10px] font-bold capitalize transition-all border",
                                selectedEffect === effect ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                              )}
                            >
                              {effect}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-500 italic mt-2">More effects unlocked for Supreme & VIP members.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Details Form */}
                <div className="space-y-6 flex flex-col">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Video Title *</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] bg-gray-50 focus:bg-white transition-colors" 
                      placeholder="Catchy title for your vibe..." 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] bg-gray-50 focus:bg-white transition-colors resize-none" 
                      placeholder="Tell viewers what your video is about. Add #hashtags to reach more people."
                    ></textarea>
                  </div>

                  {videoType === 'media-tube' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Subscription Tier Required</label>
                      <select
                        value={subscriptionTier}
                        onChange={(e) => setSubscriptionTier(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] bg-gray-50 focus:bg-white transition-colors font-bold text-gray-700"
                      >
                        <option value="free">Free (All Users)</option>
                        <option value="premium">Premium</option>
                        <option value="supreme">Supreme</option>
                        <option value="vip">VIP</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">Select the minimum subscription tier required to watch this long-form video.</p>
                    </div>
                  )}

                  {validationError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">{validationError}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 mt-auto flex flex-wrap gap-4">
                    <button 
                      onClick={resetStudio}
                      className="px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveDraft}
                      disabled={isDraftSaving}
                      className="px-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      {isDraftSaving ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : 'Save Draft'}
                    </button>
                    <button 
                      onClick={handlePublish}
                      className="flex-1 py-4 bg-gradient-to-r from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                      Publish to {videoType === 'vibes' ? 'Supreme Vibes' : 'Media Tube'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'publish' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900 mb-2">Video Published!</h3>
                <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded-xl inline-block">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Unique Video ID</p>
                  <p className="text-sm font-mono font-bold text-[var(--color-supreme-gold)]">{generatedVideoId}</p>
                </div>
                <p className="text-gray-500 mb-8 max-w-md">Your video "{title}" is now live on {videoType === 'vibes' ? 'Supreme Vibes' : 'Media Tube'}. It will start appearing in users' feeds shortly.</p>
                <div className="flex gap-4">
                  <button 
                    onClick={resetStudio}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Upload Another
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-lg"
                  >
                    Go to {videoType === 'vibes' ? 'Supreme Vibes' : 'Media Tube'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'post' && (
          <div className="space-y-6">
            
            {/* ENHANCED COVER IMAGE & ARTICLE HEADER SECTION */}
            <div className="bg-gray-150/40 p-6 rounded-2xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-3">Post / Article Cover Banner</label>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/2 aspect-video bg-white border border-dashed border-gray-300 rounded-xl overflow-hidden flex flex-col justify-center items-center text-center p-4 relative group shrink-0">
                  {coverImage ? (
                    <>
                      <img src={coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover animate-fade-in" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => setCoverImage(null)}
                          className="p-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Trash className="w-4 h-4" /> Remove Cover
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-300 mb-2" />
                      <span className="text-xs font-bold text-gray-500 mb-1">Upload article cover picture</span>
                      <p className="text-[10px] text-gray-400 mb-3">Accepts standard image files up to 5MB</p>
                      
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setCoverImage(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        id="cover-file-upload"
                        className="hidden"
                      />
                      <label 
                        htmlFor="cover-file-upload" 
                        className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        Browse File
                      </label>
                    </>
                  )}
                </div>

                <div className="w-full md:w-1/2 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Or pick premium gradients</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop', name: 'Ambient Purple' },
                        { url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop', name: 'Abstract Fluid' },
                        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop', name: 'TradingDesk' },
                        { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop', name: 'Cyberspace' }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setCoverImage(preset.url)}
                          className={clsx(
                            "relative aspect-video rounded-lg overflow-hidden border border-gray-200 hover:scale-[1.02] transition-transform",
                            coverImage === preset.url && "ring-2 ring-[var(--color-supreme-gold)] border-transparent"
                          )}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                            <span className="text-[9px] font-bold text-white truncate w-full text-left">{preset.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Article / Post Title *</label>
                    <input 
                      type="text"
                      value={postTitleText}
                      onChange={(e) => setPostTitleText(e.target.value)}
                      placeholder="Enter a compelling title..."
                      className="w-full px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)] bg-white shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN ARTICLE EDITOR AREA */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">Content Body & Formatting Area</label>
                <div className="relative">
                  <button 
                    onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-xs font-bold"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    Translate to {targetLanguage}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  
                  {showLanguageSelect && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setTargetLanguage(lang);
                            setShowLanguageSelect(false);
                          }}
                          className={clsx(
                            "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                            targetLanguage === lang ? "text-purple-650 font-bold bg-purple-50" : "text-gray-650"
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced WYSIWYG Editor wrapper */}
              <div className="relative">
                <WysiwygEditor 
                  value={postContent} 
                  onChange={setPostContent} 
                  placeholder="Write something amazing. You can type, format fonts and colors, insert searchable emoticons or drop visuals..." 
                />
                
                {postContent.trim() && (
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-lg text-xs font-bold disabled:opacity-50 z-10"
                  >
                    {isTranslating ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                    Translate Now
                  </button>
                )}
              </div>
            </div>

            {/* ENHANCED AI POLISH SUITE INTERFACE */}
            {postContent.trim() && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50/50 p-5 rounded-2xl border border-purple-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-purple-600 animate-pulse" />
                    <span className="text-sm font-bold text-gray-800">Advanced AI Polish Assistant</span>
                  </div>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-100 px-2.5 py-1 rounded-full">Gemini Powered</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { style: 'supreme-sparkle', label: '✨ Supreme Sparkle', desc: 'Prestige style & headings' },
                    { style: 'grammar', label: '🔍 Grammar & Flow', desc: 'Smooth flawless check' },
                    { style: 'clickbait', label: '🚀 Viral / Hooky', desc: 'Bullets & catchy tags' },
                    { style: 'expert', label: '💼 Professional Desk', desc: 'Formal and analytical' },
                    { style: 'concise', label: '📉 Make Concise', desc: 'Punchy brief summaries' },
                    { style: 'expand', label: '📈 Deep Expansion', desc: 'Add detailed contexts' }
                  ].map((style) => (
                    <button
                      key={style.style}
                      type="button"
                      onClick={() => setPolishStyle(style.style)}
                      className={clsx(
                        "text-left p-3 rounded-xl border transition-all hover:scale-[1.01] flex flex-col justify-between",
                        polishStyle === style.style 
                          ? "bg-white border-purple-400 text-purple-900 shadow-sm ring-2 ring-purple-100" 
                          : "bg-white/65 hover:bg-white border-gray-150 text-gray-600"
                      )}
                    >
                      <span className="text-xs font-bold block mb-0.5">{style.label}</span>
                      <span className="text-[9px] text-gray-400 font-medium leading-none block">{style.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleAIPolish}
                    disabled={isPolishing}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isPolishing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Polishing Article Contents...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-violet-100 animate-bounce" />
                        Polish Article Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* PUBLISH DESTINATION CHOICES PANEL */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
              <span className="text-sm font-bold text-gray-800 block">Choose Publication Channels</span>
              <p className="text-xs text-gray-400 leading-none">Your content will automatically configure layout tags suitable for the selected streams.</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                {[
                  { id: 'vibes', label: '🌐 Supreme Vibes', tag: 'Vibes Feed', desc: 'Sleek social micro-posts' },
                  { id: 'network', label: '📣 Supreme Network', tag: 'Timeline', desc: 'Professional news streams' },
                  { id: 'tube', label: '📺 Media Tube Content', tag: 'Media transcript', desc: 'Related media descriptions' },
                  { id: 'gmt', label: '📈 GMT Forex Desk', tag: 'Forex Desk', desc: 'Market trading insights' }
                ].map((destination) => {
                  const isChecked = publishDestinations.includes(destination.id);
                  return (
                    <button
                      key={destination.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setPublishDestinations(prev => prev.filter(item => item !== destination.id));
                        } else {
                          setPublishDestinations(prev => [...prev, destination.id]);
                        }
                      }}
                      className={clsx(
                        "p-4 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-32",
                        isChecked 
                          ? "bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)] text-amber-900 shadow-xs" 
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-750"
                      )}
                    >
                      <div>
                        <span className="text-xs font-bold block mb-1">{destination.label}</span>
                        <span className="text-[10px] text-gray-400 font-medium leading-tight block mb-3">{destination.desc}</span>
                      </div>
                      <span className={clsx(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-auto w-max",
                        isChecked ? "bg-[var(--color-supreme-gold)] text-white" : "bg-gray-200 text-gray-500"
                      )}>
                        {isChecked ? 'Active Channel' : destination.tag}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* AUDIENCE ACCESSIBILITY DROPDOWN */}
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-700 block">Audience Visibility Level</span>
                    <p className="text-[10px] text-gray-400">Restricts article access level depending on tier level subscriptions</p>
                  </div>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)] cursor-pointer"
                  >
                    <option value="free">Free Users (All Public)</option>
                    <option value="premium">Premium Creators</option>
                    <option value="supreme">Supreme Core Members</option>
                    <option value="vip">Exclusive Elite VIP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SCHEDULING TIME & DATE CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Schedule Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] bg-gray-50 focus:bg-white transition-colors" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Schedule Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] bg-gray-50 focus:bg-white transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* ACTION TRIGGERS */}
            <div className="flex justify-end gap-3.5 pt-6 border-t border-gray-100">
              <button 
                onClick={() => {
                  alert("Draft Saved successfully! You can find it under drafts section.");
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold rounded-xl transition-colors text-sm font-bold"
              >
                Save Draft
              </button>
              <button 
                onClick={handlePublishPost}
                disabled={publishDestinations.length === 0}
                className="px-8 py-3 bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] text-white font-black rounded-xl transition-all shadow-md disabled:opacity-50 text-sm"
              >
                {scheduleDate && scheduleTime ? 'Schedule Post' : 'Publish Article'}
              </button>
            </div>

            {/* INLINE POPUPS & OVERLAYS */}
            <AnimatePresence>
              {/* SIDE-BY-SIDE AI POLISH PREVIEW DIFF MODAL */}
              {showPolishModal && polishedPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
                  >
                    <div className="bg-purple-900 text-white p-5 flex justify-between items-center shrink-0">
                      <span className="font-bold flex items-center gap-2 text-sm md:text-base">
                        <Wand2 className="w-5 h-5 text-[var(--color-supreme-gold)] animate-spin-slow" /> Supreme AI Editor Comparison
                      </span>
                      <button onClick={() => setShowPolishModal(false)} className="text-white/80 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto bg-gray-50">
                      {/* Left: Original version */}
                      <div className="flex flex-col h-full">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Original Draft</span>
                        <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-xs prose max-w-none text-sm min-h-[220px] max-h-[350px] overflow-y-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: originalContentForBackup || '' }} />
                      </div>

                      {/* Right: Polished version */}
                      <div className="flex flex-col h-full">
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Polished Masterpiece
                        </span>
                        <div className="flex-1 bg-indigo-50/20 p-4 rounded-xl border border-indigo-200 shadow-xs prose max-w-none text-sm min-h-[220px] max-h-[350px] overflow-y-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: polishedPreview }} />
                      </div>
                    </div>

                    <div className="p-5 bg-white border-t border-gray-150 flex justify-end gap-3.5 shrink-0">
                      <button 
                        onClick={() => {
                          setShowPolishModal(false);
                          setPolishedPreview(null);
                        }}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                      >
                        Discard AI Changes
                      </button>
                      <button 
                        onClick={() => {
                          setPostContent(polishedPreview);
                          setShowPolishModal(false);
                          setPolishedPreview(null);
                        }}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow"
                      >
                        Accept & Apply Upgrade
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* SUCCESS PUBLICATION OVERLAY */}
              {isSuccessPublishModal && publishedArticleData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-150 flex flex-col max-h-[90vh]"
                  >
                    <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 flex flex-col items-center justify-center text-center gap-2 shrink-0">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-1">
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black">Content Published Successfully!</h3>
                      <p className="text-emerald-100 text-xs font-semibold leading-none">Your Article is fully indexed to the chosen channels</p>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6">
                      
                      {/* Interactive Live Post Preview Block */}
                      <div className="border border-gray-150 rounded-2xl overflow-hidden bg-gray-50/50 shadow-xs">
                        {publishedArticleData.cover && (
                          <div className="aspect-video relative overflow-hidden h-40 border-b border-gray-150">
                            <img src={publishedArticleData.cover} alt="Banner" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 space-y-3">
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block font-mono bg-amber-50 px-2 py-0.5 rounded-md w-max">
                            ID: {publishedArticleData.id}
                          </span>
                          <h4 className="text-lg font-bold text-gray-900 leading-tight">{publishedArticleData.title}</h4>
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {publishedArticleData.destinations.map((dest: string) => (
                              <span key={dest} className="text-[9px] font-bold px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md uppercase">
                                🔗 {dest}
                              </span>
                            ))}
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md uppercase">
                              🛡️ {publishedArticleData.audience} Audience
                            </span>
                          </div>

                          <div className="border-t border-gray-150 pt-3 text-xs text-gray-500 leading-relaxed max-h-36 overflow-y-auto prose max-w-none" dangerouslySetInnerHTML={{ __html: publishedArticleData.content }} />
                        </div>
                      </div>

                      {/* Share options and live controls */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Creator Options</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://supreme-app.com/article/${publishedArticleData.id}`);
                              alert("Copied Article Link to Clipboard!");
                            }}
                            className="p-3 bg-gray-55 hover:bg-gray-120 border border-gray-200 rounded-xl text-left font-bold text-xs text-gray-700 transition-colors flex items-center justify-between"
                          >
                            <span>Copy Deep Link</span>
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          
                          <button
                            onClick={() => {
                              alert("Opening Live publication stream on Supreme Vibes.");
                            }}
                            className="p-3 bg-gray-55 hover:bg-gray-120 border border-gray-200 rounded-xl text-left font-bold text-xs text-gray-700 transition-colors flex items-center justify-between"
                          >
                            <span>View Live Feed</span>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="p-5 bg-gray-50 border-t border-gray-150 flex justify-end shrink-0">
                      <button
                        onClick={() => {
                          setIsSuccessPublishModal(false);
                          setPublishedArticleData(null);
                          setPostTitleText('');
                          setPostContent('');
                          setCoverImage(null);
                          setPublishDestinations(['vibes']);
                        }}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                      >
                        Done & Continue
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> AI Content Generator
              </h3>
              <p className="text-gray-600 mb-6">Describe what you want to create, and our AI will generate it for you.</p>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Content Title</label>
                  <input 
                    type="text"
                    value={aiTitle}
                    onChange={(e) => setAiTitle(e.target.value)}
                    placeholder="Enter a title for your AI content..."
                    className="w-full px-4 py-3 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Content Description</label>
                  <textarea 
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="Enter a description for your AI content..."
                    className="w-full h-24 px-4 py-3 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-sm resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setAiType('text')}
                    className={clsx(
                      "flex-1 py-3 rounded-xl font-bold transition-all border",
                      aiType === 'text' ? "bg-white border-purple-200 text-purple-700 shadow-sm" : "bg-transparent border-transparent text-gray-500 hover:bg-white/50"
                    )}
                  >
                    Generate Text
                  </button>
                  <button 
                    onClick={() => setAiType('video')}
                    className={clsx(
                      "flex-1 py-3 rounded-xl font-bold transition-all border",
                      aiType === 'video' ? "bg-white border-purple-200 text-purple-700 shadow-sm" : "bg-transparent border-transparent text-gray-500 hover:bg-white/50"
                    )}
                  >
                    Generate Video
                  </button>
                </div>

                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Write an engaging post about the future of digital marketing..."
                  className="w-full h-32 px-4 py-3 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white resize-none shadow-sm"
                />

                <button 
                  onClick={handleGenerateAI}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="w-5 h-5" /> Generate Content</>
                  )}
                </button>
              </div>
            </div>

            {generatedContent && (
              <div className="p-6 border border-gray-200 rounded-2xl bg-white">
                <h4 className="font-bold text-gray-800 mb-4">Generated Result</h4>
                {aiType === 'text' ? (
                  <div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap text-gray-700">
                    {generatedContent}
                  </div>
                ) : (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video src={generatedContent} controls className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex justify-end gap-4 mt-6">
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Discard
                  </button>
                  <button 
                    onClick={() => {
                      if (aiType === 'text') {
                        setPostContent(generatedContent);
                        let finalContent = generatedContent;
                        if (aiDescription) finalContent += `\n\n<p><i>${aiDescription}</i></p>`;
                        if (aiTitle) finalContent = `<h2>${aiTitle}</h2>\n${finalContent}`;
                        setPostContent(finalContent);
                        setActiveTab('post');
                      } else {
                        setVideoUrl(generatedContent);
                        if (aiTitle) setTitle(aiTitle);
                        if (aiDescription) setDescription(aiDescription);
                        setStep('edit');
                        setActiveTab('video');
                      }
                      setGeneratedContent(null);
                      setAiTitle('');
                      setAiDescription('');
                      setAiPrompt('');
                    }}
                    className="px-6 py-2 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors"
                  >
                    Use Content
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setMediaFilter('all')}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    mediaFilter === 'all' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  All Media
                </button>
                <button 
                  onClick={() => setMediaFilter('drafts')}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                    mediaFilter === 'drafts' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Drafts
                  {drafts.length > 0 && <span className="bg-[var(--color-supreme-gold)] text-white text-[10px] px-1.5 rounded-full">{drafts.length}</span>}
                </button>
                <button 
                  onClick={() => setMediaFilter('security')}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                    mediaFilter === 'security' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Analysis & Tracking
                  {securityAlerts.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{securityAlerts.length}</span>}
                </button>
              </div>
              <button className="px-4 py-2 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors flex items-center gap-2 shadow-md">
                <Upload className="w-4 h-4" /> Upload New
              </button>
            </div>
            
            {mediaFilter === 'all' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-200">
                    <img src={`https://picsum.photos/seed/media${i}/300`} alt={`Media ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"><ImageIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mediaFilter === 'drafts' && (
              <div className="space-y-3">
                {drafts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No drafts found. Save your progress as a draft to see them here.</p>
                  </div>
                ) : (
                  drafts.map(draft => (
                    <div key={draft.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-[var(--color-supreme-gold)] transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Video className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-[var(--color-supreme-gold)] transition-colors">{draft.title}</h4>
                          <p className="text-xs text-gray-500">Last edited: {draft.date} • {draft.type === 'vibes' ? 'Vibes' : 'Media Tube'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">Edit</button>
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {mediaFilter === 'security' && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Fingerprint className="w-6 h-6 text-red-600" />
                    <h4 className="text-lg font-bold text-red-900">Security Analysis & Content Tracking</h4>
                  </div>
                  <p className="text-sm text-red-700 mb-6">Supreme uses intelligent fingerprinting to track original content. Re-uploading content downloaded from the platform is restricted to protect creator rights and maintain platform exclusivity.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-red-50">
                      <History className="w-5 h-5 text-gray-400 mb-2" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Analysis Requests</p>
                      <p className="text-xl font-bold text-gray-900">12</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-red-50">
                      <ShieldAlert className="w-5 h-5 text-red-500 mb-2" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Violations Blocked</p>
                      <p className="text-xl font-bold text-red-600 font-mono">{securityAlerts.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-red-50">
                      <Clock className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Health Status</p>
                      <p className="text-xl font-bold text-emerald-600">Active</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Recent Security Events</h5>
                  {securityAlerts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                      <ShieldCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-medium">No security violations detected on your account.</p>
                    </div>
                  ) : (
                    securityAlerts.map(alert => (
                      <div key={alert.id} className="flex items-center justify-between p-4 bg-white border border-red-100 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{alert.type}</h4>
                            <p className="text-[10px] text-gray-500">File: {alert.file} • Event ID: {alert.id}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">{alert.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

