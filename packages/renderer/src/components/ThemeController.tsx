import { motion } from 'framer-motion';

type ThemeControllerProps = {
  value: number;
  onChange: (value: number) => void;
};

const ThemeController = ({ value, onChange }: ThemeControllerProps) => {
  return (
    <motion.aside
      className="absolute right-10 bottom-10 z-20 bg-black/60 border border-white/10 backdrop-blur-lg rounded-2xl px-5 py-4 flex flex-col gap-3 w-52"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 0.9, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <span className="text-xs tracking-[0.35em] uppercase text-white/60">Aura Intensity</span>
      <input
        type="range"
        min={0.5}
        max={1.5}
        step={0.01}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full accent-[#f6c84c]"
      />
      <span className="text-[0.65rem] tracking-[0.4em] uppercase text-white/50">
        {value.toFixed(2)}
      </span>
    </motion.aside>
  );
};

export default ThemeController;
