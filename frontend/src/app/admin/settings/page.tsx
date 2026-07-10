"use client";

import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [store, setStore] = useState({
    name: "Lavender Clothing",
    email: "hello@lavenderclothing.com",
    phone: "+94 77 759 210",
    address: "728 Petal Lane, Fashion District, Colombo",
  });
  const [shippingFee, setShippingFee] = useState("2.00");
  const [codFee, setCodFee] = useState("2.00");
  const [taxRate, setTaxRate] = useState("8");
  const [freeShipThreshold, setFreeShipThreshold] = useState("200");

  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyCustomRequest, setNotifyCustomRequest] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: persist to backend settings endpoint
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 style={s.title}>Settings</h1>
      <p style={s.subtitle}>Manage your store details, pricing rules, and notification preferences.</p>

      <div style={s.grid}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Store Info */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Store Information</h2>
            <Field label="Store Name" value={store.name} onChange={(v) => setStore((p) => ({ ...p, name: v }))} />
            <Field label="Contact Email" value={store.email} onChange={(v) => setStore((p) => ({ ...p, email: v }))} />
            <Field label="Phone Number" value={store.phone} onChange={(v) => setStore((p) => ({ ...p, phone: v }))} />
            <Field label="Store Address" value={store.address} onChange={(v) => setStore((p) => ({ ...p, address: v }))} />
          </div>

          {/* Pricing Rules */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Pricing & Checkout</h2>
            <div style={s.row2}>
              <Field label="Shipping Fee (£)" value={shippingFee} onChange={setShippingFee} wrapperStyle={{ flex: 1 }} />
              <Field label="COD Service Charge (£)" value={codFee} onChange={setCodFee} wrapperStyle={{ flex: 1 }} />
            </div>
            <div style={s.row2}>
              <Field label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} wrapperStyle={{ flex: 1 }} />
              <Field label="Free Shipping Threshold (£)" value={freeShipThreshold} onChange={setFreeShipThreshold} wrapperStyle={{ flex: 1 }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Notifications */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Notifications</h2>
            <ToggleRow label="New Order Alerts" checked={notifyNewOrder} onChange={() => setNotifyNewOrder((v) => !v)} />
            <ToggleRow label="Custom Design Requests" checked={notifyCustomRequest} onChange={() => setNotifyCustomRequest((v) => !v)} />
            <ToggleRow label="Low Stock Warnings" checked={notifyLowStock} onChange={() => setNotifyLowStock((v) => !v)} />
          </div>

          {/* Save */}
          <div style={s.card}>
            <button style={s.saveBtn} onClick={handleSave}>
              {saved ? "Settings Saved ✓" : "Save Changes"}
            </button>
            <p style={s.note}>Changes apply to the storefront immediately once connected to a backend.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, wrapperStyle }: { label: string; value: string; onChange: (v: string) => void; wrapperStyle?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 16, ...wrapperStyle }}>
      <label style={s.label}>{label}</label>
      <input style={s.input} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div style={s.toggleRow}>
      <p style={s.toggleLabel}>{label}</p>
      <button
        onClick={onChange}
        style={{
          width: 40, height: 22, borderRadius: 20, border: "none", cursor: "pointer",
          background: checked ? "linear-gradient(135deg,#8a6bd6,#7c5cbf)" : "#e0d5e5",
          position: "relative", flexShrink: 0, padding: 0,
        }}
      >
        <span style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  title: { fontSize: 26, fontFamily: "Georgia, serif", color: "#3a2a5c", margin: "0 0 4px" },
  subtitle: { fontSize: 13.5, color: "#8a7a94", marginBottom: 24, maxWidth: 560 },

  grid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" },
  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  cardTitle: { fontSize: 16, fontFamily: "Georgia, serif", color: "#3d2e4a", marginBottom: 18 },

  row2: { display: "flex", gap: 16 },
  label: { display: "block", fontSize: 12, color: "#8a7a94", marginBottom: 6 },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ded0f0",
    fontSize: 14, color: "#3d2e4a", outline: "none", boxSizing: "border-box",
  },

  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  toggleLabel: { fontSize: 13.5, color: "#3a2a5c", fontWeight: 500, margin: 0 },

  saveBtn: {
    width: "100%", background: "linear-gradient(135deg,#7c5cbf,#5b3fa0)", color: "#fff",
    border: "none", borderRadius: 24, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  note: { fontSize: 11.5, color: "#a89ab0", marginTop: 12, lineHeight: 1.5 },
};