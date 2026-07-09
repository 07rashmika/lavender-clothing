"use client";

import React, { useState } from "react";

interface UserRow {
  id: number;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spent: string;
  tier: "Standard" | "Gold Member" | "VIP";
}

const initialUsers: UserRow[] = [
  { id: 1, name: "Sophie Chen", email: "sophie.c@fashion-studio.com", joined: "Jan 2024", orders: 12, spent: "£1,840.00", tier: "Gold Member" },
  { id: 2, name: "Amara Silva", email: "amara.silva@gmail.com", joined: "Mar 2024", orders: 4, spent: "£312.00", tier: "Standard" },
  { id: 3, name: "Priya Fernando", email: "priya.f@outlook.com", joined: "Nov 2023", orders: 21, spent: "£3,210.00", tier: "VIP" },
  { id: 4, name: "Chloe Bandara", email: "chloe.b@gmail.com", joined: "Jun 2024", orders: 2, spent: "£120.00", tier: "Standard" },
  { id: 5, name: "Nisha Perera", email: "nisha.perera@yahoo.com", joined: "Feb 2024", orders: 8, spent: "£980.00", tier: "Gold Member" },
];

const tierStyle: Record<UserRow["tier"], React.CSSProperties> = {
  Standard: { background: "#ece2f7", color: "#8a7a94" },
  "Gold Member": { background: "#f3e3d0", color: "#a3760f" },
  VIP: { background: "#e6d9f5", color: "#8a6bd6" },
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const users = initialUsers.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={s.title}>Users</h1>
      <p style={s.subtitle}>{initialUsers.length} registered customers.</p>

      <div style={s.card}>
        <input
          placeholder="Search by name or email..."
          style={s.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Customer</th>
              <th style={s.th}>Joined</th>
              <th style={s.th}>Orders</th>
              <th style={s.th}>Total Spent</th>
              <th style={s.th}>Tier</th>
              <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={s.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={s.avatar}>{u.name.split(" ").map((n) => n[0]).join("")}</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: "#3a2a5c" }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: 11.5, color: "#a89ab0" }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={s.td}>{u.joined}</td>
                <td style={s.td}>{u.orders}</td>
                <td style={s.td}>{u.spent}</td>
                <td style={s.td}>
                  <span style={{ ...s.tierPill, ...tierStyle[u.tier] }}>{u.tier}</span>
                </td>
                <td style={{ ...s.td, textAlign: "right" }}>
                  <button style={s.linkBtn}>View</button>
                  <button style={{ ...s.linkBtn, color: "#7c5cbf" }}>Suspend</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...s.td, textAlign: "center", padding: "32px 0", color: "#a89ab0" }}>
                  No users match your search.
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

  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  search: {
    width: "100%", maxWidth: 320, padding: "9px 14px", borderRadius: 8, border: "1.5px solid #ded0f0",
    fontSize: 13, outline: "none", marginBottom: 18, boxSizing: "border-box",
  },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 10.5, color: "#a89ab0", letterSpacing: 0.5, fontWeight: 600, paddingBottom: 10, borderBottom: "1px solid #ece2f7" },
  td: { fontSize: 13, color: "#4a3a5a", padding: "13px 0", borderBottom: "1px solid #f4eefb" },

  avatar: {
    width: 34, height: 34, borderRadius: "50%", background: "#e6d9f5", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#8a6bd6",
    fontFamily: "Georgia, serif", flexShrink: 0,
  },
  tierPill: { fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20 },
  linkBtn: {
    background: "none", border: "none", color: "#8a6bd6", fontSize: 12.5, fontWeight: 600,
    cursor: "pointer", marginLeft: 14,
  },
};