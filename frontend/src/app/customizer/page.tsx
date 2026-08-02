"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const silhouettes = ["Classic T-Shirt", "Trendy Crop Top"];
const fits = ["Relaxed", "Regular", "Slim Fit"];
const sizes = ["XS", "S", "M", "L", "XL"];
const colors = ["#c8d0f0", "#f5d060", "#f5a060", "#f09090", "#333333", "#e8e8e8"];
const colorNames = ["Lavender", "Butter", "Peach", "Blush", "Midnight", "White"];
const fontStyles = ["Playfair Display", "Inter", "Georgia", "Courier New"];
const materials = ["Organic Cotton", "Bamboo Blend", "Linen Mix", "Silk Touch"];

const inspirations = [
  { name: "Retro Bloom", bg: "#f5c8a0", accent: "#e05080" },
  { name: "Modern Serif", bg: "#f0f0f0", accent: "#333" },
  { name: "Digital Glitch", bg: "#ff6a00", accent: "#fff" },
  { name: "Watercolour Haze", bg: "#c8d8f0", accent: "#7b2fa8" },
];

interface DesignSuggestion {
  colors: string[];
  fonts: string[];
  source: "openai" | "mock";
}

export default function CustomizerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedSilhouette, setSelectedSilhouette] = useState(0);
  const [selectedFit, setSelectedFit] = useState("Regular");
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColor, setSelectedColor] = useState(0);
  const [customText, setCustomText] = useState("");
  const [selectedFont, setSelectedFont] = useState("Playfair Display");
  const [selectedMaterial, setSelectedMaterial] = useState("Organic Cotton");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // AI Stylist state
  const [styleDescription, setStyleDescription] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<DesignSuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const estimatedPrice = 45 + (selectedMaterial === "Silk Touch" ? 20 : selectedMaterial === "Bamboo Blend" ? 10 : 0);

  const handleGetAiSuggestions = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (styleDescription.trim().length < 3) {
      setAiError("Describe your vibe in a few more words (e.g. \"elegant evening look\").");
      return;
    }
    setAiError(null);
    setAiLoading(true);
    try {
      const result = await api.post("/recommendations/design", { description: styleDescription });
      setAiSuggestion(result);
    } catch (err) {
      console.error("[customizer] AI suggestion failed:", err);
      setAiError("Couldn't get suggestions right now. Please try again.");
    } finally {
      setAiLoading(false);
    }
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
        cut: `${silhouettes[selectedSilhouette]} — ${selectedFit}`,
        size: selectedSize,
        notes: `Quantity: ${quantity}${customText ? `. Custom text: "${customText}" (${selectedFont})` : ""}`,
        estimatedPriceCents: Math.round(estimatedPrice * 100 * quantity),
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

  return (
    <div style={s.page}>
      <style>{css}</style>
      <Navbar activePage="customizer" />

      <div style={s.container}>
        {/* LEFT — Preview */}
        <div style={s.previewSection}>
          <div style={s.badge}>CUSTOM LIVE</div>

          {/* Garment Preview */}
          <div style={{...s.previewBox, backgroundColor: colors[selectedColor]}}>
            <div style={s.garmentShape}>
              {/* T-shirt SVG shape */}
              <svg viewBox="0 0 200 220" width="180" height="200" style={{ display: "block", margin: "0 auto" }}>
                <path
                  d={selectedSilhouette === 0
                    ? "M60,20 L20,60 L50,70 L50,200 L150,200 L150,70 L180,60 L140,20 L120,35 Q100,45 80,35 Z"
                    : "M60,20 L20,60 L50,70 L50,140 L150,140 L150,70 L180,60 L140,20 L120,35 Q100,45 80,35 Z"
                  }
                  fill="rgba(255,255,255,0.85)"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="1.5"
                />
                {customText && (
                  <text
                    x="100"
                    y={selectedSilhouette === 0 ? "130" : "100"}
                    textAnchor="middle"
                    fontSize="14"
                    fontFamily={selectedFont}
                    fill="#2d1a3a"
                    opacity="0.8"
                  >
                    {customText.slice(0, 12)}
                  </text>
                )}
              </svg>
            </div>
            <p style={s.colorLabel}>{colorNames[selectedColor]}</p>
          </div>

          {/* Preview controls */}
          <div style={s.previewControls}>
            <button style={s.controlBtn} className="ctrl-btn" title="Rotate">↺</button>
            <button style={s.controlBtn} className="ctrl-btn" title="Zoom">⊕</button>
            <button style={s.controlBtn} className="ctrl-btn" title="Reset">⊗</button>
          </div>

          {/* AI Stylist */}
          <div style={s.aiBox}>
            <p style={s.aiTitle}>✦ AI STYLIST SUGGESTIONS</p>

            <div style={s.aiInputWrap}>
              <input
                value={styleDescription}
                onChange={(e) => setStyleDescription(e.target.value)}
                placeholder="Describe your vibe (e.g. elegant evening look)"
                style={s.aiInput}
                className="custom-input"
                maxLength={80}
                onKeyDown={(e) => { if (e.key === "Enter") handleGetAiSuggestions(); }}
              />
              <button
                style={s.aiButton}
                className="ai-suggest-btn"
                onClick={handleGetAiSuggestions}
                disabled={aiLoading}
              >
                {aiLoading ? "Thinking…" : "Get Suggestions"}
              </button>
            </div>

            {aiError && <p style={s.aiErrorText}>{aiError}</p>}

            {aiSuggestion && (
              <div style={s.aiSuggestions}>
                <div style={s.aiChipGroup}>
                  <span style={s.aiChipLabel}>Colors</span>
                  <div style={s.aiChipRow}>
                    {aiSuggestion.colors.map((c) => (
                      <span key={c} style={s.aiChip}>{c}</span>
                    ))}
                  </div>
                </div>
                <div style={s.aiChipGroup}>
                  <span style={s.aiChipLabel}>Fonts</span>
                  <div style={s.aiChipRow}>
                    {aiSuggestion.fonts.map((f) => (
                      <span key={f} style={s.aiChip}>{f}</span>
                    ))}
                  </div>
                </div>
                {aiSuggestion.source === "mock" && (
                  <p style={s.aiMockNote}>Preview suggestions — full AI stylist coming soon.</p>
                )}
              </div>
            )}

            {!aiSuggestion && !aiError && (
              <p style={s.aiHint}>Tell us the look you're going for and we'll suggest colors and fonts to match.</p>
            )}
          </div>
        </div>

        {/* RIGHT — Controls */}
        <div style={s.controls}>
          <h1 style={s.title}>Design Your Masterpiece</h1>
          <p style={s.subtitle}>Choose your silhouette, colors, and add personal touches to create something uniquely yours.</p>

          {/* Silhouette */}
          <div style={s.section}>
            <p style={s.sectionLabel}>SILHOUETTE</p>
            <div style={s.silhouetteRow}>
              {silhouettes.map((sil, i) => (
                <button
                  key={sil}
                  style={selectedSilhouette === i ? s.silBtnActive : s.silBtn}
                  className={selectedSilhouette === i ? "sil-active" : "sil-btn"}
                  onClick={() => setSelectedSilhouette(i)}
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
              {fits.map(f => (
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
              {sizes.map(sz => (
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
            <p style={s.sectionLabel}>COLOR PALETTE <span style={s.baseColorLabel}>Base Color: {colorNames[selectedColor]}</span></p>
            <div style={s.colorRow}>
              {colors.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(i)}
                  style={{
                    ...s.colorCircle,
                    backgroundColor: c,
                    border: selectedColor === i ? "3px solid #c0395a" : "2px solid #e8dce8",
                    transform: selectedColor === i ? "scale(1.2)" : "scale(1)",
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
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Your message here..."
                style={s.textInput}
                className="custom-input"
                maxLength={20}
              />
              <span style={s.textCount}>{customText.length}/20</span>
            </div>

            <div style={s.fontMaterialRow}>
              <div style={s.selectWrap}>
                <p style={s.selectLabel}>Font Style</p>
                <select style={s.select} value={selectedFont} onChange={e => setSelectedFont(e.target.value)}>
                  {fontStyles.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div style={s.selectWrap}>
                <p style={s.selectLabel}>Material</p>
                <select style={s.select} value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)}>
                  {materials.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div style={s.uploadBox} className="upload-box">
            <p style={s.uploadIcon}>⬆</p>
            <p style={s.uploadText}>Upload Your Design</p>
            <p style={s.uploadSub}>Supports PNG, JPG, SVG only</p>
          </div>

          {/* Total + Submit */}
          <div style={s.bottomRow}>
            <div>
              <p style={s.totalLabel}>ESTIMATED TOTAL</p>
              <p style={s.totalPrice}>${estimatedPrice}.00</p>
            </div>
            <div style={s.qtyAddRow}>
              <div style={s.qtyWrap}>
                <button style={s.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span style={s.qtyNum}>{quantity}</span>
                <button style={s.qtyBtn} onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <button style={s.addBagBtn} className="add-bag-btn" onClick={handleSubmitRequest} disabled={submitting}>
                {submitted ? "✓ Request Submitted!" : submitting ? "Submitting…" : "✦ Submit Custom Request"}
              </button>
            </div>
          </div>
          {submitError && <p style={{ color: "#c0395a", fontSize: 12.5, marginTop: 10 }}>{submitError}</p>}
        </div>
      </div>

      {/* AI INSPIRATION */}
      <section style={s.inspoSection}>
        <div style={s.inspoHeader}>
          <p style={s.inspoTitle}>✦ AI Design Inspo</p>
          <button style={s.refreshBtn} className="refresh-btn">Refresh Ideas</button>
        </div>
        <div style={s.inspoGrid}>
          {inspirations.map(item => (
            <div key={item.name} style={{...s.inspoCard, backgroundColor: item.bg}} className="inspo-card">
              <div style={s.inspoImgArea}>
                <svg viewBox="0 0 100 100" width="80" height="80" style={{ margin: "0 auto", display: "block" }}>
                  <path d="M30,20 L10,40 L25,45 L25,90 L75,90 L75,45 L90,40 L70,20 L60,28 Q50,33 40,28 Z"
                    fill={item.accent} opacity="0.85"/>
                  <text x="50" y="60" textAnchor="middle" fontSize="8" fill={item.bg} fontFamily="Georgia">✦</text>
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

const s: { [key: string]: React.CSSProperties } = {
  page: { fontFamily: "'Inter','Segoe UI',sans-serif", backgroundColor: "#fdf8fb", minHeight: "100vh" },
  container: { display: "flex", gap: 40, padding: "32px 48px", maxWidth: 1100, margin: "0 auto" },

  // LEFT
  previewSection: { width: 280, flexShrink: 0 },
  badge: { display: "inline-block", background: "linear-gradient(135deg,#c0395a,#7b2fa8)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: 1, marginBottom: 12 },
  previewBox: { borderRadius: 16, padding: "24px 16px 12px", marginBottom: 8, minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "background-color 0.3s" },
  garmentShape: { width: "100%", display: "flex", justifyContent: "center" },
  colorLabel: { fontSize: 11, color: "#fff", fontWeight: 600, letterSpacing: 1, marginTop: 8, textShadow: "0 1px 4px rgba(0,0,0,0.2)" },
  previewControls: { display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 },
  controlBtn: { width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #e8dce8", background: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  aiBox: { background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #f0e8f5" },
  aiTitle: { fontSize: 10, fontWeight: 700, color: "#9b6fd0", letterSpacing: 1, marginBottom: 10 },
  aiInputWrap: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 },
  aiInput: { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e8dce8", fontSize: 12, outline: "none", fontFamily: "'Inter',sans-serif", boxSizing: "border-box" },
  aiButton: { padding: "8px 0", borderRadius: 8, background: "#7b2fa8", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  aiErrorText: { fontSize: 11, color: "#c0395a", marginBottom: 8 },
  aiHint: { fontSize: 11, color: "#aaa", lineHeight: 1.5 },
  aiSuggestions: { display: "flex", flexDirection: "column", gap: 10 },
  aiChipGroup: { display: "flex", flexDirection: "column", gap: 6 },
  aiChipLabel: { fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: 0.5, textTransform: "uppercase" },
  aiChipRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  aiChip: { fontSize: 11, color: "#7b2fa8", background: "#f8f0ff", border: "1px solid #e8d8f5", borderRadius: 20, padding: "3px 10px" },
  aiMockNote: { fontSize: 10, color: "#bbb", fontStyle: "italic", margin: 0 },
  aiSuggestion: { fontSize: 11, color: "#555", lineHeight: 1.5, display: "flex", gap: 6 },
  aiText: { fontSize: 11, color: "#555" },
  aiLink: { color: "#c0395a", textDecoration: "underline", cursor: "pointer" },

  // RIGHT
  controls: { flex: 1 },
  title: { fontSize: 22, fontWeight: 700, color: "#2d1a3a", fontFamily: "'Georgia',serif", margin: "0 0 6px 0" },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.5 },

  section: { marginBottom: 18 },
  sectionLabel: { fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 },
  baseColorLabel: { fontWeight: 400, color: "#c0395a", textTransform: "none", letterSpacing: 0 },

  silhouetteRow: { display: "flex", gap: 10 },
  silBtn: { flex: 1, padding: "10px 8px", borderRadius: 10, border: "1.5px solid #e8dce8", background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  silBtnActive: { flex: 1, padding: "10px 8px", borderRadius: 10, border: "1.5px solid #7b2fa8", background: "#f8f0ff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  silIcon: { fontSize: 20 },
  silLabel: { fontSize: 11, fontWeight: 500, color: "#2d1a3a" },

  fitRow: { display: "flex", gap: 8 },
  fitBtn: { flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid #e8dce8", background: "#fff", fontSize: 12, color: "#555", cursor: "pointer" },
  fitBtnActive: { flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid #7b2fa8", background: "#f8f0ff", fontSize: 12, color: "#7b2fa8", fontWeight: 600, cursor: "pointer" },

  sizeRow: { display: "flex", gap: 8 },
  sizeBtn: { width: 40, height: 36, borderRadius: 8, border: "1.5px solid #e8dce8", background: "#fff", fontSize: 12, color: "#555", cursor: "pointer" },
  sizeBtnActive: { width: 40, height: 36, borderRadius: 8, border: "1.5px solid #c0395a", background: "#c0395a", fontSize: 12, color: "#fff", fontWeight: 700, cursor: "pointer" },

  colorRow: { display: "flex", gap: 10 },
  colorCircle: { width: 28, height: 28, borderRadius: "50%", cursor: "pointer", transition: "transform 0.2s, border 0.2s" },

  textInputWrap: { position: "relative", marginBottom: 12 },
  textInput: { width: "100%", padding: "10px 40px 10px 14px", borderRadius: 8, border: "1.5px solid #e8dce8", fontSize: 13, outline: "none", fontFamily: "'Inter',sans-serif", boxSizing: "border-box" },
  textCount: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#bbb" },
  fontMaterialRow: { display: "flex", gap: 12 },
  selectWrap: { flex: 1 },
  selectLabel: { fontSize: 11, color: "#999", marginBottom: 4 },
  select: { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e8dce8", fontSize: 12, color: "#2d1a3a", outline: "none", cursor: "pointer", backgroundColor: "#fff" },

  uploadBox: { border: "2px dashed #d8c8f0", borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 20, cursor: "pointer" },
  uploadIcon: { fontSize: 24, color: "#9b6fd0", marginBottom: 4 },
  uploadText: { fontSize: 13, fontWeight: 600, color: "#2d1a3a", margin: "0 0 2px 0" },
  uploadSub: { fontSize: 11, color: "#aaa" },

  bottomRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f0e8f5" },
  totalLabel: { fontSize: 10, color: "#999", letterSpacing: 1, fontWeight: 700, marginBottom: 4 },
  totalPrice: { fontSize: 20, fontWeight: 700, color: "#2d1a3a" },
  qtyAddRow: { display: "flex", gap: 12, alignItems: "center" },
  qtyWrap: { display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e8dce8", borderRadius: 8, padding: "4px 8px" },
  qtyBtn: { width: 24, height: 24, border: "none", background: "none", fontSize: 16, cursor: "pointer", color: "#5b2d8e", fontWeight: 700 },
  qtyNum: { fontSize: 14, fontWeight: 600, color: "#2d1a3a", minWidth: 20, textAlign: "center" },
  addBagBtn: { padding: "10px 20px", borderRadius: 8, background: "#c0395a", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" },

  // INSPO
  inspoSection: { padding: "32px 48px 48px", maxWidth: 1100, margin: "0 auto" },
  inspoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  inspoTitle: { fontSize: 15, fontWeight: 700, color: "#2d1a3a" },
  refreshBtn: { fontSize: 12, color: "#9b6fd0", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" },
  inspoGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  inspoCard: { borderRadius: 12, padding: "20px 16px 12px", cursor: "pointer", textAlign: "center", transition: "transform 0.2s" },
  inspoImgArea: { marginBottom: 10 },
  inspoName: { fontSize: 12, fontWeight: 600, color: "#2d1a3a" },
};

const css = `
  .ctrl-btn:hover { background: #f8f0ff !important; border-color: #9b6fd0 !important; }
  .fit-btn:hover { border-color: #7b2fa8 !important; color: #7b2fa8 !important; }
  .sil-btn:hover { border-color: #7b2fa8 !important; background: #f8f0ff !important; }
  .size-btn:hover { border-color: #c0395a !important; color: #c0395a !important; }
  .custom-input:focus { border-color: #9b6fd0 !important; outline: none; }
  .upload-box:hover { background: #f8f0ff !important; border-color: #9b6fd0 !important; }
  .add-bag-btn:hover { background: #a02848 !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(192,57,90,0.3); }
  .ai-suggest-btn:hover { background: #6a2494 !important; }
  .inspo-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
  .refresh-btn:hover { color: #c0395a !important; }
`;