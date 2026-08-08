"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/order";

const statusOptions: OrderStatus[] = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusLabel: Record<OrderStatus, string> = {
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const paymentLabel: Record<Order["payment"], string> = {
  CARD: "Card",
  COD: "Cash on Delivery",
};

const statusStyle: Record<OrderStatus, React.CSSProperties> = {
  PROCESSING: { background: "#ede4f7", color: "#7c5cbf" },
  SHIPPED: { background: "#fdf0d8", color: "#a3760f" },
  DELIVERED: { background: "#e3f3e8", color: "#3a9d5f" },
  CANCELLED: { background: "#ece2f7", color: "#8a7a94" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");

  useEffect(() => {
    api
      .get("/orders")
      .then((data) => setOrders(data ?? []))
      .catch((err) => console.error("[admin/orders] fetch failed:", err));
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const prev = orders;
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await api.patch(`/orders/${id}/status`, { status });
    } catch (err) {
      console.error("[admin/orders] status update failed:", err);
      setOrders(prev);
      alert("Failed to update order status.");
    }
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
            {f === "All" ? "All" : statusLabel[f]}
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
              <th style={{ ...s.th, textAlign: "right", paddingRight: 40 }}>Total</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td style={s.tdBold}>{o.orderNumber}</td>
                <td style={s.td}>{o.user?.fullName || o.user?.email || o.shippingFirstName}</td>
                <td style={s.td}>{new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td style={s.td}>{o.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                <td style={s.td}>{paymentLabel[o.payment]}</td>
                <td style={{ ...s.tdBold, textAlign: "right", whiteSpace: "nowrap", paddingRight: 40 }}>{formatMoney(o.totalCents)}</td>
                <td style={s.td}>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                    style={{ ...s.statusSelect, ...statusStyle[o.status] }}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{statusLabel[opt]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...s.td, textAlign: "center", padding: "32px 0", color: "#a89ab0" }}>
                  No orders found.
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
  title: { fontSize: 26, fontFamily: "Georgia, serif", color: "#3a2a5c", margin: "0 0 4px" },
  subtitle: { fontSize: 13.5, color: "#8a7a94", marginBottom: 20 },

  filterRow: { display: "flex", gap: 8, marginBottom: 18 },
  filterBtn: {
    padding: "7px 16px", borderRadius: 20, borderWidth: 1.5, borderStyle: "solid", borderColor: "#ded0f0", background: "#fff",
    fontSize: 12.5, color: "#6a5a74", cursor: "pointer",
  },
  filterBtnActive: { background: "#3a2a5c", borderColor: "#3a2a5c", color: "#fff", fontWeight: 600 },

  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 10.5, color: "#a89ab0", letterSpacing: 0.5, fontWeight: 600, padding: "0 16px 10px 0", borderBottom: "1px solid #ece2f7" },
  td: { fontSize: 13, color: "#4a3a5a", padding: "13px 16px 13px 0", borderBottom: "1px solid #f4eefb" },
  tdBold: { fontSize: 13, color: "#3a2a5c", fontWeight: 700, padding: "13px 16px 13px 0", borderBottom: "1px solid #f4eefb" },

  statusSelect: {
    fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 20, border: "none",
    cursor: "pointer", outline: "none",
  },
};
