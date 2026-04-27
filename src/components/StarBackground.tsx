import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function StarBackground() {
  const stars = Array.from({ length: 15 });
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/50"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.5,
          }}
          animate={{
            top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          }}
          transition={{
            duration: 15 + Math.random() * 15,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Sparkles size={10 + Math.random() * 15} />
        </motion.div>
      ))}
    </div>
  );
}
