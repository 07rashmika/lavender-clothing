"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Canvas3D from "@/app/customizer/Canvas3D";
import type { Customization, CustomizationStatus } from "@/types/customization";
import type { GarmentPart } from "@/app/customizer/Studio";

const defaultPanelColors: Record<GarmentPart, string> = {
  front: "#c8d0f0",
  back: "#c8d0f0",
  "left-sleeve": "#c8d0f0",
  "right-sleeve": "#c8d0f0",
  collar: "#c8d0f0",
};

function DesignPreview({ request }: { request: Customization }) {
  const config = request.designConfig;
  if (config?.panels || config?.layers) {
    return (
      <div style={s.preview3d}>
        <Canvas3D
          height="260px"
          color={request.color || defaultPanelColors.front}
          panelColors={{ ...defaultPanelColors, ...config.panels }}
          modelPath="/models/tshirt.glb"
          material={request.fabric || "Organic Cotton"}
          layers={config.layers ?? []}
          resetToken={0}
        />
        <span style={s.liveTag}>3D PREVIEW</span>
      </div>
    );
  }
  if (request.designPreview) {
    return (
      <div style={s.previewImgWrap}>
        <img src={request.designPreview} alt="Design preview" style={s.previewImg} />
      </div>
    );
  }
  return <p style={s.noPreview}>No preview available for this request.</p>;
}

const statusOptions: CustomizationStatus[] = [
  "PENDING_REVIEW",
  "IN_PRODUCTION",
  "READY_FOR_DELIVERY",
  "DELIVERED",
];

const statusLabel: Record<CustomizationStatus, string> = {
  PENDING_REVIEW: "Pending Review",
  IN_PRODUCTION: "In Production",
  READY_FOR_DELIVERY: "Ready for Delivery",
  DELIVERED: "Delivered",
};

const statusStyle: Record<CustomizationStatus, React.CSSProperties> = {
  PENDING_REVIEW: { background: "#ede4f7", color: "#7c5cbf" },
  IN_PRODUCTION: { background: "#fdf0d8", color: "#a3760f" },
  READY_FOR_DELIVERY: { background: "#e3ecf9", color: "#3a5d9d" },
  DELIVERED: { background: "#e3f3e8", color: "#3a9d5f" },
};

export default function CustomizationMonitorPage() {
  const [requests, setRequests] = useState<Customization[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/customizations")
      .then((data) => setRequests(data ?? []))
      .catch((err) => console.error("[admin/customization] fetch failed:", err));
  }, []);

  const updateStatus = async (id: string, status: CustomizationStatus) => {
    const prev = requests;
    setRequests((cur) => cur.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await api.patch(`/customizations/${id}/status`, { status });
    } catch (err) {
      console.error("[admin/customization] status update failed:", err);
      setRequests(prev);
      alert("Failed to update request status.");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING_REVIEW").length;
  const urgentCount = requests.filter((r) => r.urgent).length;

  return (
    <div>
      <h1 style={s.title}>Customization Monitor</h1>
      <p style={s.subtitle}>Track and manage custom design requests submitted through the Customizer tool.</p>

      <div style={s.statsRow}>
        <div style={s.miniStat}>
          <p style={s.miniStatValue}>{requests.length}</p>
          <p style={s.miniStatLabel}>Total Requests</p>
        </div>
        <div style={s.miniStat}>
          <p style={{ ...s.miniStatValue, color: "#7c5cbf" }}>{pendingCount}</p>
          <p style={s.miniStatLabel}>Pending Review</p>
        </div>
        <div style={s.miniStat}>
          <p style={{ ...s.miniStatValue, color: "#a3760f" }}>{urgentCount}</p>
          <p style={s.miniStatLabel}>Marked Urgent</p>
        </div>
      </div>

      <div style={s.cardsCol}>
        {requests.map((r) => (
          <div key={r.id} style={s.card}>
            <div style={s.cardTop}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={s.reqId}>#{r.requestNumber}</p>
                  {r.urgent && <span style={s.urgentTag}>URGENT</span>}
                </div>
                <p style={s.customer}>
                  {r.user?.fullName || r.user?.email} · {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r.id, e.target.value as CustomizationStatus)}
                style={{ ...s.statusSelect, ...statusStyle[r.status] }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{statusLabel[opt]}</option>
                ))}
              </select>
            </div>

            <div style={s.detailsGrid}>
              <div>
                <p style={s.detailLabel}>Fabric</p>
                <p style={s.detailValue}>{r.fabric}</p>
              </div>
              <div>
                <p style={s.detailLabel}>Colour</p>
                <p style={s.detailValue}>{r.color}</p>
              </div>
              <div>
                <p style={s.detailLabel}>Cut / Style</p>
                <p style={s.detailValue}>{r.cut}</p>
              </div>
            </div>

            {r.notes && (
              <div style={s.notesBox}>
                <p style={s.detailLabel}>Customer Notes</p>
                <p style={{ ...s.detailValue, fontWeight: 400 }}>{r.notes}</p>
              </div>
            )}

            <button
              style={s.previewToggle}
              onClick={() => setPreviewId((cur) => (cur === r.id ? null : r.id))}
            >
              {previewId === r.id ? "Hide Design Preview" : "Show Design Preview"}
            </button>
            {previewId === r.id && <DesignPreview request={r} />}
          </div>
        ))}
        {requests.length === 0 && (
          <p style={{ color: "#a89ab0", fontSize: 13.5 }}>No customization requests yet.</p>
        )}
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  title: { fontSize: 26, fontFamily: "Georgia, serif", color: "#3a2a5c", margin: "0 0 4px" },
  subtitle: { fontSize: 13.5, color: "#8a7a94", marginBottom: 20, maxWidth: 560 },

  statsRow: { display: "flex", gap: 16, marginBottom: 24 },
  miniStat: { background: "#fff", borderRadius: 14, padding: "16px 24px", boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  miniStatValue: { fontSize: 22, fontWeight: 700, color: "#3a2a5c", margin: 0, fontFamily: "Georgia, serif" },
  miniStatLabel: { fontSize: 11.5, color: "#a89ab0", marginTop: 4 },

  cardsCol: { display: "flex", flexDirection: "column", gap: 16 },
  card: { background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  reqId: { fontSize: 15, fontWeight: 700, color: "#3a2a5c", margin: 0 },
  urgentTag: { fontSize: 9.5, fontWeight: 700, color: "#fff", background: "#7c5cbf", padding: "2px 8px", borderRadius: 10, letterSpacing: 0.5 },
  customer: { fontSize: 12.5, color: "#8a7a94", margin: "3px 0 0" },

  statusSelect: {
    fontSize: 11.5, fontWeight: 700, padding: "6px 12px", borderRadius: 20, border: "none",
    cursor: "pointer", outline: "none",
  },

  detailsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, paddingTop: 14, borderTop: "1px solid #f2eafa" },
  detailLabel: { fontSize: 10.5, color: "#a89ab0", letterSpacing: 0.5, marginBottom: 4, textTransform: "uppercase" },
  detailValue: { fontSize: 13.5, color: "#3d2e4a", fontWeight: 600, margin: 0 },

  notesBox: { marginTop: 14, paddingTop: 14, borderTop: "1px solid #f2eafa" },

  previewToggle: {
    marginTop: 14, fontSize: 12, fontWeight: 700, color: "#7c5cbf",
    background: "#f5eefc", border: "none", borderRadius: 20, padding: "7px 14px",
    cursor: "pointer",
  },
  preview3d: {
    position: "relative", marginTop: 14, minHeight: 260, borderRadius: 14,
    overflow: "hidden", background: "linear-gradient(145deg,#f1ecf7,#faf8fb)",
    border: "1px solid #e4dce9",
  },
  liveTag: {
    position: "absolute", top: 10, left: 10, borderRadius: 99, padding: "4px 7px",
    fontSize: 9, fontWeight: 800, letterSpacing: ".08em", background: "#3a2a5c", color: "#fff",
  },
  previewImgWrap: {
    marginTop: 14, borderRadius: 14, overflow: "hidden", border: "1px solid #e4dce9",
    background: "#faf8fb",
  },
  previewImg: { width: "100%", maxHeight: 320, objectFit: "contain", display: "block" },
  noPreview: { marginTop: 14, fontSize: 12.5, color: "#a89ab0" },
};
