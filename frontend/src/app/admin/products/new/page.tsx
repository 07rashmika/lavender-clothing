"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    category: "Blouses",
    price: "",
    stock: "",
    sizes: [] as string[],
    colors: "",
    description: "",
    status: "Active",
  });
  const [saved, setSaved] = useState(false);

  const set = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to backend product creation endpoint
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/admin/products");
    }, 1200);
  };

  return (
    <div>
      <h1 style={s.title}>Add New Product</h1>
      <p style={s.subtitle}>Fill in the details below to list a new product in your store.</p>

      <form onSubmit={handleSave} style={s.grid}>
        {/* Left: main details */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Product Details</h2>

          <Field label="Product Name" value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Silk Ruffle Blouse" />

          <div style={s.row2}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Category</label>
              <select style={s.input} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option>Blouses</option>
                <option>Crop Tops</option>
                <option>Frocks</option>
                <option>Sweaters</option>
                <option>Denims</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Status</label>
              <select style={s.input} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option>Active</option>
                <option>Draft</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>

          <div style={s.row2}>
            <Field label="Price (£)" value={form.price} onChange={(v) => set("price", v)} placeholder="89.00" wrapperStyle={{ flex: 1 }} />
            <Field label="Stock Quantity" value={form.stock} onChange={(v) => set("stock", v)} placeholder="24" wrapperStyle={{ flex: 1 }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Available Sizes</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["XS", "S", "M", "L", "XL"].map((sz) => (
                <button
                  type="button"
                  key={sz}
                  onClick={() => toggleSize(sz)}
                  style={{
                    ...s.sizeBtn,
                    ...(form.sizes.includes(sz) ? s.sizeBtnActive : {}),
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <Field label="Available Colors (comma separated)" value={form.colors} onChange={(v) => set("colors", v)} placeholder="Lavender, Rose, Cream" />

          <div>
            <label style={s.label}>Description</label>
            <textarea
              style={{ ...s.input, resize: "vertical", fontFamily: "inherit" }}
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the fabric, fit, and styling details..."
            />
          </div>
        </div>

        {/* Right: image upload + actions */}
        <div>
          <div style={{ ...s.card, marginBottom: 20 }}>
            <h2 style={s.cardTitle}>Product Images</h2>
            <div style={s.uploadBox}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>📷</p>
              <p style={{ fontSize: 12.5, color: "#8a7a94" }}>Drag & drop images here, or click to browse</p>
              <p style={{ fontSize: 11, color: "#c0a8bd", marginTop: 4 }}>(Image upload requires backend/storage integration)</p>
            </div>
          </div>

          <div style={s.card}>
            <button type="submit" style={s.saveBtn}>
              {saved ? "Product Saved ✓" : "Save Product"}
            </button>
            <button type="button" style={s.cancelBtn} onClick={() => router.push("/admin/products")}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, wrapperStyle }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; wrapperStyle?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 16, ...wrapperStyle }}>
      <label style={s.label}>{label}</label>
      <input style={s.input} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  title: { fontSize: 26, fontFamily: "Georgia, serif", color: "#3a2a5c", margin: "0 0 4px" },
  subtitle: { fontSize: 13.5, color: "#8a7a94", marginBottom: 24 },

  grid: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" },
  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  cardTitle: { fontSize: 16, fontFamily: "Georgia, serif", color: "#3d2e4a", marginBottom: 18 },

  row2: { display: "flex", gap: 16 },
  label: { display: "block", fontSize: 12, color: "#8a7a94", marginBottom: 6 },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ded0f0",
    fontSize: 14, color: "#3d2e4a", outline: "none", boxSizing: "border-box", marginBottom: 16,
  },

  sizeBtn: {
    width: 38, height: 38, borderRadius: 8, border: "1.5px solid #ded0f0", background: "#fff",
    fontSize: 12, color: "#555", cursor: "pointer",
  },
  sizeBtnActive: { border: "1.5px solid #8a6bd6", background: "#8a6bd6", color: "#fff", fontWeight: 700 },

  uploadBox: {
    border: "2px dashed #e0d0e0", borderRadius: 10, padding: "32px 16px",
    textAlign: "center", cursor: "pointer", background: "#f8f5fd",
  },

  saveBtn: {
    width: "100%", background: "linear-gradient(135deg,#7c5cbf,#5b3fa0)", color: "#fff",
    border: "none", borderRadius: 24, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  cancelBtn: {
    width: "100%", marginTop: 10, background: "#fff", color: "#8a7a94",
    border: "1.5px solid #ded0f0", borderRadius: 24, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
};