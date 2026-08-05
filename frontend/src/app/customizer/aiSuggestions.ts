import type { DesignLayer, PrintTarget } from "./Studio";

export type FontSuggestion = { font: string; reason: string; color: string };
export type PlacementSuggestion = {
  target: PrintTarget;
  position: [number, number];
  label: string;
  reason: string;
};
export type AiSuggestions = {
  fonts: FontSuggestion[];
  placements: PlacementSuggestion[];
};

// This is deliberately a pure, local fallback. Replace `getAiSuggestions`
// with `fetch('/api/customizer/ai-suggestions', ...)` when the AI endpoint is
// ready. The UI and response contract can remain exactly the same.
export async function getAiSuggestions(
  layer: DesignLayer | null,
): Promise<AiSuggestions> {
  const isText = layer?.type === "text";
  const content = layer?.content.trim() ?? "";
  const shortText = content.length <= 8;
  return {
    fonts: isText
      ? [
          {
            font: shortText ? "Anton" : "Montserrat",
            color: "#171717",
            reason: shortText
              ? "Strong and readable for short statements."
              : "Balanced and legible for longer copy.",
          },
          {
            font: "Oswald",
            color: "#392354",
            reason: "Compact editorial look with good vertical rhythm.",
          },
          {
            font: "Pacifico",
            color: "#8d2ac0",
            reason: "A softer accent option for a personal message.",
          },
        ]
      : [],
    placements: [
      {
        target: "front",
        position: [0, 0.39],
        label: "Front centre",
        reason: "The safest high-visibility print area.",
      },
      {
        target: "back",
        position: [0, 0.42],
        label: "Back centre",
        reason: "Works well for larger statements or artwork.",
      },
      {
        target: "left-sleeve",
        position: [0, 0.36],
        label: "Left sleeve",
        reason: "A subtle accent placement for small logos.",
      },
      {
        target: "right-sleeve",
        position: [0, 0.36],
        label: "Right sleeve",
        reason: "Balanced alternative for a small logo or sleeve detail.",
      },
    ],
  };
}
