import { motion } from 'framer-motion';

const GlassPanel = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`
        bg-white/10 backdrop-blur-xl border border-white/20 
        rounded-3xl shadow-2xl shadow-black/20
        hover:shadow-emerald-500/25 hover:border-emerald-400/50
        transition-all duration-500 hover:-translate-y-2
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassPanel;

