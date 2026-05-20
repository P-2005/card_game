import React from "react";
import { sound } from "../utils/sound";

export const NavBar = ({
  activeScreen,
  setActiveScreen,
  cardCount = 0,
  streak = 0,
  soundMuted = true,
  toggleSound,
  theme = "dark",
  toggleTheme,
  onOpenSettings
}) => {
  const battleLocked = cardCount < 3;

  const navigate = (screen) => {
    sound.playClick();
    if (screen === "battle" && battleLocked) {
      // Do nothing, battle is locked
      return;
    }
    setActiveScreen(screen);
  };

  return (
    <>
      {/* DESKTOP HEADER & TOP NAV */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-navy-900/90 border-b border-gray-800/80 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("home")}>
          <span className="text-2xl">⚽</span>
          <h1 className="font-bebas text-2xl tracking-wider text-white bg-gradient-to-r from-gold to-white bg-clip-text text-transparent">
            ANTIGRAVITY FC
          </h1>
        </div>

        {/* Desktop Nav Items */}
        <nav className="flex items-center gap-6">
          <button
            onClick={() => navigate("home")}
            className={`font-bebas text-lg px-3 py-1.5 rounded transition-all ${
              activeScreen === "home" ? "text-gold border-b-2 border-gold" : "text-gray-300 hover:text-white"
            }`}
          >
            HOME
          </button>
          <button
            onClick={() => navigate("quiz")}
            className={`font-bebas text-lg px-3 py-1.5 rounded transition-all ${
              activeScreen === "quiz" ? "text-gold border-b-2 border-gold" : "text-gray-300 hover:text-white"
            }`}
          >
            EARN CARDS
          </button>
          <button
            onClick={() => navigate("battle")}
            className={`font-bebas text-lg px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              battleLocked
                ? "text-gray-500 cursor-not-allowed opacity-50"
                : activeScreen === "battle"
                ? "text-gold border-b-2 border-gold"
                : "text-gray-300 hover:text-white"
            }`}
          >
            BATTLE {battleLocked && "🔒"}
          </button>
          <button
            onClick={() => navigate("squad")}
            className={`font-bebas text-lg px-3 py-1.5 rounded transition-all ${
              activeScreen === "squad" ? "text-gold border-b-2 border-gold" : "text-gray-300 hover:text-white"
            }`}
          >
            MY SQUAD
          </button>
          <button
            className="font-bebas text-lg px-3 py-1.5 text-gray-500 cursor-not-allowed opacity-50"
            disabled
          >
            LEADERBOARD
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            {streak > 0 && (
              <span className="flex items-center gap-1 bg-orange-950/80 border border-orange-700/50 text-orange-400 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
                🔥 {streak} Streak
              </span>
            )}
            {/* Card Count */}
            <span className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/50 px-3 py-1 rounded-full text-xs font-semibold text-gray-200">
              🃏 {cardCount} Cards
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors"
            title={soundMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {soundMuted ? "🔇" : "🔊"}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gold hover:bg-gray-800/50 rounded-full transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors"
            title="Configure Claude AI Key"
          >
            ⚙️
          </button>

          {/* Profile Placeholder */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-yellow-600 border border-gold/50 shadow flex items-center justify-center font-bold text-black text-sm">
            PM
          </div>
        </div>
      </header>

      {/* MOBILE HEADER (TOP BAR) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-navy-900/90 border-b border-gray-800/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-1.5" onClick={() => navigate("home")}>
          <span className="text-xl">⚽</span>
          <h1 className="font-bebas text-lg tracking-wider text-white">ANTIGRAVITY</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak mini */}
          {streak > 0 && (
            <span className="bg-orange-950/80 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-700/50">
              🔥 {streak}
            </span>
          )}

          {/* Card Count mini */}
          <span className="bg-gray-800/80 text-gray-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-700/50">
            🃏 {cardCount}
          </span>

          {/* Settings */}
          <button onClick={onOpenSettings} className="p-1.5 text-gray-400 hover:text-white">
            ⚙️
          </button>

          {/* Audio */}
          <button onClick={toggleSound} className="p-1.5 text-gray-400 hover:text-white">
            {soundMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-900/95 border-t border-gray-800/80 backdrop-blur-md flex items-center justify-around py-2 shadow-2xl">
        <button
          onClick={() => navigate("home")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            activeScreen === "home" ? "text-gold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </button>

        <button
          onClick={() => navigate("quiz")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            activeScreen === "quiz" ? "text-gold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span className="text-lg">🧠</span>
          <span>Quiz</span>
        </button>

        <button
          onClick={() => navigate("battle")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            battleLocked
              ? "text-gray-600 cursor-not-allowed opacity-40"
              : activeScreen === "battle"
              ? "text-gold"
              : "text-gray-400 hover:text-gray-200"
          }`}
          disabled={battleLocked}
        >
          <span className="text-lg">{battleLocked ? "🔒" : "⚔️"}</span>
          <span>Battle</span>
        </button>

        <button
          onClick={() => navigate("squad")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            activeScreen === "squad" ? "text-gold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span className="text-lg">📋</span>
          <span>Squad</span>
        </button>
      </nav>
    </>
  );
};
