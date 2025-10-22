const LinesOverlay = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute top-1/4 inset-x-1/5 h-px bg-white/15" />
      <div className="absolute bottom-1/4 inset-x-1/5 h-px bg-white/10" />
      <div className="absolute left-1/2 top-20 bottom-20 w-px bg-white/10" />
      <div className="absolute inset-12 border border-white/5 rounded-[2.5rem]" />
    </div>
  );
};

export default LinesOverlay;
