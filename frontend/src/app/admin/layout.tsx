"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Products", href: "/admin/products", icon: "🛍️" },
  { label: "Add Product", href: "/admin/products/new", icon: "➕" },
  { label: "Orders", href: "/admin/orders", icon: "📦" },
  { label: "Customization Monitor", href: "/admin/customization", icon: "🎨" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div style={s.wrap}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo} onClick={() => router.push("/admin")}>
          Lavender <span style={s.logoTag}>Admin</span>
        </div>

        <nav style={s.nav}>
          {navItems.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href="#"
                onClick={(e) => { e.preventDefault(); router.push(item.href); }}
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.adminCard}>
            <div style={s.adminAvatar}>A</div>
            <div>
              <p style={s.adminName}>Admin</p>
              <p style={s.adminRole}>Store Manager</p>
            </div>
          </div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); router.push("/home"); }}
            style={s.backToSite}
          >
            ← Back to Storefront
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div style={s.main}>
        <header style={s.topbar} />

        <main style={s.content}>{children}</main>
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  wrap: { display: "flex", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", backgroundColor: "#f6f2fc" },

  sidebar: {
    width: 240, flexShrink: 0, backgroundColor: "#3a2a5c", color: "#fff",
    display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
  },
  logo: { fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, padding: "24px 20px", cursor: "pointer" },
  logoTag: { fontSize: 11, fontWeight: 400, color: "#c0a8d0", fontFamily: "'Inter',sans-serif", marginLeft: 4 },

  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "8px 12px", flex: 1 },
  navItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10,
    color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: 13.5, fontWeight: 500,
  },
  navItemActive: { background: "linear-gradient(135deg,#7c5cbf,#5b3fa0)", color: "#fff" },

  sidebarFooter: { padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" },
  adminCard: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  adminAvatar: {
    width: 36, height: 36, borderRadius: "50%", background: "#e6d9f5",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "Georgia, serif", fontWeight: 700, color: "#8a6bd6", flexShrink: 0,
  },
  adminName: { fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 },
  adminRole: { fontSize: 11, color: "rgba(255,255,255,0.55)", margin: 0 },
  backToSite: { fontSize: 12, color: "rgba(255,255,255,0.55)", textDecoration: "none" },

  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topbar: {
    height: 12, background: "#fff", borderBottom: "1px solid #ece2f7",
    position: "sticky", top: 0, zIndex: 10,
  },

  content: { padding: "28px 32px", flex: 1 },
};