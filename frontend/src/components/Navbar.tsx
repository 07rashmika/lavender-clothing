"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  activePage?: "home" | "shop" | "customizer" | "contact" | "bag" | "wishlist";
}

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const router = useRouter();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, signOut } = useAuth();
  const isWishlistActive = activePage === "wishlist";
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    router.push("/auth");
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const linkStyle = (page: string): React.CSSProperties =>
    activePage === page ? s.linkActive : s.link;

  const goToSearch = (value: string) => {
    const trimmed = value.trim();
    router.push(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      router.replace(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      goToSearch(query);
    }
  };

  return (
    <nav style={s.nav}>
      <style>{css}</style>

      <div style={s.logo} onClick={() => router.push("/home")}>Lavender</div>

      <div style={s.links}>
        <a style={linkStyle("home")} onClick={() => router.push("/home")} href="#">Home</a>
        <a style={linkStyle("shop")} onClick={() => router.push("/shop")} href="#">Shop</a>
        <a style={linkStyle("customizer")} onClick={() => router.push("/customizer")} href="#">Customizer</a>
        <a style={linkStyle("contact")} onClick={() => router.push("/contact")} href="#">Contact</a>
      </div>

      <div style={s.searchWrap}>
        <svg
          style={{ ...s.searchIcon, pointerEvents: "auto", cursor: "pointer" }}
          onClick={() => { if (debounceRef.current) clearTimeout(debounceRef.current); goToSearch(query); }}
          xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a090c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          placeholder="Search collection..."
          style={s.searchInput}
          className="lav-nav-search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div style={s.icons}>
        <div style={s.bagWrap} onClick={() => router.push("/wishlist")}>
          <svg style={s.iconSvg} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isWishlistActive ? "#c0395a" : "none"} stroke={isWishlistActive ? "#c0395a" : "#5b2d8e"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {wishlistCount > 0 && <span style={s.badge}>{wishlistCount}</span>}
        </div>

        <div style={s.bagWrap} onClick={() => router.push("/bag")}>
          <svg style={s.iconSvg} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b2d8e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {itemCount > 0 && <span style={s.badge}>{itemCount}</span>}
        </div>

        {user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={s.avatarBtn}
              title={user.email}
            >
              {userInitials}
            </button>
            {userMenuOpen && (
              <div style={s.userMenu}>
                <p style={s.userMenuEmail}>{user.email}</p>
                <hr style={{ border: "none", borderTop: "1px solid #f0eaf8", margin: "6px 0" }} />
                <button style={s.userMenuItem} onClick={() => { setUserMenuOpen(false); router.push("/profile"); }}>My Profile</button>
                <button style={{ ...s.userMenuItem, color: "#c0395a" }} onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <svg style={s.iconSvg} onClick={() => router.push("/auth")} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b2d8e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        )}
      </div>
    </nav>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  nav: { display: "flex", alignItems: "center", gap: 32, padding: "12px 48px", borderBottom: "1px solid #f0eaf8", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 100 },
  logo: { fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 700, color: "#5b2d8e", fontStyle: "italic", cursor: "pointer", whiteSpace: "nowrap", marginRight: 8 },
  links: { display: "flex", gap: 28, alignItems: "center" },
  linkActive: { fontSize: 14, fontWeight: 600, color: "#c0395a", textDecoration: "none", borderBottom: "2px solid #c0395a", paddingBottom: 2, cursor: "pointer" },
  link: { fontSize: 14, color: "#4a4060", textDecoration: "none", cursor: "pointer", fontWeight: 400 },
  searchWrap: { flex: 1, position: "relative", display: "flex", alignItems: "center", maxWidth: 260 },
  searchIcon: { position: "absolute", left: 12 },
  searchInput: { width: "100%", padding: "8px 16px 8px 34px", borderRadius: 50, border: "1.5px solid #e8dff5", fontSize: 13, outline: "none", fontFamily: "'Inter', sans-serif", backgroundColor: "#faf7ff", color: "#3a1260" },
  icons: { display: "flex", gap: 18, alignItems: "center", marginLeft: "auto" },
  iconSvg: { cursor: "pointer", display: "block" },
  bagWrap: { position: "relative", cursor: "pointer", display: "flex" },
  badge: {
    position: "absolute", top: -8, right: -8, background: "#c0395a", color: "#fff",
    fontSize: 10, fontWeight: 700, borderRadius: "50%", width: 16, height: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarBtn: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg,#5b2d8e,#c0395a)",
    color: "#fff", fontSize: 12, fontWeight: 700,
    border: "none", cursor: "pointer", fontFamily: "Georgia,serif",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  userMenu: {
    position: "absolute", right: 0, top: 42,
    background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px rgba(91,45,142,0.12)",
    padding: "10px 0", minWidth: 180, zIndex: 200,
    border: "1px solid #f0eaf8",
  },
  userMenuEmail: {
    fontSize: 11.5, color: "#a89ab0", padding: "0 16px 6px",
    margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  userMenuItem: {
    display: "block", width: "100%", padding: "9px 16px",
    background: "none", border: "none", textAlign: "left",
    fontSize: 13.5, color: "#2d1a3a", fontWeight: 500, cursor: "pointer",
    fontFamily: "'Inter',sans-serif",
  },
};

const css = `
  .lav-nav-search:focus { border-color: #9b6fd0 !important; background: #fff !important; outline: none; }
`;