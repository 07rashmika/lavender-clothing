"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatMoney, formatProductStatus, productImageUrl } from "@/lib/format";
import type { Product } from "@/types/product";

const statusStyle: Record<string, React.CSSProperties> = {
  ACTIVE: { background: "#e3f3e8", color: "#3a9d5f" },
  DRAFT: { background: "#f0eaf5", color: "#8a6d9e" },
  OUT_OF_STOCK: { background: "#ede4f7", color: "#7c5cbf" },
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/products")
      .then((data) => setProducts(data ?? []))
      .catch((err) => console.error("[admin/products] fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("[admin/products] delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  return (
    <div>
      <div style={s.headerRow}>
        <div>
          <h1 style={s.title}>Products</h1>
          <p style={s.subtitle}>{products.length} products in your catalog.</p>
        </div>
        <button style={s.addBtn} onClick={() => router.push("/admin/products/new")}>
          + Add Product
        </button>
      </div>

      <div style={s.card}>
        <input
          placeholder="Search products..."
          style={s.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Product</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Price</th>
              <th style={s.th}>Stock</th>
              <th style={s.th}>Status</th>
              <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={s.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {p.images[0] && (
                      <img src={productImageUrl(p.images[0])} alt={p.name} style={s.thumb} />
                    )}
                    <span style={{ fontWeight: 600, color: "#3a2a5c" }}>{p.name}</span>
                  </div>
                </td>
                <td style={s.td}>{p.category}</td>
                <td style={s.td}>{formatMoney(p.priceCents)}</td>
                <td style={s.td}>{p.stock}</td>
                <td style={s.td}>
                  <span style={{ ...s.statusPill, ...statusStyle[p.status] }}>
                    {formatProductStatus(p.status)}
                  </span>
                </td>
                <td style={{ ...s.td, textAlign: "right" }}>
                  <button style={s.linkBtn} onClick={() => router.push(`/admin/products/${p.id}`)}>Edit</button>
                  <button style={{ ...s.linkBtn, color: "#7c5cbf" }} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...s.td, textAlign: "center", padding: "32px 0", color: "#a89ab0" }}>
                  No products match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 26, fontFamily: "Georgia, serif", color: "#3a2a5c", margin: "0 0 4px" },
  subtitle: { fontSize: 13.5, color: "#8a7a94" },
  addBtn: {
    background: "linear-gradient(135deg,#7c5cbf,#5b3fa0)", color: "#fff", border: "none",
    borderRadius: 24, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
  },

  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  search: {
    width: "100%", maxWidth: 320, padding: "9px 14px", borderRadius: 8, border: "1.5px solid #ded0f0",
    fontSize: 13, outline: "none", marginBottom: 18, boxSizing: "border-box",
  },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 10.5, color: "#a89ab0", letterSpacing: 0.5, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid #ece2f7" },
  td: { fontSize: 13, color: "#4a3a5a", padding: "12px 0", borderBottom: "1px solid #f4eefb" },
  thumb: { width: 40, height: 46, borderRadius: 6, objectFit: "cover", background: "#f3e9ee" },
  statusPill: { fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20 },
  linkBtn: {
    background: "none", border: "none", color: "#8a6bd6", fontSize: 12.5, fontWeight: 600,
    cursor: "pointer", marginLeft: 14,
  },
};
