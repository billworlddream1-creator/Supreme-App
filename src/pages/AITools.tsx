import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles, Send, Loader2, Paperclip, X } from 'lucide-react';
import { clsx } from 'clsx';
import FeatureLoader from '../components/FeatureLoader';
import Markdown from 'react-markdown';
import { generateContent } from '../services/aiService';

export default function AITools() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{data: string, mimeType: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages: {data: string, mimeType: string}[] = [];
      let loadedCount = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({ data: reader.result as string, mimeType: file.type });
          loadedCount++;
          if (loadedCount === files.length) {
            setSelectedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleGenerate = async () => {
    if ((!prompt.trim() && selectedImages.length === 0) || loading) return;

    setLoading(true);
    setResponse('');
    const currentPrompt = prompt;
    const currentImages = [...selectedImages];
    
    setPrompt('');
    setSelectedImages([]);

    try {
      const parts: any[] = [];
      if (currentPrompt.trim()) {
        parts.push({ text: currentPrompt });
      }
      
      currentImages.forEach(img => {
        const base64Data = img.data.split(',')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: img.mimeType
          }
        });
      });

      const responseText = await generateContent(currentPrompt, {
        model: currentImages.length > 0 ? "gemini-2.0-flash" : "gemini-2.0-flash",
        parts,
        systemInstruction: "You are Supreme AI, the official AI assistant for the Supreme App. You are knowledgeable about all Supreme App features, including Supreme Coin Miner, Supreme GMT Forex trade, Supreme Network, Supreme FP, and the Master Admin role. Be helpful, professional, and enthusiastic about the Supreme platform."
      });
      
      setResponse(responseText);
    } catch (error) {
      console.error("Error generating content:", error);
      setResponse('An error occurred while generating content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureLoader text="Ai Tools">
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-4 rounded-full bg-[var(--color-supreme-gold)]/10 border border-[var(--color-supreme-gold)]/30 mb-4"
        >
          <Bot className="w-12 h-12 text-[var(--color-supreme-gold)]" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--color-supreme-text)] tracking-tight">
          Supreme <span className="text-gradient-gold">AI Assistant</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Harness the power of advanced artificial intelligence to create, innovate, and solve.
        </p>
      </div>

      <div className="glass-panel p-1 rounded-3xl border border-[var(--color-supreme-gold)]/20 shadow-[0_0_50px_rgba(184,134,11,0.05)] bg-white/50">
        <div className="bg-white/80 backdrop-blur-xl rounded-[22px] p-6 md:p-8 space-y-6">
          
          {selectedImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto p-2 mb-4 no-scrollbar">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={img.data} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Supreme AI anything... (e.g., 'Write a business plan for a luxury coffee brand')"
              className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-[var(--color-supreme-text)] placeholder-gray-400 focus:outline-none focus:border-[var(--color-supreme-gold)]/50 focus:ring-1 focus:ring-[var(--color-supreme-gold)]/50 transition-all resize-none shadow-inner"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <span className="text-xs text-gray-500">{prompt.length} chars</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium text-sm"
              >
                <Paperclip className="w-4 h-4" />
                Attach Images
              </button>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || (!prompt.trim() && selectedImages.length === 0)}
              className={clsx(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-md",
                loading || (!prompt.trim() && selectedImages.length === 0)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[var(--color-supreme-gold)] text-white hover:bg-[var(--color-supreme-gold-light)] hover:shadow-[0_0_20px_rgba(184,134,11,0.4)] hover:scale-105"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Response
                </>
              )}
            </button>
          </div>

          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--color-supreme-gold)]/10 border border-[var(--color-supreme-gold)]/20">
                  <Bot className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                </div>
                <h3 className="font-bold text-[var(--color-supreme-text)]">Supreme AI Response</h3>
              </div>
              <div className="markdown-body prose prose-lg max-w-none text-gray-700 leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800 prose-headings:!mt-6 prose-headings:!mb-4">
                <Markdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="!text-3xl !font-bold !text-transparent !bg-clip-text !bg-gradient-to-r !from-[var(--color-supreme-gold)] !to-yellow-600" {...props} />,
                    h2: ({node, ...props}) => <h2 className="!text-2xl !font-bold !text-blue-600" {...props} />,
                    h3: ({node, ...props}) => <h3 className="!text-xl !font-bold !text-purple-600" {...props} />,
                    h4: ({node, ...props}) => <h4 className="!text-lg !font-bold !text-emerald-600" {...props} />,
                    strong: ({node, ...props}) => <strong className="!font-bold !text-[var(--color-supreme-gold)]" {...props} />,
                  }}
                >
                  {response}
                </Markdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {['Content Creation', 'Business Strategy', 'Code Generation'].map((feature) => (
          <button 
            key={feature} 
            onClick={() => setPrompt(`Help me with ${feature.toLowerCase()} for my Supreme Network profile.`)}
            className="p-4 rounded-xl bg-white/50 border border-gray-200 text-sm text-gray-500 hover:text-[var(--color-supreme-gold)] hover:border-[var(--color-supreme-gold)]/30 transition-all cursor-pointer shadow-sm"
          >
            {feature}
          </button>
        ))}
      </div>
    </div>
    </FeatureLoader>
  );
}
