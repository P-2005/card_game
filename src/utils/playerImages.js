// SoFIFA ID Mapping for the 80+ World Cup Players to fetch official headshots
const SOFIFA_IDS = {
  // ICON TIER (90+ OVR)
  mbappe: 231747,
  salah: 209331,
  haaland: 239085,
  rodri: 231866,
  vandijk: 203376,
  bellingham: 256630,
  dembele: 231443,

  // GOLD TIER (85-89 OVR)
  kane: 202126,
  debruyne: 192985,
  vinicius: 238794,
  messi: 158023,
  griezmann: 194765,
  lewandowski: 188545,
  valverde: 239053,
  dias: 239818,
  lautaro: 231478,
  musiala: 256790,
  saka: 246781,
  wirtz: 256868,
  son: 200104,
  courtois: 192119,
  donnarumma: 230621,
  alisson: 212831,
  marquinhos: 207865,
  pedri: 251852,
  kvaratskhelia: 247631,
  modric: 177003,
  ronaldo: 20801,
  bastoni: 237156,
  hakimi: 235212,
  dejong: 228702,

  // SILVER TIER (80-84 OVR)
  leao: 241721,
  maddison: 220697,
  tchouameni: 240990,
  rudiger: 205452,
  martinez_e: 202811,
  depay: 202556,
  stones: 203574,
  szoboszlai: 236007,
  enzo: 264240,
  raphinha: 243580,
  militao: 240130,
  chiesa: 235073,
  amadou: 253163,
  nunez: 243577,
  romero: 232488,
  macallister: 242444,
  guler: 268421,
  mendy: 228618,
  xavi_simons: 256754,
  pulisic: 227796,
  kolo_muani: 253258,
  kossounou: 253457,
  senesi: 233419,

  // BRONZE TIER (70-79 OVR)
  davies: 234396,
  gimenez: 255301,
  marmoush: 241852,
  kudus: 244675,
  balogun: 252957,
  david: 243627,
  alvarez_e: 239335,
  sarr: 259253,
  endo: 222665,
  minamino: 222492,
  dest: 251570,
  lee_kang_in: 243781,
  mitoma: 259825,
  hincapie: 256958,
  weah: 238160,
  reyna: 253218,
  scally: 256191,
  chavez: 235222,
  antuna: 235805,
  eustaquio: 243575,
  kone: 258814,
  bounou: 205498,
  hojlund: 263620,
  bah: 246700,
  milik: 204837,
  kiwior: 257121,
  elneny: 209297,
  trezeguet: 234376
};

/**
 * Returns the official transparent headshot image URL from SoFIFA CDN for a player.
 * Falls back to DiceBear stylized adventurer vector avatars if no ID is found.
 */
export const getPlayerHeadshot = (playerId) => {
  const sofifaId = SOFIFA_IDS[playerId];
  if (!sofifaId) {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(playerId)}`;
  }
  const idStr = sofifaId.toString().padStart(6, "0");
  const part1 = idStr.substring(0, 3);
  const part2 = idStr.substring(3);
  
  // Return the official FIFA/FC Miniface render URL
  return `https://cdn.sofifa.net/players/${part1}/${part2}/24_120.png`;
};
