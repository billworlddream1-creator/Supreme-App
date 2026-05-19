import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Cake, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BirthdayGreeting() {
  const { user } = useAuth();
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    if (user?.birthday && user?.name) {
      const today = new Date();
      const birthDate = new Date(user.birthday);
      
      // Check if today is the user's birthday (month and day match)
      const isBirthday = today.getMonth() === birthDate.getMonth() && 
                         today.getDate() === birthDate.getDate();

      if (isBirthday) {
        const age = today.getFullYear() - birthDate.getFullYear();
        // Check if we've already shown the greeting today
        const lastGreetingDate = localStorage.getItem(`birthday_greeting_${user.uid}`);
        const todayStr = today.toISOString().split('T')[0];

        if (lastGreetingDate !== todayStr) {
          setShowGreeting(true);
          localStorage.setItem(`birthday_greeting_${user.uid}`, todayStr);
          
          // Also show a toast for extra visibility
          toast.success(`Happy Birthday, ${user.name}! 🎂`, {
            description: `Wishing you a supreme day! You are now ${age} years old.`,
            duration: 10000,
            icon: <Cake className="w-5 h-5 text-pink-500" />
          });
        }
      }
    }
  }, [user?.birthday, user?.name, user?.uid]);

  if (!showGreeting) return null;

  return (
    <AnimatePresence>
      {showGreeting && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500 rounded-full blur-3xl" />
            </div>

            <div className="p-8 text-center relative z-10">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-pink-50 shadow-inner relative">
                <Cake className="w-12 h-12 text-pink-500" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </motion.div>
              </div>

              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2 tracking-tight">
                Happy Birthday, <span className="text-pink-500">{user?.name}</span>!
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                The entire Supreme Platform team wishes you a magnificent birthday! You are now {new Date().getFullYear() - new Date(user?.birthday || '').getFullYear()} years old. May your year ahead be as supreme as you are.
              </p>

              <button
                onClick={() => setShowGreeting(false)}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-pink-500/20"
              >
                Thank You!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
