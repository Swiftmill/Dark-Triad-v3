import { motion } from 'framer-motion';

type NavBarProps = {
  logoSrc?: string;
  onCycle: () => void;
  visible?: boolean;
};

const NavBar = ({ logoSrc, onCycle, visible = true }: NavBarProps) => {
  return (
    <header
      className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-10 py-6 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className="flex items-center gap-4">
        {logoSrc ? (
          <img src={logoSrc} alt="Dark Triad sigil" className="w-14 h-14 object-contain" />
        ) : (
          <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-xs tracking-[0.4em] uppercase text-white/60">
            D T T
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-xs tracking-[0.35em] uppercase text-white/60">Order of the</span>
          <span className="text-sm tracking-[0.4em] uppercase text-white">Dark Triad</span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs tracking-[0.4em] uppercase">
        <motion.button
          type="button"
          onClick={onCycle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-white/70 hover:text-triadGold-light hover:bg-white/15 transition-all"
        >
          Cycle Vision
        </motion.button>
        <button
          type="button"
          className="px-6 py-2 rounded-full border border-white/15 bg-white/10 text-white/90 hover:bg-white/20 transition-all"
        >
          LOGIN
        </button>
      </div>
    </header>
  );
};

export default NavBar;
