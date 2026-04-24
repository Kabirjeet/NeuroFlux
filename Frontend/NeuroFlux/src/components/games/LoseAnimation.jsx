import { motion, AnimatePresence } from 'framer-motion';
import { XCircle } from 'lucide-react';

const LoseAnimation = ({ isVisible, onComplete }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: [0, -10, 10, -10, 0] // Shake effect
          }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ 
            duration: 0.8, 
            shake: { duration: 0.5, times: 4 }
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-2xl flex items-center justify-center z-50 flex-col gap-6 p-8"
          onAnimationComplete={onComplete}
        >
          {/* Shake lines */}
          <motion.div
            className="absolute inset-0"
            animate={{ 
              backgroundColor: [
                'rgba(239,68,68,0.1)',
                'rgba(239,68,68,0.3)',
                'rgba(239,68,68,0.1)'
              ]
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
          
          {/* X icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="bg-gradient-to-br from-red-500 to-rose-600 p-10 rounded-3xl shadow-2xl shadow-red-500/50"
          >
            <XCircle className="w-32 h-32 text-white drop-shadow-2xl" strokeWidth={1} />
          </motion.div>

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-red-400 via-rose-500 to-red-600 bg-clip-text text-transparent mb-4 drop-shadow-2xl tracking-wide">
              GAME OVER
            </h2>
            <motion.p 
              animate={{ color: ['#fca5a5', '#ef4444', '#fca5a5'] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-2xl font-semibold text-white/90 drop-shadow-lg"
            >
              Try Again!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoseAnimation;

