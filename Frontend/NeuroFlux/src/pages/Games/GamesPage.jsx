import React from 'react';
import { Link } from 'react-router-dom';
import { useMultiplayer } from '../../games/common/MultiplayerManager';
import { Brain, Puzzle, Calculator, Eye, Sword } from 'lucide-react';
import GlassPanel from '../../components/games/GlassPanel';
import NeonButton from '../../components/games/NeonButton';
import { motion } from 'framer-motion';

/**
 * Games Landing Page
 */

const GamesPage = () => {
  const { selectGame } = useMultiplayer();

  const games = [
    {
      name: 'MindSnap',
      path: '/games/mindSnap',
      icon: Brain,
      description: 'Quick mental math challenges',
      color: 'emerald'
    },
    {
      name: 'KenKen',
      path: '/games/kenken',
      icon: Puzzle,
      description: 'Logic grid puzzle battles',
      color: 'blue'
    },
    {
      name: 'MathPuzzle',
      path: '/games/mathPuzzle',
      icon: Calculator,
      description: 'Multi-step math solver',
      color: 'orange'
    },
    {
      name: 'MemoryMatrix',
      path: '/games/memoryMatrix',
      icon: Eye,
      description: 'Pattern memory challenge',
      color: 'purple'
    },
    {
      name: 'ConceptClash',
      path: '/games/conceptClash',
      icon: Sword,
      description: 'Knowledge battle arena',
      color: 'pink'
    }
  ];

  const colorGradients = {
    emerald: 'from-emerald-500 via-teal-500 to-blue-500',
    blue: 'from-blue-500 to-indigo-500',
    orange: 'from-orange-500 to-red-500',
    purple: 'from-purple-500 to-violet-500',
    pink: 'from-pink-500 to-rose-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-grid-pattern opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent mb-8 drop-shadow-2xl">
            🕹️ NeuroFlux Arena
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Challenge friends in real-time brain battles. Glassmorphism UI + neon animations powered by Framer Motion.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {games.map((game, index) => (
            <GlassPanel 
              key={game.name} 
              className="p-8 cursor-pointer group hover:scale-105 hover:shadow-glow"
              whileHover={{ y: -10 }}
            >
              <Link
                to={game.path}
                className="block h-full w-full p-4"
                onMouseEnter={() => selectGame(game.name.toLowerCase())}
              >
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-3xl blur-sm opacity-70 group-hover:opacity-100 transition-all`}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <div className="relative z-20 flex flex-col items-center h-full justify-center text-center gap-4 pt-16 pb-8">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-2xl drop-shadow-2xl"
                    style={{ backgroundImage: `linear-gradient(135deg, ${colorGradients[game.color]})` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <game.icon className="w-12 h-12 text-white drop-shadow-lg" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                    {game.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
                    {game.description}
                  </p>
                  
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-4"
                  >
                    <NeonButton size="sm" className="px-6 py-2 text-sm">
                      Play Now
                    </NeonButton>
                  </motion.div>
                </div>
                
                <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 backdrop-blur-md rounded-2xl opacity-60" />
              </Link>
            </GlassPanel>
          ))}
        </div>
        
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <NeonButton className="text-lg px-12 py-6">
            View Leaderboards →
          </NeonButton>
        </motion.div>
      </div>
    </div>
  );
};

export default GamesPage;

