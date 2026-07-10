"use client";

import React from "react";
import { useRouter } from "next/navigation";

const stats = [
  { label: "Total Revenue", value: "£18,420", change: "+12.4%", positive: true, icon: "💰" },
  { label: "Orders Today", value: "24", change: "+3", positive: true, icon: "📦" },
  { label: "Active Products", value: "48", change: "+2 new", positive: true, icon: "🛍️" },
  { label: "Pending Customizations", value: "6", change: "3 urgent", positive: false, icon: "🎨" },
];

const recentOrders = [
  { id: "#LV-89021", customer: "Sophie Chen", items: 2, status: "Shipped", total: "£245.00" },
  { id: "#LV-89020", customer: "Amara Silva", items: 1, status: "Processing", total: "£89.00" },
  { id: "#LV-89019", customer: "Priya Fernando", items: 3, status: "Delivered", total: "£312.00" },
  { id: "#LV-89018", customer: "Chloe Bandara", items: 1, status: "Processing", total: "£120.00" },
];

const statusStyle: Record<string, React.CSSProperties> = {
  Shipped: { background: "#fdf0d8", color: "#a3760f" },
  Delivered: { background: "#eee9f2", color: "#5b4a68" },
  Processing: { background: "#ede4f7", color: "#7c5cbf" },
};

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div>
      <h1 style={s.title}>Dashboard</h1>
      <p style={s.subtitle}>Welcome back — here's what's happening at Lavender today.</p>

      {/* Stat cards */}
      <div style={s.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statIconWrap}>{stat.icon}</div>
            <p style={s.statLabel}>{stat.label}</p>
            <p style={s.statValue}>{stat.value}</p>
            <p style={{ ...s.statChange, color: stat.positive ? "#3a9d5f" : "#7c5cbf" }}>{stat.change}</p>
          </div>
        ))}
      </div>

      <div style={s.grid2}>
        {/* Recent Orders */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Recent Orders</h2>
            <a href="#" onClick={(e) => { e.preventDefault(); router.push("/admin/orders"); }} style={s.viewAll}>
              View All →
            </a>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Order</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Status</th>
                <th style={{ ...s.th, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td style={s.tdBold}>{o.id}</td>
                  <td style={s.td}>{o.customer}</td>
                  <td style={s.td}>
                    <span style={{ ...s.statusPill, ...statusStyle[o.status] }}>{o.status}</span>
                  </td>
                  <td style={{ ...s.tdBold, textAlign: "right" }}>{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Quick Actions</h2>
          <div style={s.actionsCol}>
            <button style={s.actionBtn} onClick={() => router.push("/admin/products/new")}>
              ➕ Add New Product
            </button>
            <button style={s.actionBtn} onClick={() => router.push("/admin/customization")}>
              🎨 Review Customizations
            </button>
            <button style={s.actionBtn} onClick={() => router.push("/admin/orders")}>
              📦 Manage Orders
            </button>
            <button style={s.actionBtn} onClick={() => router.push("/admin/users")}>
              👥 View Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  title: { fontSize: 26, fontFamily: "Georgia, serif", color: "#3a2a5c", margin: "0 0 4px" },
  subtitle: { fontSize: 13.5, color: "#8a7a94", marginBottom: 24 },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  statIconWrap: { fontSize: 20, marginBottom: 10 },
  statLabel: { fontSize: 12, color: "#a89ab0", marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: 700, color: "#3a2a5c", margin: 0, fontFamily: "Georgia, serif" },
  statChange: { fontSize: 11.5, fontWeight: 600, marginTop: 6 },

  grid2: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 },
  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 16, fontFamily: "Georgia, serif", color: "#3d2e4a", margin: 0 },
  viewAll: { fontSize: 12.5, color: "#7c5cbf", fontWeight: 600, textDecoration: "none" },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 10.5, color: "#a89ab0", letterSpacing: 0.5, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid #ece2f7" },
  td: { fontSize: 13, color: "#4a3a5a", padding: "12px 0", borderBottom: "1px solid #f4eefb" },
  tdBold: { fontSize: 13, color: "#3a2a5c", fontWeight: 700, padding: "12px 0", borderBottom: "1px solid #f4eefb" },
  statusPill: { fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 },

  actionsCol: { display: "flex", flexDirection: "column", gap: 10 },
  actionBtn: {
    textAlign: "left", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #f0e2ea",
    background: "#f8f5fd", fontSize: 13, fontWeight: 600, color: "#3d2e4a", cursor: "pointer",
  },
};