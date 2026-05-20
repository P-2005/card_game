import React, { useEffect, useState } from "react";
import { PlayerCard } from "./PlayerCard";

export const CardModal = ({ player, count = 1, onClose }) => {
  const [animateWidth, setAnimateWidth] = useState(false);

  useEffect(() => {
    // Small timeout to trigger transition
    const timer = setTimeout(() => {
      setAnimateWidth(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [player]);

  if (!player) return null;

  const statLabels = {
    pac: "Pace (PAC)",
    sho: "Shooting (SHO)",
    pas: "Passing (PAS)",
    phy: "Physicality (PHY)"
  };

  const getRarityName = (rarity) => {
    switch (rarity) {
      case "icon": return "FIFA Legend Icon";
      case "gold": return "Premium Gold Card";
      case "silver": return "Challenger Silver Card";
      case "bronze": return "World Cup Bronze Card";
      default: return "Player Card";
    }
  };

  const getStatBarColor = (val) => {
    if (val >= 90) return "bg-red-500 shadow-[0_0_10px_#ef4444]";
    if (val >= 80) return "bg-yellow-500 shadow-[0_0_10px_#eab308]";
    if (val >= 70) return "bg-green-500 shadow-[0_0_10px_#22c55e]";
    return "bg-blue-500 shadow-[0_0_10px_#3b82f6]";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-navy-900 border-2 border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full transition-colors z-10"
        >
          ✕
        </button>

        {/* Left Side: Large Player Card */}
        <div className="flex flex-col items-center">
          <PlayerCard player={player} size="lg" glow={true} />
          {count > 1 && (
            <div className="mt-4 bg-gold text-black font-bebas text-lg px-4 py-1 rounded-full shadow-lg border border-yellow-300 animate-pulse">
              COLLECTED ×{count}
            </div>
          )}
        </div>

        {/* Right Side: Detailed Stats & Info */}
        <div className="flex-1 w-full text-left">
          <div className="mb-4">
            <span className="text-xs uppercase tracking-widest text-gold font-bold">
              {getRarityName(player.rarity)}
            </span>
            <h2 className="font-bebas text-4xl text-white tracking-wide mt-1">
              {player.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{player.flag}</span>
              <span className="text-gray-300 font-semibold">{player.nation}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300">{player.club}</span>
            </div>
          </div>

          {/* Stats detailed bars */}
          <div className="space-y-4 border-t border-gray-800 pt-4">
            <h3 className="font-bebas text-lg tracking-widest text-gray-400">DETAILED ATTRIBUTES</h3>
            
            {Object.entries(player.stats).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-400">{statLabels[key]}</span>
                  <span className="text-white font-bold">{val} / 99</span>
                </div>
                {/* Bar */}
                <div className="h-3 bg-navy-950 rounded-full overflow-hidden border border-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatBarColor(val)}`}
                    style={{ width: animateWidth ? `${(val / 99) * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-gray-800 pt-6 text-xs text-gray-400">
            <div className="bg-navy-950 p-3 rounded-xl border border-gray-800/50">
              <div className="font-semibold text-gray-500">PLAYSTYLE TIER</div>
              <div className="font-bold text-white mt-1 uppercase">
                {player.ovr >= 90 ? "Legendary Playmaker+" : player.ovr >= 85 ? "Gold Elite" : "Standard Pro"}
              </div>
            </div>
            <div className="bg-navy-950 p-3 rounded-xl border border-gray-800/50">
              <div className="font-semibold text-gray-500">POSITION TIER</div>
              <div className="font-bold text-white mt-1">
                {player.position} - {player.position === "GK" ? "Goalkeeper" : player.position === "DEF" ? "Defender" : player.position === "MID" ? "Midfielder" : "Forward"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
