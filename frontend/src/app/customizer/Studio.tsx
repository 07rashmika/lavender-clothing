"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Canvas3D from "./Canvas3D";
import StudioStage, { type StudioTool } from "./StudioStage";
import { getAiSuggestions, type AiSuggestions } from "./aiSuggestions";

export type PrintTarget = "front" | "back" | "left-sleeve" | "right-sleeve";
export type GarmentPart = PrintTarget | "collar";
export type Placement = { target: PrintTarget; position: [number, number] };
export type DesignLayer = {
  id: string;
  type: "logo" | "text";
  content: string;
  target: PrintTarget;
  position: [number, number];
  scale: number;
  color: string;
  font: string;
};
type Draft = {
  color: string;
  material: string;
  size: string;
  panel: GarmentPart;
  panelColors: Record<GarmentPart, string>;
  layers: DesignLayer[];
};

const swatches = [
  "#c8d0f0",
  "#f5d060",
  "#f5a060",
  "#f09090",
  "#333333",
  "#e8e8e8",
];
const materials = ["Organic Cotton", "Bamboo Blend", "Linen Mix", "Silk Touch"];
const sizes = ["XS", "S", "M", "L", "XL"];
const fonts = [
  "Anton",
  "BebasNeue",
  "Cinzel",
  "Inter",
  "Montserrat",
  "Oswald",
  "Pacifico",
];
const textSwatches = [
  "#171717",
  "#ffffff",
  "#d72b4b",
  "#1976d2",
  "#24944d",
  "#8d2ac0",
];
const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
const blankDraft = (): Draft => ({
  color: swatches[0],
  material: "Organic Cotton",
  size: "S",
  panel: "front",
  layers: [],
  panelColors: {
    front: swatches[0],
    back: swatches[0],
    "left-sleeve": swatches[0],
    "right-sleeve": swatches[0],
    collar: swatches[0],
  },
});

export default function Studio() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [current, setCurrent] = useState<Draft>(blankDraft());
  const [tool, setTool] = useState<StudioTool>("select");
  const [selectedPart, setSelectedPart] = useState<GarmentPart | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [layoutZoom, setLayoutZoom] = useState(1);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions>({
    fonts: [],
    placements: [],
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [history, setHistory] = useState<Draft[]>([]);
  const [future, setFuture] = useState<Draft[]>([]);
  const [saveNotice, setSaveNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const editingDesignId = searchParams.get("designId");
  const draftStorageKey = `lavender-studio-draft:${editingDesignId ?? "new"}`;
  const hasRestoredDraft = useRef(false);
  const activeLayer =
    current.layers.find((layer) => layer.id === activeLayerId) ?? null;
  const panelPalette = Array.from(
    new Set([...swatches, ...Object.values(current.panelColors)]),
  );
  useEffect(() => {
    hasRestoredDraft.current = false;
    try {
      const rawDraft = localStorage.getItem(draftStorageKey);
      if (rawDraft) {
        const saved = JSON.parse(rawDraft) as Partial<Draft>;
        if (Array.isArray(saved.layers) && saved.panelColors) {
          const fallback = blankDraft();
          const restoredLayers = saved.layers.filter(
            (layer) => !layer.content.startsWith("blob:"),
          );
          setCurrent({
            ...fallback,
            ...saved,
            size: saved.size ?? fallback.size,
            panelColors: { ...fallback.panelColors, ...saved.panelColors },
            layers: restoredLayers,
          });
          setActiveLayerId(restoredLayers[0]?.id ?? null);
          hasRestoredDraft.current = true;
        }
      }
    } catch {
      localStorage.removeItem(draftStorageKey);
    } finally {
      setDraftReady(true);
    }
  }, [draftStorageKey]);
  useEffect(() => {
    const id = searchParams.get("designId");
    if (!id || hasRestoredDraft.current) return;
    void api
      .get(`/customizations/${id}`)
      .then((design) => {
        const config = design.designConfig;
        if (!config || !Array.isArray(config.layers)) return;
        setCurrent((draft) => ({
          ...draft,
          color: design.color ?? draft.color,
          material: design.fabric ?? draft.material,
          size: design.size ?? config.size ?? draft.size,
          panelColors: { ...draft.panelColors, ...config.panels },
          layers: config.layers,
        }));
        setActiveLayerId(config.layers[0]?.id ?? null);
      })
      .catch(() => undefined);
  }, [searchParams]);
  useEffect(() => {
    if (!draftReady) return;
    localStorage.setItem(draftStorageKey, JSON.stringify(current));
  }, [current, draftReady, draftStorageKey]);
  useEffect(() => {
    let mounted = true;
    setAiLoading(true);
    void getAiSuggestions(activeLayer)
      .then((result) => {
        if (mounted) setAiSuggestions(result);
      })
      .finally(() => {
        if (mounted) setAiLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [activeLayer]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveLayerId(null);
        setSelectedPart(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const checkpoint = () => {
    setHistory((items) => [...items.slice(-49), current]);
    setFuture([]);
  };
  const update = (change: Partial<Draft>, record = true) => {
    if (record) checkpoint();
    setCurrent((items) => ({ ...items, ...change }));
  };
  const updateLayer = (change: Partial<DesignLayer>) => {
    if (!activeLayerId) return;
    checkpoint();
    setCurrent((draft) => ({
      ...draft,
      layers: draft.layers.map((layer) =>
        layer.id === activeLayerId ? { ...layer, ...change } : layer,
      ),
    }));
  };
  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((items) => [current, ...items]);
    setHistory((items) => items.slice(0, -1));
    setCurrent(previous);
    setActiveLayerId(previous.layers[0]?.id ?? null);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items.slice(-49), current]);
    setFuture((items) => items.slice(1));
    setCurrent(next);
    setActiveLayerId(next.layers[0]?.id ?? null);
  };
  const resetDesign = () => {
    checkpoint();
    setCurrent(blankDraft());
    setActiveLayerId(null);
  };
  const deleteActive = () => {
    if (!activeLayerId) return;
    update({
      layers: current.layers.filter((layer) => layer.id !== activeLayerId),
    });
    setActiveLayerId(null);
  };
  const addText = () => {
    const id = newId();
    update({
      layers: [
        ...current.layers,
        {
          id,
          type: "text",
          content: "New text",
          target: current.panel === "collar" ? "front" : current.panel,
          position: [0, 0.35],
          scale: 0.11,
          color: "#171717",
          font: "Anton",
        },
      ],
    });
    setActiveLayerId(id);
    requestAnimationFrame(() => textInputRef.current?.focus());
  };
  const addFile = async (file?: File) => {
    if (
      !file ||
      !["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)
    )
      return;
    const id = newId();
    const local = URL.createObjectURL(file);
    update({
      layers: [
        ...current.layers,
        {
          id,
          type: "logo",
          content: local,
          target: current.panel === "collar" ? "front" : current.panel,
          position: [0, 0.35],
          scale: 1,
          color: "#171717",
          font: "Anton",
        },
      ],
    });
    setActiveLayerId(id);
    try {
      const data = new FormData();
      data.append("file", file);
      const result = await api.post("/uploads", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCurrent((draft) => ({
        ...draft,
        layers: draft.layers.map((layer) =>
          layer.id === id ? { ...layer, content: result.url } : layer,
        ),
      }));
    } catch {
      /* Browser preview remains available. */
    }
  };
  const choosePart = (panel: GarmentPart, target?: PrintTarget) => {
    setSelectedPart(panel);
    if (target && activeLayerId) checkpoint();
    setCurrent((draft) => ({
      ...draft,
      panel,
      layers:
        target && activeLayerId
          ? draft.layers.map((layer) =>
              layer.id === activeLayerId
                ? { ...layer, target, position: [0, 0.35] }
                : layer,
            )
          : draft.layers,
    }));
  };
  const moveLayer = (id: string, position: [number, number]) =>
    setCurrent((draft) => ({
      ...draft,
      layers: draft.layers.map((layer) =>
        layer.id === id ? { ...layer, position } : layer,
      ),
    }));
  const beginLayerMove = () => checkpoint();
  const download = () => {
    if (!renderer) return;
    const link = document.createElement("a");
    link.download = "tshirt-design.png";
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();
  };
  const uploadPreviewToCloudinary = async (): Promise<string | undefined> => {
    if (!renderer) return undefined;
    const imageBlob = await new Promise<Blob | null>((resolve) =>
      renderer.domElement.toBlob(resolve, "image/png"),
    );
    if (!imageBlob) return undefined;
    const data = new FormData();
    data.append(
      "file",
      new File([imageBlob], `custom-tshirt-preview-${Date.now()}.png`, {
        type: "image/png",
      }),
    );
    const result = await api.post("/uploads", data);
    return result?.url;
  };
  const submit = async () => {
    if (!user) return router.push("/auth");
    setIsSaving(true);
    let designPreview: string | undefined;
    try {
      designPreview = await uploadPreviewToCloudinary();
    } catch {
      // Keep design saving available if the image host is unavailable.
    }
    const payload = {
      fabric: current.material,
      color: current.color,
      cut: "Classic T-Shirt",
      size: current.size,
      quantity: 1,
      estimatedPriceCents: 4500,
      designPreview,
      designConfig: {
        version: 5,
        garment: "tshirt",
        size: current.size,
        panels: current.panelColors,
        layers: current.layers,
      },
    };
    try {
      if (editingDesignId) await api.patch(`/customizations/${editingDesignId}`, payload);
      else await api.post("/customizations", payload);
      setSaveNotice(true);
      window.setTimeout(() => setSaveNotice(false), 4200);
    } finally {
      setIsSaving(false);
    }
  };
  const textPixels = activeLayer?.type === "text"
    ? Math.round(12 + ((activeLayer.scale - 0.05) / 0.17) * 60)
    : 12;
  const imageInches = activeLayer?.type === "logo"
    ? Number((activeLayer.scale * 4).toFixed(1))
    : 1;

  return (
    <main style={s.page}>
      <Navbar activePage="customizer" />
      <header style={s.studioHeader}>
        <div>
          <strong>Design Studio</strong>
          <span style={s.breadcrumb}>/ Classic T-Shirt</span>
        </div>
        <div style={s.headerActions}>
          <button onClick={undo} title="Undo" style={s.iconButton}>
            ↶
          </button>
          <button onClick={redo} title="Redo" style={s.iconButton}>
            ↷
          </button>
          <button
            onClick={resetDesign}
            title="Reset entire design"
            style={s.iconButton}
          >
            ↻
          </button>
          <button
            onClick={deleteActive}
            disabled={!activeLayer}
            title="Delete selected logo or text"
            style={{ ...s.iconButton, opacity: activeLayer ? 1 : 0.45 }}
          >
            ⛔
          </button>
          <button style={s.downloadHeader} onClick={download}>
             ⬇️ Download preview
          </button>
          <button
            style={{ ...s.apply, opacity: isSaving ? 0.65 : 1 }}
            onClick={submit}
            disabled={isSaving}
          >
            ✅ Save design
          </button>
        </div>
      </header>
      <div style={s.layout}>
        <aside style={s.rail}>
          <div style={s.modeButtons}>
            <button
              onClick={() => setTool("select")}
              style={tool === "select" ? s.toolActive : s.tool}
            >
              Select
            </button>
            <button
              onClick={() => setTool("move")}
              style={tool === "move" ? s.toolActive : s.tool}
            >
              Move
            </button>
          </div>
          <section style={s.leftCard}>
            <b>Design tools</b>
            <div style={s.designActions}>
              <button style={s.secondary} onClick={addText}>
                Add text
              </button>
              <button
                style={s.upload}
                onClick={() => inputRef.current?.click()}
              >
                Image upload
              </button>
            </div>
            <input
              ref={textInputRef}
              value={activeLayer?.type === "text" ? activeLayer.content : ""}
              disabled={activeLayer?.type !== "text"}
              onChange={(event) => updateLayer({ content: event.target.value })}
              placeholder={
                activeLayer?.type === "text"
                  ? "Type your text"
                  : "Select or add a text layer"
              }
              style={s.input}
            />
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              hidden
              onChange={(event) => void addFile(event.target.files?.[0])}
            />
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void addFile(event.dataTransfer.files?.[0]);
              }}
              style={s.dropHint}
            >
              Drop a PNG, JPG, or SVG here
            </div>
          </section>
          <section style={s.leftCard}>
            <b>Text style</b>
            <div style={s.styleGrid}>
              <label>
                Font
                <select
                  disabled={activeLayer?.type !== "text"}
                  value={activeLayer?.font ?? "Anton"}
                  onChange={(event) =>
                    updateLayer({ font: event.target.value })
                  }
                  style={s.select}
                >
                  {fonts.map((font) => (
                    <option key={font}>{font}</option>
                  ))}
                </select>
              </label>
              <label>
                Text colour
                <div style={s.textSwatches}>
                  {textSwatches.map((colour) => (
                    <button
                      title={colour}
                      key={colour}
                      disabled={activeLayer?.type !== "text"}
                      onClick={() => updateLayer({ color: colour })}
                      style={{
                        ...s.textSwatch,
                        background: colour,
                        outline:
                          activeLayer?.color === colour
                            ? "3px solid #7253a6"
                            : "none",
                        boxShadow: "0 2px 5px rgba(35,27,48,.18)",
                      }}
                    />
                  ))}
                  <input
                    aria-label="Choose any text colour"
                    disabled={activeLayer?.type !== "text"}
                    type="color"
                    value={activeLayer?.color ?? "#171717"}
                    onChange={(event) =>
                      updateLayer({ color: event.target.value })
                    }
                    style={s.textColorInput}
                  />
                </div>
              </label>
            </div>
            <label style={s.rangeLabel}>
              <span>
                Text size <small>12–72 px</small>
              </span>
              <div style={s.sizeControl}>
                <input
                  disabled={activeLayer?.type !== "text"}
                  type="number"
                  min="12"
                  max="72"
                  value={textPixels}
                  onChange={(event) => {
                    if (activeLayer?.type !== "text") return;
                    updateLayer({ scale: 0.05 + ((Math.min(72, Math.max(12, Number(event.target.value))) - 12) / 60) * 0.17 });
                  }}
                  style={s.unitInput}
                />
                <span>px</span>
              </div>
            </label>
          </section>
          <section style={s.leftCard}>
            <b>Image resize</b>
            <label style={s.rangeLabel}>
              <span>
                Print width <small>1–8 in</small>
              </span>
              <div style={s.sizeControl}>
                <input
                  disabled={activeLayer?.type !== "logo"}
                  type="number"
                  min="1"
                  max="8"
                  step="0.1"
                  value={imageInches}
                  onChange={(event) => {
                    if (activeLayer?.type !== "logo") return;
                    updateLayer({ scale: Math.min(2, Math.max(0.25, Number(event.target.value) / 4)) });
                  }}
                  style={s.unitInput}
                />
                <span>in</span>
              </div>
            </label>
            <p style={s.measureHint}>
              Approximate printed width; height keeps the image ratio.
            </p>
          </section>
        </aside>
        <section style={s.workspace}>
          <div style={s.workspaceHead}>
            <b>Texture layout</b>
            <span>
              Select a shirt part. Select or Move a logo/text layer to edit it.
            </span>
          </div>
          <div style={{ ...s.stageZoom, zoom: layoutZoom }}>
            <StudioStage
              tool={tool}
              activeLayerId={activeLayerId}
              selectedPart={selectedPart}
              layers={current.layers}
              panelColors={current.panelColors}
              onSelectPanel={choosePart}
              onDeselectPart={() => {
                setSelectedPart(null);
                setActiveLayerId(null);
              }}
              onDesignMoveStart={beginLayerMove}
              onDesignMove={moveLayer}
              onLayerSelect={setActiveLayerId}
            />
          </div>
          <div style={s.zoom}>
            <button
              style={s.zoomButton}
              onClick={() =>
                setLayoutZoom((value) =>
                  Math.max(0.7, Number((value - 0.1).toFixed(1))),
                )
              }
            >
              −
            </button>
            <span>{Math.round(layoutZoom * 100)}%</span>
            <button
              style={s.zoomButton}
              onClick={() =>
                setLayoutZoom((value) =>
                  Math.min(1.4, Number((value + 0.1).toFixed(1))),
                )
              }
            >
              +
            </button>
            <button style={s.zoomReset} onClick={() => setLayoutZoom(1)}>
              Reset
            </button>
          </div>
          <section style={s.aiSection}>
            <div style={s.aiSectionHead}>
              <div>
                <b>AI suggestions</b>
                <span style={s.aiStatus}>
                  {aiLoading ? "Analysing layer…" : "Ready"}
                </span>
              </div>
              <button
                style={s.aiRefresh}
                onClick={() => {
                  setAiLoading(true);
                  void getAiSuggestions(activeLayer)
                    .then(setAiSuggestions)
                    .finally(() => setAiLoading(false));
                }}
              >
                Refresh
              </button>
            </div>
            <div style={s.aiGrid}>
              <article style={s.aiCard}>
                <b>AI font suggestions</b>
                <p>
                  {activeLayer?.type === "text"
                    ? "Recommendations for the selected text layer."
                    : "Select a text layer to receive font recommendations."}
                </p>
                <div style={s.aiList}>
                  {aiSuggestions.fonts.map((suggestion) => (
                    <button
                      key={suggestion.font}
                      style={s.aiSuggestion}
                      onClick={() =>
                        updateLayer({
                          font: suggestion.font,
                          color: suggestion.color,
                        })
                      }
                    >
                      <span
                        style={{
                          fontFamily: suggestion.font,
                          color: suggestion.color,
                          fontWeight: 700,
                        }}
                      >
                        {suggestion.font}
                      </span>
                      <small>{suggestion.reason}</small>
                      <span
                        style={{ ...s.aiColor, background: suggestion.color }}
                        title={`Suggested colour ${suggestion.color}`}
                      />
                      <em>Apply</em>
                    </button>
                  ))}
                </div>
              </article>
              <article style={s.aiCard}>
                <b>AI placement suggestions</b>
                <p>
                  Safe target areas for the currently selected design layer.
                </p>
                <div style={s.aiList}>
                  {aiSuggestions.placements.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      disabled={!activeLayer}
                      style={s.aiSuggestion}
                      onClick={() =>
                        updateLayer({
                          target: suggestion.target,
                          position: suggestion.position,
                        })
                      }
                    >
                      <span>{suggestion.label}</span>
                      <small>{suggestion.reason}</small>
                      <em>Apply</em>
                    </button>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </section>
        <aside style={s.sidebar}>
          <section style={s.previewCard}>
            <div style={s.cardHead}>
              <b>3D Preview</b>
              <em>LIVE</em>
            </div>
            <Canvas3D
              height="365px"
              color={current.color}
              panelColors={current.panelColors}
              modelPath="/models/tshirt.glb"
              material={current.material}
              layers={current.layers}
              setRenderer={setRenderer}
              resetToken={0}
            />
            <p style={s.rotate}>Drag to rotate</p>
          </section>
          <section style={s.card}>
            <b>Selected part · {current.panel.replace("-", " ")}</b>
            <p style={s.targetHint}>
              {activeLayer ? (
                <>
                  Selected <strong>{activeLayer.type}</strong> on{" "}
                  <strong>{activeLayer.target.replace("-", " ")}</strong>.
                </>
              ) : (
                "Select a logo or text layer to edit it."
              )}
            </p>
            <div style={s.swatches}>
              {panelPalette.map((colour) => (
                <button
                  aria-label={`Use ${colour} for this shirt part`}
                  key={colour}
                  onClick={() =>
                    update({
                      color: colour,
                      panelColors: {
                        ...current.panelColors,
                        [current.panel]: colour,
                      },
                    })
                  }
                  style={{
                    ...s.swatch,
                    background: colour,
                    outline:
                      current.panelColors[current.panel] === colour
                        ? "2px solid #1677ff"
                        : "none",
                  }}
                />
              ))}
              <label title="Custom part colour" style={s.colorPicker}>
                <input
                  type="color"
                  value={current.panelColors[current.panel]}
                  onInput={(event) =>
                    update({
                      color: event.currentTarget.value,
                      panelColors: {
                        ...current.panelColors,
                        [current.panel]: event.currentTarget.value,
                      },
                    })
                  }
                  style={s.nativeColor}
                />
                <span>+</span>
              </label>
            </div>
          </section>
          <section style={s.card}>
            <b>Choose material</b>
            <div style={s.materials}>
              {materials.map((item) => (
                <button
                  key={item}
                  onClick={() => update({ material: item })}
                  style={
                    current.material === item ? s.materialActive : s.material
                  }
                >
                  {item}
                </button>
              ))}
            </div>
            <div
              style={{
                marginTop: 6,
                paddingTop: 13,
                borderTop: "1px solid #eee9f2",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 9,
                  fontSize: 12,
                }}
              >
                <b>Choose T-shirt size</b>
                <span style={{ color: "#68567f" }}>
                  Selected: {current.size}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 6,
                }}
              >
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => update({ size })}
                    style={{
                      minHeight: 34,
                      borderRadius: 8,
                      border:
                        current.size === size
                          ? "2px solid #5b2d8e"
                          : "1px solid #ded8e3",
                      background: current.size === size ? "#eee4fb" : "#fff",
                      color: current.size === size ? "#392354" : "#514a59",
                      fontWeight: current.size === size ? 800 : 600,
                      cursor: "pointer",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>
      {saveNotice && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 500,
            background: "#fff",
            border: "1px solid #c4e7cf",
            borderRadius: 14,
            padding: "14px 18px",
            boxShadow: "0 16px 34px rgba(36,91,56,.18)",
            display: "flex",
            gap: 11,
            alignItems: "center",
            color: "#205f3a",
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "#ddf5e5",
              fontWeight: 900,
            }}
          >
            ✓
          </span>
          <div>
            <b>Design saved successfully</b>
            <small style={{ display: "block", marginTop: 2, color: "#5e7b68" }}>
              You can manage it from My Designs.
            </small>
          </div>
          <button
            aria-label="Close notification"
            onClick={() => setSaveNotice(false)}
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              fontSize: 18,
              color: "#5f7466",
            }}
          >
            ×
          </button>
        </div>
      )}
      <Footer />
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f7f9",
    fontFamily: "Inter,Arial,sans-serif",
    color: "#25232a",
  },
  studioHeader: {
    minHeight: 60,
    background: "#fff",
    borderBottom: "1px solid #e4e2e7",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "0 24px",
    fontSize: 20,
  },
  breadcrumb: {
    color: "#77727d",
    fontWeight: 400,
    fontSize: 15,
    marginLeft: 12,
  },
  headerActions: { display: "flex", gap: 9, alignItems: "center" },
  iconButton: {
    width: 38,
    height: 38,
    border: "1px solid #d8cfe3",
    borderRadius: 9,
    background: "#f1eafe",
    cursor: "pointer",
    fontSize: 20,
    color: "#45315d",
  },
  apply: {
    background: "#eee4fb",
    color: "#392354",
    border: "1px solid #cab7e8",
    borderRadius: 10,
    padding: "9px 13px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  downloadHeader: {
    background: "#fff",
    color: "#4d2b70",
    border: "1px solid #cab7e8",
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "275px minmax(0,1fr) 370px",
    minHeight: "calc(100vh - 128px)",
  },
  rail: {
    background: "linear-gradient(180deg,#fbfaff 0%,#f6f4f8 100%)",
    borderRight: "1px solid #e4e2e7",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 11,
    overflowY: "auto",
  },
  modeButtons: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  tool: {
    minHeight: 40,
    border: "1px solid #d9d4df",
    borderRadius: 10,
    background: "#fff",
    cursor: "pointer",
    color: "#39353d",
    fontWeight: 600,
  },
  toolActive: {
    minHeight: 40,
    border: "1px solid #cab7e8",
    borderRadius: 10,
    background: "#eee4fb",
    cursor: "pointer",
    color: "#392354",
    fontWeight: 700,
    boxShadow: "0 5px 12px rgba(87,58,130,.13)",
  },
  workspace: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 0,
  },
  stageZoom: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    transformOrigin: "top center",
  },
  sidebar: {
    background: "#fff",
    borderLeft: "1px solid #e4e2e7",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
  },
  workspaceHead: { width: "100%", display: "flex", gap: 12, fontSize: 13 },
  previewCard: {
    background: "#fff",
    border: "1px solid #e2e0e5",
    borderRadius: 18,
    overflow: "hidden",
  },
  cardHead: {
    padding: "13px 15px 0",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 16,
  },
  rotate: {
    textAlign: "center",
    color: "#77727d",
    fontSize: 12,
    margin: "-12px 0 14px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e0e5",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  leftCard: {
    background: "#fff",
    border: "1px solid #e5e0e8",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 5px 14px rgba(40,34,48,.045)",
  },
  targetHint: { margin: 0, fontSize: 12, color: "#67616e", lineHeight: 1.4 },
  swatches: { display: "flex", gap: 10, flexWrap: "wrap" },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "1px solid #ddd",
    cursor: "pointer",
  },
  colorPicker: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "1px dashed #6d6475",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    position: "relative",
    fontWeight: 700,
  },
  nativeColor: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  designActions: { display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 8 },
  secondary: {
    background: "#fff",
    color: "#27232c",
    border: "1px solid #cfc7d7",
    borderRadius: 9,
    padding: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  upload: {
    background: "#eee4fb",
    color: "#392354",
    border: "1px solid #cab7e8",
    borderRadius: 9,
    padding: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  input: {
    border: "1px solid #ded8e3",
    padding: "11px 12px",
    borderRadius: 9,
    background: "#fbfaff",
    fontSize: 13,
  },
  dropHint: {
    border: "1px dashed #b8aec4",
    borderRadius: 9,
    padding: 10,
    textAlign: "center",
    fontSize: 11,
    color: "#70677b",
    background: "#fcfbfd",
  },
  styleGrid: {
    display: "grid",
    gridTemplateColumns: "88px minmax(0,1fr)",
    gap: 13,
    fontSize: 12,
    color: "#625d68",
  },
  select: {
    display: "block",
    width: "100%",
    marginTop: 6,
    padding: "8px 9px",
    border: "1px solid #d8d1dd",
    borderRadius: 8,
    background: "#fff",
  },
  textSwatches: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
    alignItems: "center",
    padding: 5,
    background: "#faf7ff",
    border: "1px solid #e5daef",
    borderRadius: 10,
  },
  textSwatch: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "2px solid #fff",
    cursor: "pointer",
  },
  textColorInput: {
    width: 22,
    height: 22,
    padding: 0,
    border: "2px solid #fff",
    borderRadius: "50%",
    background: "transparent",
    cursor: "pointer",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(35,27,48,.2)",
  },
  rangeLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    fontSize: 12,
    color: "#625d68",
  },
  sizeControl: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#413b47",
    background: "#faf9fc",
    border: "1px solid #e5e0e9",
    borderRadius: 9,
    padding: "5px 7px",
    width: "fit-content",
  },
  unitInput: {
    width: 60,
    padding: "6px 7px",
    border: 0,
    borderRadius: 6,
    fontSize: 13,
    background: "#fff",
  },
  measureHint: {
    margin: "-3px 0 0",
    fontSize: 11,
    color: "#77717b",
    lineHeight: 1.35,
  },
  download: {
    background: "#eee4fb",
    color: "#392354",
    border: "1px solid #cab7e8",
    borderRadius: 9,
    padding: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  materials: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  material: {
    padding: 9,
    border: "1px solid #dfdbe4",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    fontSize: 12,
  },
  materialActive: {
    padding: 9,
    border: "2px solid #1677ff",
    borderRadius: 8,
    background: "#eff6ff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  },
  zoom: {
    marginTop: 18,
    background: "#fff",
    border: "1px solid #e2e0e5",
    borderRadius: 14,
    padding: "6px 10px",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 9,
  },
  zoomButton: {
    border: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: 20,
    color: "#49346a",
    lineHeight: 1,
  },
  zoomReset: {
    border: 0,
    borderLeft: "1px solid #e4e0e7",
    background: "transparent",
    cursor: "pointer",
    fontSize: 11,
    color: "#6e6577",
    paddingLeft: 9,
  },
  aiSection: {
    width: "min(700px,96%)",
    marginTop: 30,
    background: "#fff",
    border: "1px solid #e3dfea",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 10px 24px rgba(35,29,47,.05)",
  },
  aiSectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
  },
  aiStatus: { fontSize: 11, color: "#6c5e7a", marginLeft: 9 },
  aiRefresh: {
    border: "1px solid #cfbde7",
    borderRadius: 8,
    background: "#f3ecfd",
    color: "#513878",
    padding: "6px 9px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
  aiGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 14,
  },
  aiCard: {
    border: "1px dashed #cbbce1",
    borderRadius: 12,
    padding: 14,
    background: "#fcfaff",
  },
  aiList: { display: "flex", flexDirection: "column", gap: 8, marginTop: 11 },
  aiSuggestion: {
    textAlign: "left",
    border: "1px solid #e3dbe9",
    borderRadius: 9,
    padding: "9px 10px",
    background: "#fff",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "3px 8px",
    fontSize: 12,
  },
  aiPlaceholder: {
    marginTop: 12,
    padding: "8px 10px",
    borderRadius: 8,
    background: "#f0e9fa",
    fontSize: 11,
    color: "#68567f",
    textAlign: "center",
  },
  footer: {
    padding: "18px 30px",
    background: "#fff",
    borderTop: "1px solid #e4e2e7",
    color: "#766c81",
    fontSize: 13,
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },
};
