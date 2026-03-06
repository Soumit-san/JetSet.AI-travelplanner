import TripWizard from "@/components/trip-wizard/TripWizard";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-deep/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center z-10 mb-12">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-lg">
          JetSet<span className="text-sky-vivid">.AI</span>
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-sans">
          The ultimate intelligent travel planner. Tell us your dream, and we handle the rest.
        </p>
      </div>

      {/* Main Wizard */}
      <div className="w-full max-w-4xl z-10">
        <TripWizard />
      </div>

      {/* Footer / Decorative */}
      <div className="absolute bottom-4 text-center w-full text-white/30 text-sm font-mono tracking-widest pointer-events-none">
        POWERED BY LIQUID GLASS UI
      </div>
    </main>
  );
}
