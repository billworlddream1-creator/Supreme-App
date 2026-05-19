import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Edit3, Eye, Save, Image as ImageIcon, Link as LinkIcon, List, Bold, Italic, Heading, Languages, ChevronDown, Globe, Loader2, Wand2 } from 'lucide-react';
import Markdown from 'react-markdown';
import FeatureLoader from '../components/FeatureLoader';
import { clsx } from 'clsx';
import { generateContent } from '../services/aiService';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 
  'Korean', 'Russian', 'Portuguese', 'Italian', 'Arabic', 'Hindi',
  'Turkish', 'Dutch', 'Swedish', 'Indonesian', 'Vietnamese', 'Thai'
];

export default function ContentCreator() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleAiPolish = async () => {
    if (!content.trim()) return;
    setIsPolishing(true);
    try {
      const polishedText = await generateContent(
        `As an elite editor, polish and enhance the following article content. 
        Make it sound more professional, engaging, and authoritative. Maintain the Markdown formatting. 
        Do not provide commentary, only return the polished text.
        Original content: "${content}"`
      );
      setContent(polishedText || content);
    } catch (error) {
      console.error("AI Polish Error", error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleTranslate = async () => {
    if (!content.trim()) return;
    setIsTranslating(true);
    try {
      const translatedText = await generateContent(
        `Translate the following article content to ${targetLanguage}. Keep the tone and context. Maintain the Markdown formatting. Only return the translated text: \n\n${content}`
      );
      setContent(translatedText || content);
    } catch (error) {
      console.error("Translation Error", error);
    } finally {
      setIsTranslating(false);
      setShowLanguageSelect(false);
    }
  };

  return (
    <FeatureLoader text="Content Creator">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)]">Content Creator</h1>
            <p className="text-gray-500">Draft and manage your articles and posts</p>
          </div>
          <button className="px-6 py-2 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-md flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </button>
        </div>

        <div className="glass-panel rounded-2xl border border-gray-200 bg-white/80 overflow-hidden shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gray-50/50">
            <input 
              type="text" 
              placeholder="Article Title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none w-full sm:w-1/2 placeholder-gray-400 text-[var(--color-supreme-text)]"
            />
            
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <button 
                onClick={() => setViewMode('edit')}
                className={clsx("px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors", viewMode === 'edit' ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "text-gray-500 hover:bg-gray-50")}
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button 
                onClick={() => setViewMode('preview')}
                className={clsx("px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors", viewMode === 'preview' ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "text-gray-500 hover:bg-gray-50")}
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
            </div>
          </div>

          {viewMode === 'edit' && (
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-white">
              <button onClick={() => insertText('**', '**')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
              <button onClick={() => insertText('*', '*')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              <button onClick={() => insertText('### ')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Heading"><Heading className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              <button onClick={() => insertText('- ')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="List"><List className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              <button onClick={() => insertText('[', '](url)')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Link"><LinkIcon className="w-4 h-4" /></button>
              <button onClick={() => insertText('![alt text](', ')')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Image"><ImageIcon className="w-4 h-4" /></button>
              <div className="flex-1" />
              <div className="flex items-center gap-2 pr-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 hover:text-gray-900 transition-all border border-gray-100"
                  >
                    <Languages className="w-3 h-3" /> {targetLanguage} <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                  {showLanguageSelect && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 max-h-48 overflow-y-auto">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setTargetLanguage(lang);
                            setShowLanguageSelect(false);
                          }}
                          className={clsx(
                            "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors",
                            targetLanguage === lang ? "text-[var(--color-supreme-gold)] font-bold bg-[var(--color-supreme-gold)]/5" : "text-gray-600"
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleTranslate}
                  disabled={isTranslating || !content.trim()}
                  className={clsx(
                    "p-1.5 rounded-lg transition-all",
                    isTranslating ? "bg-blue-100 text-blue-600 animate-pulse" : "hover:bg-gray-100 text-gray-500"
                  )}
                  title="Translate Content"
                >
                  <Globe className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleAiPolish}
                  disabled={isPolishing || !content.trim()}
                  className={clsx(
                    "p-1.5 rounded-lg transition-all",
                    isPolishing ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] animate-pulse" : "hover:bg-gray-100 text-gray-500"
                  )}
                  title="Polish with AI"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden relative bg-white">
            {viewMode === 'edit' ? (
              <textarea
                id="content-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your content here using Markdown..."
                className="w-full h-full p-6 resize-none outline-none text-gray-700 leading-relaxed font-mono text-sm"
              />
            ) : (
              <div className="w-full h-full p-8 overflow-y-auto prose prose-slate max-w-none">
                {content ? (
                  <div className="markdown-body">
                    <Markdown>{content}</Markdown>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Nothing to preview yet...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </FeatureLoader>
  );
}
