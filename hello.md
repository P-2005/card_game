# System Instructions: AntiGravity — World Cup 2026 Card Battle Game

## Project Overview

Build a **football card battle game** for the FIFA World Cup 2026, inspired by WWE SuperCard.
Players earn cards by answering AI-generated World Cup quizzes. Every correct answer
triggers a walkout-style card reveal. Users need at least 3 cards to unlock 1v1 battle mode.
The app uses the **Anthropic Claude API** for quiz generation and runs fully in-browser
with React + Tailwind CSS. No backend required — all state lives in React + localStorage.

---

## Navigation Structure

### Top Navigation (Desktop)
- Home (default view)
- Earn Cards (Quiz mode)
- Battle (locked until 3 cards earned)
- My Squad
- Leaderboard *(future)*

### Bottom Navigation (Mobile)
- 🏠 Home
- 🧠 Quiz
- ⚔️ Battle
- 📋 Squad

### Header Elements
- Dark/Light mode toggle
- Card count badge (🃏 X cards) — always visible top-right
- Streak counter (🔥 X correct in a row)
- Sound toggle (muted by default)
- User avatar placeholder

---

## Home Screen

### Hero Section
- Animated title: "⚽ ANTIGRAVITY — WORLD CUP CARD BATTLE 2026"
- Subtitle: "Answer. Earn. Battle. Dominate."
- Stadium background: dark navy (#0a0f1e) with animated green pitch glow
- Crowd silhouette at the bottom (CSS only)

### Action Buttons (large, prominent)
- "EARN CARDS 🧠" → navigates to Quiz screen
- "KICK OFF ⚽" → navigates to Battle screen (locked icon if < 3 cards)
- "MY SQUAD 📋" → navigates to Squad screen

### Progress Gate Banner
- Shown when user has fewer than 3 cards
- Text: "Earn 3 cards to unlock battles! You have X/3"
- Animated progress bar (gold fill)

### Recent Card Earned (optional)
- Shows last pulled card in mini format below buttons

---

## Quiz Screen ("Earn Cards")

### Quiz Flow
1. User lands on quiz screen
2. App calls Claude API to generate one World Cup question
3. Question displayed with 4 answer buttons (A / B / C / D)
4. User selects answer → immediate feedback:
   - ✅ Correct: green flash + "CORRECT! 🎉" banner + fun fact text
   - ❌ Wrong: red shake animation + "WRONG! 😬" + correct answer revealed
5. Correct answer → triggers Walkout Card Reveal sequence
6. Wrong answer → "Try Again?" button shown, no card awarded

### Question UI
- Topic badge shown on every question (e.g. "📖 World Cup History")
- Question text: large, centered, bold
- 4 answer buttons: colorful (A=blue, B=green, C=orange, D=purple)
- Fun fact box appears below after answer is revealed
- "Next Question ➡️" button after fact shown

### Claude API Integration
- Endpoint: POST https://api.anthropic.com/v1/messages
- Model: claude-sonnet-4-20250514
- max_tokens: 400
- System prompt instructs Claude to return ONLY valid JSON:
  { question, options: [4 strings], correct: 0–3, fact: string }
- Random topic hint injected each call from:
  ["history", "records", "2026 tournament", "famous goals", "World Cup winners",
   "top scorers", "iconic moments", "player facts", "host countries", "group stage facts"]
- Wrap JSON.parse in try/catch; retry API call on parse failure

---

## Walkout Card Reveal Screen

### Triggered after every correct quiz answer

### Animation Sequence (pure CSS keyframes, no libraries)

**Step 1 — Blackout + Spotlight (0.5s)**
- Full screen fades to black
- Single spotlight beam sweeps across center
- Text: "YOUR REWARD AWAITS..." (gold, pulsing)

**Step 2 — Stadium Effect (1s)**
- Background flickers with crowd silhouette (white flash animation)
- Confetti particles rain from top of screen

**Step 3 — Card Slides In (1.5s)**
- Face-down card (dark, "?" on front) slides up from bottom
- Card glows in rarity color before reveal
- Subtle rotation/wobble effect

**Step 4 — Card Flip Reveal (0.8s)**
- Card flips 180° on Y-axis (CSS 3D transform, backface-visibility)
- Player name appears with typewriter animation
- Rarity badge drops in from top:
  - 90+ OVR → "🔥 ICON CARD!"
  - 85–89 OVR → "⭐ GOLD CARD!"
  - 80–84 OVR → "🥈 SILVER CARD!"
  - 70–79 OVR → "🥉 BRONZE CARD!"

**Step 5 — Celebration (1s)**
- Icon tier: full-screen gold shimmer + "🔥 LEGENDARY PULL!"
- Gold tier: golden confetti + "⭐ GREAT PULL!"
- Silver/Bronze: green burst + "✅ CARD EARNED!"
- "ADDED TO YOUR SQUAD" text fades in below card

**Step 6 — Action Buttons**
- "QUIZ AGAIN 🧠"
- "VIEW MY SQUAD 📋"

### Card Award Logic
- Random card picked from full player database
- Weighted rarity: 60% Bronze/Silver | 30% Gold | 10% Icon
- Duplicate cards allowed (shown as "x2" badge in squad view)
- Card saved to localStorage immediately on award

---

## Battle Screen

### Access Gate
- Locked with padlock icon until user has ≥ 3 cards
- Message: "Earn 3 cards to unlock battles! You have X/3 cards"
- Unlock animation plays when threshold is first reached

### Pre-Battle: Squad Selection
- User picks any 5 cards from their earned collection as their hand
- Cards displayed as selectable tiles with checkbox
- "READY TO BATTLE ⚔️" confirm button

### Battle Arena Layout
- Desktop: CPU hand top / Player hand bottom, side-by-side battlefield
- Mobile: stacked layout, CPU face-down top, player picks bottom

### Match Flow (Best of 3 Rounds)
1. Player picks one card from their 5-card hand (10-second timer)
2. CPU auto-picks randomly from its 5 cards (drawn from full database)
3. "3...2...1...REVEAL!" countdown animation
4. Both cards flip simultaneously
5. Random stat selected each round: PAC / SHO / PAS / PHY
6. Stat category banner drops from top: e.g. "PACE BATTLE ⚡"
7. Higher stat wins the round — winning stat glows gold on both cards
8. Round result shown: "ROUND WIN ✅" or "ROUND LOSS ❌"
9. Win 2/3 rounds = Match Won

### Victory / Defeat Screens
- Win: "CHAMPION! 🏆" + confetti animation + winner card enlarged with gold glow
- Lose: "FULL TIME 😤" + screen shake + "Quiz for more cards?" button

---

## My Squad Screen

### Collection Gallery
- Grid layout: 3 columns mobile / 5 columns desktop
- Each card shows: player name, nation flag emoji, club, position, OVR, 4 stat bars
- Rarity glow border on every card
- Icon cards have continuous CSS shimmer animation

### Filters & Search
- Filter by: Rarity | Nation | Position
- Search bar: filter by player name (live filter, no API call)
- Sort by: OVR (high→low) | Recently Earned | Rarity

### Empty State
- When 0 cards: "No cards yet! Go quiz to earn your first player 🧠"
- Animated bouncing ball illustration (CSS only)

### Card Detail (on tap/click)
- Modal expands the card full-screen
- Shows all 4 stats with animated bar fill
- Shows rarity tier and OVR badge
- "Duplicate x2" badge if owned more than once

---

## Player Card Component

### Card Face Elements
- Player initial avatar (colored circle, color based on rarity)
- Nation flag emoji (top-left)
- Club name (small, top-right)
- Position badge (colored pill: GK=yellow, DEF=blue, MID=green, FWD=red)
- OVR: large bold number (center)
- Player name: bold, bottom section
- 4 stat bars: PAC / SHO / PAS / PHY with animated fill on render

### Rarity Tier System (FC26 based)
- Bronze: OVR 70–79 | border #cd7f32 | soft orange glow
- Silver: OVR 80–84 | border #c0c0c0 | soft silver glow
- Gold:   OVR 85–89 | border #ffd700 | golden glow
- Icon:   OVR 90+   | border animated orange-red gradient | shimmer effect

### Card Hover Effect
- Subtle 3D CSS tilt on hover (perspective transform, mouse tracking optional)
- Slight scale-up (1.05x) on hover

---

## Player Database

### Source
- All players are World Cup 2026 confirmed squad members
- Ratings based on official EA Sports FC 26 database
- Stats: PAC (Pace) · SHO (Shooting) · PAS (Passing) · PHY (Physicality)

### Coverage (80+ players across all nations)
- Nations included: 🇫🇷 France, 🇪🇸 Spain, 🇩🇪 Germany, 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England, 🇧🇷 Brazil,
  🇦🇷 Argentina, 🇵🇹 Portugal, 🇳🇱 Netherlands, 🇧🇪 Belgium, 🇮🇹 Italy,
  🇳🇴 Norway, 🇸🇪 Sweden, 🇩🇰 Denmark, 🇭🇷 Croatia, 🇲🇦 Morocco,
  🇪🇬 Egypt, 🇸🇳 Senegal, 🇯🇵 Japan, 🇰🇷 South Korea, 🇺🇸 USA,
  🇨🇦 Canada, 🇲🇽 Mexico, 🇺🇾 Uruguay, 🇷🇸 Serbia, 🇵🇱 Poland,
  🇨🇭 Switzerland, 🇭🇺 Hungary, 🇩🇿 Algeria, 🇬🇭 Ghana

### Top Rated Players (Icon Tier 90+)
- Kylian Mbappé (🇫🇷, Real Madrid, ST, 91 OVR)
- Mohamed Salah (🇪🇬, Liverpool, RW, 91 OVR)
- Ousmane Dembélé (🇫🇷, PSG, ST, 90 OVR)
- Rodri (🇪🇸, Man City, CDM, 90 OVR)
- Virgil van Dijk (🇳🇱, Liverpool, CB, 90 OVR)
- Jude Bellingham (🏴󠁧󠁢󠁥󠁮󠁧󠁿, Real Madrid, CAM, 90 OVR)
- Erling Haaland (🇳🇴, Man City, ST, 90 OVR)

---

## Data Persistence

### localStorage Keys
- `antigravity_cards` — array of earned player card objects
- `antigravity_streak` — current correct answer streak (integer)
- `antigravity_stats` — { quizzesAnswered, correctAnswers, battlesPlayed, battlesWon }

### On App Load
- Read localStorage and hydrate React state
- Show "Welcome back! You have X cards 🃏" toast if returning user

---

## Component Structure

```
src/
├── App.jsx                  — screen router + global state
├── data/
│   └── players.js           — full player database (80+ players)
├── screens/
│   ├── HomeScreen.jsx        — welcome landing page
│   ├── QuizScreen.jsx        — AI quiz + answer UI
│   ├── WalkoutScreen.jsx     — card reveal animation sequence
│   ├── BattleScreen.jsx      — 1v1 battle arena
│   └── SquadScreen.jsx       — earned card collection gallery
├── components/
│   ├── PlayerCard.jsx        — reusable card (all variants)
│   ├── RoundBanner.jsx       — animated round result overlay
│   ├── CardModal.jsx         — full-screen card detail view
│   ├── ProgressGate.jsx      — 3-card lock banner
│   └── NavBar.jsx            — top (desktop) + bottom (mobile) nav
└── utils/
    ├── claudeApi.js          — Claude API call + JSON parse logic
    ├── cardDrop.js           — weighted random card award logic
    └── storage.js            — localStorage read/write helpers
```

---

## Design System

### Colors
- Background:     #0a0f1e (deep navy)
- Surface:        #111827 (dark card bg)
- Accent Gold:    #ffd700
- Accent Green:   #22c55e (pitch green)
- Text Primary:   #f9fafb
- Text Secondary: #9ca3af
- Error Red:      #ef4444
- Success Green:  #22c55e

### Typography
- Headings: "Bebas Neue" (Google Fonts) — all caps, wide tracking
- Body:     "Inter" (Google Fonts) — clean, readable

### Animations (all pure CSS keyframes)
- `@keyframes cardFlip`       — Y-axis 3D card reveal
- `@keyframes slideUp`        — card entering from bottom
- `@keyframes confetti`       — particle rain
- `@keyframes shimmer`        — Icon card continuous glow
- `@keyframes shakeX`         — wrong answer shake
- `@keyframes spotlightSweep` — walkout spotlight beam
- `@keyframes typewriter`     — player name reveal
- `@keyframes glowPulse`      — rarity border breathing glow

### Responsive Breakpoints
- Mobile:  < 768px  → stacked layout, bottom nav, 160px cards
- Desktop: ≥ 768px  → side-by-side layout, top nav, 220px cards

---

## Build Order (recommended)

1. `data/players.js` — full player database
2. `PlayerCard.jsx` — card component with rarity styles
3. `SquadScreen.jsx` — gallery to verify cards render correctly
4. `claudeApi.js` + `QuizScreen.jsx` — quiz flow with API
5. `WalkoutScreen.jsx` — full walkout animation sequence
6. `cardDrop.js` — weighted random card logic
7. `BattleScreen.jsx` — match arena with squad gate
8. `HomeScreen.jsx` + `NavBar.jsx` — tie everything together
9. Wire `localStorage` persistence throughout via `storage.js`