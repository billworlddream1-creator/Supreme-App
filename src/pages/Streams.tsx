import React, { useState } from 'react';
import { Radio, Play, Users, Video, Mic, MicOff, VideoOff, MonitorUp, MessageSquare, PhoneOff, Settings, Copy, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import FeatureLoader from '../components/FeatureLoader';

export default function Streams() {
  const [inMeeting, setInMeeting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);

  if (inMeeting) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-supreme-gold)] flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">Supreme Meeting</span>
            <span className="text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded-md flex items-center gap-2">
              00:12:45 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <UserPlus className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Copy className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Grid */}
          <div className="flex-1 p-4 flex items-center justify-center bg-gray-950">
            <div className="grid grid-cols-2 gap-4 w-full h-full max-w-6xl max-h-[800px]">
              <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                {isVideoOff ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl text-white font-bold">
                      You
                    </div>
                  </div>
                ) : (
                  <img src="https://picsum.photos/seed/you/800/600" alt="You" className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-bold flex items-center gap-2">
                  {isMuted && <MicOff className="w-4 h-4 text-red-500" />}
                  You (Host)
                </div>
              </div>
              <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <img src="https://picsum.photos/seed/guest1/800/600" alt="Guest 1" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-bold">
                  Sarah Jenkins
                </div>
              </div>
              <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <img src="https://picsum.photos/seed/guest2/800/600" alt="Guest 2" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-bold">
                  Michael Chen
                </div>
              </div>
              <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl text-white font-bold">
                  AK
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-bold flex items-center gap-2">
                  <MicOff className="w-4 h-4 text-red-500" />
                  Alex Kumar
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <AnimatePresence>
            {showChat && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-gray-900 border-l border-gray-800 flex flex-col"
              >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-white font-bold">Meeting Chat</h3>
                  <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-white">Sarah Jenkins</span>
                      <span className="text-xs text-gray-500">10:02 AM</span>
                    </div>
                    <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded-lg rounded-tl-none inline-block">Can everyone see my screen?</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-[var(--color-supreme-gold)]">You</span>
                      <span className="text-xs text-gray-500">10:03 AM</span>
                    </div>
                    <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded-lg rounded-tl-none inline-block">Yes, looks good!</p>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 px-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={clsx(
              "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all",
              isMuted ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-gray-800 text-white hover:bg-gray-700"
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="text-[10px] font-bold mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={clsx(
              "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all",
              isVideoOff ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-gray-800 text-white hover:bg-gray-700"
            )}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            <span className="text-[10px] font-bold mt-1">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
          </button>

          <div className="w-px h-8 bg-gray-700 mx-2"></div>

          <button className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gray-800 text-white hover:bg-gray-700 transition-all">
            <MonitorUp className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Share</span>
          </button>

          <button className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gray-800 text-white hover:bg-gray-700 transition-all relative">
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Participants</span>
            <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-supreme-gold)] rounded-full text-[10px] flex items-center justify-center font-bold">4</span>
          </button>

          <button 
            onClick={() => setShowChat(!showChat)}
            className={clsx(
              "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all",
              showChat ? "bg-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)]" : "bg-gray-800 text-white hover:bg-gray-700"
            )}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Chat</span>
          </button>

          <div className="w-px h-8 bg-gray-700 mx-2"></div>

          <button 
            onClick={() => setInMeeting(false)}
            className="flex items-center gap-2 px-6 h-12 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            <PhoneOff className="w-5 h-5" />
            End Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <FeatureLoader text="Live Streams & Meetings">
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)]">Supreme Meetings & Streams</h1>
          <p className="text-gray-500">Host high-quality video meetings and live broadcasts.</p>
        </div>
      </div>

      {/* Meeting Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-br from-white to-gray-50">
          <div className="w-20 h-20 bg-[var(--color-supreme-gold)]/10 rounded-full flex items-center justify-center text-[var(--color-supreme-gold)]">
            <Video className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Start a Meeting</h2>
            <p className="text-gray-500 max-w-sm mx-auto">Create a new meeting instantly and invite others to join.</p>
          </div>
          <button 
            onClick={() => setInMeeting(true)}
            className="px-8 py-4 bg-[var(--color-supreme-gold)] text-white rounded-2xl font-bold text-lg hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-lg shadow-[var(--color-supreme-gold)]/20 flex items-center gap-3 w-full max-w-xs justify-center"
          >
            <Video className="w-6 h-6" /> New Meeting
          </button>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6 bg-white">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Users className="w-10 h-10" />
          </div>
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join a Meeting</h2>
            <p className="text-gray-500 mb-6">Enter a meeting code or link to join an existing session.</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter meeting code..." 
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 text-center font-mono text-lg"
              />
              <button 
                onClick={() => setInMeeting(true)}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Radio className="w-6 h-6 text-red-500" /> Live Broadcasts
        </h2>
        <div className="relative aspect-video rounded-2xl overflow-hidden glass-panel border border-gray-200 group hover:shadow-[0_0_50px_rgba(184,134,11,0.1)] transition-all duration-500 shadow-md mb-8">
          <img 
            src="https://picsum.photos/seed/stream/1200/600" 
            alt="Live Stream" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">LIVE</span>
              <span className="text-gray-200 text-sm flex items-center gap-1"><Users className="w-3 h-3" /> 12.5k watching</span>
            </div>
            <h2 className="text-4xl font-display font-bold text-white mb-2">Supreme Launch Event</h2>
            <p className="text-xl text-gray-200 max-w-2xl">Join us for the unveiling of the next generation of digital tools.</p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-transform duration-300 cursor-pointer group-hover:bg-[var(--color-supreme-gold)]/80 group-hover:border-[var(--color-supreme-gold)] shadow-lg">
            <Play className="w-8 h-8 text-white fill-current ml-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Gaming Championship', viewers: '45k', category: 'Gaming', image: 'https://picsum.photos/seed/game/400/300' },
            { title: 'Crypto Talk', viewers: '8.2k', category: 'Business', image: 'https://picsum.photos/seed/crypto/400/300' },
            { title: 'Music Festival', viewers: '120k', category: 'Music', image: 'https://picsum.photos/seed/music/400/300' },
          ].map((stream) => (
            <div key={stream.title} className="glass-panel rounded-xl overflow-hidden group hover:border-[var(--color-supreme-gold)]/30 transition-colors cursor-pointer bg-white/80 border border-gray-200 shadow-sm">
              <div className="relative h-48 overflow-hidden">
                <img src={stream.image} alt={stream.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[var(--color-supreme-text)] border border-gray-200 shadow-sm">
                  {stream.category}
                </div>
                <div className="absolute bottom-4 right-4 bg-red-600/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 shadow-sm">
                  <Users className="w-3 h-3" /> {stream.viewers}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-[var(--color-supreme-text)] group-hover:text-[var(--color-supreme-gold)] transition-colors">{stream.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </FeatureLoader>
  );
}
