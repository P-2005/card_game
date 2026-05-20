import React, { useEffect, useState } from "react";
import { PlayerCard } from "../components/PlayerCard";
import { sound } from "../utils/sound";

export const WalkoutScreen = ({ player, onQuizAgain, onViewSquad }) => {
  // Stages: 0: tunnel, 1: flagReveal, 2: posReveal, 3: clubReveal, 4: cardDrop, 5: cardFlip, 6: celebrate
  const [stage, setStage] = useState(0);
  const [rumbleSound, setRumbleSound] = useState(null);

  useEffect(() => {
    if (!player) return;

    // Start deep drone/rumble sound
    const rumble = sound.playRumble(4.5);
    setRumbleSound(rumble);

    // Advanced Pack Opening Sequence Timers (FIFA 23 style)
    const t1 = setTimeout(() => {
      setStage(1); // Show Country Flag
    }, 1200);

    const t2 = setTimeout(() => {
      setStage(2); // Show Position
    }, 2400);

    const t3 = setTimeout(() => {
      setStage(3); // Show Club
    }, 3600);

    const t4 = setTimeout(() => {
      sound.playWhoosh();
      setStage(4); // Card Slides In (Face Down)
    }, 4800);

    const t5 = setTimeout(() => {
      sound.playFlip();
      sound.playBoom();
      if (player.ovr >= 90) {
        sound.playShimmer();
      }
      setStage(5); // Card Flips
    }, 6200);

    const t6 = setTimeout(() => {
      setStage(6); // Celebration and Actions
    }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      if (rumble) {
        try { rumble.stop(); } catch(e) {}
      }
    };
  }, [player]);

  const getRarityBadge = (ovr) => {
    if (ovr >= 90) return "🔥 ICON CARD!";
    if (ovr >= 85) return "⭐ GOLD CARD!";
    if (ovr >= 80) return "🥈 SILVER CARD!";
    return "🥉 BRONZE CARD!";
  };

  const getRarityTitle = (ovr) => {
    if (ovr >= 90) return "🔥 LEGENDARY WALKOUT!";
    if (ovr >= 85) return "⭐ BOARDS SEEN!";
    return "✅ SQUAD EXPANDED!";
  };

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case "icon": return "shadow-[0_0_50px_rgba(239,68,68,0.4),0_0_20px_rgba(245,158,11,0.4)]";
      case "gold": return "shadow-[0_0_40px_rgba(255,215,0,0.3)]";
      case "silver": return "shadow-[0_0_30px_rgba(192,192,192,0.2)]";
      default: return "shadow-[0_0_20px_rgba(205,127,50,0.15)]";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* Cinematic Stadium Flashing camera spotlights */}
      <div className="absolute inset-0 bg-navy-950 opacity-40 z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020617_90%)] z-0"></div>
      <div className="absolute inset-0 bg-transparent animate-camera-flashes bg-white/5 pointer-events-none z-10"></div>

      {/* Spotlights Sweeping */}
      {stage < 5 && (
        <>
          <div className="absolute top-0 left-1/3 w-32 h-[150vh] bg-white/10 origin-top transform -rotate-12 blur-md animate-spotlight-1 pointer-events-none z-0"></div>
          <div className="absolute top-0 right-1/3 w-40 h-[150vh] bg-gold/5 origin-top transform rotate-12 blur-md animate-spotlight-2 pointer-events-none z-0"></div>
        </>
      )}

      {/* STAGE 0, 1, 2, 3: Cinematic Tunnel Hints */}
      {stage < 4 && (
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 animate-fade-in px-4">
          <div className="text-gray-500 font-bebas text-lg tracking-widest animate-pulse">
            YOUR REWARD AWAITS...
          </div>
          
          <div className="flex gap-6 md:gap-10 items-center justify-center py-6">
            {/* Nation Flag Reveal */}
            <div className={`flex flex-col items-center justify-center w-20 h-28 md:w-28 md:h-36 rounded-2xl border bg-navy-900/80 backdrop-blur transition-all duration-700 ${
              stage >= 1 ? "border-gold scale-105 shadow-[0_0_15px_#ffd70030]" : "border-gray-800 opacity-20 scale-95"
            }`}>
              <div className="text-[10px] md:text-xs font-bold font-bebas text-gray-400 tracking-wider mb-2">NATION</div>
              <div className="text-4xl md:text-5xl transition-all duration-500 transform scale-110">
                {stage >= 1 ? player.flag : "❓"}
              </div>
            </div>

            {/* Position Reveal */}
            <div className={`flex flex-col items-center justify-center w-20 h-28 md:w-28 md:h-36 rounded-2xl border bg-navy-900/80 backdrop-blur transition-all duration-700 ${
              stage >= 2 ? "border-gold scale-105 shadow-[0_0_15px_#ffd70030]" : "border-gray-800 opacity-20 scale-95"
            }`}>
              <div className="text-[10px] md:text-xs font-bold font-bebas text-gray-400 tracking-wider mb-2">POSITION</div>
              <div className="font-bebas text-2xl md:text-3xl font-extrabold text-white">
                {stage >= 2 ? player.position : "❓"}
              </div>
            </div>

            {/* Club Reveal */}
            <div className={`flex flex-col items-center justify-center w-20 h-28 md:w-28 md:h-36 rounded-2xl border bg-navy-900/80 backdrop-blur transition-all duration-700 ${
              stage >= 3 ? "border-gold scale-105 shadow-[0_0_15px_#ffd70030]" : "border-gray-800 opacity-20 scale-95"
            }`}>
              <div className="text-[10px] md:text-xs font-bold font-bebas text-gray-400 tracking-wider mb-2">CLUB</div>
              <div className="text-center font-bebas text-xs font-semibold px-2 text-white truncate max-w-full">
                {stage >= 3 ? player.club : "❓"}
              </div>
            </div>
          </div>

          <div className="h-6 flex items-center">
            {stage === 0 && <p className="text-[11px] text-gray-400">Loading stadium elements...</p>}
            {stage === 1 && <p className="text-gold text-xs font-semibold animate-pulse">Country scouted: {player.nation}!</p>}
            {stage === 2 && <p className="text-gold text-xs font-semibold animate-pulse">Position located: {player.position}!</p>}
            {stage === 3 && <p className="text-gold text-xs font-semibold animate-pulse">Club established: {player.club}!</p>}
          </div>
        </div>
      )}

      {/* STAGE 4, 5, 6: Card drop & flip reveal */}
      {stage >= 4 && (
        <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
          
          {/* Confetti Particles (Fills screen once revealed) */}
          {stage >= 5 && (
            <div className="absolute inset-0 pointer-events-none z-0">
              {[...Array(30)].map((_, i) => {
                const colors = ["#ffd700", "#ffffff", "#cd7f32", "#22c55e", "#ef4444", "#3b82f6"];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = `${Math.random() * 100}%`;
                const delay = `${Math.random() * 3}s`;
                const size = `${Math.random() * 8 + 5}px`;

                return (
                  <div
                    key={i}
                    className="confetti-particle rounded-full"
                    style={{
                      left,
                      backgroundColor: color,
                      width: size,
                      height: size,
                      animationDelay: delay,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Rarity Header Badge (drops in from top) */}
          {stage >= 5 && (
            <div className="mb-6 text-center animate-[slideDown_0.6s_ease-out] z-10">
              <span className="bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 text-black font-bebas text-lg px-6 py-1.5 rounded-full border border-yellow-300 shadow-lg tracking-wider block">
                {getRarityBadge(player.ovr)}
              </span>
            </div>
          )}

          {/* Card Presentation Space */}
          <div className={`relative ${getRarityGlow(player.rarity)} rounded-2xl`}>
            {/* Spotlight halo behind card once revealed */}
            {stage >= 5 && (
              <div className="absolute inset-0 bg-gold/10 rounded-2xl filter blur-2xl z-0 animate-pulse"></div>
            )}
            
            <div className={`${stage === 4 ? "animate-slide-up" : ""} relative z-10`}>
              <PlayerCard
                player={player}
                revealed={stage >= 5}
                size="xl"
                glow={true}
              />
            </div>
          </div>

          {/* Celebration Text & Action buttons */}
          {stage >= 6 && (
            <div className="mt-8 text-center space-y-6 w-full animate-fade-in z-20">
              <div className="space-y-1">
                <h2 className="font-bebas text-3xl text-white tracking-widest animate-[pulse_2s_infinite]">
                  {getRarityTitle(player.ovr)}
                </h2>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  {player.name} added to your squad
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 w-full justify-center">
                <button
                  onClick={onQuizAgain}
                  className="flex-1 bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bebas text-base py-3.5 px-4 rounded-xl border border-yellow-300 shadow-md shadow-gold/10 transition-all duration-300 transform active:scale-95"
                >
                  QUIZ AGAIN 🧠
                </button>
                <button
                  onClick={onViewSquad}
                  className="flex-1 bg-navy-900 hover:bg-navy-800 text-white font-bebas text-base py-3.5 px-4 rounded-xl border border-gray-800 transition-all duration-300 transform active:scale-95"
                >
                  MY SQUAD 📋
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
