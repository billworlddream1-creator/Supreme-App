import React, { useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Image, Settings, Type } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function WysiwygEditor({ value, onChange, placeholder }: WysiwygEditorProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [toolbarConfig, setToolbarConfig] = useState({
    bold: true,
    italic: true,
    underline: true,
    align: true,
    list: true,
    link: true,
    image: true,
    heading: true,
  });

  const toggleToolbarOption = (option: keyof typeof toolbarConfig) => {
    setToolbarConfig(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarConfig.heading && (
            <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Heading">
              <Type className="w-4 h-4" />
            </button>
          )}
          {toolbarConfig.bold && (
            <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors font-bold" title="Bold">
              <Bold className="w-4 h-4" />
            </button>
          )}
          {toolbarConfig.italic && (
            <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors italic" title="Italic">
              <Italic className="w-4 h-4" />
            </button>
          )}
          {toolbarConfig.underline && (
            <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors underline" title="Underline">
              <Underline className="w-4 h-4" />
            </button>
          )}
          
          {toolbarConfig.align && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Align Left">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Align Center">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Align Right">
                <AlignRight className="w-4 h-4" />
              </button>
            </>
          )}

          {toolbarConfig.list && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Bullet List">
                <List className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </button>
            </>
          )}

          {(toolbarConfig.link || toolbarConfig.image) && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              {toolbarConfig.link && (
                <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Insert Link">
                  <Link className="w-4 h-4" />
                </button>
              )}
              {toolbarConfig.image && (
                <button className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Insert Image">
                  <Image className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-200 rounded text-gray-500 transition-colors"
            title="Toolbar Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-2"
              >
                <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">Customize Toolbar</div>
                {Object.entries(toolbarConfig).map(([key, isEnabled]) => (
                  <label key={key} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <span className="text-sm text-gray-700 capitalize">{key}</span>
                    <input 
                      type="checkbox" 
                      checked={isEnabled}
                      onChange={() => toggleToolbarOption(key as keyof typeof toolbarConfig)}
                      className="rounded text-[var(--color-supreme-gold)] focus:ring-[var(--color-supreme-gold)]"
                    />
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Editor Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Start typing..."}
        className="w-full min-h-[200px] p-4 focus:outline-none resize-y text-gray-800"
      />
    </div>
  );
}
