import confetti from "canvas-confetti";

// SafeWander palette confetti — uses HSL semantic vibes baked into hex equivalents.
const COLORS = ["#F26A4F", "#36B7A6", "#FBC04A", "#7AD3C5", "#FFD58A"];

export const popConfetti = (origin: { x?: number; y?: number } = {}) => {
  confetti({
    particleCount: 80,
    spread: 75,
    startVelocity: 38,
    scalar: 0.9,
    ticks: 180,
    origin: { x: origin.x ?? 0.5, y: origin.y ?? 0.6 },
    colors: COLORS,
  });
};

export const burstFromEvent = (e: { clientX: number; clientY: number }) => {
  popConfetti({
    x: e.clientX / window.innerWidth,
    y: e.clientY / window.innerHeight,
  });
};

export const FUN_LOADING_LINES = [
  "Asking locals for the inside scoop…",
  "Sniffing out tourist traps 🕵️",
  "Checking the weather gods ☀️",
  "Mapping pharmacies near you 💊",
  "Memorising emergency numbers 📞",
  "Packing your imaginary bag 🎒",
  "Translating 'help!' into 12 languages 🌍",
  "Cross-checking with safety advisories…",
  "Brewing your perfect brief ☕",
];

export const TRAVEL_QUIPS = [
  "Wander wisely ✨",
  "The world is huge. Bring snacks. 🍪",
  "Lost? Good. That's where stories live.",
  "Pack light. Worry lighter.",
  "New city, who dis? 📍",
  "Your passport's favourite app.",
];
