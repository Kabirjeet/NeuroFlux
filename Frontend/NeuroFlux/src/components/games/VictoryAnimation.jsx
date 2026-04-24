import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';

const VictoryAnimation = ({ isVisible, onComplete }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50 flex-col gap-8 p-8"
          onAnimationComplete={onComplete}
        >
          {/* Background particles */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -200, 0],
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </motion.div>

          {/* Victory trophy */}
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-3xl shadow-2xl shadow-yellow-500/50"
          >
            <Trophy className="w-24 h-24 text-white drop-shadow-2xl" />
          </motion.div>

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
              VICTORY!
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [-20, 0], opacity: [0, 1] }}
                  transition={{ delay: i * 0.1, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                </motion.div>
              ))}
            </div>
            <p className="text-xl md:text-2xl text-white/90 font-semibold drop-shadow-lg">
              Perfect Score! 🎉
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VictoryAnimation;

