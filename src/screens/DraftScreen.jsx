import React, { useState, useEffect, useRef, useMemo } from "react";
import { PlayerCard } from "../components/PlayerCard";
import { players } from "../data/players";
import { sound } from "../utils/sound";

// Formation coordinates on the virtual pitch
// Coordinates are in percentages: left (x) and top (y)
const FORMATIONS = {
  "4-3-3": [
    { id: 0, pos: "GK", left: 50, top: 86, group: "GK" },
    { id: 1, pos: "LB", left: 15, top: 66, group: "DEF" },
    { id: 2, pos: "LCB", left: 38, top: 70, group: "DEF" },
    { id: 3, pos: "RCB", left: 62, top: 70, group: "DEF" },
    { id: 4, pos: "RB", left: 85, top: 66, group: "DEF" },
    { id: 5, pos: "LCM", left: 25, top: 43, group: "MID" },
    { id: 6, pos: "CM", left: 50, top: 47, group: "MID" },
    { id: 7, pos: "RCM", left: 75, top: 43, group: "MID" },
    { id: 8, pos: "LW", left: 20, top: 18, group: "FWD" },
    { id: 9, pos: "ST", left: 50, top: 12, group: "FWD" },
    { id: 10, pos: "RW", left: 80, top: 18, group: "FWD" }
  ],
  "4-4-2": [
    { id: 0, pos: "GK", left: 50, top: 86, group: "GK" },
    { id: 1, pos: "LB", left: 15, top: 66, group: "DEF" },
    { id: 2, pos: "LCB", left: 38, top: 70, group: "DEF" },
    { id: 3, pos: "RCB", left: 62, top: 70, group: "DEF" },
    { id: 4, pos: "RB", left: 85, top: 66, group: "DEF" },
    { id: 5, pos: "LM", left: 15, top: 42, group: "MID" },
    { id: 6, pos: "LCM", left: 38, top: 46, group: "MID" },
    { id: 7, pos: "RCM", left: 62, top: 46, group: "MID" },
    { id: 8, pos: "RM", left: 85, top: 42, group: "MID" },
    { id: 9, pos: "LST", left: 33, top: 14, group: "FWD" },
    { id: 10, pos: "RST", left: 67, top: 14, group: "FWD" }
  ],
  "3-5-2": [
    { id: 0, pos: "GK", left: 50, top: 86, group: "GK" },
    { id: 1, pos: "LCB", left: 25, top: 68, group: "DEF" },
    { id: 2, pos: "CB", left: 50, top: 71, group: "DEF" },
    { id: 3, pos: "RCB", left: 75, top: 68, group: "DEF" },
    { id: 4, pos: "LM", left: 15, top: 44, group: "MID" },
    { id: 5, pos: "LCM", left: 33, top: 48, group: "MID" },
    { id: 6, pos: "CM", left: 50, top: 50, group: "MID" },
    { id: 7, pos: "RCM", left: 67, top: 48, group: "MID" },
    { id: 8, pos: "RM", left: 85, top: 44, group: "MID" },
    { id: 9, pos: "LST", left: 33, top: 14, group: "FWD" },
    { id: 10, pos: "RST", left: 67, top: 14, group: "FWD" }
  ],
  "4-2-3-1": [
    { id: 0, pos: "GK", left: 50, top: 86, group: "GK" },
    { id: 1, pos: "LB", left: 15, top: 68, group: "DEF" },
    { id: 2, pos: "LCB", left: 38, top: 71, group: "DEF" },
    { id: 3, pos: "RCB", left: 62, top: 71, group: "DEF" },
    { id: 4, pos: "RB", left: 85, top: 68, group: "DEF" },
    { id: 5, pos: "LDM", left: 33, top: 52, group: "MID" },
    { id: 6, pos: "RDM", left: 67, top: 52, group: "MID" },
    { id: 7, pos: "LAM", left: 18, top: 32, group: "MID" },
    { id: 8, pos: "CAM", left: 50, top: 34, group: "MID" },
    { id: 9, pos: "RAM", left: 82, top: 32, group: "MID" },
    { id: 10, pos: "ST", left: 50, top: 12, group: "FWD" }
  ],
  "5-2-3": [
    { id: 0, pos: "GK", left: 50, top: 86, group: "GK" },
    { id: 1, pos: "LWB", left: 12, top: 62, group: "DEF" },
    { id: 2, pos: "LCB", left: 30, top: 69, group: "DEF" },
    { id: 3, pos: "CB", left: 50, top: 71, group: "DEF" },
    { id: 4, pos: "RCB", left: 70, top: 69, group: "DEF" },
    { id: 5, pos: "RWB", left: 88, top: 62, group: "DEF" },
    { id: 6, pos: "LCM", left: 35, top: 45, group: "MID" },
    { id: 7, pos: "RCM", left: 65, top: 45, group: "MID" },
    { id: 8, pos: "LW", left: 20, top: 18, group: "FWD" },
    { id: 9, pos: "ST", left: 50, top: 12, group: "FWD" },
    { id: 10, pos: "RW", left: 80, top: 18, group: "FWD" }
  ]
};

export const DraftScreen = ({ earnedCards = [], onNavigateToQuiz }) => {
  // State
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [squad, setSquad] = useState(Array(11).fill(null));
  const [activeSlot, setActiveSlot] = useState(null); // Index of slot being drafted
  const [draftOptions, setDraftOptions] = useState([]); // Candidates for selected slot
  const [builderMode, setBuilderMode] = useState("fantasy"); // 'fantasy' or 'battle'
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isHtml2CanvasLoaded, setIsHtml2CanvasLoaded] = useState(false);

  const pitchRef = useRef(null);

  // Dynamic loading of html2canvas from CDN
  useEffect(() => {
    if (window.html2canvas) {
      setIsHtml2CanvasLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    script.onload = () => setIsHtml2CanvasLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Clean up script if it hasn't loaded yet
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Get configuration slots for current formation
  const currentSlots = FORMATIONS[selectedFormation];

  // Calculate Average OVR
  const getAverageOvr = () => {
    const filled = squad.filter((p) => p !== null);
    if (filled.length === 0) return 0;
    const sum = filled.reduce((acc, curr) => acc + curr.ovr, 0);
    return Math.round(sum / filled.length);
  };

  // Calculate Squad Chemistry
  // Nation match (2+ players -> +1, 5+ -> +2, 8+ -> +3 per player)
  // Club match (2+ players -> +1, 4+ -> +2, 7+ -> +3 per player)
  // Correct position -> +1 chem base. Wrong position -> 0 total chem for that player!
  const getChemistryData = () => {
    const filled = squad.filter((p) => p !== null);
    if (filled.length === 0) return { total: 0, details: [] };

    // Count clubs and nations
    const nationsCount = {};
    const clubsCount = {};

    filled.forEach((p) => {
      nationsCount[p.nation] = (nationsCount[p.nation] || 0) + 1;
      clubsCount[p.club] = (clubsCount[p.club] || 0) + 1;
    });

    let totalChem = 0;
    const playerChems = squad.map((p, idx) => {
      if (!p) return 0;
      const slot = currentSlots[idx];
      const isCorrectPosition = p.position === slot.group;

      if (!isCorrectPosition) return 0; // Out of position gets 0 chem

      const nationCount = nationsCount[p.nation] || 0;
      const nationPoints = nationCount >= 8 ? 3 : nationCount >= 5 ? 2 : nationCount >= 2 ? 1 : 0;

      const clubCount = clubsCount[p.club] || 0;
      const clubPoints = clubCount >= 7 ? 3 : clubCount >= 4 ? 2 : clubCount >= 2 ? 1 : 0;

      const chem = Math.min(3, 1 + nationPoints + clubPoints);
      totalChem += chem;
      return chem;
    });

    return { total: totalChem, details: playerChems };
  };

  const { total: totalChemistry, details: playerChems } = getChemistryData();

  // Reset Draft
  const handleResetDraft = () => {
    sound.playClick();
    setSquad(Array(11).fill(null));
    setActiveSlot(null);
    setDraftOptions([]);
  };

  // Switch Formation
  const handleFormationChange = (formName) => {
    sound.playClick();
    setSelectedFormation(formName);
  };

  // Open Draft Choice Overlay for a slot
  const handleSlotClick = (slotIdx) => {
    sound.playClick();
    setActiveSlot(slotIdx);
    setSearchTerm("");
    setRarityFilter("all");

    const slot = currentSlots[slotIdx];
    const draftedIds = squad.filter((p) => p !== null).map((p) => p.id);

    // Determine candidate pool based on mode (Fantasy: all database cards vs. Battle: earned quiz cards)
    const sourcePool = builderMode === "fantasy" ? players : earnedCards;
    
    // Group matching position cards (GK, DEF, MID, FWD)
    const candidates = sourcePool.filter((p) => p.position === slot.group && !draftedIds.includes(p.id));

    // Sort by OVR rating descending
    candidates.sort((a, b) => b.ovr - a.ovr);
    setDraftOptions(candidates);
  };

  // Draft a player into active slot
  const handleDraftPlayer = (player) => {
    sound.playClick();
    const updatedSquad = [...squad];
    updatedSquad[activeSlot] = player;
    setSquad(updatedSquad);
    setActiveSlot(null);
    setDraftOptions([]);
  };

  // Toggle Builder Mode
  const handleModeChange = (mode) => {
    if (mode === builderMode) return;
    sound.playClick();
    setBuilderMode(mode);
    setSquad(Array(11).fill(null));
    setActiveSlot(null);
    setDraftOptions([]);
  };

  // Dynamic search and filter processing on candidates list
  const filteredDraftOptions = useMemo(() => {
    if (activeSlot === null) return [];

    let result = [...draftOptions];

    // Search bar filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Rarity tag filter
    if (rarityFilter !== "all") {
      result = result.filter((p) => p.rarity === rarityFilter);
    }

    return result;
  }, [draftOptions, activeSlot, searchTerm, rarityFilter]);

  // Download squad screenshot via html2canvas
  const handleDownloadTeam = async () => {
    sound.playClick();
    if (!isHtml2CanvasLoaded || !pitchRef.current) {
      alert("Loading export engine... Please try again in a second!");
      return;
    }

    setIsExporting(true);

    try {
      const pitchEl = pitchRef.current;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await window.html2canvas(pitchEl, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#030712",
        scale: 2, // Double resolution for ultra-sharp rendering
        logging: false
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `team-fc-${selectedFormation}-${builderMode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export squad failed:", err);
      alert("Oops! Failed to download squad image. Some player headshots CDN may block export via CORS.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 to-gray-950 py-8 px-4 pb-20 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Stats Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-navy-900/60 border border-gray-800 p-4 rounded-2xl backdrop-blur-md">
          {/* Title & Brand */}
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛡️</span>
            <div>
              <h2 className="font-bebas text-2xl md:text-3xl tracking-wider text-white">
                BUILD YOUR <span className="text-green-400">11</span>
              </h2>
              <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-semibold">
                {builderMode === "fantasy" ? "Team FC Fantasy Draft Arena" : "Team FC Battle Arena Squad"}
              </p>
            </div>
          </div>

          {/* Builder Mode Segment Selector */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-gray-800/80 shadow-inner">
            <button
              onClick={() => handleModeChange("fantasy")}
              className={`font-bebas text-xs md:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all duration-300 ${
                builderMode === "fantasy"
                  ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-extrabold shadow-lg shadow-yellow-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>🌟</span> FANTASY BUILDER
            </button>
            <button
              onClick={() => handleModeChange("battle")}
              className={`font-bebas text-xs md:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all duration-300 ${
                builderMode === "battle"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-black font-extrabold shadow-lg shadow-green-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>⚔️</span> BATTLE SQUAD
            </button>
          </div>

          {/* Formation Selector */}
          <div className="flex flex-wrap justify-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-gray-800">
            {Object.keys(FORMATIONS).map((form) => (
              <button
                key={form}
                onClick={() => handleFormationChange(form)}
                className={`font-bebas text-xs md:text-sm px-3 py-1.5 rounded-lg transition-all ${
                  selectedFormation === form
                    ? "bg-green-500 text-black font-extrabold shadow-md shadow-green-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {form}
              </button>
            ))}
          </div>

          {/* Draft Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleResetDraft}
              className="bg-red-950/40 border border-red-700/50 hover:bg-red-900/30 text-red-400 font-bebas text-xs md:text-sm px-4 py-2 rounded-xl transition-all"
            >
              🔄 RESET
            </button>
            <button
              onClick={handleDownloadTeam}
              disabled={isExporting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bebas text-xs md:text-sm px-4 py-2 rounded-xl font-bold shadow hover:from-green-400 hover:to-emerald-500 transform active:scale-95 transition-all flex items-center gap-1.5"
            >
              📥 {isExporting ? "EXPORTING..." : "DOWNLOAD TEAM"}
            </button>
          </div>
        </div>

        {/* Squad HUD Stats Display */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {/* Average Rating OVR */}
          <div className="bg-navy-900/40 border border-gray-800 p-3 rounded-2xl text-center backdrop-blur-sm relative overflow-hidden">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Avg OVR</div>
            <div className="text-3xl md:text-5xl font-extrabold font-bebas text-white mt-1 drop-shadow">
              {getAverageOvr()}
            </div>
            {/* Soft backdrop glow */}
            <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none"></div>
          </div>

          {/* Team Chemistry (Max 33) */}
          <div className="bg-navy-900/40 border border-gray-800 p-3 rounded-2xl text-center backdrop-blur-sm relative overflow-hidden">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Chemistry</div>
            <div className="text-3xl md:text-5xl font-extrabold font-bebas text-green-400 mt-1 drop-shadow flex items-center justify-center gap-1">
              <span>{totalChemistry}</span>
              <span className="text-gray-600 text-lg md:text-2xl font-normal">/33</span>
            </div>
            {/* Dynamic Chemistry Gauge Bar */}
            <div className="w-full bg-gray-800/80 h-1.5 rounded-full mt-2 overflow-hidden border border-black/30">
              <div
                className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(totalChemistry / 33) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Draft Progress */}
          <div className="bg-navy-900/40 border border-gray-800 p-3 rounded-2xl text-center backdrop-blur-sm relative overflow-hidden">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Squad Drafted</div>
            <div className="text-3xl md:text-5xl font-extrabold font-bebas text-white mt-1 drop-shadow flex items-center justify-center gap-1">
              <span>{squad.filter((p) => p !== null).length}</span>
              <span className="text-gray-600 text-lg md:text-2xl font-normal">/11</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-800/80 h-1.5 rounded-full mt-2 overflow-hidden border border-black/30">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(squad.filter((p) => p !== null).length / 11) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Virtual Soccer Pitch Arena */}
        <div className="flex justify-center">
          <div
            ref={pitchRef}
            id="team-fc-pitch"
            className="relative w-full aspect-[3/4] max-w-3xl rounded-3xl overflow-hidden border-4 border-gray-800/80 bg-[#0e3a1b] shadow-2xl select-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%),
                repeating-linear-gradient(90deg, #104e25 0px, #104e25 80px, #0c421e 80px, #0c421e 160px)
              `,
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7)"
            }}
          >
            {/* Pitch Markings Overlay */}
            <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none"></div>
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white/10 pointer-events-none transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[24%] aspect-square rounded-full border border-white/10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white/15 rounded-full"></div>
            </div>

            {/* Penalty Box (Top - FWDs) */}
            <div className="absolute top-4 left-1/2 w-[55%] h-[15%] border-b border-l border-r border-white/10 pointer-events-none transform -translate-x-1/2"></div>
            <div className="absolute top-4 left-1/2 w-[25%] h-[6%] border-b border-l border-r border-white/10 pointer-events-none transform -translate-x-1/2"></div>

            {/* Penalty Box (Bottom - GK) */}
            <div className="absolute bottom-4 left-1/2 w-[55%] h-[15%] border-t border-l border-r border-white/10 pointer-events-none transform -translate-x-1/2"></div>
            <div className="absolute bottom-4 left-1/2 w-[25%] h-[6%] border-t border-l border-r border-white/10 pointer-events-none transform -translate-x-1/2"></div>

            {/* Pitch Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
              <span className="font-bebas text-7xl md:text-9xl text-white tracking-widest uppercase">
                TEAM FC
              </span>
            </div>

            {/* Render 11 Slots */}
            {currentSlots.map((slot, index) => {
              const draftedPlayer = squad[index];
              const chemScore = playerChems[index] || 0;

              return (
                <div
                  key={slot.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group transition-all duration-300"
                  style={{
                    left: `${slot.left}%`,
                    top: `${slot.top}%`
                  }}
                >
                  {draftedPlayer ? (
                    /* Render Drafted Player Card */
                    <div className="relative animate-scale-up-fast flex flex-col items-center">
                      <div className="transform scale-[0.55] sm:scale-[0.8] hover:scale-[0.85] transition-all origin-center animate-fade-in">
                        <PlayerCard player={draftedPlayer} size="sm" glow={true} />
                      </div>
                      
                      {/* Rating indicator */}
                      <div className="absolute -bottom-1 sm:-bottom-2 bg-black/80 backdrop-blur-xs border border-gray-700/80 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md z-30 pointer-events-none">
                        <span className="text-[7px] sm:text-[9px] font-bold text-white">OVR {draftedPlayer.ovr}</span>
                        <span className="text-[7px] sm:text-[9px] text-green-400 font-extrabold flex items-center gap-0.5">
                          💎{chemScore}
                        </span>
                      </div>

                      {/* Replace trigger overlay button */}
                      <button
                        onClick={() => handleSlotClick(index)}
                        className="absolute top-0 right-0 sm:-top-1 sm:-right-1 bg-red-600 hover:bg-red-500 border border-white/30 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-40 cursor-pointer animate-fade-in"
                        title="Draft alternate player"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    /* Render Empty Slot Button */
                    <button
                      onClick={() => handleSlotClick(index)}
                      className="w-14 h-20 sm:w-20 sm:h-28 rounded-xl sm:rounded-2xl border-2 border-dashed border-white/30 hover:border-green-400 bg-black/30 hover:bg-green-950/20 backdrop-blur-xs flex flex-col items-center justify-center gap-1 cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg group"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-dashed border-white/40 group-hover:border-green-400/80 flex items-center justify-center text-white/50 group-hover:text-green-400 text-sm sm:text-base font-bold transition-colors">
                        +
                      </div>
                      <div className="text-[8px] sm:text-[10px] font-bold text-white/60 group-hover:text-green-400 tracking-wide transition-colors">
                        {slot.pos}
                      </div>
                      <div className="text-[5px] sm:text-[7px] text-white/40 uppercase tracking-widest leading-none">
                        {slot.group}
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Tips footer */}
        <div className="text-center text-xs text-gray-500 uppercase tracking-wider font-semibold max-w-md mx-auto">
          Tip: Tap any empty slot + to draft a player. Place players in matching position groups (e.g. FWD in ST) and pair similar clubs or nations to max chemistry!
        </div>

      </div>

      {/* DRAFT PICKER OVERLAY DIALOG MODAL */}
      {activeSlot !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-navy-900 via-navy-950 to-gray-950 border border-gray-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-6 max-h-[90vh] overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveSlot(null);
                setDraftOptions([]);
              }}
              className="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/80 text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Heading */}
            <div className="text-center space-y-1 w-full">
              <h3 className="font-bebas text-2xl sm:text-4xl text-white tracking-wider flex items-center justify-center gap-2">
                <span>SELECT A</span>
                <span className={builderMode === "fantasy" ? "text-yellow-400 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent" : "text-green-400 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"}>
                  {builderMode === "fantasy" ? "FANTASY PLAYER" : "BATTLE PLAYER"}
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-semibold">
                Drafting {currentSlots[activeSlot]?.pos} ({currentSlots[activeSlot]?.group}) slot candidates • {filteredDraftOptions.length} available
              </p>
            </div>

            {/* Premium Controls Panel (Search & Rarity Filter) */}
            <div className="w-full bg-black/45 border border-gray-800/60 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search player name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-navy-950 border border-gray-800/80 rounded-xl px-4 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-gray-600"
                />
                <span className="absolute left-3.5 top-3 text-gray-500 text-sm">🔍</span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Rarity Pill Filter */}
              <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end">
                {["all", "icon", "gold", "silver", "bronze"].map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => {
                      sound.playClick();
                      setRarityFilter(rarity);
                    }}
                    className={`font-bebas text-xs px-3 py-1.5 rounded-lg border transition-all capitalize ${
                      rarityFilter === rarity
                        ? "bg-gold text-black font-extrabold border-gold shadow-md shadow-gold/10"
                        : "bg-navy-950 text-gray-400 border-gray-800/80 hover:text-white hover:border-gray-700"
                    }`}
                  >
                    {rarity === "all" ? "All Rarities" : rarity}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Card Grid */}
            <div className="flex-1 w-full overflow-y-auto px-2 py-4 custom-scrollbar">
              {filteredDraftOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <span className="text-5xl">🃏</span>
                  <div className="space-y-1">
                    <h4 className="font-bebas text-xl text-white tracking-wider">NO MATCHING CANDIDATES FOUND</h4>
                    <p className="text-xs text-gray-500 max-w-sm">
                      {builderMode === "battle"
                        ? "You haven't unlocked any players for this position yet! Earn cards by completing more trivia quizzes."
                        : "No players in the database match your current search terms or filters."}
                    </p>
                  </div>
                  {builderMode === "battle" && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveSlot(null);
                        setDraftOptions([]);
                        onNavigateToQuiz();
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bebas text-sm px-6 py-2.5 rounded-xl shadow-lg border border-yellow-400 hover:scale-105 active:scale-95 transition-all duration-300 font-bold"
                    >
                      EARN PLAYERS 🧠
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center w-full">
                  {filteredDraftOptions.map((player) => (
                    <div
                      key={player.id}
                      onClick={() => handleDraftPlayer(player)}
                      className="transform hover:scale-105 active:scale-95 transition-all duration-300 relative cursor-pointer group flex flex-col items-center"
                    >
                      <PlayerCard player={player} size="sm" glow={true} />
                      
                      {/* Hover stats review badge overlay */}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded border border-gray-800 text-[8px] font-bold text-gray-300 group-hover:text-gold transition-colors z-20">
                        OVR {player.ovr}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Subtext Info */}
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold text-center border-t border-gray-800/40 w-full pt-3 flex items-center justify-center gap-1.5">
              <span>💡</span>
              <span>
                {builderMode === "fantasy"
                  ? "Fantasy Mode provides access to every card in the database."
                  : "Battle Mode shows only the cards you have unlocked by taking quizzes."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
