import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { 
  Send, Smile, Image as ImageIcon, Mic, Paperclip, 
  X, Play, Pause, Download, User as UserIcon, Search
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  type: 'text' | 'image' | 'audio' | 'file' | 'gif';
  url?: string;
  fileName?: string;
  timestamp: string;
}

export default function AdminChat() {
  const { user } = useAuth();
  const { miniAdmins } = useAdmin();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.emit('join-admin-chat', user?.id);

    newSocket.on('admin-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (type: Message['type'] = 'text', url?: string, fileName?: string) => {
    if (!socket || (!inputText.trim() && !url)) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'unknown',
      senderName: user?.name || 'Admin',
      text: type === 'text' ? inputText : undefined,
      type,
      url,
      fileName,
      timestamp: new Date().toISOString(),
    };

    socket.emit('send-admin-message', newMessage);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we would upload to a server/S3
    // For now, we'll use a local URL
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : 'file';
    sendMessage(type, url, file.name);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        sendMessage('audio', url, 'Voice Message.webm');
        setAudioChunks([]);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendGif = () => {
    // Mock GIF selection
    const mockGifs = [
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKDkDbIDJieKbVm/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlHFRbmaZtBRhXG/giphy.gif'
    ];
    const randomGif = mockGifs[Math.floor(Math.random() * mockGifs.length)];
    sendMessage('gif', randomGif);
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter(msg => 
        msg.type === 'text' && msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col h-[600px] bg-red-950/50 rounded-3xl border border-amber-500/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-amber-500/10 bg-red-900/40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-red-950 font-bold">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-amber-100">Admin Command Center</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {miniAdmins.length + 1} Admins Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSearchVisible ? (
            <div className="flex items-center gap-2 bg-red-900/40 border border-amber-500/20 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-amber-500/50" />
              <input 
                autoFocus
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs text-white w-32 outline-none"
              />
              <button onClick={() => { setIsSearchVisible(false); setSearchQuery(''); }} className="p-1 hover:bg-red-900/60 rounded-full">
                <X className="w-3 h-3 text-amber-500/50" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsSearchVisible(true)}
              className="p-2 text-amber-500/50 hover:text-amber-500 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-amber-500/20"
      >
        {filteredMessages.map((msg) => (
          <div 
            key={msg.id}
            className={clsx(
              "flex flex-col max-w-[80%]",
              msg.senderId === user?.id ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <span className="text-[10px] font-bold text-amber-500/50 mb-1 px-1">
              {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div 
              className={clsx(
                "p-3 rounded-2xl shadow-sm",
                msg.senderId === user?.id 
                  ? "bg-amber-500 text-red-950 rounded-tr-none" 
                  : "bg-red-900/60 text-white border border-amber-500/10 rounded-tl-none"
              )}
            >
              {msg.type === 'text' && <p className="text-sm">{msg.text}</p>}
              {msg.type === 'image' && (
                <img src={msg.url} alt="Shared" className="max-w-full rounded-lg cursor-pointer" onClick={() => window.open(msg.url)} />
              )}
              {msg.type === 'gif' && (
                <img src={msg.url} alt="GIF" className="max-w-full rounded-lg" />
              )}
              {msg.type === 'audio' && (
                <div className="flex items-center gap-2">
                  <audio src={msg.url} controls className="h-8 w-48" />
                </div>
              )}
              {msg.type === 'file' && (
                <a 
                  href={msg.url} 
                  download={msg.fileName}
                  className="flex items-center gap-2 text-sm underline hover:opacity-80"
                >
                  <Paperclip className="w-4 h-4" />
                  {msg.fileName}
                </a>
              )}
            </div>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-red-200/20 space-y-2">
            {searchQuery ? (
              <>
                <Search className="w-12 h-12 opacity-10" />
                <p className="text-sm italic">No messages found matching "{searchQuery}"</p>
              </>
            ) : (
              <>
                <UserIcon className="w-12 h-12 opacity-10" />
                <p className="text-sm italic">No messages yet. Start the conversation.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-red-900/40 border-t border-amber-500/10 relative">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full right-4 mb-2 z-50"
            >
              <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-amber-500/50 hover:text-amber-500 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-amber-500/50 hover:text-amber-500 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              onClick={sendGif}
              className="p-2 text-amber-500/50 hover:text-amber-500 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>

          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-red-950/50 border border-amber-500/20 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />

          <div className="flex gap-1">
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="p-2 bg-red-500 text-white rounded-xl animate-pulse"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={startRecording}
                className="p-2 text-amber-500/50 hover:text-amber-500 transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => sendMessage()}
              disabled={!inputText.trim()}
              className="p-2 bg-amber-500 text-red-950 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
