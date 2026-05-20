import React, { useState, useEffect } from "react";
import { NavBar } from "./components/NavBar";
import { SettingsModal } from "./components/SettingsModal";
import { HomeScreen } from "./screens/HomeScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { WalkoutScreen } from "./screens/WalkoutScreen";
import { BattleScreen } from "./screens/BattleScreen";
import { SquadScreen } from "./screens/SquadScreen";
import { DraftScreen } from "./screens/DraftScreen";
import { storage } from "./utils/storage";
import { sound } from "./utils/sound";

function App() {
  // Global States
  const [activeScreen, setActiveScreen] = useState("home");
  const [cards, setCards] = useState([]);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({
    quizzesAnswered: 0,
    correctAnswers: 0,
    battlesPlayed: 0,
    battlesWon: 0,
  });
  const [apiKey, setApiKey] = useState("");
  const [soundMuted, setSoundMuted] = useState(true);
  const [theme, setTheme] = useState("dark");
  
  // Modals & UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [walkoutPlayer, setWalkoutPlayer] = useState(null);
  const [lastPulledPlayer, setLastPulledPlayer] = useState(null);
  const [welcomeToast, setWelcomeToast] = useState("");

  // Hydrate states from localStorage on mount
  useEffect(() => {
    const savedCards = storage.getCards();
    const savedStreak = storage.getStreak();
    const savedStats = storage.getStats();
    const savedApiKey = storage.getApiKey();
    const savedMutedSetting = localStorage.getItem("antigravity_muted") === "true";

    setCards(savedCards);
    setStreak(savedStreak);
    setStats(savedStats);
    setApiKey(savedApiKey);
    
    // Configure sound
    sound.setMuted(savedMutedSetting);
    setSoundMuted(savedMutedSetting);

    // Welcome back toast for returning user
    if (savedCards.length > 0) {
      setWelcomeToast(`Welcome back, Champion! You have ${savedCards.length} cards in your collection 🃏`);
      const timer = setTimeout(() => {
        setWelcomeToast("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update body background or color system when theme changes
  useEffect(() => {
    const body = document.body;
    if (theme === "light") {
      body.classList.remove("bg-navy-950", "text-gray-100");
      body.classList.add("bg-slate-50", "text-gray-900");
    } else {
      body.classList.remove("bg-slate-50", "text-gray-900");
      body.classList.add("bg-navy-950", "text-gray-100");
    }
  }, [theme]);

  // Handlers
  const handleCorrectAnswer = (newCard) => {
    // Save to user collection
    const updatedCards = [newCard, ...cards];
    setCards(updatedCards);
    storage.saveCards(updatedCards);

    // Save as last pulled card
    setLastPulledPlayer(newCard);

    // Prepare walkout player and switch screen
    setWalkoutPlayer(newCard);
    setActiveScreen("walkout");
  };

  const handleUpdateStats = (isQuiz, isCorrect) => {
    const updatedStats = { ...stats };
    if (isQuiz) {
      updatedStats.quizzesAnswered += 1;
      if (isCorrect) {
        updatedStats.correctAnswers += 1;
      }
    }
    setStats(updatedStats);
    storage.saveStats(updatedStats);
  };

  const handleMatchEnd = (userWon) => {
    const updatedStats = { ...stats };
    updatedStats.battlesPlayed += 1;
    if (userWon) {
      updatedStats.battlesWon += 1;
    }
    setStats(updatedStats);
    storage.saveStats(updatedStats);
  };

  const toggleSound = () => {
    const newMuteState = sound.toggleMuted();
    setSoundMuted(newMuteState);
  };

  const toggleTheme = () => {
    sound.playClick();
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleResetProfile = () => {
    storage.clearAll();
    setCards([]);
    setStreak(0);
    setStats({
      quizzesAnswered: 0,
      correctAnswers: 0,
      battlesPlayed: 0,
      battlesWon: 0,
    });
    setApiKey("");
    setLastPulledPlayer(null);
    setWalkoutPlayer(null);
    setActiveScreen("home");
  };

  // Sync API Key from Settings Modal back to states
  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    setApiKey(storage.getApiKey());
  };

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-slate-50 text-gray-900" : "bg-navy-950 text-gray-100"}`}>
      
      {/* Toast Notification */}
      {welcomeToast && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-5 py-3 rounded-2xl shadow-2xl border border-yellow-300 flex items-center gap-3 animate-fade-in font-medium text-xs md:text-sm">
          <span>✨</span>
          <span>{welcomeToast}</span>
          <button 
            onClick={() => setWelcomeToast("")} 
            className="ml-auto font-bold bg-black/10 hover:bg-black/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation bar (Header + Mobile Bottom Bar) */}
      {activeScreen !== "walkout" && (
        <NavBar
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          cardCount={cards.length}
          streak={streak}
          soundMuted={soundMuted}
          toggleSound={toggleSound}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenSettings={() => {
            sound.playClick();
            setIsSettingsOpen(true);
          }}
        />
      )}

      {/* Screen Routing */}
      <main className={activeScreen !== "walkout" ? "pb-16 md:pb-0" : ""}>
        {activeScreen === "home" && (
          <HomeScreen
            cardCount={cards.length}
            stats={stats}
            lastPulledPlayer={lastPulledPlayer}
            onNavigate={(screen) => setActiveScreen(screen)}
          />
        )}

        {activeScreen === "quiz" && (
          <QuizScreen
            apiKey={apiKey}
            onCorrectAnswer={handleCorrectAnswer}
            streak={streak}
            setStreak={(val) => {
              setStreak(val);
              storage.saveStreak(val);
            }}
            updateStats={handleUpdateStats}
          />
        )}

        {activeScreen === "walkout" && (
          <WalkoutScreen
            player={walkoutPlayer}
            onQuizAgain={() => {
              sound.playClick();
              setWalkoutPlayer(null);
              setActiveScreen("quiz");
            }}
            onViewSquad={() => {
              sound.playClick();
              setWalkoutPlayer(null);
              setActiveScreen("squad");
            }}
          />
        )}

        {activeScreen === "battle" && (
          <BattleScreen
            squad={cards}
            onNavigateToQuiz={() => {
              sound.playClick();
              setActiveScreen("quiz");
            }}
            onMatchEnd={handleMatchEnd}
          />
        )}

        {activeScreen === "draft" && (
          <DraftScreen
            earnedCards={cards}
            onNavigateToQuiz={() => {
              sound.playClick();
              setActiveScreen("quiz");
            }}
          />
        )}

        {activeScreen === "squad" && (
          <SquadScreen
            cards={cards}
            onNavigateToQuiz={() => {
              sound.playClick();
              setActiveScreen("quiz");
            }}
          />
        )}
      </main>

      {/* Settings Dialog Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onResetProfile={handleResetProfile}
      />
    </div>
  );
}

export default App;
