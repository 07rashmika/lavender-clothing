"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { api } from "@/lib/api";
import { productImageUrl } from "@/lib/format";
import type { Product } from "@/types/product";

const heroSlides = [
  {
    img: "/lav-hero-1.jpg",
    eyebrow: "Summer Collection 2025",
    title: "Effortless Elegance in Every Stitch",
    sub: "Discover hand-curated pieces that move with you — from sunrise markets to golden evenings.",
  },
  {
    img: "/lav-hero-2.jpg",
    eyebrow: "New Arrivals",
    title: "Styled for the Season Ahead",
    sub: "Fresh silhouettes and soft palettes, made for every moment of your day.",
  },
  {
    img: "/lav-hero-3.jpg",
    eyebrow: "Signature Edit",
    title: "Timeless Pieces, Modern Grace",
    sub: "Refined tailoring meets everyday comfort in our curated signature edit.",
  },
  {
    img: "/lav-hero-4.jpg",
    eyebrow: "Boutique Favorites",
    title: "Colour That Moves With You",
    sub: "Bold hues and soft textures — pieces designed to be worn with confidence.",
  },
  {
    img: "/lav-hero-5.jpg",
    eyebrow: "Made to Shine",
    title: "Dress for Every Golden Hour",
    sub: "From daytime ease to evening glow, find the pieces that carry you through.",
  },
];

const COLLECTIONS = [
  { label: "Sweaters", category: "Sweaters" },
  { label: "Crop Tops", category: "Crop Tops" },
  { label: "Dresses", category: "Frocks" },
  { label: "Blouses", category: "Blouses" },
  { label: "Denims", category: "Denims" },
];

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [slide, setSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  const nextSlide = useCallback(() => {
    setSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = () => {
    setSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    api
      .get("/products?status=ACTIVE")
      .then((data) => setProducts(data ?? []))
      .catch((err) => console.error("[home] products fetch failed:", err));
  }, []);

  useEffect(() => {
    api
      .get("/trends/popular")
      .then((data) => setTrendingProducts(data ?? []))
      .catch((err) => console.error("[home] trending fetch failed:", err));
  }, []);

  const newArrivals = products.slice(0, 6);
  const collectionTiles = COLLECTIONS.map((c) => ({
    ...c,
    product: products.find((p) => p.category === c.category),
  }));

  const current = heroSlides[slide];

  return (
    <div style={s.page}>
      <style>{css}</style>

      <Navbar activePage="home" />

      {/* HERO SLIDER */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />

        {heroSlides.map((item, i) => (
          <Image
            key={item.img}
            src={item.img}
            alt={item.title}
            fill
            priority={i === 0}
            sizes="100vw"
            style={{
              ...s.heroImg,
              opacity: i === slide ? 1 : 0,
              zIndex: i === slide ? 0 : -1,
            }}
          />
        ))}

        <div style={s.heroContent}>
          <p style={s.heroEyebrow}>{current.eyebrow}</p>
          <h1 style={s.heroTitle}>{current.title}</h1>
          <p style={s.heroSub}>{current.sub}</p>
          <div style={s.heroBtns}>
            <button style={s.btnPrimary} className="lav-btn-primary" onClick={() => router.push("/shop")}>Shop Now</button>
            <button style={s.btnOutline} className="lav-btn-outline" onClick={() => router.push("/customizer")}>Customize</button>
          </div>
        </div>

        {/* Arrows */}
        <button style={{ ...s.heroArrow, left: 20 }} onClick={prevSlide} aria-label="Previous slide">‹</button>
        <button style={{ ...s.heroArrow, right: 20 }} onClick={nextSlide} aria-label="Next slide">›</button>

        {/* Dots */}
        <div style={s.heroDots}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              style={{
                ...s.heroDot,
                width: i === slide ? 22 : 8,
                background: i === slide ? "#fff" : "rgba(255,255,255,0.5)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* TRENDING NOW */}
      {trendingProducts.length > 0 && (
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={{...s.sectionTitle, margin: 0}}>Trending Now</h2>
            <a style={s.viewAll} onClick={() => router.push("/shop")} href="#">View All Products →</a>
          </div>
          <div style={s.productsGrid}>
            {trendingProducts.map(p => (
              <div key={p.id} style={s.productCard} className="lav-card" onClick={() => router.push(`/shop/${p.id}`)}>
                <div style={s.productImgWrap}>
                  {p.images[0] && (
                    <Image src={productImageUrl(p.images[0])} alt={p.name} fill sizes="33vw" style={s.productImg} />
                  )}
                  <span style={{...s.productTag, background: "#ff6b35"}}>🔥 Trending</span>
                  <div style={s.productActions} className="product-actions">
                    <button
                      style={s.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({
                          id: p.id,
                          name: p.name,
                          price: p.priceCents / 100,
                          image: p.images[0] ? productImageUrl(p.images[0]) : "",
                          badge: p.tag || undefined,
                          colorSwatch: p.colors[0],
                        });
                      }}
                      className="lav-action"
                    >
                      {isInWishlist(p.id) ? "♥" : "♡"}
                    </button>
                    <button
                      style={s.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          id: p.id,
                          name: p.name,
                          price: p.priceCents / 100,
                          image: p.images[0] ? productImageUrl(p.images[0]) : "",
                          color: "Default",
                          colorSwatch: p.colors[0],
                          size: p.sizes[0] ?? "M",
                          badge: p.tag || undefined,
                        });
                      }}
                      className="lav-action"
                    >
                      🛒
                    </button>
                  </div>
                </div>
                <div style={s.productInfo}>
                  <p style={s.productName}>{p.name}</p>
                  <p style={s.productPrice}>LKR {(p.priceCents / 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CURATED COLLECTIONS */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Curated Collections</h2>
        <div style={s.collectionsGrid}>
          {collectionTiles.map((tile, i) => (
            <div
              key={tile.label}
              style={{ ...s.collCard, ...(i === 0 ? s.collLarge : {}) }}
              onClick={() => router.push("/shop")}
            >
              {tile.product?.images[0] && (
                <Image src={productImageUrl(tile.product.images[0])} alt={tile.label} fill sizes="33vw" style={s.collImg} />
              )}
              <div style={s.collOverlay}><span style={s.collLabel}>{tile.label}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMIZE BANNER */}
      <section style={s.customizeBanner}>
        <div style={s.customizeInner}>
          <p style={s.customizeEye}>MADE FOR YOU</p>
          <h2 style={s.customizeTitle}>Customize Your Own</h2>
          <p style={s.customizeSub}>Choose your fabric, colour and cut. We'll create a signature piece made especially for you.</p>
          <button style={s.btnWhite} className="lav-btn-white lav-btn-design" onClick={() => router.push("/customizer")}>Start Designing</button>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={{...s.sectionTitle, margin: 0}}>New Arrivals</h2>
          <a style={s.viewAll} onClick={() => router.push("/shop")} href="#">View All Products →</a>
        </div>
        <div style={s.productsGrid}>
          {newArrivals.map(p => (
            <div key={p.id} style={s.productCard} className="lav-card" onClick={() => router.push(`/shop/${p.id}`)}>
              <div style={s.productImgWrap}>
                {p.images[0] && (
                  <Image src={productImageUrl(p.images[0])} alt={p.name} fill sizes="33vw" style={s.productImg} />
                )}
                {p.tag && <span style={{...s.productTag, ...(p.tag==="Sale"?s.tagSale:p.tag==="Hot"?s.tagHot:s.tagNew)}}>{p.tag}</span>}
                <div style={s.productActions} className="product-actions">
                  <button
                    style={s.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist({
                        id: p.id,
                        name: p.name,
                        price: p.priceCents / 100,
                        image: p.images[0] ? productImageUrl(p.images[0]) : "",
                        badge: p.tag || undefined,
                        colorSwatch: p.colors[0],
                      });
                    }}
                    className="lav-action"
                  >
                    {isInWishlist(p.id) ? "♥" : "♡"}
                  </button>
                  <button
                    style={s.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: p.id,
                        name: p.name,
                        price: p.priceCents / 100,
                        image: p.images[0] ? productImageUrl(p.images[0]) : "",
                        color: "Default",
                        colorSwatch: p.colors[0],
                        size: p.sizes[0] ?? "M",
                        badge: p.tag || undefined,
                      });
                    }}
                    className="lav-action"
                  >
                    🛒
                  </button>
                </div>
              </div>
              <div style={s.productInfo}>
                <p style={s.productName}>{p.name}</p>
                <p style={s.productPrice}>LKR {(p.priceCents / 100).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { fontFamily: "'Inter','Segoe UI',sans-serif", backgroundColor: "#fff", minHeight: "100vh" },

  hero: { position: "relative", height: 640, overflow: "hidden" },
  heroImg: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    objectFit: "cover", objectPosition: "top", transition: "opacity 0.8s ease-in-out",
  },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(20,5,35,0.72) 0%, rgba(20,5,35,0.2) 60%, transparent 100%)", zIndex: 1 },
  heroContent: { position: "absolute", top: "50%", left: 64, transform: "translateY(-50%)", zIndex: 2, maxWidth: 460 },
  heroEyebrow: { fontSize: 11, letterSpacing: 2, color: "#e8c4d0", textTransform: "uppercase", marginBottom: 12 },
  heroTitle: { fontSize: 42, fontWeight: 700, color: "#fff", fontFamily: "'Georgia',serif", lineHeight: 1.2, margin: "0 0 16px 0" },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, marginBottom: 28 },
  heroBtns: { display: "flex", gap: 12 },
  btnPrimary: { padding: "12px 28px", borderRadius: 50, background: "linear-gradient(135deg,#c0395a,#a02848)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnOutline: { padding: "12px 28px", borderRadius: 50, background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, cursor: "pointer" },

  heroArrow: {
    position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 3,
    width: 40, height: 40, borderRadius: "50%", border: "none",
    background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 22,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  heroDots: {
    position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
    zIndex: 3, display: "flex", gap: 8,
  },
  heroDot: {
    height: 8, borderRadius: 4, border: "none", cursor: "pointer",
    transition: "width 0.3s, background 0.3s",
  },

  section: { padding: "52px 48px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  sectionTitle: { fontSize: 32, fontWeight: 700, color: "#2d1a3a", fontFamily: "'Georgia',serif", margin: "0 0 28px 0" },
  viewAll: { fontSize: 13, color: "#c0395a", textDecoration: "none", fontWeight: 500, cursor: "pointer" },

  collectionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "200px 200px", gap: 12 },
  collCard: { position: "relative", overflow: "hidden", borderRadius: 12, cursor: "pointer", background: "#f3e9ee" },
  collLarge: { gridRow: "1 / 3" },
  collImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.3s" },
  collOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 20px", background: "linear-gradient(to top, rgba(30,10,50,0.8), transparent)", display: "flex", flexDirection: "column" },
  collLabel: { color: "#fff", fontWeight: 700, fontSize: 22, fontFamily: "'Georgia',serif" },
  collSub: { color: "rgba(255,255,255,0.8)", fontSize: 13.5, marginTop: 4 },

  customizeBanner: { margin: "0 48px", borderRadius: 16, background: "linear-gradient(135deg, #c0395a 0%, #7b2fa8 100%)", padding: "48px 64px", display: "flex", alignItems: "center", justifyContent: "center" },
  customizeInner: { textAlign: "center", maxWidth: 500 },
  customizeEye: { fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 10 },
  customizeTitle: { fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "'Georgia',serif", margin: "0 0 12px 0" },
  customizeSub: { fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, marginBottom: 24 },
  btnWhite: { padding: "11px 28px", borderRadius: 50, background: "#fff", color: "#c0395a", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  productsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 24 },
  productCard: { borderRadius: 12, overflow: "hidden", backgroundColor: "#fdf8fb", transition: "transform 0.2s", cursor: "pointer" },
  productImgWrap: { position: "relative", height: 260, overflow: "hidden" },
  productImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.3s" },
  productTag: { position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: 0.5 },
  tagNew: { background: "#c0395a", color: "#fff" },
  tagHot: { background: "#ff6b35", color: "#fff" },
  tagSale: { background: "#7b2fa8", color: "#fff" },
  productActions: { position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 6, opacity: 0, transition: "opacity 0.2s" },
  productInfo: { padding: "14px 16px" },
  productName: { fontSize: 13, fontWeight: 600, color: "#2d1a3a", margin: "0 0 4px 0" },
  productPrice: { fontSize: 13, color: "#c0395a", fontWeight: 700, margin: 0 },
  actionBtn: { width: 32, height: 32, borderRadius: "50%", border: "none", backgroundColor: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
};

const css = `
  .lav-btn-primary { transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s; }
  .lav-btn-primary:hover { opacity: 0.88; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(192,57,90,0.4); }
  .lav-btn-primary:active { transform: translateY(0px); box-shadow: none; }

  .lav-btn-outline { transition: transform 0.2s, background 0.2s, box-shadow 0.2s; }
  .lav-btn-outline:hover { background: rgba(255,255,255,0.15) !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,255,255,0.15); }
  .lav-btn-outline:active { transform: translateY(0px); box-shadow: none; }

  .lav-btn-design { transition: transform 0.2s, box-shadow 0.2s, background 0.2s; }
  .lav-btn-design:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,255,255,0.35); background: #fdf3f6 !important; }
  .lav-btn-design:active { transform: translateY(0px); box-shadow: none; }

  .lav-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(192,57,90,0.12); }
  .lav-card:hover img { transform: scale(1.04); }
  .lav-card:hover .product-actions { opacity: 1 !important; }
  .lav-action:hover { background: #fdf3f6 !important; color: #c0395a; }
`;