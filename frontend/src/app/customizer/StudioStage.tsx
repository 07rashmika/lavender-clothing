"use client";

import { useRef, useState } from "react";
import type { DesignLayer, GarmentPart, PrintTarget } from "./Studio";

export type StudioTool = "select" | "move" | "text" | "image";
type Region = { left: number; top: number; width: number; height: number };
interface Props {
  tool: StudioTool;
  activeLayerId: string | null;
  selectedPart: GarmentPart | null;
  layers: DesignLayer[];
  panelColors: Record<GarmentPart, string>;
  onSelectPanel: (part: GarmentPart, target?: PrintTarget) => void;
  onDeselectPart: () => void;
  onDesignMoveStart: () => void;
  onDesignMove: (id: string, position: [number, number]) => void;
  onLayerSelect: (id: string) => void;
}
const regions: Record<PrintTarget, Region> = {
  "left-sleeve": { left: 4, top: 7, width: 16, height: 43 },
  "right-sleeve": { left: 80, top: 7, width: 16, height: 43 },
  front: { left: 20, top: 22, width: 27, height: 67 },
  back: { left: 53, top: 22, width: 27, height: 67 },
};
const pointFor = (layer: DesignLayer) => {
  const region = regions[layer.target];
  return {
    left: region.left + region.width * (0.5 + layer.position[0]),
    top: region.top + region.height * (0.5 - (layer.position[1] - 0.35) / 0.6),
  };
};

export default function StudioStage({
  tool,
  activeLayerId,
  selectedPart,
  layers,
  panelColors,
  onSelectPanel,
  onDeselectPart,
  onDesignMoveStart,
  onDesignMove,
  onLayerSelect,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const moveLayer = (id: string, clientX: number, clientY: number) => {
    const layer = layers.find((item) => item.id === id);
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds || !layer) return;
    const region = regions[layer.target];
    const xPercent = ((clientX - bounds.left) / bounds.width) * 100;
    const yPercent = ((clientY - bounds.top) / bounds.height) * 100;
    const padding = Math.min(0.16, 0.045 + layer.scale * 0.055);
    const x = (xPercent - (region.left + region.width / 2)) / region.width;
    const y =
      0.35 +
      ((region.top + region.height / 2 - yPercent) / region.height) * 0.6;
    onDesignMove(id, [
      Math.min(0.42 - padding, Math.max(-0.42 + padding, x)),
      Math.min(0.65 - padding, Math.max(0.05 + padding, y)),
    ]);
  };
  const selectedStyle = (part: GarmentPart) => ({
    stroke: selectedPart === part ? "#1677ff" : "#242228",
    strokeWidth: selectedPart === part ? 5 : 1.5,
  });
  const visual = (layer: DesignLayer) => {
    const point = pointFor(layer);
    const textPixels = Math.round(12 + ((layer.scale - 0.05) / 0.17) * 60);
    return (
      <div
        key={layer.id}
        onPointerDown={(event) => {
          event.stopPropagation();
          onLayerSelect(layer.id);
          if (tool !== "move" && tool !== "select") return;
          onDesignMoveStart();
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(layer.id);
        }}
        style={{
          position: "absolute",
          left: `${point.left}%`,
          top: `${point.top}%`,
          transform: `translate(-50%, -50%) scale(${layer.type === "logo" ? layer.scale : 1})`,
          cursor: tool === "move" ? "grab" : "pointer",
          outline: activeLayerId === layer.id ? "2px dashed #1677ff" : "none",
          padding: 5,
          userSelect: "none",
          zIndex: activeLayerId === layer.id ? 2 : 1,
        }}
      >
        {layer.type === "logo" ? (
          <img
            src={layer.content}
            alt="Design"
            draggable={false}
            style={{
              width: 74,
              height: 74,
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              color: layer.color,
              fontFamily: layer.font,
              fontWeight: 700,
              fontSize: textPixels,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {layer.content}
          </div>
        )}
      </div>
    );
  };
  return (
    <div
      ref={stageRef}
      onPointerMove={(event) =>
        dragging && moveLayer(dragging, event.clientX, event.clientY)
      }
      onPointerUp={() => setDragging(null)}
      onPointerCancel={() => setDragging(null)}
      onClick={(event) => {
        const target = event.target as Element;
        if (target === event.currentTarget || target.tagName.toLowerCase() === "svg") onDeselectPart();
      }}
      style={{
        position: "relative",
        width: "min(620px, 94%)",
        aspectRatio: "1.1",
        background: "#fff",
        border: "1px solid #e2e0e5",
        borderRadius: 18,
        boxShadow: "0 18px 36px rgba(28,25,32,.08)",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 700 665"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <g strokeLinejoin="round">
          <path
            fill={panelColors["left-sleeve"]}
            onClick={() => onSelectPanel("left-sleeve", "left-sleeve")}
            {...selectedStyle("left-sleeve")}
            d="M33 58 C74 46 96 65 112 100 L132 318 L72 330 L43 139 Z"
          />
          <path
            fill={panelColors["right-sleeve"]}
            onClick={() => onSelectPanel("right-sleeve", "right-sleeve")}
            {...selectedStyle("right-sleeve")}
            d="M667 58 C626 46 604 65 588 100 L568 318 L628 330 L657 139 Z"
          />
          <path
            fill={panelColors.collar}
            onClick={() => onSelectPanel("collar")}
            {...selectedStyle("collar")}
            d="M285 35 Q350 85 415 35 L405 61 Q350 103 295 61 Z"
          />
          <path
            fill={panelColors.front}
            onClick={() => onSelectPanel("front", "front")}
            {...selectedStyle("front")}
            d="M125 180 L190 145 Q230 175 270 145 L335 180 L315 240 L315 590 L145 590 L145 240 Z"
          />
          <path
            fill={panelColors.back}
            onClick={() => onSelectPanel("back", "back")}
            {...selectedStyle("back")}
            d="M365 180 L430 145 Q470 175 510 145 L575 180 L555 240 L555 590 L385 590 L385 240 Z"
          />
        </g>
        <g
          fill="#5c5661"
          fontSize="13"
          fontFamily="Inter, Arial"
          textAnchor="middle"
        >
          <text x="350" y="100">
            Collar
          </text>
          <text x="82" y="355">
            Left sleeve
          </text>
          <text x="618" y="355">
            Right sleeve
          </text>
          <text x="235" y="620">
            Front body
          </text>
          <text x="455" y="620">
            Back body
          </text>
        </g>
      </svg>
      {layers.map(visual)}
    </div>
  );
}
