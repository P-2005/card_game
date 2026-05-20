import { players } from "../data/players";

export const getWeightedRandomPlayer = () => {
  const roll = Math.random() * 100;
  let targetRarity = "bronze";

  if (roll < 40) {
    targetRarity = "bronze";
  } else if (roll < 60) {
    targetRarity = "silver";
  } else if (roll < 90) {
    targetRarity = "gold";
  } else {
    targetRarity = "icon";
  }

  // Filter players by target rarity
  let candidates = players.filter(p => p.rarity === targetRarity);

  // Fallback if candidates is empty
  if (candidates.length === 0) {
    candidates = players;
  }

  // Choose a random player from candidates
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};
