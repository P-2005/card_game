// LocalStorage Helper Functions

const KEYS = {
  CARDS: "antigravity_cards",
  STREAK: "antigravity_streak",
  STATS: "antigravity_stats",
  API_KEY: "antigravity_apikey"
};

export const storage = {
  // Get earned cards
  getCards: () => {
    try {
      const data = localStorage.getItem(KEYS.CARDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading cards from localStorage", e);
      return [];
    }
  },

  // Save earned cards
  saveCards: (cards) => {
    try {
      localStorage.setItem(KEYS.CARDS, JSON.stringify(cards));
    } catch (e) {
      console.error("Error writing cards to localStorage", e);
    }
  },

  // Get current answer streak
  getStreak: () => {
    const val = localStorage.getItem(KEYS.STREAK);
    return val ? parseInt(val, 10) : 0;
  },

  // Save answer streak
  saveStreak: (streak) => {
    localStorage.setItem(KEYS.STREAK, streak.toString());
  },

  // Get game statistics
  getStats: () => {
    try {
      const data = localStorage.getItem(KEYS.STATS);
      return data ? JSON.parse(data) : {
        quizzesAnswered: 0,
        correctAnswers: 0,
        battlesPlayed: 0,
        battlesWon: 0
      };
    } catch (e) {
      console.error("Error reading stats from localStorage", e);
      return {
        quizzesAnswered: 0,
        correctAnswers: 0,
        battlesPlayed: 0,
        battlesWon: 0
      };
    }
  },

  // Save game statistics
  saveStats: (stats) => {
    try {
      localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error("Error writing stats to localStorage", e);
    }
  },

  // Get Claude API Key
  getApiKey: () => {
    return localStorage.getItem(KEYS.API_KEY) || "";
  },

  // Save Claude API Key
  saveApiKey: (key) => {
    localStorage.setItem(KEYS.API_KEY, key.trim());
  },

  // Clear all game data (Reset profile)
  clearAll: () => {
    localStorage.removeItem(KEYS.CARDS);
    localStorage.removeItem(KEYS.STREAK);
    localStorage.removeItem(KEYS.STATS);
    localStorage.removeItem(KEYS.API_KEY);
  }
};
