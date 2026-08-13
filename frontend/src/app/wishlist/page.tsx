"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const moveToBag = (item: (typeof items)[number]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      color: "Default",
      colorSwatch: item.colorSwatch,
      size: "S",
      badge: item.badge,
    });
    removeFromWishlist(item.id);
  };

  return (
    <div style={s.page}>
      <Navbar activePage="wishlist" />

      <div style={s.container}>
        <h1 style={s.title}>My Wishlist</h1>
        <p style={s.subtitle}>
          Curate your perfect wardrobe. Save your favorites here and move them to your bag
          whenever you&apos;re ready to shine.
        </p>

        {items.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyText}>Your wishlist is empty.</p>
            <button style={s.shopBtn} onClick={() => router.push("/shop")}>
              Browse the Shop
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {items.map((item) => (
              <div key={item.id} style={s.card}>
                <div style={s.imgWrap}>
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 50vw, 25vw" style={s.img} />
                  <button style={s.removeBtn} onClick={() => removeFromWishlist(item.id)}>
                    ×
                  </button>
                </div>
                <div style={s.info}>
                  {item.badge && (
                    <span
                      style={{
                        ...s.badge,
                        color: item.badge === "New" || item.badge === "NEW" ? "#c0395a" : "#b8860b",
                      }}
                    >
                      {item.badge === "New" ? "NEW IN" : item.badge === "Limited" ? "LIMITED EDITION" : item.badge.toUpperCase()}
                    </span>
                  )}
                  <p style={s.name}>{item.name}</p>
                  <p style={s.price}>LKR {item.price.toFixed(2)}</p>
                  <button style={s.moveBtn} onClick={() => moveToBag(item)}>
                    Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { fontFamily: "'Inter','Segoe UI',sans-serif", backgroundColor: "#fdf8fb", minHeight: "100vh" },
  container: { maxWidth: 1200, margin: "0 auto", padding: "40px 48px" },
  title: { fontFamily: "Georgia, serif", fontSize: 32, color: "#4a3a5a", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#8a7a94", maxWidth: 560, marginBottom: 32 },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 },
  card: { borderRadius: 12, overflow: "hidden", backgroundColor: "#fff", border: "1px solid #f0e8f5" },
  imgWrap: { position: "relative", height: 220, overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" },
  removeBtn: {
    position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: "50%",
    border: "none", backgroundColor: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 16,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
  },
  info: { padding: "14px 16px" },
  badge: { fontSize: 10, fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 6 },
  name: { fontSize: 14, fontWeight: 600, color: "#2d1a3a", margin: "0 0 4px 0" },
  price: { fontSize: 13, color: "#555", margin: "0 0 12px 0" },
  moveBtn: { width: "100%", padding: "9px 0", borderRadius: 8, background: "#c0395a", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  empty: { textAlign: "center", padding: "80px 0" },
  emptyText: { fontSize: 16, color: "#6a5a74", marginBottom: 16 },
  shopBtn: { background: "#c0395a", color: "#fff", border: "none", borderRadius: 24, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
};