"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const router = useRouter();

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

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.navLogo}>Lavender</div>
        <div style={s.navLinks}>
          <a style={s.navLink} href="#">Collections</a>
          <a style={s.navLink} href="#">Contact</a>
        </div>
        <div style={s.navSearch}>
          <input placeholder="Search for anything..." style={s.searchInput} className="lav-search" />
        </div>
        <div style={s.navIcons}>
          <span style={s.icon} title="Wishlist">♡</span>
          <span style={s.icon} title="Cart">
            🛍 {cartCount > 0 && <span style={s.badge}>{cartCount}</span>}
          </span>
          <span style={s.icon} onClick={() => router.push("/auth")} title="Account">👤</span>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <img src="/lav-p4.jpg" alt="hero" style={s.heroImg} />
        <div style={s.heroContent}>
          <p style={s.heroEyebrow}>Summer Collection 2025</p>
          <h1 style={s.heroTitle}>Effortless Elegance<br />in Every Stitch</h1>
          <p style={s.heroSub}>Discover hand-curated pieces that move with you — from sunrise markets to golden evenings.</p>
          <div style={s.heroBtns}>
            <button style={s.btnPrimary} className="lav-btn-primary">Shop Now</button>
            <button style={s.btnOutline} className="lav-btn-outline">Explore Looks</button>
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
            <div style={s.collOverlay}><span style={s.collLabel}>Fringe</span><span style={s.collSub}>From $49.99</span></div>
          </div>
        </div>
      </section>

      {/* CUSTOMIZE BANNER */}
      <section style={s.customizeBanner}>
        <div style={s.customizeInner}>
          <p style={s.customizeEye}>MADE FOR YOU</p>
          <h2 style={s.customizeTitle}>Customize Your Own</h2>
          <p style={s.customizeSub}>Choose your fabric, colour and cut. We'll create a signature piece made especially for you.</p>
          <button style={s.btnWhite} className="lav-btn-white">Start Designing</button>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>New Arrivals</h2>
          <a style={s.viewAll} href="#">View All Products →</a>
        </div>
        <div style={s.productsGrid}>
          {products.map(p => (
            <div key={p.id} style={s.productCard} className="lav-card">
              <div style={s.productImgWrap}>
                <img src={p.img} alt={p.name} style={s.productImg} />
                {p.tag && <span style={{...s.productTag, ...(p.tag==="Sale"?s.tagSale:p.tag==="Hot"?s.tagHot:s.tagNew)}}>{p.tag}</span>}
                <div style={s.productActions}>
                  <button style={s.actionBtn} onClick={() => toggleWishlist(p.id)} className="lav-action">
                    {wishlist.includes(p.id) ? "♥" : "♡"}
                  </button>
                  <button style={s.actionBtn} onClick={() => setCartCount(c => c+1)} className="lav-action">🛒</button>
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

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div>
            <div style={s.footerLogo}>Lavender</div>
            <p style={s.footerTagline}>Fashion that blooms with you.</p>
            <div style={s.socials}>
              <span style={s.social}>f</span>
              <span style={s.social}>in</span>
              <span style={s.social}>ig</span>
            </div>
          </div>
          <div>
            <p style={s.footerHeading}>Shopping</p>
            <p style={s.footerLink}>Collections</p>
            <p style={s.footerLink}>New Arrivals</p>
            <p style={s.footerLink}>Returns</p>
            <p style={s.footerLink}>Shipping Policy</p>
          </div>
          <div>
            <p style={s.footerHeading}>Support</p>
            <p style={s.footerLink}>About Us</p>
            <p style={s.footerLink}>Contact</p>
            <p style={s.footerLink}>FAQ</p>
          </div>
          <div>
            <p style={s.footerHeading}>Contact Us</p>
            <p style={s.footerLink}>123 Bloom Street, Suite 4</p>
            <p style={s.footerLink}>Colombo, LK 00300</p>
            <p style={s.footerLink}>hello@lavender.com</p>
          </div>
        </div>
        <div style={s.footerBottom}>© 2025 Lavender Clothing. All rights reserved.</div>
      </footer>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { fontFamily: "'Inter','Segoe UI',sans-serif", backgroundColor: "#fff", minHeight: "100vh" },

  // NAV
  nav: { display: "flex", alignItems: "center", gap: 24, padding: "14px 48px", borderBottom: "1px solid #f0e8f0", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 100 },
  navLogo: { fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 700, color: "#2d1a3a", marginRight: 16, whiteSpace: "nowrap" },
  navLinks: { display: "flex", gap: 24 },
  navLink: { fontSize: 13, color: "#555", textDecoration: "none", cursor: "pointer" },
  navSearch: { flex: 1 },
  searchInput: { width: "100%", maxWidth: 320, padding: "7px 16px", borderRadius: 20, border: "1.5px solid #e8dce8", fontSize: 13, outline: "none", fontFamily: "'Inter',sans-serif" },
  navIcons: { display: "flex", gap: 18, alignItems: "center" },
  icon: { fontSize: 18, cursor: "pointer", position: "relative", userSelect: "none" },
  badge: { position: "absolute", top: -6, right: -8, background: "#c0395a", color: "#fff", borderRadius: "50%", fontSize: 9, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" },

  // HERO
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

  // SECTIONS
  section: { padding: "52px 48px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  sectionTitle: { fontSize: 22, fontWeight: 700, color: "#2d1a3a", fontFamily: "'Georgia',serif", margin: "0 0 28px 0" },
  viewAll: { fontSize: 13, color: "#c0395a", textDecoration: "none", fontWeight: 500, cursor: "pointer" },

  // COLLECTIONS
  collectionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "200px 200px", gap: 12 },
  collCard: { position: "relative", overflow: "hidden", borderRadius: 12, cursor: "pointer" },
  collLarge: { gridRow: "1 / 3" },
  collImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.3s" },
  collOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 16px", background: "linear-gradient(to top, rgba(30,10,50,0.75), transparent)", display: "flex", flexDirection: "column" },
  collLabel: { color: "#fff", fontWeight: 600, fontSize: 15, fontFamily: "'Georgia',serif" },
  collSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

  // CUSTOMIZE BANNER
  customizeBanner: { margin: "0 48px", borderRadius: 16, background: "linear-gradient(135deg, #c0395a 0%, #7b2fa8 100%)", padding: "48px 64px", display: "flex", alignItems: "center", justifyContent: "center" },
  customizeInner: { textAlign: "center", maxWidth: 500 },
  customizeEye: { fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 10 },
  customizeTitle: { fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "'Georgia',serif", margin: "0 0 12px 0" },
  customizeSub: { fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, marginBottom: 24 },
  btnWhite: { padding: "11px 28px", borderRadius: 50, background: "#fff", color: "#c0395a", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  // PRODUCTS
  productsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  productCard: { borderRadius: 12, overflow: "hidden", backgroundColor: "#fdf8fb", transition: "transform 0.2s" },
  productImgWrap: { position: "relative", height: 260, overflow: "hidden" },
  productImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.3s" },
  productTag: { position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: 0.5 },
  tagNew: { background: "#c0395a", color: "#fff" },
  tagHot: { background: "#ff6b35", color: "#fff" },
  tagSale: { background: "#7b2fa8", color: "#fff" },
  productActions: { position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 6, opacity: 0 },
  productInfo: { padding: "14px 16px" },
  productName: { fontSize: 13, fontWeight: 600, color: "#2d1a3a", margin: "0 0 4px 0" },
  productPrice: { fontSize: 13, color: "#c0395a", fontWeight: 700, margin: 0 },
  actionBtn: { width: 32, height: 32, borderRadius: "50%", border: "none", backgroundColor: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },

  // FOOTER
  footer: { backgroundColor: "#1a0a2a", padding: "48px 48px 24px" },
  footerTop: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 40, marginBottom: 40 },
  footerLogo: { fontFamily: "'Georgia',serif", fontSize: 22, color: "#fff", fontWeight: 700, marginBottom: 8 },
  footerTagline: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 },
  socials: { display: "flex", gap: 10 },
  social: { width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, cursor: "pointer" },
  footerHeading: { fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 },
  footerLink: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, cursor: "pointer" },
  footerBottom: { borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" },
};

const css = `
  .lav-search:focus { border-color: #c0395a !important; outline: none; }
  .lav-btn-primary:hover { opacity: 0.88; }
  .lav-btn-outline:hover { background: rgba(255,255,255,0.1) !important; }
  .lav-btn-white:hover { background: #fdf3f6 !important; }
  .lav-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(192,57,90,0.12); }
  .lav-card:hover img { transform: scale(1.04); }
  .lav-card:hover .product-actions { opacity: 1 !important; }
  .lav-action:hover { background: #fdf3f6 !important; color: #c0395a; }
`;