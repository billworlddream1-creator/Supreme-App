import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Rocket, Target, Users, MapPin, ArrowRight } from 'lucide-react';

const projects = [
  { name: 'EcoTrack Mobile App', category: 'Tech', funding: '85%', goal: '$50k', team: 4, location: 'Global', stage: 'Seed', popularity: 95, image: 'https://picsum.photos/seed/eco/600/400' },
  { name: 'NextGen AI Assistant', category: 'AI Tools', funding: '120%', goal: '$100k', team: 8, location: 'USA', stage: 'Series A', popularity: 98, image: 'https://picsum.photos/seed/ai/600/400' },
  { name: 'Urban Farm Initiative', category: 'Community', funding: '45%', goal: '$25k', team: 12, location: 'UK', stage: 'Pre-Seed', popularity: 75, image: 'https://picsum.photos/seed/farm/600/400' },
  { name: 'Indie Game: Neon Nights', category: 'Gaming', funding: '15%', goal: '$10k', team: 2, location: 'Japan', stage: 'Pre-Seed', popularity: 60, image: 'https://picsum.photos/seed/neon/600/400' },
  { name: 'Quantum Compute API', category: 'Deep Tech', funding: '300%', goal: '$500k', team: 15, location: 'Switzerland', stage: 'Series B', popularity: 99, image: 'https://picsum.photos/seed/quantum/600/400' },
  { name: 'Sustainable Packaging', category: 'Green', funding: '92%', goal: '$75k', team: 6, location: 'Canada', stage: 'Seed', popularity: 88, image: 'https://picsum.photos/seed/package/600/400' },
];

export default function RandomProjectPowerWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Start with a random index
    setCurrentIndex(Math.floor(Math.random() * projects.length));

    // Change project every 8 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        let next = Math.floor(Math.random() * projects.length);
        // Ensure it picks a different one
        while (next === prev && projects.length > 1) {
          next = Math.floor(Math.random() * projects.length);
        }
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const project = projects[currentIndex];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-[var(--color-supreme-gold)]/20 shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-[var(--color-supreme-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="p-4 border-b border-gray-800 flex justify-between items-center relative z-10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Rocket className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Project Power Spotlight
        </h3>
        <span className="text-[10px] font-bold text-black uppercase tracking-wider bg-[var(--color-supreme-gold)] px-2 py-1 rounded-full">
          Featured
        </span>
      </div>

      <Link to="/project-power" className="block relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={project.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="p-5"
          >
            <div className="relative h-36 rounded-xl overflow-hidden mb-4 group-hover:shadow-[0_0_15px_rgba(184,134,11,0.3)] transition-shadow">
              <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-xs font-bold text-black bg-[var(--color-supreme-gold)] px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">
                  {project.category}
                </span>
                <h4 className="text-white font-bold text-lg leading-tight line-clamp-1">{project.name}</h4>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1.5"><Target className="w-4 h-4" /> Funding Goal</span>
                <span className="text-white font-bold">{project.goal}</span>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[var(--color-supreme-gold)]">Funded</span>
                  <span className="text-white">{project.funding}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: parseInt(project.funding) > 100 ? '100%' : project.funding }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-[var(--color-supreme-gold)] rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800 mt-2">
                <div className="flex gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {project.team}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {project.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--color-supreme-gold)] text-xs font-bold group-hover:translate-x-1 transition-transform">
                  View Project <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Link>
    </div>
  );
}
