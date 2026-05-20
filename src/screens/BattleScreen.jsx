import React, { useState, useEffect, useRef } from "react";
import { PlayerCard } from "../components/PlayerCard";
import { ProgressGate } from "../components/ProgressGate";
import { getWeightedRandomPlayer } from "../utils/cardDrop";
import { sound } from "../utils/sound";
import { players } from "../data/players";

export const BattleScreen = ({ squad = [], onNavigateToQuiz, onMatchEnd }) => {
  // Game states: 'gate', 'selection', 'battle', 'result'
  const [gameState, setGameState] = useState("gate");
  const [selectedCards, setSelectedCards] = useState([]);
  
  // Hand states
  const [playerHand, setPlayerHand] = useState([]);
  const [cpuHand, setCpuHand] = useState([]);
  
  // Battle arena states
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [timer, setTimer] = useState(10);
  const [roundActive, setRoundActive] = useState(false);
  
  // Card selections for current round
  const [playerPlayedCard, setPlayerPlayedCard] = useState(null);
  const [cpuPlayedCard, setCpuPlayedCard] = useState(null);
  
  // Round status
  const [countdown, setCountdown] = useState(null); // null, 3, 2, 1, 'REVEAL'
  const [battleStat, setBattleStat] = useState(""); // PAC, SHO, PAS, PHY
  const [roundResult, setRoundResult] = useState(null); // 'win', 'loss', 'tie'
  const [arenaMessage, setArenaMessage] = useState("");
  const [shakeArena, setShakeArena] = useState(false);

  const timerRef = useRef(null);

  // Check squad lock
  useEffect(() => {
    if (squad.length < 3) {
      setGameState("gate");
    } else {
      setGameState("selection");
    }
  }, [squad]);

  // Handle Card Selection (Need exactly 5 cards to battle)
  const handleSelectCard = (card) => {
    sound.playClick();
    if (selectedCards.some((c) => c.id === card.id)) {
      setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
    } else {
      if (selectedCards.length < 5) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  // Start Battle
  const handleReadyToBattle = () => {
    if (selectedCards.length !== 5) return;
    
    sound.playClick();
    
    // Set up player hand
    setPlayerHand(selectedCards.map((c) => ({ ...c, played: false })));
    
    // Set up CPU hand (Draft 5 random cards from database, including a few high-tier options to make it fun)
    const cpuDraft = [];
    for (let i = 0; i < 5; i++) {
      // Pick a random player from database
      const randomDbPlayer = players[Math.floor(Math.random() * players.length)];
      cpuDraft.push({ ...randomDbPlayer, played: false });
    }
    setCpuHand(cpuDraft);

    // Initialise Match
    setRound(1);
    setPlayerScore(0);
    setCpuScore(0);
    setPlayerPlayedCard(null);
    setCpuPlayedCard(null);
    setRoundResult(null);
    setGameState("battle");
    startRoundTimer();
  };

  // Start 10-second timer
  const startRoundTimer = () => {
    setTimer(10);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          autoPlayCard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Autoplay first unplayed card if timer runs out
  const autoPlayCard = () => {
    const unplayed = playerHand.find((c) => !c.played);
    if (unplayed) {
      handlePlayCard(unplayed);
    }
  };

  // Player clicks card to play in round
  const handlePlayCard = (card) => {
    if (playerPlayedCard || roundActive) return;
    
    clearInterval(timerRef.current);
    sound.playClick();
    
    setPlayerPlayedCard(card);
    
    // Choose CPU card randomly from its unplayed hand
    const cpuUnplayed = cpuHand.filter((c) => !c.played);
    const cpuCard = cpuUnplayed[Math.floor(Math.random() * cpuUnplayed.length)];
    setCpuPlayedCard(cpuCard);

    // Mark cards as played in hands
    setPlayerHand(playerHand.map((c) => (c.id === card.id ? { ...c, played: true } : c)));
    setCpuHand(cpuHand.map((c) => (c.id === cpuCard.id ? { ...c, played: true } : c)));

    // Begin Countdown Reveal
    initiateRevealSequence(card, cpuCard);
  };

  // Reveal Sequence
  const initiateRevealSequence = (pCard, cCard) => {
    setRoundActive(true);
    
    // Pick random stat category to battle
    const statsCategories = ["pac", "sho", "pas", "phy"];
    const chosenStat = statsCategories[Math.floor(Math.random() * statsCategories.length)];
    setBattleStat(chosenStat);

    // 3, 2, 1, REVEAL Countdown
    setCountdown(3);
    
    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 3) {
          sound.playClick();
          return 2;
        }
        if (prev === 2) {
          sound.playClick();
          return 1;
        }
        if (prev === 1) {
          clearInterval(countInterval);
          sound.playFlip();
          return "REVEAL!";
        }
        return null;
      });
    }, 850);

    // Execute Battle outcome after reveal countdown ends
    setTimeout(() => {
      setCountdown(null);
      
      const pVal = pCard.stats[chosenStat];
      const cVal = cCard.stats[chosenStat];

      let res = "tie";
      if (pVal > cVal) {
        res = "win";
        setPlayerScore((s) => s + 1);
        setArenaMessage(`${pCard.name}'s ${chosenStat.toUpperCase()} dominates!`);
      } else if (cVal > pVal) {
        res = "loss";
        setCpuScore((s) => s + 1);
        setArenaMessage(`${cCard.name}'s ${chosenStat.toUpperCase()} wins!`);
      } else {
        setArenaMessage("An epic tie! No points awarded.");
      }

      setRoundResult(res);
      setShakeArena(true);
      setTimeout(() => setShakeArena(false), 500);

      // Play Sound
      if (res === "win") {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }

      // Progress Round
      setTimeout(() => {
        // Clear battlefield
        setPlayerPlayedCard(null);
        setCpuPlayedCard(null);
        setRoundResult(null);
        setBattleStat("");
        setArenaMessage("");
        setRoundActive(false);

        // Check Match Over
        const currentRound = round;
        const pScore = playerScore + (res === "win" ? 1 : 0);
        const cScore = cpuScore + (res === "loss" ? 1 : 0);

        if (currentRound >= 3 || pScore >= 2 || cScore >= 2) {
          // End of Match
          setGameState("result");
          const userWon = pScore > cScore;
          if (userWon) {
            sound.playVictory();
          } else {
            sound.playWrong();
          }
          // Report results
          onMatchEnd(userWon);
        } else {
          setRound(currentRound + 1);
          startRoundTimer();
        }
      }, 3500); // Hold result for 3.5 seconds

    }, 3800); // 3 * 850ms + 1000ms delay
  };

  const getStatLabel = (stat) => {
    switch (stat) {
      case "pac": return "⚡ PACE BATTLE";
      case "sho": return "🎯 SHOOTING BATTLE";
      case "pas": return "📐 PASSING BATTLE";
      case "phy": return "💪 PHYSICALITY BATTLE";
      default: return "";
    }
  };

  // Reset Match
  const handleResetMatch = () => {
    setSelectedCards([]);
    setGameState("selection");
  };

  return (
    <div className={`relative min-h-[calc(100vh-73px)] py-10 px-4 flex flex-col items-center justify-center bg-navy-950 transition-all ${
      shakeArena ? "animate-shake" : ""
    }`}>
      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,24,48,0.4)_0%,#050710_90%)] pointer-events-none"></div>

      {/* STAGE 1: Access Gate */}
      {gameState === "gate" && (
        <ProgressGate cardCount={squad.length} onNavigateToQuiz={onNavigateToQuiz} />
      )}

      {/* STAGE 2: Squad Selection Hand Drafting */}
      {gameState === "selection" && (
        <div className="relative z-10 w-full max-w-5xl text-center space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h2 className="font-bebas text-3xl md:text-4xl text-white tracking-widest">
              DRAFT YOUR SQUAD HAND
            </h2>
            <p className="text-gray-400 text-xs md:text-sm">
              Select exactly <span className="text-gold font-bold">5 players</span> from your collection to enter the Arena.
            </p>
            <div className="text-xs bg-navy-900 border border-gray-800 rounded-full px-4 py-1 inline-block text-gray-300">
              Selected: <span className="text-gold font-extrabold">{selectedCards.length} / 5</span>
            </div>
          </div>

          {/* Squad Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-h-[50vh] overflow-y-auto p-4 border border-gray-800/60 rounded-3xl bg-navy-900/40 backdrop-blur-xs">
            {squad.map((card, idx) => {
              const isCardSelected = selectedCards.some((c) => c.id === card.id);
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center transform scale-95 hover:scale-100 transition-transform duration-300"
                >
                  <PlayerCard
                    player={card}
                    size="sm"
                    onClick={() => handleSelectCard(card)}
                    isSelected={isCardSelected}
                    glow={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Draft Actions */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleReadyToBattle}
              disabled={selectedCards.length !== 5}
              className={`font-bebas text-2xl px-10 py-4 rounded-xl border tracking-widest shadow-xl transition-all duration-300 ${
                selectedCards.length === 5
                  ? "bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 border-yellow-300 text-black transform hover:scale-105 active:scale-95 hover:shadow-gold/25"
                  : "bg-gray-800/40 border-gray-700/50 text-gray-500 cursor-not-allowed opacity-55"
              }`}
            >
              READY TO BATTLE ⚔️
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Battle Arena */}
      {gameState === "battle" && (
        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-between min-h-[75vh] animate-fade-in">
          
          {/* Top Panel: CPU Cards & Stats */}
          <div className="w-full flex items-center justify-between border-b border-gray-800/50 pb-3">
            <div className="text-left">
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">OPPONENT</span>
              <h3 className="font-bebas text-lg text-white">CPU SQUAD HAND</h3>
            </div>
            
            {/* Scoreboard */}
            <div className="flex items-center gap-4 bg-navy-900 border border-gray-800 px-6 py-2 rounded-2xl shadow-inner font-bebas text-xl md:text-2xl text-white">
              <span className="text-gold font-bold">ROUND {round} / 3</span>
              <div className="flex items-center gap-2 border-l border-gray-800 pl-4 font-mono font-semibold">
                <span className="text-gray-300">YOU {playerScore}</span>
                <span className="text-gray-500">-</span>
                <span className="text-red-400">{cpuScore} CPU</span>
              </div>
            </div>

            {/* Hand indicators CPU */}
            <div className="flex gap-1.5">
              {cpuHand.map((c, i) => (
                <div
                  key={i}
                  className={`w-3 h-4 rounded-xs border ${
                    c.played ? "bg-red-950 border-red-900/40 opacity-40" : "bg-red-500 border-red-400 shadow-md shadow-red-500/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Arena Battlefield */}
          <div className="flex-1 w-full flex flex-col items-center justify-center py-6 min-h-[35vh] relative">
            
            {/* Round Category drops from top */}
            {battleStat && (
              <div className="absolute top-0 z-30 bg-gold text-black font-bebas text-lg px-6 py-1.5 rounded-full border border-yellow-300 shadow-lg tracking-widest animate-bounce">
                {getStatLabel(battleStat)}
              </div>
            )}

            {/* Timer Bar */}
            {!playerPlayedCard && !roundActive && (
              <div className="w-64 bg-navy-900 border border-gray-800 rounded-full h-3.5 p-0.5 mb-6 overflow-hidden relative flex items-center">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_#ffd700]"
                  style={{ width: `${(timer / 10) * 100}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white font-bebas tracking-wide">
                  SELECT CARD: {timer}S
                </div>
              </div>
            )}

            {/* Countdown Big overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center rounded-3xl">
                <div className="font-bebas text-7xl md:text-8xl text-gold font-bold tracking-widest animate-ping">
                  {countdown}
                </div>
              </div>
            )}

            {/* Battlefield grid layouts */}
            <div className="flex items-center gap-10 md:gap-16 justify-center">
              {/* CPU Played Card */}
              {cpuPlayedCard ? (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">CPU CARD</span>
                  <div className="transform rotate-12 transition-transform duration-500">
                    <PlayerCard
                      player={cpuPlayedCard}
                      revealed={countdown === null} // Reveal after countdown finishes
                      isCardBack={countdown !== null}
                      size="md"
                      glow={roundResult === "loss"}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-44 h-64 border-4 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-600 bg-navy-900/10">
                  <span className="text-3xl opacity-30">🤖</span>
                  <span className="font-bebas text-xs mt-2 uppercase tracking-wide opacity-40">CPU WAITING</span>
                </div>
              )}

              {/* VERSUS divider line */}
              <div className="font-bebas text-4xl text-gray-600 italic font-extrabold select-none drop-shadow">
                VS
              </div>

              {/* Player Played Card */}
              {playerPlayedCard ? (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">YOUR CARD</span>
                  <div className="transform -rotate-12 transition-transform duration-500">
                    <PlayerCard
                      player={playerPlayedCard}
                      revealed={countdown === null}
                      isCardBack={countdown !== null}
                      size="md"
                      glow={roundResult === "win"}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-44 h-64 border-4 border-dashed border-gold/25 rounded-2xl flex flex-col items-center justify-center text-gold/30 bg-gold/5 animate-pulse">
                  <span className="text-3xl opacity-30">🃏</span>
                  <span className="font-bebas text-xs mt-2 uppercase tracking-wide opacity-40">PLAY A CARD</span>
                </div>
              )}
            </div>

            {/* Battle Round Feedback Message */}
            {arenaMessage && (
              <div className="mt-6 flex flex-col items-center space-y-2 max-w-sm text-center">
                {roundResult === "win" && (
                  <div className="bg-green-950/40 border border-green-700/50 text-green-400 text-sm font-semibold px-6 py-2 rounded-full shadow shadow-green-500/10">
                    ROUND WIN ✅
                  </div>
                )}
                {roundResult === "loss" && (
                  <div className="bg-red-950/40 border border-red-700/50 text-red-400 text-sm font-semibold px-6 py-2 rounded-full shadow shadow-red-500/10">
                    ROUND LOSS ❌
                  </div>
                )}
                {roundResult === "tie" && (
                  <div className="bg-gray-800/40 border border-gray-700/50 text-gray-400 text-sm font-semibold px-6 py-2 rounded-full">
                    DRAW 🤝
                  </div>
                )}
                <p className="text-xs text-gray-300 font-semibold italic mt-1">{arenaMessage}</p>
              </div>
            )}

          </div>

          {/* Bottom Panel: Player Cards & Draft Hand */}
          <div className="w-full border-t border-gray-800/50 pt-4 flex flex-col items-center space-y-4">
            <div className="w-full flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-gold font-bold uppercase tracking-wider block">TACTICAL BOARD</span>
                <h3 className="font-bebas text-lg text-white">YOUR SQUAD HAND</h3>
              </div>
              <div className="text-xs text-gray-400 font-medium">
                Tap card to launch into the battlefield
              </div>
            </div>

            {/* Hand list cards */}
            <div className="flex gap-4 overflow-x-auto pb-4 max-w-full justify-center">
              {playerHand.map((card, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-300 transform ${
                    card.played
                      ? "opacity-25 grayscale cursor-not-allowed translate-y-6"
                      : playerPlayedCard
                      ? "opacity-55 cursor-default hover:scale-100"
                      : "hover:-translate-y-4 scale-95 hover:scale-100"
                  }`}
                >
                  <PlayerCard
                    player={card}
                    size="sm"
                    onClick={() => !card.played && handlePlayCard(card)}
                    glow={false}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* STAGE 4: Match Result */}
      {gameState === "result" && (
        <div className="relative z-10 w-full max-w-md bg-navy-900 border-2 border-gray-800 rounded-3xl p-8 text-center space-y-8 animate-fade-in shadow-2xl overflow-hidden">
          
          {/* Confetti overlay for win */}
          {playerScore > cpuScore && (
            <div className="absolute inset-0 pointer-events-none z-0">
              {[...Array(20)].map((_, i) => {
                const colors = ["#ffd700", "#ffffff", "#22c55e"];
                const color = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <div
                    key={i}
                    className="confetti-particle rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      backgroundColor: color,
                      width: "6px",
                      height: "6px",
                      animationDelay: `${Math.random() * 2.5}s`,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Victory / Defeat headers */}
          {playerScore > cpuScore ? (
            <div className="relative z-10 space-y-3">
              <div className="w-20 h-20 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce shadow-[0_0_20px_#ffd70020]">
                🏆
              </div>
              <h2 className="font-bebas text-4xl text-gold tracking-widest">
                CHAMPION!
              </h2>
              <p className="text-gray-300 text-sm px-4 leading-relaxed">
                You outsmarted the CPU in tactical battles, claiming victory with a <span className="text-gold font-bold">{playerScore} - {cpuScore}</span> final score!
              </p>
            </div>
          ) : (
            <div className="relative z-10 space-y-3">
              <div className="w-20 h-20 bg-red-950/30 border border-red-900/30 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">
                😤
              </div>
              <h2 className="font-bebas text-4xl text-red-500 tracking-widest">
                FULL TIME
              </h2>
              <p className="text-gray-300 text-sm px-4 leading-relaxed">
                The CPU secured the win with a <span className="text-red-400 font-bold">{cpuScore} - {playerScore}</span> final score. Quiz for stronger player cards and try again!
              </p>
            </div>
          )}

          {/* Match Score Stats summary */}
          <div className="bg-navy-950 border border-gray-800 rounded-2xl p-4 relative z-10 text-xs text-gray-400 space-y-2 text-left">
            <h4 className="font-bebas text-sm text-gray-500 tracking-wider mb-2">MATCH LOG RECAP</h4>
            <div className="flex justify-between">
              <span>Match Outcome:</span>
              <span className={playerScore > cpuScore ? "text-pitch font-bold" : "text-red-400 font-bold"}>
                {playerScore > cpuScore ? "MATCH VICTORY" : "MATCH DEFEAT"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Your Rounds Won:</span>
              <span className="text-white font-bold">{playerScore}</span>
            </div>
            <div className="flex justify-between">
              <span>CPU Rounds Won:</span>
              <span className="text-white font-bold">{cpuScore}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 relative z-10">
            <button
              onClick={handleResetMatch}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bebas text-lg py-3 rounded-xl transition-all"
            >
              REMATCH ⚔️
            </button>
            <button
              onClick={onNavigateToQuiz}
              className="flex-1 bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 text-black font-bebas text-lg py-3 rounded-xl border border-yellow-300 shadow hover:bg-yellow-400 transition-all"
            >
              QUIZ AGAIN 🧠
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
