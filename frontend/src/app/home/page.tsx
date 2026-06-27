"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const products = [
    { id: 1, name: "Boho Fringe Kimono", price: "$89.00", img: "/lav-p5.jpg", tag: "New" },
    { id: 2, name: "Yellow Chic Blouse", price: "$64.00", img: "/lav-p1.jpg", tag: "Hot" },
    { id: 3, name: "Floral Midi Dress", price: "$112.00", img: "/lav-p2.jpg", tag: "" },
    { id: 4, name: "Classic Navy Jumpsuit", price: "$95.00", img: "/lav-p6.jpg", tag: "New" },
    { id: 5, name: "Summer Duo Set", price: "$138.00", img: "/lav-p3.jpg", tag: "" },
    { id: 6, name: "Boho Straw Hat Look", price: "$76.00", img: "/lav-p4.jpg", tag: "Sale" },
  ];

  return (
    <div style={s.page}>
      <style>{css}</style>

      <Navbar activePage="home" />

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <img src="/lav-p4.jpg" alt="hero" style={s.heroImg} />
        <div style={s.heroContent}>
          <p style={s.heroEyebrow}>Summer Collection 2025</p>
          <h1 style={s.heroTitle}>Effortless Elegance<br />in Every Stitch</h1>
          <p style={s.heroSub}>Discover hand-curated pieces that move with you — from sunrise markets to golden evenings.</p>
          <div style={s.heroBtns}>
            <button style={s.btnPrimary} className="lav-btn-primary" onClick={() => router.push("/shop")}>Shop Now</button>
            <button style={s.btnOutline} className="lav-btn-outline" onClick={() => router.push("/customizer")}>Customize</button>
          </div>
        </div>
      </section>

      {/* CURATED COLLECTIONS */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Curated Collections</h2>
        <div style={s.collectionsGrid}>
          <div style={{...s.collCard, ...s.collLarge}}>
            <img src="/lav-p3.jpg" alt="Sweaters" style={s.collImg} />
            <div style={s.collOverlay}><span style={s.collLabel}>Sweaters</span><span style={s.collSub}>From $59.99</span></div>
          </div>
          <div style={s.collCard}>
            <img src="/lav-p1.jpg" alt="Crop Tops" style={s.collImg} />
            <div style={s.collOverlay}><span style={s.collLabel}>Crop Tops</span><span style={s.collSub}>From $34.99</span></div>
          </div>
          <div style={s.collCard}>
            <img src="/lav-p6.jpg" alt="Dresses" style={s.collImg} />
            <div style={s.collOverlay}><span style={s.collLabel}>Dresses</span><span style={s.collSub}>From $79.99</span></div>
          </div>
          <div style={s.collCard}>
            <img src="/lav-p5.jpg" alt="Fringe" style={s.collImg} />
            <div style={s.collOverlay}><span style={s.collLabel}>Blouses</span><span style={s.collSub}>From $49.99</span></div>
          </div>
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
          {products.map(p => (
            <div key={p.id} style={s.productCard} className="lav-card" onClick={() => router.push(`/shop/${p.id}`)}>
              <div style={s.productImgWrap}>
                <img src={p.img} alt={p.name} style={s.productImg} />
                {p.tag && <span style={{...s.productTag, ...(p.tag==="Sale"?s.tagSale:p.tag==="Hot"?s.tagHot:s.tagNew)}}>{p.tag}</span>}
                <div style={s.productActions} className="product-actions">
                  <button style={s.actionBtn} onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }} className="lav-action">
                    {wishlist.includes(p.id) ? "♥" : "♡"}
                  </button>
                  <button style={s.actionBtn} onClick={(e) => { e.stopPropagation(); setCartCount(c => c+1); }} className="lav-action">🛒</button>
                </div>
              </div>
              <div style={s.productInfo}>
                <p style={s.productName}>{p.name}</p>
                <p style={s.productPrice}>{p.price}</p>
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

  hero: { position: "relative", height: 520, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(20,5,35,0.72) 0%, rgba(20,5,35,0.2) 60%, transparent 100%)", zIndex: 1 },
  heroContent: { position: "absolute", top: "50%", left: 64, transform: "translateY(-50%)", zIndex: 2, maxWidth: 460 },
  heroEyebrow: { fontSize: 11, letterSpacing: 2, color: "#e8c4d0", textTransform: "uppercase", marginBottom: 12 },
  heroTitle: { fontSize: 42, fontWeight: 700, color: "#fff", fontFamily: "'Georgia',serif", lineHeight: 1.2, margin: "0 0 16px 0" },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, marginBottom: 28 },
  heroBtns: { display: "flex", gap: 12 },
  btnPrimary: { padding: "12px 28px", borderRadius: 50, background: "linear-gradient(135deg,#c0395a,#a02848)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnOutline: { padding: "12px 28px", borderRadius: 50, background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, cursor: "pointer" },

  section: { padding: "52px 48px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  sectionTitle: { fontSize: 22, fontWeight: 700, color: "#2d1a3a", fontFamily: "'Georgia',serif", margin: "0 0 28px 0" },
  viewAll: { fontSize: 13, color: "#c0395a", textDecoration: "none", fontWeight: 500, cursor: "pointer" },

  collectionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "200px 200px", gap: 12 },
  collCard: { position: "relative", overflow: "hidden", borderRadius: 12, cursor: "pointer" },
  collLarge: { gridRow: "1 / 3" },
  collImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.3s" },
  collOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 16px", background: "linear-gradient(to top, rgba(30,10,50,0.75), transparent)", display: "flex", flexDirection: "column" },
  collLabel: { color: "#fff", fontWeight: 600, fontSize: 15, fontFamily: "'Georgia',serif" },
  collSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

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