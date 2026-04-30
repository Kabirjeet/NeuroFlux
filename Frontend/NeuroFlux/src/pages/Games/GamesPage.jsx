import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, Puzzle, Calculator, Eye, Sword } from 'lucide-react';
import { useMultiplayer } from '../../games/common/MultiplayerManager';
import GlassPanel from '../../components/games/GlassPanel';
import NeonButton from '../../components/games/NeonButton';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

/**
 * Games Landing Page
 */

const GamesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    findMatch,
    cancelMatchmaking,
    matchStatus,
    isConnected,
    gameData,
    currentQuestionIndex,
    scores,
    timeLeft,
    winner,
    error,
    selectedGame,
    selectGame
  } = useMultiplayer();

  const games = [
    {
      name: 'MindSnap',
      gameName: 'mindSnap',
      path: '/games/mindSnap',
      icon: Brain,
      description: 'Quick mental math challenges',
      color: 'emerald'
    },
    {
      name: 'KenKen',
      gameName: 'kenken',
      path: '/games/kenken',
      icon: Puzzle,
      description: 'Logic grid puzzle battles',
      color: 'blue'
    },
    {
      name: 'MathPuzzle',
      gameName: 'mathPuzzle',
      path: '/games/mathPuzzle',
      icon: Calculator,
      description: 'Multi-step math solver',
      color: 'orange'
    },
    {
      name: 'MemoryMatrix',
      gameName: 'memoryMatrix',
      path: '/games/memoryMatrix',
      icon: Eye,
      description: 'Pattern memory challenge',
      color: 'purple'
    },
    {
      name: 'ConceptClash',
      gameName: 'conceptClash',
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

  const handlePlay = (game) => {
    selectGame(game.gameName);
    findMatch(game.gameName, {
      userId: user?._id || user?.id,
      username: user?.username,
      name: user?.username || 'Player'
    });
  };

  const handleCancel = () => {
    cancelMatchmaking(selectedGame);
  };

  const activeGameName = gameData?.type || selectedGame;
  const activeGame = games.find((game) => matchStatus !== 'idle' && activeGameName === game.gameName);
  const isMatching = matchStatus === 'waiting' || matchStatus === 'matched';
  const isPlaying = matchStatus === 'playing';
  const isEnded = matchStatus === 'ended';

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
          {error && (
            <p className="mt-6 text-sm text-red-300">
              {error}
            </p>
          )}
          {(isMatching || isPlaying || isEnded) && (
            <div className="mt-8 mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300">
                <span>Status: <strong className="text-emerald-300">{matchStatus}</strong></span>
                {timeLeft !== null && <span>Time: <strong className="text-amber-300">{timeLeft}s</strong></span>}
                {Number.isInteger(currentQuestionIndex) && isPlaying && (
                  <span>Question: <strong className="text-blue-300">{currentQuestionIndex + 1}</strong></span>
                )}
              </div>
              {Object.keys(scores || {}).length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
                  {Object.entries(scores).map(([playerId, score]) => (
                    <span key={playerId} className="rounded-xl bg-black/30 px-4 py-2 text-gray-200">
                      {playerId.slice(0, 6)}: <strong className="text-white">{score}</strong>
                    </span>
                  ))}
                </div>
              )}
              {winner && (
                <p className="mt-4 text-emerald-300">
                  Winner: {winner}
                </p>
              )}
              {isPlaying && activeGame && (
                <button
                  type="button"
                  onClick={() => navigate(activeGame.path)}
                  className="mt-5 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
                >
                  Open Game
                </button>
              )}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {games.map((game) => {
            const isActiveCard = selectedGame === game.gameName || gameData?.type === game.gameName;

            return (
            <GlassPanel 
              key={game.name} 
              className="p-8 cursor-pointer group hover:scale-105 hover:shadow-glow"
              whileHover={{ y: -10 }}
            >
              <div
                className="block h-full w-full p-4"
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
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="opacity-100 transition-opacity mt-4"
                  >
                    {isMatching ? (
                      <NeonButton
                        size="sm"
                        className="px-6 py-2 text-sm"
                        onClick={handleCancel}
                        disabled={!isActiveCard}
                      >
                        {isActiveCard ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cancel Match
                          </span>
                        ) : (
                          'In Queue'
                        )}
                      </NeonButton>
                    ) : (
                      <NeonButton
                        size="sm"
                        className="px-6 py-2 text-sm"
                        onClick={() => handlePlay(game)}
                        disabled={!isConnected}
                      >
                        Play Now
                      </NeonButton>
                    )}
                  </motion.div>
                </div>
                
                <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 backdrop-blur-md rounded-2xl opacity-60" />
              </div>
            </GlassPanel>
            );
          })}
        </div>
        
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <NeonButton
            className="text-lg px-12 py-6"
            onClick={() => navigate('/leaderboard')}
          >
            View Leaderboards →
          </NeonButton>
        </motion.div>
      </div>
    </div>
  );
};

export default GamesPage;
