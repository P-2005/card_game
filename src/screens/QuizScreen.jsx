import React, { useState, useEffect } from "react";
import { fetchAiQuestion } from "../utils/claudeApi";
import { getWeightedRandomPlayer } from "../utils/cardDrop";
import { sound } from "../utils/sound";

export const QuizScreen = ({
  apiKey = "",
  onCorrectAnswer, // callback when correct, takes earnedCard
  streak = 0,
  setStreak,
  updateStats
}) => {
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, correct, wrong
  const [errorMsg, setErrorMsg] = useState("");

  // Load a new question
  const loadQuestion = async () => {
    setLoading(true);
    setSelectedIdx(null);
    setStatus("idle");
    setErrorMsg("");
    
    try {
      const q = await fetchAiQuestion(apiKey);
      setQuestionData(q);
    } catch (e) {
      setErrorMsg("Failed to load question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [apiKey]);

  const handleOptionClick = (idx) => {
    if (selectedIdx !== null) return; // Answered already

    setSelectedIdx(idx);
    const isCorrect = idx === questionData.correct;

    updateStats(true, isCorrect); // Increment quizzes answered, correct answers if applicable

    if (isCorrect) {
      sound.playCorrect();
      setStatus("correct");
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      
      // Select random card to reward
      const card = getWeightedRandomPlayer();
      
      // Delay before triggering walkout so player sees they got it correct
      setTimeout(() => {
        onCorrectAnswer(card);
      }, 1500);
    } else {
      sound.playWrong();
      setStatus("wrong");
      setStreak(0); // Reset streak
    }
  };

  const optionColors = [
    "bg-blue-600/25 hover:bg-blue-600/40 border-blue-500/45 text-blue-100", // A
    "bg-green-600/25 hover:bg-green-600/40 border-green-500/45 text-green-100", // B
    "bg-amber-600/25 hover:bg-amber-600/40 border-amber-500/45 text-amber-100", // C
    "bg-purple-600/25 hover:bg-purple-600/40 border-purple-500/45 text-purple-100" // D
  ];

  const letterLabels = ["A", "B", "C", "D"];

  return (
    <div className="relative min-h-[calc(100vh-73px)] py-10 px-4 flex flex-col items-center justify-center bg-navy-950">
      {/* Background elements */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a0f1e]/90 to-navy-950 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl bg-navy-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Subtle grid line backdrop */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <h3 className="font-bebas text-2xl tracking-widest text-gold">GENERATING CHALLENGE...</h3>
            <p className="text-gray-500 text-xs">{apiKey ? "Analyzing historical databases via Claude AI..." : "Extracting trivia from World Cup chronicles..."}</p>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-12 space-y-4">
            <span className="text-4xl">⚠️</span>
            <h3 className="font-bebas text-2xl text-red-400">ERROR LOADING QUESTION</h3>
            <p className="text-gray-400 text-sm">{errorMsg}</p>
            <button
              onClick={loadQuestion}
              className="bg-gold text-black font-bebas text-lg px-6 py-2.5 rounded-xl border border-yellow-300 shadow hover:bg-yellow-400"
            >
              RETRY CHALLENGE
            </button>
          </div>
        ) : (
          <div className={`space-y-6 ${status === "wrong" ? "animate-shake" : ""}`}>
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <span className="bg-gray-800 border border-gray-700 text-gray-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                🏷️ {questionData.category}
              </span>
              
              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <span className="bg-orange-950/80 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-700/50 animate-pulse">
                    🔥 STREAK: {streak}
                  </span>
                )}
                {questionData.isOffline && (
                  <span className="bg-navy-950 text-gray-500 text-[9px] font-semibold px-2 py-0.5 rounded border border-gray-800">
                    OFFLINE MODE
                  </span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-lg md:text-2xl font-bold text-white text-center leading-relaxed px-2 select-text">
              {questionData.question}
            </h2>

            {/* Multiple Choice Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {questionData.options.map((option, idx) => {
                let buttonStyle = optionColors[idx];
                const isSelected = selectedIdx === idx;
                const isCorrectAnswer = idx === questionData.correct;

                // Style changes based on status
                if (selectedIdx !== null) {
                  if (isCorrectAnswer) {
                    buttonStyle = "bg-green-600/40 border-green-500 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                  } else if (isSelected) {
                    buttonStyle = "bg-red-600/40 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
                  } else {
                    buttonStyle = "bg-navy-950/20 border-gray-800 text-gray-600 opacity-40 cursor-default";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={selectedIdx !== null}
                    className={`border-2 rounded-2xl p-4 text-left font-medium text-sm transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${buttonStyle}`}
                  >
                    <span className="font-bebas text-lg w-7 h-7 rounded-lg bg-black bg-opacity-35 flex items-center justify-center text-center shrink-0">
                      {letterLabels[idx]}
                    </span>
                    <span className="select-text">{option}</span>
                    
                    {/* Tick / Cross Overlay Icons */}
                    {selectedIdx !== null && isCorrectAnswer && (
                      <span className="ml-auto text-green-400 text-xl font-bold">✓</span>
                    )}
                    {selectedIdx !== null && isSelected && !isCorrectAnswer && (
                      <span className="ml-auto text-red-400 text-xl font-bold">✕</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Banners & Fact boxes */}
            {status !== "idle" && (
              <div className="mt-6 space-y-4 border-t border-gray-800 pt-6 animate-fade-in text-left">
                {status === "correct" ? (
                  <div className="bg-green-950/30 border border-green-700/40 rounded-2xl p-3 flex items-center gap-3">
                    <span className="text-2xl animate-bounce">🎉</span>
                    <div>
                      <div className="font-bebas text-lg text-green-400 tracking-wider">CORRECT ANSWER!</div>
                      <div className="text-[11px] text-gray-300">A card drop walkout is initiating...</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/30 border border-red-700/40 rounded-2xl p-3 flex items-center gap-3">
                    <span className="text-2xl">😬</span>
                    <div>
                      <div className="font-bebas text-lg text-red-400 tracking-wider">WRONG ANSWER!</div>
                      <div className="text-[11px] text-gray-300">
                        The correct answer was: <span className="text-green-400 font-bold">{questionData.options[questionData.correct]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Did You Know Fact Box */}
                <div className="bg-navy-950 border border-gray-800/80 rounded-2xl p-4">
                  <h4 className="text-[10px] font-extrabold text-gold tracking-widest uppercase mb-1">
                    📖 DID YOU KNOW?
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed italic select-text">
                    {questionData.fact}
                  </p>
                </div>

                {/* Try Again / Next buttons */}
                {status === "wrong" && (
                  <div className="flex gap-4">
                    <button
                      onClick={loadQuestion}
                      className="flex-1 bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bebas text-lg py-3 rounded-xl shadow-lg border border-yellow-300 transition-all duration-300"
                    >
                      TRY ANOTHER QUESTION ➡️
                    </button>
                  </div>
                )}
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};
