import React, { useState, useMemo } from "react";
import { PlayerCard } from "../components/PlayerCard";
import { CardModal } from "../components/CardModal";

export const SquadScreen = ({ cards = [], onNavigateToQuiz }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedNation, setSelectedNation] = useState("all");
  const [sortBy, setSortBy] = useState("ovr-desc"); // ovr-desc, name-asc, count-desc, rarity-desc
  const [activeDetailPlayer, setActiveDetailPlayer] = useState(null);

  // Group cards to count duplicates
  const uniqueCards = useMemo(() => {
    const grouped = cards.reduce((acc, card) => {
      if (acc[card.id]) {
        acc[card.id].count += 1;
      } else {
        acc[card.id] = { ...card, count: 1 };
      }
      return acc;
    }, {});
    return Object.values(grouped);
  }, [cards]);

  // Extract unique nations from the cards database for filter dropdown
  const nationsList = useMemo(() => {
    const nations = cards.map((c) => c.nation);
    return ["all", ...new Set(nations)];
  }, [cards]);

  // Filter & Sort unique cards
  const filteredUniqueCards = useMemo(() => {
    let result = [...uniqueCards];

    // Search Term Filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(query));
    }

    // Rarity Filter
    if (selectedRarity !== "all") {
      result = result.filter((c) => c.rarity === selectedRarity);
    }

    // Position Filter
    if (selectedPosition !== "all") {
      result = result.filter((c) => c.position === selectedPosition);
    }

    // Nation Filter
    if (selectedNation !== "all") {
      result = result.filter((c) => c.nation === selectedNation);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "ovr-desc") {
        return b.ovr - a.ovr;
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "count-desc") {
        return b.count - a.count;
      }
      if (sortBy === "rarity-desc") {
        const priority = { icon: 4, gold: 3, silver: 2, bronze: 1 };
        return priority[b.rarity] - priority[a.rarity];
      }
      return 0;
    });

    return result;
  }, [uniqueCards, searchTerm, selectedRarity, selectedPosition, selectedNation, sortBy]);

  const handleCardClick = (player) => {
    setActiveDetailPlayer(player);
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] py-10 px-4 bg-navy-950 flex flex-col items-center">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,24,48,0.25)_0%,#050710_90%)] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl text-center space-y-6">
        
        {/* Screen Header */}
        <div className="space-y-1">
          <h2 className="font-bebas text-3xl md:text-4xl text-white tracking-widest">
            MY SQUAD GALLERY
          </h2>
          <p className="text-gray-400 text-xs md:text-sm">
            View details, stats, and filter your unlocked World Cup squad ({cards.length} cards, {uniqueCards.length} unique).
          </p>
        </div>

        {/* Empty state */}
        {cards.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            {/* CSS-only bouncing soccer ball */}
            <div className="w-16 h-16 rounded-full border-4 border-white border-dashed bg-gradient-to-br from-gray-800 to-black relative animate-[bounce_1.5s_infinite_ease-in-out] shadow-lg shadow-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/20"></div>
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="font-bebas text-2xl text-white tracking-wide">NO CARDS EARNED YET</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Your squad is currently empty! Answer World Cup trivia quizzes correctly to draft and earn your first player cards.
              </p>
            </div>
            <button
              onClick={onNavigateToQuiz}
              className="bg-gradient-to-r from-yellow-500 via-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bebas text-lg px-8 py-3 rounded-xl shadow-lg border border-yellow-300 transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              START QUIZ 🧠
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Filters panel */}
            <div className="bg-navy-900 border border-gray-800 rounded-3xl p-4 md:p-6 text-left grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              
              {/* Search Bar */}
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Search Name</label>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-navy-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Rarity Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Rarity</label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="bg-navy-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="all">All Rarities</option>
                  <option value="icon">🔥 Icon</option>
                  <option value="gold">⭐ Gold</option>
                  <option value="silver">🥈 Silver</option>
                  <option value="bronze">🥉 Bronze</option>
                </select>
              </div>

              {/* Position Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Position</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="bg-navy-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="all">All Positions</option>
                  <option value="FWD">FWD - Forward</option>
                  <option value="MID">MID - Midfielder</option>
                  <option value="DEF">DEF - Defender</option>
                  <option value="GK">GK - Goalkeeper</option>
                </select>
              </div>

              {/* Nation Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Nation</label>
                <select
                  value={selectedNation}
                  onChange={(e) => setSelectedNation(e.target.value)}
                  className="bg-navy-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-colors capitalize"
                >
                  {nationsList.map((nation, idx) => (
                    <option key={idx} value={nation}>
                      {nation === "all" ? "All Nations" : nation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-navy-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="ovr-desc">Highest Rating (OVR)</option>
                  <option value="rarity-desc">Highest Rarity</option>
                  <option value="count-desc">Duplicate Count</option>
                  <option value="name-asc">Alphabetical (A-Z)</option>
                </select>
              </div>

            </div>

            {/* Unique gallery grid */}
            {filteredUniqueCards.length === 0 ? (
              <div className="py-12 bg-navy-900/20 border border-gray-800/40 rounded-3xl text-gray-500 font-bebas text-xl">
                NO MATCHING PLAYERS FOUND IN SQUAD
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-2 justify-center">
                {filteredUniqueCards.map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col items-center relative transform scale-[0.98] hover:scale-100 hover:z-10 transition-all duration-300"
                  >
                    <PlayerCard
                      player={player}
                      size="md"
                      onClick={() => handleCardClick(player)}
                      glow={player.rarity === "icon" || player.rarity === "gold"}
                    />
                    
                    {/* Duplicate Badge indicator overlay */}
                    {player.count > 1 && (
                      <span className="absolute top-1 right-3 bg-gold border border-yellow-300 text-black text-[9px] font-extrabold font-bebas px-2.5 py-0.5 rounded-full shadow-lg z-20 pointer-events-none animate-pulse">
                        ×{player.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Card Details Popup Modal */}
      {activeDetailPlayer && (
        <CardModal
          player={activeDetailPlayer}
          count={activeDetailPlayer.count}
          onClose={() => setActiveDetailPlayer(null)}
        />
      )}
    </div>
  );
};
