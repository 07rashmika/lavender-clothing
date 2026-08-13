"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Canvas3D from "./Canvas3D";
import Studio from "./Studio";
import { useSearchParams } from "next/navigation";

const silhouettes = ["Classic T-Shirt"];
const fits = ["Relaxed", "Regular", "Slim Fit"];
const sizes = ["XS", "S", "M", "L", "XL"];
const colors = [
  "#c8d0f0",
  "#f5d060",
  "#f5a060",
  "#f09090",
  "#333333",
  "#e8e8e8",
];
const colorNames = [
  "Lavender",
  "Butter",
  "Peach",
  "Blush",
  "Midnight",
  "White",
];
const textColors = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#2196f3",
  "#4caf50",
  "#ff9800",
  "#9c27b0",
  "#795548",
];
const fontStyles = [
  "Anton",
  "BebasNeue",
  "Cinzel",
  "Inter-Italic",
  "Inter",
  "Montserrat-Italic",
  "Montserrat",
  "Oswald",
  "Pacifico",
];
const materials = ["Organic Cotton", "Bamboo Blend", "Linen Mix", "Silk Touch"];

const inspirations = [
  { name: "Retro Bloom", bg: "#f5c8a0", accent: "#e05080" },
  { name: "Modern Serif", bg: "#f0f0f0", accent: "#333" },
  { name: "Digital Glitch", bg: "#ff6a00", accent: "#fff" },
  { name: "Watercolour Haze", bg: "#c8d8f0", accent: "#7b2fa8" },
];

function CustomizerContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedSilhouette, setSelectedSilhouette] = useState(0);
  const [selectedFit, setSelectedFit] = useState("Regular");
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColor, setSelectedColor] = useState(0);
  const [activePanel, setActivePanel] = useState<"body" | "sleeves" | "collar">(
    "body",
  );
  const [activeTool, setActiveTool] = useState<
    "select" | "move" | "draw" | "text" | "image" | "shape"
  >("select");
  const [panelColors, setPanelColors] = useState<
    Record<"body" | "sleeves" | "collar", string>
  >({
    body: colors[0],
    sleeves: colors[0],
    collar: colors[0],
  });
  const [customText, setCustomText] = useState("");
  const [selectedFont, setSelectedFont] = useState("Playfair Display");
  const [selectedMaterial, setSelectedMaterial] = useState("Organic Cotton");
  const [textColor, setTextColor] = useState("#2d1a3a");
  const [textSize, setTextsize] = useState(0.11);
  const [designSide, setDesignSide] = useState<"front" | "back">("front");
  const [artworkPosition, setArtworkPosition] = useState<[number, number]>([
    0, 0.35,
  ]);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [textPosition, setTextPosition] = useState<[number, number]>([0, 0.35]);
  const [textRotation, setTextRotation] = useState(0);
  const [letterspacing, setLetterSpacing] = useState(0);
  const [artworkScale, setArtworkScale] = useState(1);
  const [logoRotation, setLogoRotation] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const designSummary = useMemo(
    () => `${silhouettes[selectedSilhouette]} — ${selectedFit}`,
    [selectedFit, selectedSilhouette],
  );
  const estimatedPrice =
    45 +
    (selectedMaterial === "Silk Touch"
      ? 20
      : selectedMaterial === "Bamboo Blend"
        ? 10
        : 0);
  const searchParams = useSearchParams();
  const designId = searchParams.get("designId");
  const isEditing = !!designId;
  const [loadedDesign, setLoadedDesign] = useState<any>(null);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.url;
  };

  const uploadPreviewToCloudinary = async () => {
    if (!renderer) return null;

    const dataUrl = renderer.domElement.toDataURL("image/png");

    const blob = await (await fetch(dataUrl)).blob();

    const file = new File([blob], "tshirt-preview.png", {
      type: "image/png",
    });

    return await uploadToCloudinary(file);
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) await addLogoFile(file);
  };

  const addLogoFile = async (file: File) => {
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      setSubmitError("Please upload a PNG, JPG, or SVG design.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("Your design must be smaller than 2 MB.");
      return;
    }

    // Show the uploaded image in the preview immediately. A cloud upload can
    // take a moment, and a local preview keeps the editor responsive.
    const localPreview = URL.createObjectURL(file);
    setLogo(localPreview);

    try {
      setSubmitError(null);

      const imageUrl = await uploadToCloudinary(file);

      setLogo(imageUrl);
    } catch (error) {
      console.error(error);
      setSubmitError(
        "The image is displayed locally, but could not be saved to the server yet.",
      );
    }
  };

  const resetDesignForSilhouette = (silhouetteIndex: number) => {
    setSelectedSilhouette(silhouetteIndex);
    setSelectedColor(0);
    setPanelColors({ body: colors[0], sleeves: colors[0], collar: colors[0] });
    setSelectedMaterial("Organic Cotton");
    setCustomText("");
    setLogo(null);
    setTextPosition([0, 0.35]);
    setArtworkPosition([0, 0.35]);
    setTextRotation(0);
    setLogoRotation(0);
    setArtworkScale(1);
    setResetToken((token) => token + 1);
  };

  const handleDownload = () => {
    if (!renderer) return;

    const link = document.createElement("a");
    link.download = "my-tshirt-design.png";
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      await api.post("/customizations", {
        fabric: selectedMaterial,
        color: colorNames[selectedColor],
        cut: designSummary,
        size: selectedSize,
        quantity,
        customText: customText || undefined,
        fontStyle: customText ? selectedFont : undefined,
        designPreview: "https://res.cloudinary.com/.../shirt-preview.png",
        notes: customText
          ? `Custom text: "${customText}" (${selectedFont})`
          : "",
        estimatedPriceCents: Math.round(estimatedPrice * 100 * quantity),
        designConfig: {
          version: 1,

          silhouette: silhouettes[selectedSilhouette],
          fit: selectedFit,
          size: selectedSize,

          material: selectedMaterial,

          color: {
            name: colorNames[selectedColor],
            hex: colors[selectedColor],
          },

          artwork: {
            side: designSide,
            image: logo,

            position: {
              x: artworkPosition[0],
              y: artworkPosition[1],
            },

            scale: artworkScale,
            rotation: logoRotation,
          },

          text: {
            value: customText,
            font: selectedFont,
            color: textColor,

            position: {
              x: textPosition[0],
              y: textPosition[1],
            },

            size: textSize,
            rotation: textRotation,
            letterSpacing: letterspacing,
          },
        },
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("[customizer] submit failed:", err);
      setSubmitError("Failed to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (!designId) return;

    const loadDesign = async () => {
      try {
        const design = await api.get(`/customizations/${designId}`);
        setLoadedDesign(design);
        console.log("Loaded design:", design);
      } catch (error) {
        console.error("Failed to load design", error);
      }
    };

    loadDesign();
  }, [designId]);

  useEffect(() => {
    if (!loadedDesign?.designConfig) return;

    const config = loadedDesign.designConfig;

    // Silhouette
    if (config.silhouette) {
      const silhouetteIndex = silhouettes.findIndex(
        (s) => s === config.silhouette,
      );

      if (silhouetteIndex !== -1) {
        setSelectedSilhouette(silhouetteIndex);
      }
    }

    // Fit
    if (config.fit) {
      setSelectedFit(config.fit);
    }

    // Size
    if (config.size) {
      setSelectedSize(config.size);
    }

    // Material
    if (config.material) {
      setSelectedMaterial(config.material);
    }

    // Color
    if (config.color?.hex) {
      const colorIndex = colors.findIndex((c) => c === config.color.hex);

      if (colorIndex !== -1) {
        setSelectedColor(colorIndex);
      }
    }

    // Logo
    if (config.artwork) {
      setLogo(config.artwork.image ?? null);

      setArtworkPosition([
        config.artwork.position?.x ?? 0,
        config.artwork.position?.y ?? 0.35,
      ]);

      setArtworkScale(config.artwork.scale ?? 1);
      setLogoRotation(config.artwork.rotation ?? 0);
    }

    // Text
    if (config.text) {
      setCustomText(config.text.value ?? "");
      setSelectedFont(config.text.font ?? "Playfair Display");
      setTextColor(config.text.color ?? "#2d1a3a");

      setTextPosition([
        config.text.position?.x ?? 0,
        config.text.position?.y ?? 0.35,
      ]);

      setTextsize(config.text.size ?? 0.11);
      setTextRotation(config.text.rotation ?? 0);
      setLetterSpacing(config.text.letterSpacing ?? 0);
    }

    // Front / Back
    if (config.artwork?.side) {
      setDesignSide(config.artwork.side);
    }
  }, [loadedDesign]);

  return <Studio />;

  if (false)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <Navbar activePage="customizer" />

        <div style={s.container} className="customizer-layout">
          {/* LEFT — Preview */}
          <div style={s.previewSection} className="customizer-preview">
            <div style={s.badge}>CUSTOM LIVE</div>

            {/* Garment Preview */}
            <div style={{ ...s.previewBox, backgroundColor: "transparent" }}>
              <div style={s.garmentShape}>
                {/* T-shirt 3D model Display */}
                <Canvas3D
                  color={colors[selectedColor]}
                  modelPath="/models/tshirt.glb"
                  panelColors={{
                    front: panelColors.body,
                    back: panelColors.body,
                    "left-sleeve": panelColors.sleeves,
                    "right-sleeve": panelColors.sleeves,
                    collar: panelColors.collar,
                  }}
                  letterspacing={letterspacing}
                  material={selectedMaterial}
                  textRotation={textRotation}
                  logo={logo}
                  customText={customText}
                  textColor={textColor}
                  textSize={textSize}
                  textPosition={textPosition}
                  textTarget={designSide === "front" ? "front" : "back"}
                  font={selectedFont}
                  side={designSide}
                  artworkPosition={artworkPosition}
                  artworkTarget={designSide === "front" ? "front" : "back"}
                  artworkScale={artworkScale}
                  logoRotation={logoRotation}
                  isDraggingLogo={isDraggingLogo}
                  setIsDraggingLogo={setIsDraggingLogo}
                  setArtworkPosition={setArtworkPosition}
                  setRenderer={setRenderer}
                  resetToken={resetToken}
                />
              </div>
              <p style={s.colorLabel}>{colorNames[selectedColor]}</p>
            </div>

            {/* Preview controls */}
            <div style={s.previewControls}>
              <button
                style={s.controlBtn}
                className="ctrl-btn"
                title="Show the other side"
                onClick={() =>
                  setDesignSide((side) => (side === "front" ? "back" : "front"))
                }
              >
                ↺
              </button>
              <button
                style={s.controlBtn}
                className="ctrl-btn"
                title="Reset camera"
                onClick={() => setResetToken((token) => token + 1)}
              >
                ⊙
              </button>
              <button
                style={s.controlBtn}
                className="ctrl-btn"
                title="Center artwork"
                onClick={() => {
                  setArtworkPosition([0, 0.35]);
                  setArtworkScale(1);
                }}
              >
                ⌖
              </button>
            </div>

            {/* AI Stylist */}
            <div style={s.aiBox}>
              <p style={s.aiTitle}>✦ AI STYLIST SUGGESTIONS</p>
              <div style={s.aiSuggestions}>
                <div style={s.aiSuggestion}>
                  ✓{" "}
                  <span style={s.aiText}>
                    Pairs perfectly with our{" "}
                    <span style={s.aiLink}>High-Rise Jeans</span> for an
                    effortless weekend look.
                  </span>
                </div>
                <div style={s.aiSuggestion}>
                  ✓{" "}
                  <span style={s.aiText}>
                    Try a <span style={s.aiLink}>Floral Embroidery</span> accent
                    to elevate this everyday feel.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Controls */}
          <section style={s.textureWorkspace} className="texture-workspace">
            <aside style={s.toolRail} aria-label="Design tools">
              {(
                [
                  ["select", "↖", "Select"],
                  ["move", "✥", "Move"],
                  ["draw", "✎", "Draw"],
                  ["text", "T", "Text"],
                  ["image", "▧", "Image"],
                  ["shape", "□", "Shape"],
                ] as const
              ).map(([tool, icon, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setActiveTool(tool);
                    if (tool === "image")
                      document.getElementById("logo-upload")?.click();
                    if (tool === "text")
                      document.getElementById("custom-text-input")?.focus();
                  }}
                  style={
                    activeTool === tool ? s.toolButtonActive : s.toolButton
                  }
                  title={label}
                >
                  <span style={s.toolIcon}>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
              <div style={s.toolSpacer} />
              {[
                ["↶", "Undo"],
                ["↷", "Redo"],
                ["⌫", "Delete"],
              ].map(([icon, label]) => (
                <button
                  key={label}
                  type="button"
                  style={s.toolButton}
                  title={label}
                >
                  <span style={s.toolIcon}>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </aside>
            <div style={s.workspaceCanvas}>
              <div style={s.workspaceTitle}>
                <strong>Texture layout</strong>
                <span>
                  {activeTool === "select"
                    ? "Select a garment panel to edit"
                    : `${activeTool[0].toUpperCase()}${activeTool.slice(1)} tool active`}
                </span>
              </div>
              <div style={s.patternCard}>
                <svg
                  viewBox="0 0 720 620"
                  role="img"
                  aria-label="T-shirt UV pattern layout"
                  style={s.patternSvg}
                >
                  <rect
                    x="0"
                    y="0"
                    width="720"
                    height="620"
                    rx="18"
                    fill="#fff"
                  />
                  <g
                    stroke="#242228"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    cursor="pointer"
                  >
                    <path
                      onClick={() => {
                        setActivePanel("sleeves");
                        setActiveTool("select");
                      }}
                      fill={panelColors.sleeves}
                      stroke={activePanel === "sleeves" ? "#5b2d8e" : "#242228"}
                      strokeWidth={activePanel === "sleeves" ? 6 : 2}
                      d="M36 126 C92 108 100 62 155 56 C210 62 220 108 276 126 L256 192 L56 192 Z"
                    />
                    <path
                      onClick={() => setActivePanel("sleeves")}
                      fill={panelColors.sleeves}
                      stroke={activePanel === "sleeves" ? "#5b2d8e" : "#242228"}
                      strokeWidth={activePanel === "sleeves" ? 6 : 2}
                      d="M448 126 C504 108 514 62 570 56 C625 62 636 108 692 126 L672 192 L468 192 Z"
                    />
                    <path
                      onClick={() => setActivePanel("collar")}
                      fill={panelColors.collar}
                      stroke={activePanel === "collar" ? "#5b2d8e" : "#242228"}
                      strokeWidth={activePanel === "collar" ? 6 : 2}
                      d="M295 76 H425 V96 H295 Z M286 112 H434 V132 H286 Z"
                    />
                    <path
                      onClick={() => setActivePanel("body")}
                      fill={panelColors.body}
                      stroke={activePanel === "body" ? "#5b2d8e" : "#242228"}
                      strokeWidth={activePanel === "body" ? 6 : 2}
                      d="M55 288 L155 244 Q194 288 236 244 L336 288 Q318 340 327 402 L327 570 H62 V402 Q71 340 55 288 Z"
                    />
                    <path
                      onClick={() => setActivePanel("body")}
                      fill={panelColors.body}
                      stroke={activePanel === "body" ? "#5b2d8e" : "#242228"}
                      strokeWidth={activePanel === "body" ? 6 : 2}
                      d="M384 288 L484 244 Q526 288 566 244 L666 288 Q648 340 658 402 L658 570 H393 V402 Q402 340 384 288 Z"
                    />
                    <path
                      onClick={() => setActivePanel("collar")}
                      fill={panelColors.collar}
                      stroke={activePanel === "collar" ? "#5b2d8e" : "#242228"}
                      strokeWidth={activePanel === "collar" ? 6 : 2}
                      d="M55 208 H300 V228 H55 Z M420 208 H665 V228 H420 Z"
                    />
                  </g>
                  <text
                    x="194"
                    y="600"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#625b6b"
                  >
                    Front body
                  </text>
                  <text
                    x="526"
                    y="600"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#625b6b"
                  >
                    Back body
                  </text>
                </svg>
              </div>
              <div style={s.workspaceFooter}>
                <span>
                  Panel selected:{" "}
                  <strong>
                    {activePanel === "body"
                      ? "Body"
                      : activePanel === "sleeves"
                        ? "Sleeves"
                        : "Collar"}
                  </strong>
                </span>
                <span>Click a pattern piece to edit</span>
              </div>
            </div>
          </section>

          <div style={s.controls} className="customizer-controls">
            <h1 style={s.title}>Design Your Masterpiece</h1>
            <p style={s.subtitle}>
              Choose your silhouette, colors, and add personal touches to create
              something uniquely yours.
            </p>

            {/* Silhouette */}
            <div style={s.section}>
              <p style={s.sectionLabel}>SILHOUETTE</p>
              <div style={s.silhouetteRow}>
                {silhouettes.map((sil, i) => (
                  <button
                    key={sil}
                    style={selectedSilhouette === i ? s.silBtnActive : s.silBtn}
                    className={
                      selectedSilhouette === i ? "sil-active" : "sil-btn"
                    }
                    onClick={() => resetDesignForSilhouette(i)}
                  >
                    <span style={s.silIcon}>{i === 0 ? "👕" : "👚"}</span>
                    <span style={s.silLabel}>{sil}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fit */}
            <div style={s.section}>
              <p style={s.sectionLabel}>FIT</p>
              <div style={s.fitRow}>
                {fits.map((f) => (
                  <button
                    key={f}
                    style={selectedFit === f ? s.fitBtnActive : s.fitBtn}
                    className={selectedFit === f ? "fit-active" : "fit-btn"}
                    onClick={() => setSelectedFit(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div style={s.section}>
              <p style={s.sectionLabel}>SELECT SIZE</p>
              <div style={s.sizeRow}>
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    style={selectedSize === sz ? s.sizeBtnActive : s.sizeBtn}
                    className={selectedSize === sz ? "size-active" : "size-btn"}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div style={s.section}>
              <p style={s.sectionLabel}>
                COLOR PALETTE{" "}
                <span style={s.baseColorLabel}>
                  Base Color: {colorNames[selectedColor]}
                </span>
              </p>
              <div style={s.colorRow}>
                {colors.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedColor(i);
                      setPanelColors({ body: c, sleeves: c, collar: c });
                    }}
                    style={{
                      ...s.colorCircle,
                      backgroundColor: c,
                      border:
                        selectedColor === i
                          ? "3px solid #c0395a"
                          : "2px solid #e8dce8",
                      transform:
                        selectedColor === i ? "scale(1.2)" : "scale(1)",
                    }}
                    title={colorNames[i]}
                  />
                ))}
              </div>
            </div>

            {/* Custom Text */}
            <div style={s.section}>
              <p style={s.sectionLabel}>ADD CUSTOM TEXT</p>
              <div style={s.textInputWrap}>
                <input
                  id="custom-text-input"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Your message here..."
                  style={s.textInput}
                  className="custom-input"
                  maxLength={20}
                />
                <span style={s.textCount}>{customText.length}/20</span>
              </div>

              <div style={s.fontMaterialRow} className="fontMaterialRow">
                <div style={s.selectWrap}>
                  <p style={s.selectLabel}>Font Style</p>
                  <select
                    style={s.select}
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                  >
                    {fontStyles.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: 15 }}>
                  <p style={s.selectLabel}>Text Color</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    {textColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border:
                            textColor == color
                              ? "3px solid #7b2fa8"
                              : "2px solid #ddd",
                          backgroundColor: color,
                          cursor: "pointer",
                        }}
                      ></button>
                    ))}
                  </div>
                </div>
                <div style={s.selectWrap}>
                  <p style={s.selectLabel}>Material</p>
                  <select
                    style={s.select}
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                  >
                    {materials.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div style={s.section}>
              <p style={s.sectionLabel}>
                TEXT PLACEMENT{" "}
                <span style={s.baseColorLabel}>
                  {designSide === "front" ? "Front" : "Back"}
                </span>
              </p>
              <label style={s.rangeLabel}>
                Horizontal position
                <input
                  aria-label="Horizontal Text position"
                  type="range"
                  min="-0.4"
                  max="0.4"
                  step="0.01"
                  value={textPosition[0]}
                  onChange={(e) =>
                    setTextPosition([Number(e.target.value), textPosition[1]])
                  }
                  style={s.range}
                />
              </label>
              <label style={s.rangeLabel}>
                Vertical position
                <input
                  aria-label="Vertical Text position"
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.01"
                  value={textPosition[1]}
                  onChange={(e) =>
                    setTextPosition([textPosition[0], Number(e.target.value)])
                  }
                  style={s.range}
                />
              </label>
              <label style={s.rangeLabel}>
                Text Size
                <input
                  type="range"
                  min="0.05"
                  max="0.20"
                  step="0.005"
                  value={textSize}
                  onChange={(e) => setTextsize(Number(e.target.value))}
                  style={s.range}
                />
              </label>
              <label style={s.rangeLabel}>
                Text Rotation ({textRotation}°)
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={textRotation}
                  onChange={(e) => setTextRotation(Number(e.target.value))}
                  style={s.range}
                />
              </label>
              <label style={s.rangeLabel}>
                Letter Spacing
                <input
                  type="range"
                  min="0"
                  max="0.2"
                  step="0.002"
                  value={letterspacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  style={s.range}
                />
              </label>
            </div>

            <div style={s.section}>
              <p style={s.sectionLabel}>
                ARTWORK PLACEMENT{" "}
                <span style={s.baseColorLabel}>
                  {designSide === "front" ? "Front" : "Back"}
                </span>
              </p>
              <div style={s.sideRow}>
                {(["front", "back"] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => setDesignSide(side)}
                    style={designSide === side ? s.fitBtnActive : s.fitBtn}
                    className={designSide === side ? "fit-active" : "fit-btn"}
                  >
                    {side === "front" ? "Front" : "Back"}
                  </button>
                ))}
              </div>
              <label style={s.rangeLabel}>
                Horizontal position
                <input
                  aria-label="Horizontal artwork position"
                  type="range"
                  min="-0.3"
                  max="0.3"
                  step="0.01"
                  value={artworkPosition[0]}
                  onChange={(e) =>
                    setArtworkPosition([
                      Number(e.target.value),
                      artworkPosition[1],
                    ])
                  }
                  style={s.range}
                />
              </label>
              <label style={s.rangeLabel}>
                Vertical position
                <input
                  aria-label="Vertical artwork position"
                  type="range"
                  min="0.05"
                  max="0.65"
                  step="0.01"
                  value={artworkPosition[1]}
                  onChange={(e) =>
                    setArtworkPosition([
                      artworkPosition[0],
                      Number(e.target.value),
                    ])
                  }
                  style={s.range}
                />
              </label>
              <label style={s.rangeLabel}>
                Artwork scale
                <input
                  aria-label="Artwork scale"
                  type="range"
                  min="0.5"
                  max="1.6"
                  step="0.05"
                  value={artworkScale}
                  onChange={(e) => setArtworkScale(Number(e.target.value))}
                  style={s.range}
                />
              </label>
              <label style={s.rangeLabel}>
                Artwork Rotation
                <input
                  aria-label="Artwork Rotation"
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={logoRotation}
                  onChange={(e) => setLogoRotation(Number(e.target.value))}
                  style={s.range}
                />
              </label>
            </div>

            {/* Upload */}
            <label
              htmlFor="logo-upload"
              style={s.uploadBox}
              className="upload-box"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) void addLogoFile(file);
              }}
            >
              <p style={s.uploadIcon}>⬆</p>
              <p style={s.uploadText}>Upload Your Design</p>
              <p style={s.uploadSub}>Supports PNG, JPG, SVG only</p>
            </label>

            <input
              id="logo-upload"
              type="file"
              style={{ display: "none" }}
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
            />
            {logo && (
              <div style={s.designPreview}>
                <img
                  src={logo ?? undefined}
                  alt="Uploaded design preview"
                  style={s.designPreviewImage}
                />
                <button
                  type="button"
                  style={s.removeDesignBtn}
                  onClick={() => setLogo(null)}
                >
                  Remove design
                </button>
              </div>
            )}

            {/* Total + Submit */}
            <div style={s.bottomRow}>
              <div>
                <p style={s.totalLabel}>ESTIMATED TOTAL</p>
                <p style={s.totalPrice}>LKR {estimatedPrice}.00</p>
              </div>
              <div style={s.qtyAddRow}>
                <div style={s.qtyWrap}>
                  <button
                    style={s.qtyBtn}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span style={s.qtyNum}>{quantity}</span>
                  <button
                    style={s.qtyBtn}
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  style={s.addBagBtn}
                  className="add-bag-btn"
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                >
                  {submitted
                    ? isEditing
                      ? " ✓ Design updated"
                      : "✓ Request Submitted!"
                    : submitting
                      ? isEditing
                        ? "Updating..."
                        : "Submitting..."
                      : isEditing
                        ? "✦ Update Design"
                        : "✦ Submit Custom Request"}
                </button>
                <button
                  style={s.addBagBtn}
                  className="add-bag-btn"
                  onClick={handleDownload}
                >
                  Download Design
                </button>
              </div>
            </div>
            {submitError && (
              <p style={{ color: "#c0395a", fontSize: 12.5, marginTop: 10 }}>
                {submitError}
              </p>
            )}
          </div>
        </div>

        {/* AI INSPIRATION */}
        <section style={s.inspoSection}>
          <div style={s.inspoHeader}>
            <p style={s.inspoTitle}>✦ AI Design Inspo</p>
            <button style={s.refreshBtn} className="refresh-btn">
              Refresh Ideas
            </button>
          </div>
          <div style={s.inspoGrid}>
            {inspirations.map((item) => (
              <div
                key={item.name}
                style={{ ...s.inspoCard, backgroundColor: item.bg }}
                className="inspo-card"
              >
                <div style={s.inspoImgArea}>
                  <svg
                    viewBox="0 0 100 100"
                    width="80"
                    height="80"
                    style={{ margin: "0 auto", display: "block" }}
                  >
                    <path
                      d="M30,20 L10,40 L25,45 L25,90 L75,90 L75,45 L90,40 L70,20 L60,28 Q50,33 40,28 Z"
                      fill={item.accent}
                      opacity="0.85"
                    />
                    <text
                      x="50"
                      y="60"
                      textAnchor="middle"
                      fontSize="8"
                      fill={item.bg}
                      fontFamily="Georgia"
                    >
                      ✦
                    </text>
                  </svg>
                </div>
                <p style={s.inspoName}>{item.name}</p>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    );
}

export default function CustomizerPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Loading customizer…
        </main>
      }
    >
      <CustomizerContent />
    </Suspense>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "'Inter','Segoe UI',sans-serif",
    backgroundColor: "#fff",
    minHeight: "100vh",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(520px, 32vw)",
    minHeight: "calc(100vh - 59px)",
    maxWidth: "none",
    margin: 0,
    padding: 0,
    gap: 0,
  },

  // LEFT
  previewSection: {
    width: "100%",
    height: 980,
    minHeight: 980,
    alignSelf: "start",
    background: "#f7f7f7",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "sticky",
    top: 59,
  },
  previewHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px 0",
    fontSize: 17,
    color: "#26242a",
    boxSizing: "border-box",
  },
  liveBadge: {
    background: "#ebf8ef",
    color: "#298958",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: 800,
  },
  badge: {
    position: "absolute",
    top: 28,
    left: 36,
    background: "#5b2d8e",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    padding: "7px 12px",
    borderRadius: 999,
    letterSpacing: 1.1,
    margin: 0,
  },
  previewBox: {
    width: "min(780px, 94%)",
    borderRadius: 0,
    padding: 0,
    margin: 0,
    minHeight: 820,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.3s",
  },
  garmentShape: { width: "100%", display: "flex", justifyContent: "center" },
  colorLabel: {
    fontSize: 12,
    color: "#171717",
    fontWeight: 600,
    letterSpacing: 0,
    marginTop: -6,
  },
  quickPanelEditor: {
    width: "100%",
    margin: "0 0 22px",
    padding: "12px",
    border: "1px solid #e8e3ec",
    borderRadius: 12,
    background: "#fcfbfd",
    boxSizing: "border-box",
  },
  quickPanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#6c6572",
    fontSize: 11,
    marginBottom: 8,
  },
  quickPanelButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 5,
  },
  quickPanelButton: {
    padding: "7px 3px",
    border: "1px solid #ded8e5",
    borderRadius: 7,
    background: "#fff",
    color: "#453e4d",
    fontSize: 10,
    cursor: "pointer",
  },
  quickPanelButtonActive: {
    padding: "7px 3px",
    border: "1px solid #5b2d8e",
    borderRadius: 7,
    background: "#5b2d8e",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  quickSwatches: {
    display: "flex",
    justifyContent: "center",
    gap: 9,
    marginTop: 10,
  },
  quickSwatch: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "1px solid #e2dce8",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  previewControls: {
    position: "absolute",
    bottom: 28,
    left: 36,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    margin: 0,
  },
  controlBtn: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid #ddd",
    background: "#fff",
    fontSize: 17,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  aiBox: { display: "none" },
  aiTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#9b6fd0",
    letterSpacing: 1,
    marginBottom: 10,
  },
  aiSuggestions: { display: "flex", flexDirection: "column", gap: 8 },
  aiSuggestion: {
    fontSize: 11,
    color: "#555",
    lineHeight: 1.5,
    display: "flex",
    gap: 6,
  },
  aiText: { fontSize: 11, color: "#555" },
  aiLink: { color: "#c0395a", textDecoration: "underline", cursor: "pointer" },

  // RIGHT
  controls: {
    minWidth: 0,
    padding: "42px 32px 56px",
    background: "#fff",
    borderLeft: "1px solid #eee",
    overflowX: "hidden",
  },
  textureWorkspace: { display: "none" },
  toolRail: {
    background: "#fff",
    borderRight: "1px solid #e5e3e8",
    padding: "18px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 7,
  },
  toolButton: {
    minHeight: 66,
    padding: "8px 3px",
    border: "none",
    background: "transparent",
    color: "#3e3a43",
    fontSize: 11,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 13,
  },
  toolButtonActive: {
    minHeight: 66,
    padding: "8px 3px",
    border: "none",
    background: "#202024",
    color: "#fff",
    fontSize: 11,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 13,
    boxShadow: "0 8px 18px rgba(0,0,0,.14)",
  },
  toolIcon: { fontSize: 23, lineHeight: 1 },
  toolSpacer: { flex: 1 },
  workspaceCanvas: { padding: "28px 30px 40px", minWidth: 0 },
  workspaceTitle: {
    display: "flex",
    gap: 12,
    alignItems: "baseline",
    color: "#2d2930",
    fontSize: 15,
  },
  patternCard: {
    width: "min(720px, 92%)",
    margin: "42px auto 22px",
    background: "#fff",
    border: "1px solid #e2dfe5",
    borderRadius: 18,
    boxShadow: "0 16px 34px rgba(32,27,38,.08)",
    overflow: "hidden",
  },
  patternSvg: { display: "block", width: "100%", height: "auto" },
  workspaceFooter: {
    width: "min(720px, 92%)",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    color: "#706b74",
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#171717",
    fontFamily: "'Inter',sans-serif",
    margin: "0 0 9px 0",
    letterSpacing: "-0.8px",
  },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 32, lineHeight: 1.55 },

  section: { marginBottom: 18 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 750,
    color: "#171717",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 13,
  },
  baseColorLabel: {
    fontWeight: 500,
    color: "#666",
    textTransform: "none",
    letterSpacing: 0,
  },

  silhouetteRow: { display: "flex", gap: 10 },
  silBtn: {
    flex: 1,
    padding: "14px 8px",
    borderRadius: 0,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },
  silBtnActive: {
    flex: 1,
    padding: "14px 8px",
    borderRadius: 0,
    border: "2px solid #5b2d8e",
    background: "#f7f1ff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },
  silIcon: { fontSize: 20 },
  silLabel: { fontSize: 11, fontWeight: 500, color: "#2d1a3a" },

  fitRow: { display: "flex", gap: 8 },
  fitBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 0,
    border: "1px solid #ddd",
    background: "#fff",
    fontSize: 12,
    color: "#333",
    cursor: "pointer",
  },
  fitBtnActive: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 0,
    border: "2px solid #5b2d8e",
    background: "#5b2d8e",
    fontSize: 12,
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },

  sizeRow: { display: "flex", gap: 8 },
  sizeBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    border: "1.5px solid #e8dce8",
    background: "#fff",
    fontSize: 12,
    color: "#555",
    cursor: "pointer",
  },
  sizeBtnActive: {
    width: 40,
    height: 36,
    borderRadius: 0,
    border: "2px solid #5b2d8e",
    background: "#5b2d8e",
    fontSize: 12,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  colorRow: { display: "flex", gap: 10 },
  panelRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 },
  panelButton: {
    border: "1px solid #ded6e6",
    background: "#fff",
    padding: "10px 6px",
    fontSize: 12,
    color: "#3b3150",
    cursor: "pointer",
    borderRadius: 8,
  },
  panelButtonActive: {
    border: "1px solid #5b2d8e",
    background: "#5b2d8e",
    padding: "10px 6px",
    fontSize: 12,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    borderRadius: 8,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.2s, border 0.2s",
  },

  textInputWrap: { position: "relative", marginBottom: 12 },
  textInput: {
    width: "100%",
    padding: "10px 40px 10px 14px",
    borderRadius: 8,
    border: "1.5px solid #e8dce8",
    fontSize: 13,
    outline: "none",
    fontFamily: "'Inter',sans-serif",
    boxSizing: "border-box",
  },
  textCount: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 11,
    color: "#bbb",
  },
  fontMaterialRow: {
    display: "grid",
    gridTemplateColumns: "minmax(96px, 1fr) 1.45fr minmax(96px, 1fr)",
    gap: 12,
    alignItems: "end",
  },
  sideRow: { display: "flex", gap: 8, marginBottom: 10 },
  rangeLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    color: "#777",
    fontSize: 11,
    marginTop: 7,
  },
  range: { accentColor: "#7b2fa8", width: "55%" },
  selectWrap: { flex: 1 },
  selectLabel: { fontSize: 11, color: "#999", marginBottom: 4 },
  select: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1.5px solid #e8dce8",
    fontSize: 12,
    color: "#2d1a3a",
    outline: "none",
    cursor: "pointer",
    backgroundColor: "#fff",
  },

  uploadBox: {
    border: "2px dashed #d8c8f0",
    borderRadius: 12,
    padding: "20px",
    textAlign: "center",
    marginBottom: 20,
    cursor: "pointer",
  },
  uploadIcon: { fontSize: 24, color: "#9b6fd0", marginBottom: 4 },
  uploadText: {
    fontSize: 13,
    fontWeight: 600,
    color: "#2d1a3a",
    margin: "0 0 2px 0",
  },
  uploadSub: { fontSize: 11, color: "#aaa" },
  designPreview: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "-8px 0 20px",
  },
  designPreviewImage: {
    width: 48,
    height: 48,
    objectFit: "contain",
    borderRadius: 8,
    border: "1px solid #e8dce8",
    background: "#fff",
  },
  removeDesignBtn: {
    border: "none",
    background: "none",
    color: "#c0395a",
    cursor: "pointer",
    fontSize: 12,
    textDecoration: "underline",
  },

  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    borderRadius: 12,
    padding: "16px 20px",
    border: "1px solid #f0e8f5",
  },
  totalLabel: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1,
    fontWeight: 700,
    marginBottom: 4,
  },
  totalPrice: { fontSize: 20, fontWeight: 700, color: "#2d1a3a" },
  qtyAddRow: { display: "flex", gap: 12, alignItems: "center" },
  qtyWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1.5px solid #e8dce8",
    borderRadius: 8,
    padding: "4px 8px",
  },
  qtyBtn: {
    width: 24,
    height: 24,
    border: "none",
    background: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "#5b2d8e",
    fontWeight: 700,
  },
  qtyNum: {
    fontSize: 14,
    fontWeight: 600,
    color: "#2d1a3a",
    minWidth: 20,
    textAlign: "center",
  },
  addBagBtn: {
    padding: "12px 18px",
    borderRadius: 999,
    background: "#5b2d8e",
    color: "#fff",
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  // INSPO
  inspoSection: { padding: "32px 48px 48px", maxWidth: 1100, margin: "0 auto" },
  inspoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  inspoTitle: { fontSize: 15, fontWeight: 700, color: "#2d1a3a" },
  refreshBtn: {
    fontSize: 12,
    color: "#9b6fd0",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  inspoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  inspoCard: {
    borderRadius: 12,
    padding: "20px 16px 12px",
    cursor: "pointer",
    textAlign: "center",
    transition: "transform 0.2s",
  },
  inspoImgArea: { marginBottom: 10 },
  inspoName: { fontSize: 12, fontWeight: 600, color: "#2d1a3a" },
};

const css = `
  .ctrl-btn:hover { background: #5b2d8e !important; color: #fff; border-color: #5b2d8e !important; }
  .fit-btn:hover, .sil-btn:hover { border-color: #5b2d8e !important; }
  .size-btn:hover { border-color: #5b2d8e !important; color: #5b2d8e !important; }
  .custom-input:focus { border-color: #5b2d8e !important; outline: none; }
  .upload-box:hover { background: #f7f1ff !important; border-color: #5b2d8e !important; }
  .add-bag-btn:hover { background: #43216d !important; transform: translateY(-1px); }
  .inspo-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
  .refresh-btn:hover { color: #c0395a !important; }
  @media (max-width: 900px) {
    .customizer-layout { grid-template-columns: 1fr !important; }
    .texture-workspace { grid-column: 1 !important; grid-row: auto !important; min-height: auto !important; }
    .customizer-preview { grid-column: 1 !important; grid-row: auto !important; min-height: 560px !important; position: relative !important; top: auto !important; margin: 12px !important; }
    .customizer-controls { grid-column: 1 !important; grid-row: auto !important; border-left: 0 !important; padding: 32px 24px 46px !important; }
    .fontMaterialRow { grid-template-columns: 1fr !important; }
  }
`;
