import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type TitleGlitchProps = {
  onActivate: () => void;
};

const glitchVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.2, ease: 'easeOut' } }
};

const TitleGlitch = ({ onActivate }: TitleGlitchProps) => {
  const [glitchState, setGlitchState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchState((value) => (value + 1) % 3);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.button
      type="button"
      className="title-glitch pointer-events-auto relative uppercase tracking-[0.8em] text-xs md:text-sm lg:text-base text-white/80"
      variants={glitchVariants}
      initial="initial"
      animate="animate"
      onClick={onActivate}
    >
      <span className="block text-[2.6rem] md:text-[3.4rem] lg:text-[4rem] font-semibold leading-tight">
        <span className="mr-6 text-white/80">THE DARK</span>
        <span
          className="text-transparent bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(120deg, #f6c84c 0%, #9e6b10 100%)',
            textShadow: '0 0 12px rgba(246, 200, 76, 0.45)'
          }}
        >
          TRIAD
        </span>
      </span>

      {[0, 1, 2].map((layer) => (
        <span
          key={layer}
          className="absolute inset-0 text-[2.6rem] md:text-[3.4rem] lg:text-[4rem] font-semibold leading-tight mix-blend-screen"
          style={{
            color: layer === 0 ? '#f6c84c' : layer === 1 ? '#9e6b10' : '#ffffff',
            opacity: glitchState === layer ? 0.18 : 0,
            transform: `translate(${layer === 0 ? -3 : 3}px, ${layer === 2 ? 2 : -2}px)`
          }}
          aria-hidden="true"
        >
          THE DARK TRIAD
        </span>
      ))}
    </motion.button>
  );
};

export default TitleGlitch;
