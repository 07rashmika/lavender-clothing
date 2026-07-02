"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const allProducts = [
  { id: 1, name: "Silk Ruffle Blouse", price: "$89.00", img: "/lav-p5.jpg", category: "Blouses", colors: ["#c8a0d0", "#e05080"], tag: "New" },
  { id: 2, name: "Puff Sleeve Crop", price: "$55.00", img: "/lav-p1.jpg", category: "Crop Tops", colors: ["#e05080", "#333"], tag: "Hot" },
  { id: 3, name: "Meadow Floral Frock", price: "$120.00", img: "/lav-p2.jpg", category: "Frocks", colors: ["#c8a0d0"], tag: "Limited" },
  { id: 4, name: "Linen Button-up", price: "$72.00", img: "/lav-p3.jpg", category: "Blouses", colors: ["#f5f0e8", "#333"], tag: "" },
  { id: 5, name: "Essential Crop Top", price: "$42.00", img: "/lav-p6.jpg", category: "Crop Tops", colors: ["#333", "#c8a0d0"], tag: "" },
  { id: 6, name: "Tiered Ribbon Frock", price: "$135.00", img: "/lav-p4.jpg", category: "Frocks", colors: ["#c8a0d0", "#e05080"], tag: "Limited" },
  { id: 7, name: "Boho Fringe Kimono", price: "$89.00", img: "/lav-p5.jpg", category: "Blouses", colors: ["#f5f0e8"], tag: "New" },
  { id: 8, name: "Lavender Mini Dress", price: "$98.00", img: "/lav-p2.jpg", category: "Frocks", colors: ["#c8a0d0"], tag: "" },
  { id: 9, name: "Yellow Chic Top", price: "$64.00", img: "/lav-p1.jpg", category: "Crop Tops", colors: ["#f5c518", "#e05080"], tag: "Hot" },
  { id: 10, name: "Floral Midi Dress", price: "$112.00", img: "/lav-p4.jpg", category: "Frocks", colors: ["#c8a0d0", "#333"], tag: "" },
  { id: 11, name: "Classic Linen Top", price: "$58.00", img: "/lav-p3.jpg", category: "Blouses", colors: ["#f5f0e8", "#c8a0d0"], tag: "" },
  { id: 12, name: "Ruched Crop", price: "$47.00", img: "/lav-p6.jpg", category: "Crop Tops", colors: ["#e05080"], tag: "New" },
];

const ITEMS_PER_PAGE = 6;
const categories = ["All Items", "Blouses", "Crop Tops", "Frocks"];
const sizes = ["XS", "S", "M", "L"];
const colorOptions = ["#f5f0e8", "#e05080", "#f5c518", "#333", "#c8a0d0"];
const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low"];

export default function ShopPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);

  const handleWishlistClick = (p: (typeof allProducts)[number], e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({
      id: String(p.id),
      name: p.name,
      price: parseFloat(p.price.replace("$", "")),
      image: p.img,
      badge: p.tag || undefined,
      colorSwatch: p.colors[0],
    });
  };

  const clearAll = () => {
    setSelectedCategory("All Items");
    setSelectedSize("S");
    setSelectedColor(null);
    setSortBy("Newest");
    setCurrentPage(1);
  };

  const filtered = allProducts.filter(p => {
    if (selectedCategory !== "All Items" && p.category !== selectedCategory) return false;
    if (selectedColor && !p.colors.includes(selectedColor)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Price: Low to High") return parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1));
    if (sortBy === "Price: High to Low") return parseFloat(b.price.slice(1)) - parseFloat(a.price.slice(1));
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={s.page}>
      <style>{css}</style>
      <Navbar activePage="shop" />

      <div style={s.container}>
        {/* SIDEBAR */}
        <aside style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <span style={s.filtersTitle}>Filters</span>
            <span style={s.clearAll} onClick={clearAll}>Clear all</span>
          </div>

          <div style={s.filterGroup}>
            <p style={s.filterLabel}>CATEGORIES</p>
            <div style={s.categoryBtns}>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => { setSelectedCategory(c); setCurrentPage(1); }}
                  style={selectedCategory === c ? s.catBtnActive : s.catBtn}
                  className={selectedCategory === c ? "cat-active" : "cat-btn"}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={s.filterGroup}>
            <p style={s.filterLabel}>SIZE</p>
            <div style={s.sizeBtns}>
              {sizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={selectedSize === sz ? s.sizeBtnActive : s.sizeBtn}
                  className={selectedSize === sz ? "size-active" : "size-btn"}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div style={s.filterGroup}>
            <p style={s.filterLabel}>COLOR</p>
            <div style={s.colorBtns}>
              {colorOptions.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(selectedColor === c ? null : c)}
                  style={{
                    ...s.colorBtn,
                    backgroundColor: c,
                    border: selectedColor === c ? "2.5px solid #c0395a" : "2px solid #e8dce8",
                    transform: selectedColor === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={s.filterGroup}>
            <p style={s.filterLabel}>PRICE</p>
            <p style={s.priceRange}>$20 - $150</p>
          </div>
        </aside>

        {/* MAIN */}
        <main style={s.main}>
          <div style={s.topBar}>
            <p style={s.resultCount}>Showing {paginated.length} results of {sorted.length} items</p>
            <div style={s.sortWrap}>
              <span style={s.sortLabel}>Sort by:</span>
              <select
                style={s.sortSelect}
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
              >
                {sortOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div style={s.grid}>
            {paginated.map(p => (
              <div
                key={p.id}
                style={s.card}
                className="shop-card"
                onClick={() => router.push(`/shop/${p.id}`)}
              >
                <div style={s.cardImgWrap}>
                  <img src={p.img} alt={p.name} style={s.cardImg} />
                  {p.tag && (
                    <span style={{
                      ...s.tag,
                      background: p.tag === "Hot" ? "#e05080" : p.tag === "Limited" ? "#7b2fa8" : "#5b2d8e"
                    }}>{p.tag}</span>
                  )}
                  <button
                    style={s.wishBtn}
                    className="wish-btn"
                    onClick={(e) => handleWishlistClick(p, e)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(String(p.id)) ? "#c0395a" : "none"} stroke="#c0395a" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                <div style={s.cardInfo}>
                  <p style={s.cardName}>{p.name}</p>
                  <div style={s.cardBottom}>
                    <p style={s.cardPrice}>{p.price}</p>
                    <div style={s.cardColors}>
                      {p.colors.map(c => (
                        <span key={c} style={{ ...s.colorDot, backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <button
                    style={s.addBtn}
                    className="add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: String(p.id),
                        name: p.name,
                        price: parseFloat(p.price.replace("$", "")),
                        image: p.img,
                        color: "Default",
                        colorSwatch: p.colors[0],
                        size: selectedSize,
                        badge: p.tag || undefined,
                      });
                    }}
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={s.pagination}>
            <button
              style={s.pageBtn}
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                style={currentPage === n ? s.pageBtnActive : s.pageBtn}
                className={currentPage === n ? "page-active" : "page-btn"}
                onClick={() => setCurrentPage(n)}
              >{n}</button>
            ))}
            <button
              style={s.pageBtn}
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >›</button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { fontFamily: "'Inter','Segoe UI',sans-serif", backgroundColor: "#fdf8fb", minHeight: "100vh" },
  container: { display: "flex", gap: 32, padding: "32px 48px", maxWidth: 1200, margin: "0 auto" },

  sidebar: { width: 180, flexShrink: 0 },
  sidebarHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  filtersTitle: { fontSize: 16, fontWeight: 700, color: "#2d1a3a" },
  clearAll: { fontSize: 12, color: "#c0395a", cursor: "pointer", textDecoration: "underline" },
  filterGroup: { marginBottom: 24 },
  filterLabel: { fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 },
  categoryBtns: { display: "flex", flexWrap: "wrap", gap: 6 },
  catBtn: { padding: "5px 12px", borderRadius: 20, border: "1.5px solid #e8dce8", background: "#fff", fontSize: 12, color: "#555", cursor: "pointer" },
  catBtnActive: { padding: "5px 12px", borderRadius: 20, border: "1.5px solid #5b2d8e", background: "#5b2d8e", fontSize: 12, color: "#fff", cursor: "pointer", fontWeight: 600 },
  sizeBtns: { display: "flex", gap: 6 },
  sizeBtn: { width: 32, height: 32, borderRadius: 6, border: "1.5px solid #e8dce8", background: "#fff", fontSize: 12, color: "#555", cursor: "pointer" },
  sizeBtnActive: { width: 32, height: 32, borderRadius: 6, border: "1.5px solid #5b2d8e", background: "#5b2d8e", fontSize: 12, color: "#fff", cursor: "pointer", fontWeight: 700 },
  colorBtns: { display: "flex", gap: 8 },
  colorBtn: { width: 22, height: 22, borderRadius: "50%", cursor: "pointer", transition: "transform 0.2s" },
  priceRange: { fontSize: 13, color: "#555" },

  main: { flex: 1 },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  resultCount: { fontSize: 13, color: "#888" },
  sortWrap: { display: "flex", alignItems: "center", gap: 8 },
  sortLabel: { fontSize: 13, color: "#555" },
  sortSelect: { fontSize: 13, color: "#2d1a3a", border: "1.5px solid #e8dce8", borderRadius: 8, padding: "4px 8px", outline: "none", cursor: "pointer", backgroundColor: "#fff" },

  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  card: { borderRadius: 12, overflow: "hidden", backgroundColor: "#fff", border: "1px solid #f0e8f5", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" },
  cardImgWrap: { position: "relative", height: 220, overflow: "hidden" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.3s" },
  tag: { position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, color: "#fff", padding: "3px 8px", borderRadius: 20 },
  wishBtn: { position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", border: "none", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  cardInfo: { padding: "12px 14px" },
  cardName: { fontSize: 13, fontWeight: 600, color: "#2d1a3a", margin: "0 0 6px 0" },
  cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardPrice: { fontSize: 13, color: "#2d1a3a", fontWeight: 600, margin: 0 },
  cardColors: { display: "flex", gap: 4 },
  colorDot: { width: 10, height: 10, borderRadius: "50%", border: "1px solid #e8dce8" },
  addBtn: { width: "100%", padding: "8px 0", borderRadius: 8, background: "#c0395a", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" },

  pagination: { display: "flex", justifyContent: "center", gap: 6, marginTop: 36 },
  pageBtn: { width: 34, height: 34, borderRadius: 8, border: "1.5px solid #e8dce8", background: "#fff", fontSize: 13, color: "#555", cursor: "pointer" },
  pageBtnActive: { width: 34, height: 34, borderRadius: 8, border: "1.5px solid #c0395a", background: "#c0395a", fontSize: 13, color: "#fff", cursor: "pointer", fontWeight: 700 },
};

const css = `
  .shop-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(192,57,90,0.1); }
  .shop-card:hover img { transform: scale(1.04); }
  .add-btn:hover { background: #a02848 !important; }
  .wish-btn:hover { background: #fdf3f6 !important; }
  .page-btn:hover { border-color: #c0395a !important; color: #c0395a !important; }
  .cat-btn:hover { border-color: #5b2d8e !important; color: #5b2d8e !important; }
  .size-btn:hover { border-color: #5b2d8e !important; color: #5b2d8e !important; }
`;