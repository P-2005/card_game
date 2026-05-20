import React, { useEffect, useState } from "react";
import { PlayerCard } from "../components/PlayerCard";
import { players } from "../data/players";
import { sound } from "../utils/sound";

export const HomeScreen = ({
  cardCount = 0,
  stats = { quizzesAnswered: 0, correctAnswers: 0, battlesPlayed: 0, battlesWon: 0 },
  lastPulledPlayer = null,
  onNavigate
}) => {
  const [showcasePlayer, setShowcasePlayer] = useState(null);
  const battleLocked = cardCount < 3;

  // Pick a random high-OVR player for the landing screen showcase
  useEffect(() => {
    const highOvrPlayers = players.filter(p => p.ovr >= 90);
    const randomPlayer = highOvrPlayers[Math.floor(Math.random() * highOvrPlayers.length)];
    setShowcasePlayer(randomPlayer);
  }, []);

  const handleEarn = () => {
    sound.playClick();
    onNavigate("quiz");
  };

  const handleKickOff = () => {
    sound.playClick();
    if (!battleLocked) {
      onNavigate("battle");
    }
  };

  const handleSquad = () => {
    sound.playClick();
    onNavigate("squad");
  };

  return (
    <div
      className="relative min-h-[calc(100vh-73px)] flex flex-col items-center justify-center py-10 px-4 overflow-hidden select-none bg-navy-950"
      style={{
        backgroundImage: "url('/stadium_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
      }}
    >
      {/* Dark overlay with green stadium pitch glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/20 z-0"></div>
      <div className="absolute inset-0 stadium-overlay z-0"></div>
      
      {/* Spotlight beams */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[150vh] bg-gradient-to-r from-transparent via-white/10 to-transparent transform -rotate-45 -translate-x-1/2 origin-top pointer-events-none animate-spotlight-1 z-0"></div>
      <div className="absolute top-0 right-1/4 w-[50vw] h-[150vh] bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-45 translate-x-1/2 origin-top pointer-events-none animate-spotlight-2 z-0"></div>

      {/* Cinematic grid layer */}
      <div className="absolute inset-0 stadium-scanlines opacity-[0.12] z-0 pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center gap-12 justify-between">
        
        {/* Left Side: Cinematic Title & CTAs */}
        <div className="flex-1 text-center md:text-left space-y-6 max-w-xl">
          {/* Top badge */}
          <div className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/40 text-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse mx-auto md:mx-0">
            ⚽ FIFA WORLD CUP 2026 SPECIAL
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="font-bebas text-5xl md:text-7xl leading-none text-white tracking-wide uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              ANTIGRAVITY <br />
              <span className="bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 bg-clip-text text-transparent">
                CARD BATTLE 2026
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-medium max-w-md drop-shadow">
              Answer challenging World Cup trivia, draft legendary players, and duel the AI in a tactical card battle.
            </p>
          </div>

          {/* Locked status banner */}
          {battleLocked && (
            <div className="bg-gradient-to-r from-yellow-600/20 via-yellow-600/10 to-transparent border-l-4 border-gold p-3 rounded-r-xl max-w-md text-left flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="text-xs font-bold text-gold uppercase tracking-wide">Battles Locked</div>
                <div className="text-[11px] text-gray-300">Earn at least 3 cards to unlock Arena Battles (Squad: {cardCount}/3)</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            {/* Earn cards */}
            <button
              onClick={handleEarn}
              className="bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bebas text-xl py-4 px-6 rounded-xl shadow-lg border border-yellow-300 hover:border-yellow-200 transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              EARN PLAYERS 🧠
            </button>

            {/* Battle / Kick off */}
            <button
              onClick={handleKickOff}
              disabled={battleLocked}
              className={`font-bebas text-xl py-4 px-6 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                battleLocked
                  ? "bg-gray-800/40 border-gray-700/50 text-gray-500 cursor-not-allowed opacity-55"
                  : "bg-transparent border-white hover:bg-white hover:text-black transform hover:scale-105 active:scale-95 text-white"
              }`}
            >
              {battleLocked ? "🔒 KICK OFF" : "⚔️ KICK OFF"}
            </button>

            {/* My Squad (Full width across cols) */}
            <button
              onClick={handleSquad}
              className="sm:col-span-2 bg-navy-900/60 hover:bg-navy-900/90 border border-gray-800 hover:border-gray-700 text-white font-bebas text-lg py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              📋 MY SQUAD GALLERY ({cardCount})
            </button>
          </div>

          {/* Statistics panel */}
          <div className="border-t border-gray-800/80 pt-6 grid grid-cols-4 gap-4 text-center md:text-left max-w-md">
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Answered</div>
              <div className="text-xl font-bold font-bebas text-white mt-0.5">{stats.quizzesAnswered}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Correct</div>
              <div className="text-xl font-bold font-bebas text-pitch mt-0.5">{stats.correctAnswers}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Battles</div>
              <div className="text-xl font-bold font-bebas text-white mt-0.5">{stats.battlesPlayed}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Wins</div>
              <div className="text-xl font-bold font-bebas text-gold mt-0.5">{stats.battlesWon}</div>
            </div>
          </div>
        </div>

        {/* Right Side: Showcase Player Card */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-w-[280px]">
          {/* Behind Card Glowing Shield Backdrop */}
          <div className="absolute w-72 h-96 rounded-full bg-gold/15 filter blur-3xl animate-pulse"></div>

          {showcasePlayer ? (
            <div className="animate-float flex flex-col items-center">
              <div className="text-xs text-gold font-bold uppercase tracking-widest mb-3 select-none">
                🏆 SIGNATURE REWARD PREVIEW
              </div>
              <PlayerCard player={showcasePlayer} size="lg" glow={true} />
            </div>
          ) : (
            <div className="w-56 h-80 rounded-2xl border-4 border-dashed border-gray-800 flex items-center justify-center text-gray-600 font-bebas">
              LOADING CARD...
            </div>
          )}

          {/* Last Earned Card Mini Preview */}
          {lastPulledPlayer && (
            <div className="mt-8 bg-navy-900/80 border border-gray-800 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md animate-fade-in shadow-xl max-w-[260px]">
              <div className="transform scale-[0.6] origin-left -mr-16">
                <PlayerCard player={lastPulledPlayer} size="sm" glow={false} />
              </div>
              <div className="text-left flex-1 min-w-0 pr-1">
                <div className="text-[9px] text-gold font-extrabold tracking-wider uppercase">LATEST UNLOCKED</div>
                <div className="text-xs font-bold text-white truncate">{lastPulledPlayer.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{lastPulledPlayer.flag} OVR {lastPulledPlayer.ovr}</div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
