import React from "react";
import { sound } from "../utils/sound";

export const ProgressGate = ({ cardCount = 0, onNavigateToQuiz }) => {
  const needed = 3;
  const percentage = Math.min((cardCount / needed) * 100, 100);

  const handleQuizClick = () => {
    sound.playClick();
    if (onNavigateToQuiz) onNavigateToQuiz();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-navy-900/90 border border-gray-800 rounded-3xl shadow-2xl max-w-md mx-auto text-center backdrop-blur-md">
      {/* Big glowing lock icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl filter"></div>
        <div className="relative w-20 h-20 bg-gradient-to-br from-navy-950 to-navy-900 border border-gold/40 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-4xl text-gold select-none animate-pulse">🔒</span>
        </div>
      </div>

      <h2 className="font-bebas text-3xl text-white tracking-wider mb-2">
        BATTLE MODE LOCKED
      </h2>
      <p className="text-gray-400 text-sm mb-6 px-4">
        You need at least <span className="text-gold font-bold">{needed} players</span> in your squad to unlock matches. Keep answering quiz trivia to earn players!
      </p>

      {/* Progress Bar Container */}
      <div className="w-full bg-navy-950 border border-gray-800 rounded-full h-5 overflow-hidden mb-8 relative flex items-center px-1">
        {/* Animated fill */}
        <div
          className="h-3 rounded-full bg-gradient-to-r from-yellow-600 to-gold shadow-[0_0_10px_#ffd700] transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
        
        {/* Count text absolute overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white font-bebas tracking-wide">
          SQUAD SIZE: {cardCount} / {needed} PLAYERS
        </div>
      </div>

      {/* Earn Cards Button */}
      <button
        onClick={handleQuizClick}
        className="w-full bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bebas text-lg py-3 rounded-xl shadow-lg shadow-gold/20 border border-yellow-300 hover:border-yellow-200 transform hover:scale-105 active:scale-95 transition-all duration-300"
      >
        EARN PLAYERS 🧠
      </button>
    </div>
  );
};
