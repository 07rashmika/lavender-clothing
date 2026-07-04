"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

interface Order {
  id: string;
  date: string;
  items: string;
  status: "Shipped" | "Delivered" | "Processing";
  total: string;
}

const orders: Order[] = [
  { id: "#LV-89021", date: "Oct 12, 2024", items: "Silk Wrap Dress, Gold Studs", status: "Shipped", total: "£245.00" },
  { id: "#LV-88742", date: "Sept 28, 2024", items: "Lavender Blouse", status: "Delivered", total: "£89.00" },
  { id: "#LV-88601", date: "Sept 15, 2024", items: "Linen Trousers (Beige)", status: "Delivered", total: "£120.00" },
];

const statusStyle: Record<Order["status"], React.CSSProperties> = {
  Shipped: { background: "#fdf0d8", color: "#a3760f" },
  Delivered: { background: "#eee9f2", color: "#5b4a68" },
  Processing: { background: "#fde3e8", color: "#c0395a" },
};

export default function ProfilePage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [styleRecs, setStyleRecs] = useState(true);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const fullName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
  const email = user.email ?? "";
  const phone = user.user_metadata?.phone ?? "—";
  const language = "English (UK)";

  const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <div style={s.page}>
      <Navbar activePage="home" />

      <div style={s.container}>
        {/* Header */}
        <div style={s.headerRow}>
          <div style={s.avatar}>{initials}</div>
          <h1 style={s.name}>{fullName}</h1>
          <span style={s.memberBadge}>MEMBER</span>
          <button style={s.signOutBtn} onClick={handleSignOut}>Sign Out</button>
        </div>

        {/* Top grid */}
        <div style={s.topGrid}>
          {/* Account Settings */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>👤 Account Settings</h2>
            <hr style={s.divider} />

            <div style={s.fieldGrid}>
              <div>
                <p style={s.fieldLabel}>FULL NAME</p>
                <p style={s.fieldValue}>{fullName}</p>
              </div>
              <div>
                <p style={s.fieldLabel}>EMAIL ADDRESS</p>
                <p style={s.fieldValue}>{email}</p>
              </div>
              <div>
                <p style={s.fieldLabel}>PHONE NUMBER</p>
                <p style={s.fieldValue}>{phone}</p>
              </div>
              <div>
                <p style={s.fieldLabel}>LANGUAGE</p>
                <p style={s.fieldValue}>{language}</p>
              </div>
            </div>

            <button style={s.updateBtn}>Update Profile</button>
          </div>

          {/* Right column: Preferences, Security, Payment */}
          <div style={s.rightCol}>
            <div style={s.card}>
              <h2 style={s.cardTitle}>⚙️ Preferences</h2>
              <hr style={s.divider} />

              <ToggleRow
                label="Email Notifications"
                sub="Order updates and drops"
                checked={emailNotifs}
                onChange={() => setEmailNotifs((v) => !v)}
              />
              <ToggleRow
                label="Style Recommendations"
                sub="Personalized tailored feed"
                checked={styleRecs}
                onChange={() => setStyleRecs((v) => !v)}
              />
            </div>

            <div style={s.card}>
              <h2 style={s.cardTitle}>🛡️ Security</h2>
              <hr style={s.divider} />

              <div style={s.rowBetween}>
                <span style={s.secLabel}>Password</span>
                <a href="#" style={s.linkAction}>Change</a>
              </div>
              <div style={{ ...s.rowBetween, marginTop: 14 }}>
                <span style={s.secLabel}>2-Factor Auth</span>
                <a href="#" style={s.linkAction}>Enable</a>
              </div>
            </div>

            <div style={s.card}>
              <h2 style={s.cardTitle}>💳 Payment Methods</h2>
              <hr style={s.divider} />

              <div style={s.rowBetween}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={s.visaChip}>VISA</span>
                  <div>
                    <p style={{ ...s.fieldValue, marginBottom: 1 }}>Visa ending in 4242</p>
                    <p style={s.expiryText}>Expires 12/26</p>
                  </div>
                </div>
                <a href="#" style={s.linkAction}>Edit</a>
              </div>

              <button style={s.addCardBtn}>+ Add New Card</button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ ...s.card, marginTop: 24 }}>
          <div style={s.ordersHeader}>
            <h2 style={s.cardTitle}>🧾 Recent Orders</h2>
            <a href="#" style={s.viewAllLink}>View All History</a>
          </div>
          <hr style={s.divider} />

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ORDER ID</th>
                <th style={s.th}>DATE</th>
                <th style={s.th}>ITEMS</th>
                <th style={s.th}>STATUS</th>
                <th style={{ ...s.th, textAlign: "right" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={s.tdBold}>{o.id}</td>
                  <td style={s.td}>{o.date}</td>
                  <td style={s.td}>{o.items}</td>
                  <td style={s.td}>
                    <span style={{ ...s.statusPill, ...statusStyle[o.status] }}>
                      {o.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...s.tdBold, textAlign: "right" }}>{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: () => void }) {
  return (
    <div style={s.toggleRow}>
      <div>
        <p style={s.toggleLabel}>{label}</p>
        <p style={s.toggleSub}>{sub}</p>
      </div>
      <button
        onClick={onChange}
        style={{
          width: 40, height: 22, borderRadius: 20, border: "none", cursor: "pointer",
          background: checked ? "linear-gradient(135deg,#5b2d8e,#c0395a)" : "#e0d5e5",
          position: "relative", flexShrink: 0, padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute", top: 3, left: checked ? 21 : 3,
            width: 16, height: 16, borderRadius: "50%", background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { backgroundColor: "#fdf6f9", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },
  container: { maxWidth: 1000, margin: "0 auto", padding: "40px 24px 60px" },

  headerRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 28 },
  avatar: {
    width: 64, height: 64, borderRadius: "50%", background: "#e8d9ee",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "Georgia, serif", fontSize: 22, fontStyle: "italic", color: "#8a6d9e",
  },
  name: { fontSize: 24, fontFamily: "Georgia, serif", color: "#2d1a3a", margin: 0 },
  memberBadge: {
    fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "#8a6d3d",
    background: "#f3e3d0", padding: "4px 10px", borderRadius: 20,
  },
  signOutBtn: {
    marginLeft: "auto", background: "none", border: "1.5px solid #e8d0d8",
    borderRadius: 20, padding: "6px 18px", color: "#c0395a",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  },

  topGrid: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" },
  rightCol: { display: "flex", flexDirection: "column", gap: 20 },

  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(150,100,150,0.06)" },
  cardTitle: { fontSize: 16, fontFamily: "Georgia, serif", color: "#3d2e4a", margin: 0 },
  divider: { border: "none", borderTop: "1px solid #f0e8f0", margin: "14px 0 18px" },

  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  fieldLabel: { fontSize: 10.5, color: "#c0395a", letterSpacing: 0.5, marginBottom: 4, fontWeight: 600 },
  fieldValue: { fontSize: 14, color: "#2d1a3a", fontWeight: 600, margin: 0 },

  updateBtn: {
    background: "#fff", color: "#5b2d8e", border: "1.5px solid #5b2d8e",
    borderRadius: 24, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },

  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  toggleLabel: { fontSize: 13.5, color: "#2d1a3a", fontWeight: 600, margin: 0 },
  toggleSub: { fontSize: 11.5, color: "#a89ab0", margin: "2px 0 0" },

  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  secLabel: { fontSize: 13.5, color: "#2d1a3a", fontWeight: 500 },
  linkAction: { fontSize: 13, color: "#c0395a", fontWeight: 600, textDecoration: "none", cursor: "pointer" },

  visaChip: {
    fontSize: 9, fontWeight: 700, color: "#1a3a8f", background: "#eef1fb",
    padding: "5px 8px", borderRadius: 4, letterSpacing: 0.5,
  },
  expiryText: { fontSize: 11.5, color: "#a89ab0", margin: 0 },
  addCardBtn: {
    width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 10,
    border: "1.5px dashed #d9c8de", background: "transparent",
    color: "#5b2d8e", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },

  ordersHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  viewAllLink: { fontSize: 13, color: "#5b2d8e", fontWeight: 600, textDecoration: "none", cursor: "pointer" },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 10.5, color: "#a89ab0", letterSpacing: 0.5, fontWeight: 600, paddingBottom: 12, borderBottom: "1px solid #f0e8f0" },
  td: { fontSize: 13, color: "#4a3a5a", padding: "14px 0", borderBottom: "1px solid #f7f0f5" },
  tdBold: { fontSize: 13, color: "#2d1a3a", fontWeight: 700, padding: "14px 0", borderBottom: "1px solid #f7f0f5" },
  statusPill: { fontSize: 10, fontWeight: 700, letterSpacing: 0.3, padding: "4px 10px", borderRadius: 20 },
};