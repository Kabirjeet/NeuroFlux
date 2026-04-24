import { motion } from 'framer-motion';

const NeonButton = ({ children, onClick, className = '', disabled, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,255,128,0.3)' }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500
        text-white font-bold py-4 px-8 rounded-2xl shadow-2xl
        hover:from-emerald-600 hover:via-teal-600 hover:to-blue-600
        active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      {...props}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ 
          x: ['0%', '100%', '0%'],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default NeonButton;

