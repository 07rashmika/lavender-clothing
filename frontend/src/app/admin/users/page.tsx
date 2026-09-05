"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatMoneyUSD } from "@/lib/format";

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  suspended: boolean;
  createdAt: string;
  orderCount: number;
  totalSpentCents: number;
}

type Tier = "Standard" | "Gold Member" | "VIP";

function tierFor(totalSpentCents: number): Tier {
  if (totalSpentCents >= 200000) return "VIP";
  if (totalSpentCents >= 50000) return "Gold Member";
  return "Standard";
}

const tierStyle: Record<Tier, React.CSSProperties> = {
  Standard: { background: "#ece2f7", color: "#8a7a94" },
  "Gold Member": { background: "#f3e3d0", color: "#a3760f" },
  VIP: { background: "#e6d9f5", color: "#8a6bd6" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/users")
      .then((data) => setUsers(data ?? []))
      .catch((err) => console.error("[admin/users] fetch failed:", err));
  }, []);

  const filtered = users.filter(
    (u) =>
      (u.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSuspend = async (u: AdminUser) => {
    const next = !u.suspended;
    if (!confirm(next ? `Suspend ${u.email}?` : `Reactivate ${u.email}?`)) return;
    const prev = users;
    setUsers((cur) => cur.map((x) => (x.id === u.id ? { ...x, suspended: next } : x)));
    try {
      await api.patch(`/users/${u.id}/suspend`, { suspended: next });
    } catch (err) {
      console.error("[admin/users] suspend failed:", err);
      setUsers(prev);
      alert("Failed to update user.");
    }
  };

  return (
    <div>
      <h1 style={s.title}>Users</h1>
      <p style={s.subtitle}>{users.length} registered customers.</p>

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
            {filtered.map((u) => {
              const tier = tierFor(u.totalSpentCents);
              const displayName = u.fullName || u.email;
              return (
                <tr key={u.id}>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={s.avatar}>{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: "#3a2a5c" }}>{displayName}</p>
                        <p style={{ margin: 0, fontSize: 11.5, color: "#a89ab0" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</td>
                  <td style={s.td}>{u.orderCount}</td>
                  <td style={s.td}>{formatMoneyUSD(u.totalSpentCents)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.tierPill, ...tierStyle[tier] }}>{tier}</span>
                    {u.suspended && <span style={s.suspendedPill}>Suspended</span>}
                  </td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <button
                      style={{ ...s.linkBtn, color: u.suspended ? "#3a9d5f" : "#7c5cbf" }}
                      onClick={() => toggleSuspend(u)}
                    >
                      {u.suspended ? "Reactivate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
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
  suspendedPill: { fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginLeft: 6, background: "#fde8ec", color: "#c0395a" },
  linkBtn: {
    background: "none", border: "none", fontSize: 12.5, fontWeight: 600,
    cursor: "pointer", marginLeft: 14,
  },
};
