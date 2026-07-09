"use client";

import React, { useState } from "react";

interface CustomRequest {
  id: string;
  customer: string;
  date: string;
  fabric: string;
  color: string;
  cut: string;
  notes: string;
  status: "Pending Review" | "In Production" | "Ready for Delivery" | "Delivered";
  urgent: boolean;
}

const initialRequests: CustomRequest[] = [
  { id: "#CX-3021", customer: "Sophie Chen", date: "Oct 12, 2024", fabric: "Silk Chiffon", color: "Lavender Mist", cut: "Wrap Dress", notes: "Wants a lower back detail.", status: "Pending Review", urgent: true },
  { id: "#CX-3020", customer: "Amara Silva", date: "Oct 11, 2024", fabric: "Linen", color: "Rose Beige", cut: "Wide-Leg Trouser", notes: "", status: "In Production", urgent: false },
  { id: "#CX-3019", customer: "Priya Fernando", date: "Oct 10, 2024", fabric: "Cotton Voile", color: "Cream", cut: "Off-Shoulder Blouse", notes: "Extra length requested.", status: "Ready for Delivery", urgent: false },
  { id: "#CX-3018", customer: "Chloe Bandara", date: "Oct 9, 2024", fabric: "Velvet", color: "Deep Plum", cut: "Fitted Jumpsuit", notes: "", status: "Delivered", urgent: false },
  { id: "#CX-3017", customer: "Nisha Perera", date: "Oct 8, 2024", fabric: "Silk Satin", color: "Champagne Gold", cut: "Slip Dress", notes: "Rush order — event next week.", status: "Pending Review", urgent: true },
];

const statusOptions: CustomRequest["status"][] = ["Pending Review", "In Production", "Ready for Delivery", "Delivered"];

const statusStyle: Record<CustomRequest["status"], React.CSSProperties> = {
  "Pending Review": { background: "#ede4f7", color: "#7c5cbf" },
  "In Production": { background: "#fdf0d8", color: "#a3760f" },
  "Ready for Delivery": { background: "#e3ecf9", color: "#3a5d9d" },
  Delivered: { background: "#e3f3e8", color: "#3a9d5f" },
};

export default function CustomizationMonitorPage() {
  const [requests, setRequests] = useState(initialRequests);

  const updateStatus = (id: string, status: CustomRequest["status"]) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const pendingCount = requests.filter((r) => r.status === "Pending Review").length;
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
                  <p style={s.reqId}>{r.id}</p>
                  {r.urgent && <span style={s.urgentTag}>URGENT</span>}
                </div>
                <p style={s.customer}>{r.customer} · {r.date}</p>
              </div>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r.id, e.target.value as CustomRequest["status"])}
                style={{ ...s.statusSelect, ...statusStyle[r.status] }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
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
          </div>
        ))}
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
};