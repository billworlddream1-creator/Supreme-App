import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Lock, Phone, Video, Smile, ImagePlay, Mic, Wand2, Send, X, Loader2, Square, Users, Search } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import FeatureLoader from '../components/FeatureLoader';

import { useNetwork, Friend, Message } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { generateContent } from '../services/aiService';

const MOCK_GIFS = [
  'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
  'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
  'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif',
  'https://media.giphy.com/media/3o6ozh46EBuEFtl0ig/giphy.gif',
  'https://media.giphy.com/media/xT0xezQGU5xCDJuCPe/giphy.gif',
];

export default function Chat() {
  const { user } = useAuth();
  const { friends, chatSessions, sendMessage, markChatRead } = useNetwork();
  const location = useLocation();
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle navigation from profile
  useEffect(() => {
    if (location.state?.userId) {
      setSelectedFriendId(location.state.userId);
    } else if (friends.length > 0 && !selectedFriendId) {
      setSelectedFriendId(friends[0].id);
    }
  }, [location.state, friends]);

  // Simulate typing when selected friend changes or new message arrives
  useEffect(() => {
    if (selectedFriendId) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedFriendId, chatSessions[selectedFriendId || '']?.messages.length]);

  useEffect(() => {
    if (selectedFriendId) {
      markChatRead(selectedFriendId);
    }
  }, [selectedFriendId, chatSessions[selectedFriendId || '']?.messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedFriendId, chatSessions[selectedFriendId || '']?.messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const selectedFriend = friends.find(f => f.id === selectedFriendId);
  const currentMessages = selectedFriendId ? (chatSessions[selectedFriendId]?.messages || []) : [];

  const filteredMessages = searchQuery.trim() 
    ? currentMessages.filter(msg => 
        msg.type === 'text' && msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentMessages;

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  const handleAutoCorrect = async () => {
    if (!message.trim()) return;
    setIsCorrecting(true);
    try {
        const correctedText = await generateContent(
            `Correct the grammar and spelling of the following chat message, keeping the original tone and meaning. Only return the corrected text: "${message}"`
        );
        setMessage(correctedText || message);
    } catch (error) {
        console.error("AI Error", error);
    } finally {
        setIsCorrecting(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedFriendId) return;
    sendMessage(selectedFriendId, message, 'text');
    setMessage('');
  };

  const handleSendGif = (gifUrl: string) => {
    if (!selectedFriendId) return;
    sendMessage(selectedFriendId, gifUrl, 'gif');
    setShowGifPicker(false);
  };

  const handleSendAudio = () => {
    if (!selectedFriendId) return;
    if (isRecording) {
      setIsRecording(false);
      sendMessage(selectedFriendId, `Audio message (${formatTime(recordingTime)})`, 'audio');
    } else {
      setIsRecording(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <FeatureLoader text="Chat Zone">
    <div className="flex h-[calc(100vh-8rem)] glass-panel rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white/80">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[var(--color-supreme-text)] text-lg">Messages</h2>
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <MessageCircle className="w-5 h-5 text-[var(--color-supreme-gold)]" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => {
              const session = chatSessions[friend.id];
              return (
                <div 
                  key={friend.id} 
                  onClick={() => setSelectedFriendId(friend.id)}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group",
                    selectedFriendId === friend.id ? "bg-white shadow-sm border border-gray-100" : "hover:bg-gray-200"
                  )}
                >
                  <div className="relative">
                    <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    <div className={clsx(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                      friend.isOnline !== false ? "bg-green-500" : "bg-gray-400"
                    )}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-bold text-[var(--color-supreme-text)] text-sm truncate group-hover:text-[var(--color-supreme-gold)] transition-colors">{friend.name}</h4>
                      {session?.lastMessageTime && (
                        <span className="text-[10px] text-gray-500">
                          {new Date(session.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 truncate">{session?.lastMessage || 'No messages yet'}</p>
                      {session?.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {session.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No connections yet. Connect with people in the Network or Supreme Users zone!</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/50">
        {selectedFriend ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <img src={selectedFriend.avatar} alt={selectedFriend.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                <div>
                  <h3 className="font-bold text-[var(--color-supreme-text)]">{selectedFriend.name}</h3>
                  <p className={clsx(
                    "text-xs flex items-center gap-1",
                    selectedFriend.isOnline !== false ? "text-green-600" : "text-gray-500"
                  )}>
                    <span className={clsx(
                      "w-1.5 h-1.5 rounded-full",
                      selectedFriend.isOnline !== false ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    )}></span> 
                    {selectedFriend.isOnline !== false ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                {isSearchVisible ? (
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 border border-gray-200">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm w-32 sm:w-48 outline-none"
                    />
                    <button onClick={() => { setIsSearchVisible(false); setSearchQuery(''); }} className="p-1 hover:bg-gray-200 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsSearchVisible(true)}
                    className="p-2 rounded-full hover:bg-gray-100 hover:text-[var(--color-supreme-text)] transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
                <button className="p-2 rounded-full hover:bg-gray-100 hover:text-[var(--color-supreme-text)] transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="p-2 rounded-full hover:bg-gray-100 hover:text-[var(--color-supreme-text)] transition-colors"><Video className="w-5 h-5" /></button>
                <button className="p-2 rounded-full hover:bg-gray-100 hover:text-[var(--color-supreme-text)] transition-colors"><Lock className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
              <div className="flex justify-center mb-4">
                <span className="text-xs text-gray-500 bg-gray-200/50 px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Messages are end-to-end encrypted
                </span>
              </div>
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <div key={msg.id} className={clsx("flex", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                    <div className={clsx(
                      "p-3 max-w-[70%] shadow-sm",
                      msg.senderId === user?.uid 
                        ? "bg-[var(--color-supreme-gold)] text-white rounded-2xl rounded-tr-none" 
                        : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200"
                    )}>
                      {msg.type === 'text' && <span>{msg.text}</span>}
                      {msg.type === 'gif' && <img src={msg.text} alt="GIF" className="rounded-lg max-w-full h-auto" />}
                      {msg.type === 'audio' && (
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <Mic className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium">{msg.text}</span>
                        </div>
                      )}
                      <div className={clsx("text-[10px] mt-1", msg.senderId === user?.uid ? "text-white/70" : "text-gray-400")}>
                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Search className="w-16 h-16 mb-4 opacity-20" />
                  <p>No messages found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 bg-white relative">
              
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-full left-4 mb-2 z-50 shadow-xl rounded-xl overflow-hidden border border-gray-200"
                  >
                    <div className="bg-white p-2 flex justify-end border-b border-gray-100">
                      <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <EmojiPicker onEmojiClick={(emojiData) => setMessage(prev => prev + emojiData.emoji)} />
                  </motion.div>
                )}

                {showGifPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-full left-4 mb-2 z-50 bg-white shadow-xl rounded-xl border border-gray-200 p-4 w-80"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-[var(--color-supreme-text)] text-sm">Select a GIF</h4>
                      <button onClick={() => setShowGifPicker(false)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                      {MOCK_GIFS.map((gif, index) => (
                        <img 
                          key={index} 
                          src={gif} 
                          alt="GIF" 
                          onClick={() => handleSendGif(gif)}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-gray-100"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2">
                {/* Toolbar */}
                <div className="flex items-center gap-2 px-2">
                  <button 
                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}
                    className={clsx("p-2 rounded-full transition-colors", showEmojiPicker ? "text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10" : "text-gray-500 hover:text-[var(--color-supreme-gold)] hover:bg-gray-100")} 
                    title="Emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}
                    className={clsx("p-2 rounded-full transition-colors", showGifPicker ? "text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10" : "text-gray-500 hover:text-[var(--color-supreme-gold)] hover:bg-gray-100")} 
                    title="GIF"
                  >
                    <ImagePlay className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSendAudio}
                    className={clsx("p-2 rounded-full transition-colors flex items-center gap-1", isRecording ? "text-red-500 bg-red-50 animate-pulse" : "text-gray-500 hover:text-[var(--color-supreme-gold)] hover:bg-gray-100")} 
                    title="Voice Message"
                  >
                    {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                    {isRecording && <span className="text-xs font-bold">{formatTime(recordingTime)}</span>}
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button 
                    onClick={() => setAutoCorrectEnabled(!autoCorrectEnabled)}
                    className={`p-2 rounded-full transition-colors flex items-center gap-1 text-sm font-medium ${autoCorrectEnabled ? 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10' : 'text-gray-500 hover:bg-gray-100'}`} 
                    title="Auto-correct"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Auto-correct {autoCorrectEnabled ? 'On' : 'Off'}</span>
                  </button>
                  {autoCorrectEnabled && message && (
                    <button 
                      onClick={handleAutoCorrect}
                      disabled={isCorrecting}
                      className="text-xs bg-[var(--color-supreme-gold)] text-white px-3 py-1.5 rounded-md hover:bg-[var(--color-supreme-gold-light)] transition-colors disabled:opacity-50 flex items-center gap-1 font-bold"
                    >
                      {isCorrecting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Fix Text'}
                    </button>
                  )}
                </div>
                
                {/* Input Area */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-200 focus-within:border-[var(--color-supreme-gold)]/50 transition-colors">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--color-supreme-text)] placeholder-gray-400 px-2 outline-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 bg-[var(--color-supreme-gold)] text-white rounded-lg hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12 opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-supreme-text)] mb-2">Select a conversation</h3>
            <p className="max-w-xs">Choose a connection from the sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
    </FeatureLoader>
  );
}
