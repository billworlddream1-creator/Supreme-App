import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Info,
  Paperclip,
  ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { clsx } from 'clsx';
import Markdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { event } from '../utils/analytics';
import { generateContent } from '../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  image?: string;
}

const SYSTEM_INSTRUCTION = `
You are the Supreme Platform Assistant, a sophisticated AI designed to help users and dealers navigate the Supreme ecosystem. 
The Supreme Platform is an elite professional network and luxury marketplace.

Key Features for Users:
- Supreme Network: Connect with high-net-worth individuals and elite professionals.
- Supreme Market: A curated marketplace for luxury goods and services.
- Supreme Media: High-quality content platform where creators can monetize their work.
- Supreme Discover: Explore global business opportunities and luxury lifestyle trends.
- Supreme AI Tools: Advanced productivity tools, including AI-powered ad generation.
- Supreme Chat: Secure, encrypted messaging for private communications.
- Supreme Streams: Live broadcasts of exclusive events and professional seminars.
- Supreme Insight: Professional news, market analysis, and elite insights.
- Heart to Heart: A community space for meaningful social interactions.
- Supreme Mode: An exclusive, high-end interface for the most dedicated members.
- Supreme Coin Miner: Cloud and hardware mining for Supreme Coin (SUP). Free tier includes a 500MB rig. 17% commission on conversions. Free miners can cash out max $2 per 31 days.
- Supreme GMT Forex Trade: Fixed Time Trade (binary options style) forex trading with 82% payout. Features UP/DOWN orders, deposit bonuses (up to 50%), and crypto/card/wallet payments.
- Supreme FP (Financial Policy): Comprehensive guidelines ensuring transparent billing, performance-based earning, unlimited withdrawals (min $50), and strict adherence to financial terms.

Key Features for Dealers & Admins:
- Dealer Portal: Specialized access to list luxury products and manage business operations.
- Ads Manager: Tools to create, track, and optimize promotional campaigns.
- Business Tools: Suite of utilities for managing sales, leads, and client relationships.
- Wallet: Integrated financial management for tracking earnings and transactions.
- Master Admin: The highest administrative role with full control over settings, users, and platform moderation. Master Admin posts are ranked as 'Official'.

Subscription Tiers:
- Marketplace Plans: For users primarily interested in the luxury market.
- AI Ads Plans: For dealers and marketers needing advanced ad generation tools.
- Streaming Plans: For users focused on exclusive live content.
- General Subscription: The all-access pass that unlocks the full potential of the Supreme Platform.

Tone: Professional, sophisticated, helpful, and exclusive. Always refer to the platform as "Supreme" or "The Supreme Platform".
If asked about specific technical issues, guide them to the Admin Dashboard or Profile settings.
`;

export default function Chatbot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkAccess } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: `Welcome to Supreme, ${user?.name?.split(' ')[0] || 'Guest'}. I am your personal assistant. How can I help you navigate our elite ecosystem today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragControls = useDragControls();

  const access = checkAccess('general');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText !== undefined ? overrideText : input;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = textToSend;
    const currentImage = selectedImage;
    const currentMimeType = selectedImageMimeType;
    event({ action: 'send_message', category: 'Chatbot', label: currentImage ? 'with_image' : 'text_only' });
    
    setInput('');
    setSelectedImage(null);
    setSelectedImageMimeType(null);
    setIsLoading(true);

    try {
      const parts: any[] = [];
      if (currentInput.trim()) {
        parts.push({ text: currentInput });
      }
      if (currentImage && currentMimeType) {
        const base64Data = currentImage.split(',')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: currentMimeType
          }
        });
      }

      const botMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'bot',
        text: '',
        timestamp: new Date()
      }]);

      const responseText = await generateContent(currentInput, {
        model: currentImage ? "gemini-3.5-flash" : "gemini-3.5-flash",
        parts,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: responseText }
          : msg
      ));
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'bot',
        text: "An error occurred while processing your request. Please ensure your connection to the Supreme network is stable.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <motion.div 
        drag
        dragMomentum={false}
        className="fixed bottom-6 right-6 z-50"
      >
        <button 
          onClick={() => navigate('/login')}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-red-950 shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
          title="Login Required"
        >
          <Bot className="w-7 h-7" />
        </button>
      </motion.div>
    );
  }

  if (!access.hasAccess && user) {
    return (
      <motion.div 
        drag
        dragMomentum={false}
        className="fixed bottom-6 right-6 z-50"
      >
        <button 
          onClick={() => toast.error(access.message)}
          className="w-14 h-14 rounded-full bg-gray-400 text-white shadow-lg flex items-center justify-center cursor-not-allowed opacity-50"
          title="Subscription Required"
        >
          <Bot className="w-7 h-7" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-50"
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onPointerDown={(e) => !isOpen && dragControls.start(e)}
        className={clsx(
          "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95",
          isOpen 
            ? "bg-red-950 text-amber-500 rotate-90" 
            : "bg-gradient-to-br from-amber-400 to-amber-600 text-red-950"
        )}
      >
        {isOpen ? <X className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-amber-500/20 flex flex-col overflow-hidden"
          >
            {/* Header - Drag Handle */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="bg-gradient-to-r from-red-950 to-red-900 p-4 flex items-center justify-between border-b border-amber-500/30 cursor-move"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Bot className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-amber-500 font-display font-bold text-sm tracking-wider uppercase">Supreme Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-amber-500/60 font-bold uppercase">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMessages([{
                    id: '1',
                    role: 'bot',
                    text: 'Welcome to the Supreme Platform. I am your personal assistant, equipped with the latest features to guide you through our exclusive ecosystem. How may I assist you today?',
                    timestamp: new Date()
                  }])}
                  className="text-amber-500/50 hover:text-amber-500 transition-colors text-xs font-bold uppercase mr-2"
                  title="Clear Chat"
                >
                  Clear
                </button>
                <ShieldCheck className="w-4 h-4 text-amber-500/40" />
                <button onClick={() => setIsOpen(false)} className="text-amber-500/50 hover:text-amber-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={clsx(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                    msg.role === 'user' 
                      ? "bg-white border-gray-200 text-gray-400" 
                      : "bg-red-950 border-amber-500/30 text-amber-500"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={clsx(
                    "p-3 rounded-2xl text-sm shadow-sm overflow-hidden",
                    msg.role === 'user' 
                      ? "bg-amber-500 text-red-950 font-medium rounded-tr-none" 
                      : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                  )}>
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="max-w-full rounded-lg mb-2 border border-black/10" />
                    )}
                    {msg.role === 'bot' ? (
                      <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800 prose-headings:!mt-4 prose-headings:!mb-2">
                        <Markdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="!text-xl !font-bold !text-transparent !bg-clip-text !bg-gradient-to-r !from-amber-600 !to-red-600" {...props} />,
                            h2: ({node, ...props}) => <h2 className="!text-lg !font-bold !text-blue-600" {...props} />,
                            h3: ({node, ...props}) => <h3 className="!text-base !font-bold !text-purple-600" {...props} />,
                            h4: ({node, ...props}) => <h4 className="!text-sm !font-bold !text-emerald-600" {...props} />,
                            strong: ({node, ...props}) => <strong className="!font-bold !text-amber-700" {...props} />,
                          }}
                        >
                          {msg.text}
                        </Markdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}
                    <div className={clsx(
                      "text-[9px] mt-1 font-bold uppercase",
                      msg.role === 'user' ? "text-red-950/40" : "text-gray-400"
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 mr-auto max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-red-950 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                    <span className="text-xs text-gray-400 font-medium italic">Supreme Assistant is thinking...</span>
                  </div>
                </div>
              )}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-xs text-gray-400 text-center font-medium uppercase tracking-wider mb-2">Suggested Topics</p>
                  {[
                    "How do Profile Card subscriptions work?",
                    "What are the benefits of the Dealer tier?",
                    "Explain the Supreme Network features."
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="text-left text-sm p-3 rounded-xl bg-white border border-amber-500/20 text-gray-700 hover:bg-amber-50 hover:border-amber-500/50 transition-all shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
              {selectedImage && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedImageMimeType(null);
                    }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="relative flex items-center gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                  title="Attach Image"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about Supreme features..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className={clsx(
                    "p-3 rounded-xl transition-all flex-shrink-0",
                    (input.trim() || selectedImage) && !isLoading 
                      ? "bg-amber-500 text-red-950 shadow-md hover:bg-amber-400" 
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Powered by Supreme AI
                </div>
                <div className="w-px h-3 bg-gray-200" />
                <button className="flex items-center gap-1 text-[9px] text-amber-500 hover:text-amber-600 font-bold uppercase transition-colors">
                  <Info className="w-3 h-3" />
                  Help Center
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
