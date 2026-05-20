import React, { useState, useRef, useEffect } from "react";
import { sound } from "../utils/sound";
import { getPlayerHeadshot } from "../utils/playerImages";

// Custom SVG Avatars with nation-themed jerseys and stylized player silhouettes
const PlayerAvatar = ({ nation, rarity, position }) => {
  // Determine jersey color scheme based on nation
  let jerseyPrimary = "#e2e8f0"; // Default light gray
  let jerseySecondary = "#94a3b8";
  let hasStripes = false;

  switch (nation) {
    case "France":
      jerseyPrimary = "#0f20d9"; // Royal Blue
      jerseySecondary = "#ffffff";
      break;
    case "Spain":
      jerseyPrimary = "#dc2626"; // Red
      jerseySecondary = "#facc15"; // Yellow
      break;
    case "Germany":
      jerseyPrimary = "#ffffff"; // White
      jerseySecondary = "#000000"; // Black
      break;
    case "England":
      jerseyPrimary = "#f8fafc"; // White
      jerseySecondary = "#1e3a8a"; // Navy
      break;
    case "Brazil":
      jerseyPrimary = "#fbbf24"; // Yellow
      jerseySecondary = "#22c55e"; // Green
      break;
    case "Argentina":
      jerseyPrimary = "#7dd3fc"; // Sky Blue
      jerseySecondary = "#ffffff"; // White stripes
      hasStripes = true;
      break;
    case "Portugal":
      jerseyPrimary = "#b91c1c"; // Red
      jerseySecondary = "#15803d"; // Green
      break;
    case "Netherlands":
      jerseyPrimary = "#ea580c"; // Orange
      jerseySecondary = "#ffffff";
      break;
    case "Belgium":
      jerseyPrimary = "#991b1b"; // Dark Red
      jerseySecondary = "#fbbf24"; // Yellow
      break;
    case "Italy":
      jerseyPrimary = "#1d4ed8"; // Azure Blue
      jerseySecondary = "#ffffff";
      break;
    case "Morocco":
      jerseyPrimary = "#15803d"; // Green
      jerseySecondary = "#dc2626"; // Red
      break;
    case "Egypt":
      jerseyPrimary = "#dc2626"; // Red
      jerseySecondary = "#000000"; // Black
      break;
    case "USA":
      jerseyPrimary = "#1e3a8a"; // Navy
      jerseySecondary = "#dc2626"; // Red stripes
      hasStripes = true;
      break;
    case "Mexico":
      jerseyPrimary = "#15803d"; // Green
      jerseySecondary = "#ffffff";
      break;
    case "Canada":
      jerseyPrimary = "#dc2626"; // Red
      jerseySecondary = "#ffffff";
      break;
    case "Uruguay":
      jerseyPrimary = "#38bdf8"; // Light Blue
      jerseySecondary = "#ffffff";
      break;
    case "Croatia":
      jerseyPrimary = "#ffffff"; // Red/white checkers (we'll do stripes here)
      jerseySecondary = "#dc2626";
      hasStripes = true;
      break;
    default:
      jerseyPrimary = "#475569";
      jerseySecondary = "#64748b";
  }

  // Rarity color glows for silhouette lines
  let glowColor = "rgba(255, 255, 255, 0.4)";
  if (rarity === "icon") glowColor = "#fbbf24"; // Bright gold glow
  else if (rarity === "gold") glowColor = "#fef08a"; // Soft gold glow
  else if (rarity === "silver") glowColor = "#e2e8f0"; // Silver-white glow
  else glowColor = "#d97706"; // Bronze-copper glow

  return (
    <svg className="w-full h-full object-contain animate-fade-in" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background radial gradient inside avatar circle */}
      <defs>
        <radialGradient id={`avatar-bg-${rarity}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={rarity === "icon" ? "#1e1b4b" : "#0f172a"} />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <clipPath id="circle-clip">
          <circle cx="50" cy="50" r="45" />
        </clipPath>
      </defs>

      <circle cx="50" cy="50" r="45" fill={`url(#avatar-bg-${rarity})`} stroke={glowColor} strokeWidth="1.5" />

      {/* Styled player inside circle clip */}
      <g clipPath="url(#circle-clip)">
        {/* Silhouette Glow Background */}
        <circle cx="50" cy="38" r="18" fill={glowColor} opacity="0.15" filter="blur(4px)" />
        
        {/* Jersey body */}
        <path d="M22 85 C22 66, 32 62, 50 62 C68 62, 78 66, 78 85 L78 100 L22 100 Z" fill={jerseyPrimary} />
        
        {/* Jersey stripes if applicable */}
        {hasStripes && (
          <>
            <path d="M34 63 L34 100" stroke={jerseySecondary} strokeWidth="5" />
            <path d="M50 62 L50 100" stroke={jerseySecondary} strokeWidth="5" />
            <path d="M66 63 L66 100" stroke={jerseySecondary} strokeWidth="5" />
          </>
        )}

        {/* Jersey collar / neck trim */}
        <path d="M40 62 C40 67, 60 67, 60 62 Z" fill={jerseySecondary} />

        {/* Neck */}
        <rect x="45" y="48" width="10" height="15" fill="#fbcfe8" opacity="0.8" />

        {/* Head Silhouette */}
        <circle cx="50" cy="38" r="14" fill="#334155" />
        {/* Hair shape details */}
        <path d="M36 34 C36 22, 64 22, 64 34 C64 38, 60 30, 50 30 C40 30, 36 38, 36 34 Z" fill="#0f172a" />
        
        {/* Holographic facial shadow line */}
        <path d="M50 24 C57 24, 64 30, 64 38 C64 45, 50 52, 50 52 Z" fill={glowColor} opacity="0.08" />
      </g>
    </svg>
  );
};

export const PlayerCard = ({
  player,
  revealed = true,
  isCardBack = false,
  size = "md", // sm, md, lg
  onClick,
  isSelected = false,
  glow = true
}) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [imageError, setImageError] = useState(false);

  // Handle 3D Tilt Effect on mouse movement
  const handleMouseMove = (e) => {
    if (!revealed || isCardBack) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const angleX = -(y - yc) / (rect.height / 10); // Tilt amount up/down
    const angleY = (x - xc) / (rect.width / 10);   // Tilt amount left/right

    setTiltStyle({
      transform: `rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: "transform 0.1s ease-out"
    });

    // Glare sheen reflection movement
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    setGlareStyle({
      opacity: 0.35,
      background: `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
      transition: "opacity 0.1s ease-out"
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease"
    });
    setGlareStyle({
      opacity: 0,
      transition: "opacity 0.5s ease"
    });
  };

  const handleClick = () => {
    sound.playClick();
    if (onClick) onClick();
  };

  // Dimensions based on size parameter
  let sizeClasses = "w-44 h-64 text-xs"; // md (default)
  if (size === "sm") sizeClasses = "w-32 h-48 text-[10px]";
  if (size === "lg") sizeClasses = "w-56 h-80 text-sm";
  if (size === "xl") sizeClasses = "w-72 h-96 text-base";

  // Card styles mapping based on rarity
  let borderGlowClass = "";
  let cardBgUrl = "";
  let cardBorderColor = "";
  let rarityText = "";

  if (player) {
    switch (player.rarity) {
      case "icon":
        borderGlowClass = glow ? "glow-icon" : "border-[#ef4444]";
        cardBgUrl = "/icon_bg.png";
        cardBorderColor = "border-[#fbbf24]";
        rarityText = "🔥 ICON";
        break;
      case "gold":
        borderGlowClass = glow ? "glow-gold" : "border-[#ffd700]";
        cardBgUrl = "/gold_bg.png";
        cardBorderColor = "border-[#ffd700]";
        rarityText = "⭐ GOLD";
        break;
      case "silver":
        borderGlowClass = glow ? "glow-silver" : "border-[#c0c0c0]";
        cardBgUrl = "/silver_bg.png";
        cardBorderColor = "border-[#c0c0c0]";
        rarityText = "🥈 SILVER";
        break;
      case "bronze":
      default:
        borderGlowClass = glow ? "glow-bronze" : "border-[#cd7f32]";
        cardBgUrl = "/bronze_bg.png";
        cardBorderColor = "border-[#cd7f32]";
        rarityText = "🥉 BRONZE";
        break;
    }
  }

  // If showing card back or card is not revealed yet
  if (isCardBack || !revealed) {
    return (
      <div
        className={`relative ${sizeClasses} rounded-2xl border-4 border-[#22c55e] bg-gradient-to-br from-[#0c1f10] via-[#050b07] to-[#020603] text-gray-400 select-none shadow-2xl flex flex-col justify-between p-4 cursor-pointer overflow-hidden transform-gpu hover:scale-105 transition-all duration-300`}
        onClick={handleClick}
        style={{
          boxShadow: "0 0 15px rgba(34, 197, 94, 0.4)"
        }}
      >
        {/* Neon pitch grid lines on the back */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#020603] to-[#020603] pointer-events-none"></div>

        {/* Corner glowing laser brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#22c55e]"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#22c55e]"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#22c55e]"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#22c55e]"></div>

        <div className="text-center font-bebas tracking-widest text-[#22c55e] text-opacity-80">TEAM FC 26</div>

        {/* Center glowing logo */}
        <div className="flex flex-col items-center justify-center my-auto">
          <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#22c55e] flex items-center justify-center animate-[spin_10s_linear_infinite]">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] bg-opacity-20 flex items-center justify-center">
              <span className="text-2xl font-bold font-bebas text-[#22c55e]">?</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
          Team FC Battle Card
        </div>
      </div>
    );
  }

  // Position colors
  const posColors = {
    GK: "bg-yellow-600 text-yellow-950",
    DEF: "bg-blue-600 text-white",
    MID: "bg-green-600 text-white",
    FWD: "bg-red-600 text-white"
  };

  const headshotUrl = getPlayerHeadshot(player.id);

  return (
    <div
      ref={cardRef}
      className={`relative ${sizeClasses} rounded-2xl border-4 ${cardBorderColor} ${borderGlowClass} select-none shadow-2xl overflow-hidden cursor-pointer transform-gpu preserve-3d`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        backgroundImage: `url(${cardBgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...tiltStyle
      }}
    >
      {/* 3D Holographic Foil Shimmer Overlay */}
      {player.rarity === "icon" && <div className="absolute inset-0 shimmer-overlay mix-blend-color-dodge pointer-events-none opacity-40"></div>}
      <div className="absolute inset-0 foil-glare opacity-20" style={glareStyle}></div>

      {/* Selected checkbox overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-gold bg-opacity-20 border-4 border-gold z-30 flex items-center justify-center animate-pulse">
          <div className="bg-gold text-black rounded-full p-2 shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* TOP SECTION: OVR, Position, Nation Flag */}
      <div className="absolute top-2 left-2 flex flex-col items-center z-10 leading-none">
        <span className="text-2xl md:text-3xl font-extrabold font-bebas text-white drop-shadow-md">
          {player.ovr}
        </span>
        <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-bold ${posColors[player.position]} drop-shadow-sm`}>
          {player.position}
        </span>
        <span className="mt-1.5 text-base md:text-lg filter drop-shadow" title={player.nation}>
          {player.flag}
        </span>
      </div>

      {/* TOP RIGHT: Club Info */}
      <div className="absolute top-2 right-2 flex flex-col items-end z-10">
        <span className="text-[8px] md:text-[10px] font-medium text-gray-300 bg-black bg-opacity-40 px-1.5 py-0.5 rounded backdrop-blur-xs">
          {player.club}
        </span>
      </div>

      {/* CENTER: Player Image with Avatar Fallback */}
      <div className="absolute top-10 left-0 right-0 bottom-20 flex items-center justify-center px-4 overflow-hidden">
        {!imageError && headshotUrl ? (
          <img
            src={headshotUrl}
            alt={player.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-[110%] w-auto object-contain z-10 drop-shadow-[0_8px_12px_rgba(0,0,0,0.65)] transform hover:scale-[1.08] transition-transform duration-300 translate-y-1"
          />
        ) : (
          <PlayerAvatar nation={player.nation} rarity={player.rarity} position={player.position} />
        )}
      </div>

      {/* BOTTOM SECTION: Name, Rarity, Stats */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/85 to-transparent pt-6 pb-2 px-2 flex flex-col items-center">
        {/* Player Name */}
        <h3 className="font-bebas text-lg md:text-xl text-white text-center leading-tight tracking-wider truncate w-full drop-shadow-md">
          {player.name}
        </h3>

        {/* Rarity label */}
        <span className="text-[7px] md:text-[8px] font-extrabold text-gold tracking-widest uppercase mb-1.5">
          {rarityText} CARD
        </span>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 w-full text-center border-t border-gray-700/50 pt-1.5 text-[9px] md:text-[11px] font-semibold text-gray-300">
          <div className="flex flex-col">
            <span className="text-[7px] text-gray-500 font-bold uppercase">PAC</span>
            <span className="text-white font-bold">{player.stats.pac}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] text-gray-500 font-bold uppercase">SHO</span>
            <span className="text-white font-bold">{player.stats.sho}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] text-gray-500 font-bold uppercase">PAS</span>
            <span className="text-white font-bold">{player.stats.pas}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] text-gray-500 font-bold uppercase">PHY</span>
            <span className="text-white font-bold">{player.stats.phy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
