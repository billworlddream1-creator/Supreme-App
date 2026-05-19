import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Mail, Send, Sparkles, User as UserIcon, 
  ChevronRight, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { generateContent } from '../services/aiService';

interface AdminEmailProps {
  initialRecipient?: string;
}

export default function AdminEmail({ initialRecipient = '' }: AdminEmailProps) {
  const [to, setTo] = useState(initialRecipient);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (initialRecipient) {
      setTo(initialRecipient);
    }
  }, [initialRecipient]);
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [generationType, setGenerationType] = useState('Welcome');
  const [generationTone, setGenerationTone] = useState('Elite');
  const [aiKeywords, setAiKeywords] = useState('');

  const generateWithAI = async () => {
    if (!subject && !to && !aiKeywords) {
      toast.error('Please enter a subject, recipient, or keywords to provide context');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Write a professional, high-end email for a luxury and elite platform called "Supreme". 
        Context:
        - Purpose: ${generationType}
        - Tone: ${generationTone}
        - Subject Line Hint: ${subject}
        - Recipient Context: ${to}
        - Specific Keywords/Instructions: ${aiKeywords}

        Requirements:
        1. Use an elite, exclusive, and highly respectful tone (Gold and White theme).
        2. Keep it concise but impactful.
        3. Format it as a plain text body suitable for a premium email template.
        4. Focus on luxury, reliability, and supreme service.
        5. Do not include subject line in the body.`;

      const responseText = await generateContent(prompt);

      setBody(responseText || '');
      toast.success('Elite draft generated successfully');
    } catch (err) {
      console.error("AI Generation error:", err);
      toast.error('Failed to generate content with AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          setTo('');
          setSubject('');
          setBody('');
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Email Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-500">Direct Communication</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500/50">
            <CheckCircle className="w-4 h-4" /> Gold & White Template Active
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">Recipient Email</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                <input 
                  type="email" required value={to} onChange={e => setTo(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-red-950/50 border border-amber-500/20 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">Subject</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                <input 
                  type="text" required value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Exclusive Offer for You"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-red-950/50 border border-amber-500/20 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">AI Smart Draft</label>
              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={generationType}
                  onChange={e => setGenerationType(e.target.value)}
                  className="text-[10px] bg-red-950 border border-amber-500/20 text-amber-500 rounded-lg px-2 py-1 outline-none"
                >
                  <option>Welcome</option>
                  <option>Reward Notification</option>
                  <option>Security Alert</option>
                  <option>System Update</option>
                  <option>Exclusive Invite</option>
                </select>
                <select 
                  value={generationTone}
                  onChange={e => setGenerationTone(e.target.value)}
                  className="text-[10px] bg-red-950 border border-amber-500/20 text-amber-500 rounded-lg px-2 py-1 outline-none"
                >
                  <option>Elite</option>
                  <option>Professional</option>
                  <option>Urgent</option>
                  <option>Warm</option>
                  <option>Minimalist</option>
                </select>
                <input 
                  type="text"
                  value={aiKeywords}
                  onChange={e => setAiKeywords(e.target.value)}
                  placeholder="Key points (e.g. $100 bonus, VIP access)"
                  className="text-[10px] bg-red-950 border border-amber-500/20 text-white rounded-lg px-2 py-1 outline-none min-w-[150px]"
                />
                <button 
                  type="button"
                  onClick={generateWithAI}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-red-950 rounded-lg text-[10px] font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate Draft
                </button>
              </div>
            </div>
            <textarea 
              required value={body} onChange={e => setBody(e.target.value)}
              rows={12}
              placeholder="Your exclusive message starts here..."
              className="w-full px-4 py-4 rounded-3xl bg-red-950/50 border border-amber-500/20 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none font-serif"
            />
          </div>

          <button 
            type="submit"
            disabled={isSending || status === 'success'}
            className={clsx(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
              status === 'success' 
                ? "bg-green-500 text-white" 
                : "bg-amber-500 text-red-950 hover:bg-amber-400"
            )}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === 'success' ? (
              <><CheckCircle className="w-5 h-5" /> Email Sent Successfully</>
            ) : (
              <><Send className="w-5 h-5" /> Send Exclusive Email</>
            )}
          </button>
        </form>
      </div>

      {/* Template Preview */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-amber-500/50 uppercase tracking-widest">Live Template Preview</h3>
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 min-h-[500px] flex flex-col">
          {/* Email Header */}
          <div className="bg-amber-500 p-8 text-center">
            <h1 className="text-3xl font-display font-bold text-white tracking-widest uppercase">Supreme</h1>
            <div className="w-12 h-0.5 bg-white/50 mx-auto mt-2" />
          </div>
          
          {/* Email Content */}
          <div className="flex-1 p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">{subject || 'Subject Line'}</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm italic">
              {body || 'Your message will appear here in our exclusive gold and white template...'}
            </div>
            
            <div className="pt-8 border-t border-gray-100">
              <button className="bg-amber-500 text-white px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase shadow-md">
                Access Your Account
              </button>
            </div>
          </div>

          {/* Email Footer */}
          <div className="p-8 bg-gray-50 text-center space-y-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Supreme Elite Network</p>
            <p className="text-[8px] text-gray-300">This is an exclusive communication for Supreme members only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
