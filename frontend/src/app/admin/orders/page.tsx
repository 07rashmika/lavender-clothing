"use client";

import React, { useState } from "react";

interface Order {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: string;
  payment: "Card" | "Cash on Delivery";
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
}

const initialOrders: Order[] = [
  { id: "#LV-89021", customer: "Sophie Chen", date: "Oct 12, 2024", items: 2, total: "£245.00", payment: "Card", status: "Shipped" },
  { id: "#LV-89020", customer: "Amara Silva", date: "Oct 11, 2024", items: 1, total: "£89.00", payment: "Cash on Delivery", status: "Processing" },
  { id: "#LV-89019", customer: "Priya Fernando", date: "Oct 10, 2024", items: 3, total: "£312.00", payment: "Card", status: "Delivered" },
  { id: "#LV-89018", customer: "Chloe Bandara", date: "Oct 9, 2024", items: 1, total: "£120.00", payment: "Card", status: "Processing" },
  { id: "#LV-89017", customer: "Nisha Perera", date: "Oct 8, 2024", items: 2, total: "£178.00", payment: "Cash on Delivery", status: "Cancelled" },
];

const statusOptions: Order["status"][] = ["Processing", "Shipped", "Delivered", "Cancelled"];

const statusStyle: Record<Order["status"], React.CSSProperties> = {
  Processing: { background: "#ede4f7", color: "#7c5cbf" },
  Shipped: { background: "#fdf0d8", color: "#a3760f" },
  Delivered: { background: "#e3f3e8", color: "#3a9d5f" },
  Cancelled: { background: "#ece2f7", color: "#8a7a94" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<"All" | Order["status"]>("All");

  const updateStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 style={s.title}>Orders</h1>
      <p style={s.subtitle}>{orders.length} total orders.</p>

      <div style={s.filterRow}>
        {(["All", ...statusOptions] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Order ID</th>
              <th style={s.th}>Customer</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Items</th>
              <th style={s.th}>Payment</th>
              <th style={{ ...s.th, textAlign: "right" }}>Total</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td style={s.tdBold}>{o.id}</td>
                <td style={s.td}>{o.customer}</td>
                <td style={s.td}>{o.date}</td>
                <td style={s.td}>{o.items}</td>
                <td style={s.td}>{o.payment}</td>
                <td style={{ ...s.tdBold, textAlign: "right" }}>{o.total}</td>
                <td style={s.td}>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as Order["status"])}
                    style={{ ...s.statusSelect, ...statusStyle[o.status] }}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  title: { fontSize: 26, fontFamily: "Georgia, serif", color: "#3a2a5c", margin: "0 0 4px" },
  subtitle: { fontSize: 13.5, color: "#8a7a94", marginBottom: 20 },

  filterRow: { display: "flex", gap: 8, marginBottom: 18 },
  filterBtn: {
    padding: "7px 16px", borderRadius: 20, border: "1.5px solid #ded0f0", background: "#fff",
    fontSize: 12.5, color: "#6a5a74", cursor: "pointer",
  },
  filterBtnActive: { background: "#3a2a5c", borderColor: "#3a2a5c", color: "#fff", fontWeight: 600 },

  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 10.5, color: "#a89ab0", letterSpacing: 0.5, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid #ece2f7" },
  td: { fontSize: 13, color: "#4a3a5a", padding: "13px 0", borderBottom: "1px solid #f4eefb" },
  tdBold: { fontSize: 13, color: "#3a2a5c", fontWeight: 700, padding: "13px 0", borderBottom: "1px solid #f4eefb" },

  statusSelect: {
    fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 20, border: "none",
    cursor: "pointer", outline: "none",
  },
};