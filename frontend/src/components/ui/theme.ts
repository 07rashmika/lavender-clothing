// Shared design tokens for the Lavender Clothing frontend.
// Import this anywhere instead of hardcoding hex values, so a palette
// tweak only needs to happen in one place.

export const colors = {
  // Brand
  primary: "#c0395a",       // main rose/pink - buttons, prices, accents
  primaryDark: "#a02848",   // hover/gradient end
  primarySoft: "#c6558a",   // softer rose used on bag/checkout CTAs
  purple: "#5b2d8e",        // secondary accent - nav icons, category active state
  purpleDark: "#7b2fa8",    // gradient / "Limited" tag

  // Backgrounds
  pageBg: "#fdf6f9",        // main page background (bag, checkout, contact, wishlist)
  pageBgAlt: "#fdf8fb",     // shop/home page background
  cardBg: "#ffffff",
  subtleBg: "#fdf3f6",      // input backgrounds, hover fills

  // Text
  textDark: "#2d1a3a",      // headings
  textBody: "#3d2e4a",      // body/product names
  textMuted: "#6a5a74",     // secondary text
  textFaint: "#8a7a94",     // captions, subtitles
  textPlaceholder: "#a89ab0",

  // Borders
  border: "#e8dce8",

  // Status tags
  tagNew: "#c0395a",
  tagHot: "#ff6b35",
  tagLimited: "#7b2fa8",
  tagSale: "#7b2fa8",

  // Feedback
  warningBg: "#fdf6e3",
  warningBorder: "#f0e0b0",
  warningText: "#8a6d3d",
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 50,
};

export const shadow = {
  card: "0 2px 10px rgba(150,100,150,0.06)",
  cardHover: "0 8px 24px rgba(192,57,90,0.12)",
};

export const fonts = {
  heading: "'Georgia', serif",
  body: "'Inter', 'Segoe UI', sans-serif",
};