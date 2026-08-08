"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import Canvas3D from "@/app/customizer/Canvas3D";
import type { DesignLayer, GarmentPart } from "@/app/customizer/Studio";

type Design = {
  id: string;
  requestNumber?: string;
  color: string;
  fabric: string;
  cut: string;
  size?: string;
  status?: string;
  createdAt: string;
  estimatedPriceCents?: number;
  designConfig?: {
    panels?: Partial<Record<GarmentPart, string>>;
    layers?: DesignLayer[];
  };
};
const defaults: Record<GarmentPart, string> = {
  front: "#c8d0f0",
  back: "#c8d0f0",
  "left-sleeve": "#c8d0f0",
  "right-sleeve": "#c8d0f0",
  collar: "#c8d0f0",
};
function GarmentPreview({ design }: { design: Design }) {
  return (
    <div style={s.preview}>
      <Canvas3D
        height="260px"
        color={design.color || defaults.front}
        panelColors={{ ...defaults, ...design.designConfig?.panels }}
        modelPath="/models/tshirt.glb"
        material={design.fabric || "Organic Cotton"}
        layers={design.designConfig?.layers ?? []}
        resetToken={0}
      />
      <span style={s.live}>3D PREVIEW</span>
    </div>
  );
}
function confirmAction(
  title: string,
  message: string,
  confirmText: string,
  danger = false,
) {
  return new Promise<boolean>((resolve) => {
    const layer = document.createElement("div"),
      box = document.createElement("div");
    layer.style.cssText =
      "position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:rgba(35,24,46,.45);padding:20px";
    box.style.cssText =
      "max-width:400px;background:#fff;border-radius:20px;padding:30px;text-align:center;box-shadow:0 24px 60px rgba(30,20,40,.28);font-family:Inter,Arial";
    box.innerHTML = `<div style=\"width:50px;height:50px;margin:auto;border-radius:50%;display:grid;place-items:center;background:${danger ? "#fee8ea" : "#eee4fb"};color:${danger ? "#ae3a48" : "#5d338f"};font-size:25px;font-weight:800\">${danger ? "!" : "✓"}</div><h2 style=\"margin:16px 0 8px;color:#32263d\">${title}</h2><p style=\"color:#746a7d;line-height:1.5\">${message}</p><div style=\"display:flex;gap:10px;margin-top:22px\"><button id=\"cancel\" style=\"flex:1;padding:11px;border:1px solid #ddd;border-radius:9px;background:#fff;cursor:pointer\">Cancel</button><button id=\"confirm\" style=\"flex:1;padding:11px;border:0;border-radius:9px;background:${danger ? "#c94c5a" : "#5d338f"};color:#fff;font-weight:800;cursor:pointer\">${confirmText}</button></div>`;
    layer.appendChild(box);
    document.body.appendChild(layer);
    const done = (v: boolean) => {
      layer.remove();
      resolve(v);
    };
    box.querySelector("#cancel")?.addEventListener("click", () => done(false));
    box.querySelector("#confirm")?.addEventListener("click", () => done(true));
    layer.addEventListener("click", (e) => {
      if (e.target === layer) done(false);
    });
  });
}

export default function MyDesignsPage() {
  const router = useRouter();
  const { addCustomizationToCart } = useCart();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void api
      .get("/customizations/mine")
      .then((items: Design[]) =>
        setDesigns(
          items.map((item) => ({ ...item, requestNumber: "Custom T-Shirt" })),
        ),
      )
      .catch(() => setDesigns([]))
      .finally(() => setLoading(false));
  }, []);
  const qty = (id: string) => quantities[id] ?? 1;
  const change = (id: string, n: number) =>
    setQuantities((v) => ({ ...v, [id]: Math.max(1, Math.min(20, n)) }));
  const add = async (d: Design) => {
    if (
      !(await confirmAction(
        "Add to bag?",
        `Add ${qty(d.id)} custom T-shirt${qty(d.id) > 1 ? "s" : ""} to your bag?`,
        `Add to bag`,
      ))
    )
      return;
    setDesigns((items) => items.filter((item) => item.id !== d.id));
    const ok = await addCustomizationToCart(
      {
        id: `customization:${d.id}`,
        customizationId: d.id,
        name: "Custom T-Shirt",
        price: (d.estimatedPriceCents ?? 4500) / 100,
        image: "",
        color: d.color || "Custom",
        colorSwatch: d.color,
        size: d.size || "S",
        material: d.fabric || "Organic Cotton",
        customizationConfig: d.designConfig,
      },
      qty(d.id),
    );
    if (ok) {
      setNotice("Custom design added to your bag");
      window.setTimeout(() => setNotice(""), 3500);
    } else {
      setDesigns((items) => [...items, d]);
      setNotice("Could not add the custom design to your bag. Please try again.");
    }
  };
  const remove = async (d: Design) => {
    if (
      !(await confirmAction(
        "Delete this design?",
        "This will permanently remove your saved custom design. You cannot undo this action.",
        "Delete design",
        true,
      ))
    )
      return;
    await api.delete(`/customizations/${d.id}`);
    setDesigns((items) => items.filter((item) => item.id !== d.id));
  };
  return (
    <main style={s.page}>
      <Navbar />
      <header style={s.hero}>
        <div>
          <p style={s.kicker}>YOUR CREATIVE WARDROBE</p>
          <h1 style={s.title}>My Designs</h1>
          <p style={s.lead}>
            Revisit, refine, and order every T-shirt you have created.
          </p>
        </div>
        <button style={s.create} onClick={() => router.push("/customizer")}>
          ＋ Create new design
        </button>
      </header>
      <section style={s.content}>
        {loading ? (
          <div style={s.loading}>Loading your saved designs…</div>
        ) : designs.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>✦</div>
            <h2>Start your first design</h2>
            <p>Your saved custom T-shirts will appear here.</p>
            <button style={s.create} onClick={() => router.push("/customizer")}>
              Open Design Studio
            </button>
          </div>
        ) : (
          <>
            <div style={s.sectionHead}>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "Georgia,serif",
                    fontSize: 28,
                  }}
                >
                  Saved designs
                </h2>
                <p style={{ margin: "6px 0 0", color: "#766d80" }}>
                  {designs.length} designs ready to make yours
                </p>
              </div>
            </div>
            <div style={s.grid}>
              {designs.map((d, index) => {
                const amount =
                  ((d.estimatedPriceCents ?? 4500) / 100) * qty(d.id);
                return (
                  <article key={d.id} style={s.card}>
                    <GarmentPreview design={d} />
                    <div style={s.details}>
                      <div style={s.cardTop}>
                        <div>
                          <span style={s.number}>
                            DESIGN {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3 style={s.name}>
                            {d.requestNumber || "Custom T-Shirt"}
                          </h3>
                        </div>
                        <span style={s.status}>
                          {(d.status || "Saved").replace("_", " ")}
                        </span>
                      </div>
                      <p style={s.meta}>
                        {d.cut || "Classic T-Shirt"} <span>•</span>{" "}
                        {d.fabric || "Organic Cotton"}
                      </p>
                      <p style={s.date}>
                        Saved {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                      <p
                        style={{
                          margin: "7px 0 0",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#5d407d",
                        }}
                      >
                        T-shirt size: {d.size || "S"}
                      </p>
                      <div style={s.orderRow}>
                        <div>
                          <small style={s.label}>QUANTITY</small>
                          <div style={s.stepper}>
                            <button onClick={() => change(d.id, qty(d.id) - 1)}>
                              −
                            </button>
                            <b>{qty(d.id)}</b>
                            <button onClick={() => change(d.id, qty(d.id) + 1)}>
                              +
                            </button>
                          </div>
                        </div>
                        <div style={s.price}>
                          <small style={s.label}>ESTIMATED TOTAL</small>
                          <b>${amount.toFixed(2)}</b>
                        </div>
                      </div>
                      <div style={s.actions}>
                        <button style={s.bag} onClick={() => void add(d)}>
                          🛍️ Add{" "}
                        </button>
                        <button
                          style={s.edit}
                          onClick={() =>
                            router.push(`/customizer?designId=${d.id}`)
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          style={s.delete}
                          onClick={() => void remove(d)}
                          title="Delete design"
                        >
                          ⛔
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
      {notice && (
        <div style={s.toast}>
          ✓ <span>{notice}</span>
          <button onClick={() => router.push("/bag")}>View bag</button>
        </div>
      )}
      <Footer />
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 0 15%,#eee7f9,transparent 30%),radial-gradient(circle at 100% 45%,#fff1d9,transparent 32%),#faf9fc",
    color: "#30253b",
    fontFamily: "Inter,Arial,sans-serif",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "end",
    padding: "62px max(7vw,30px) 38px",
    background: "rgba(255,255,255,.65)",
    borderBottom: "1px solid #e7deed",
  },
  kicker: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".16em",
    color: "#8a69af",
    margin: 0,
  },
  title: {
    fontFamily: "Georgia,serif",
    fontWeight: 500,
    fontSize: "clamp(38px,5vw,56px)",
    margin: "9px 0",
  },
  lead: { margin: 0, color: "#776d82" },
  create: {
    border: "1px solid #c8afe6",
    borderRadius: 10,
    background: "#eadff8",
    padding: "12px 17px",
    fontSize: 14,
    fontWeight: 800,
    color: "#482a6b",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  content: { maxWidth: 1240, margin: "0 auto", padding: "38px 30px 70px" },
  sectionHead: { marginBottom: 22 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(520px,1fr))",
    gap: 24,
  },
  card: {
    display: "grid",
    gridTemplateColumns: "245px minmax(0,1fr)",
    padding: 14,
    border: "1px solid rgba(255,255,255,.9)",
    borderRadius: 20,
    background: "rgba(255,255,255,.88)",
    boxShadow: "0 16px 32px rgba(68,43,94,.11)",
  },
  preview: {
    position: "relative",
    minHeight: 260,
    borderRadius: 14,
    overflow: "hidden",
    background: "linear-gradient(145deg,#f1ecf7,#faf8fb)",
    border: "1px solid #e4dce9",
  },
  live: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 99,
    padding: "4px 7px",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: ".08em",
    background: "#e6f6eb",
    color: "#3d8057",
  },
  details: {
    padding: "8px 8px 8px 20px",
    display: "flex",
    flexDirection: "column",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "start",
  },
  number: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: ".12em",
    color: "#8b6dae",
  },
  name: {
    margin: "6px 0 0",
    fontSize: 21,
    fontFamily: "Georgia,serif",
    fontWeight: 500,
  },
  status: {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: ".05em",
    padding: "5px 7px",
    borderRadius: 99,
    background: "#e8f7ec",
    color: "#3b7b54",
    textTransform: "uppercase",
  },
  meta: { fontSize: 13, color: "#5e536a", margin: "17px 0 4px" },
  date: { margin: 0, fontSize: 12, color: "#908596" },
  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    marginTop: "auto",
    paddingTop: 20,
  },
  label: {
    display: "block",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: ".1em",
    color: "#887d91",
    marginBottom: 7,
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ded5e5",
    borderRadius: 9,
    overflow: "hidden",
  },
  price: { textAlign: "right" },
  actions: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 42px",
    gap: 8,
    marginTop: 18,
  },
  bag: {
    border: 0,
    borderRadius: 9,
    background: "#5d338f",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  edit: {
    border: "1px solid #a9d7b7",
    borderRadius: 9,
    background: "#e2f4e8",
    color: "#22633f",
    fontWeight: 800,
    cursor: "pointer",
  },
  delete: {
    border: "1px solid #f0bac0",
    borderRadius: 9,
    background: "#ffecef",
    color: "#aa3948",
    fontSize: 18,
    cursor: "pointer",
  },
  toast: {
    position: "fixed",
    top: 88,
    right: 24,
    zIndex: 500,
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: 13,
    background: "#e5f7ea",
    boxShadow: "0 14px 32px rgba(32,93,55,.18)",
    color: "#21613c",
    fontWeight: 700,
  },
  loading: { padding: 70, textAlign: "center", color: "#74687e" },
  empty: {
    maxWidth: 460,
    margin: "30px auto",
    padding: 46,
    textAlign: "center",
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 12px 28px rgba(68,43,94,.08)",
  },
  emptyIcon: { fontSize: 32, color: "#8158ac" },
  footer: { padding: 20 },
};
s.number = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: ".12em",
  color: "#8b6dae",
};
s.orderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "stretch",
  gap: 14,
  marginTop: "auto",
  paddingTop: 22,
};
s.stepper = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "7px 11px",
  border: "1px solid #cdb9e5",
  borderRadius: 10,
  background: "#faf6ff",
  color: "#482a6b",
};
s.price = {
  textAlign: "right",
  padding: "8px 12px",
  borderRadius: 10,
  background: "#f0e7fc",
  color: "#482a6b",
  minWidth: 112,
};
s.actions = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr .75fr",
  gap: 10,
  marginTop: 20,
  paddingTop: 14,
  borderTop: "1px solid #ece5f0",
};
s.bag = {
  minHeight: 42,
  border: 0,
  borderRadius: 10,
  background: "#5d338f",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
s.edit = {
  minHeight: 42,
  border: "1px solid #a9d7b7",
  borderRadius: 10,
  background: "#e2f4e8",
  color: "#22633f",
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
s.delete = {
  minHeight: 42,
  border: "1px solid #f0bac0",
  borderRadius: 10,
  background: "#ffecef",
  color: "#aa3948",
  fontSize: 18,
  cursor: "pointer",
};
