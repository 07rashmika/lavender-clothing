"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { api } from "@/lib/api";
import { formatMoney, productImageUrl } from "@/lib/format";
import type { Product } from "@/types/product";

const COLOR_NAMES = ["Soft Lavender", "Deep Purple", "Cream", "Navy", "Blush", "Gold"];

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColor, setSelectedColor] = useState(0);
  const [addedToBag, setAddedToBag] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("fabric");

  useEffect(() => {
    api
      .get(`/products/${params.id}`)
      .then((data: Product) => {
        setProduct(data);
        setSelectedSize(data.sizes[0] ?? "S");
      })
      .catch((err) => console.error("[shop/detail] fetch failed:", err));
  }, [params.id]);

  const inWishlist = product ? isInWishlist(product.id) : false;

  const handleAddToBag = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.priceCents / 100,
      image: product.images[0] ? productImageUrl(product.images[0]) : "",
      color: COLOR_NAMES[selectedColor] || "Default",
      colorSwatch: product.colors[selectedColor],
      size: selectedSize,
      badge: product.tag || undefined,
    });
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.priceCents / 100,
      image: product.images[0] ? productImageUrl(product.images[0]) : "",
      badge: product.tag || undefined,
      colorSwatch: product.colors[0],
    });
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (!product) {
    return (
      <div style={s.page}>
        <Navbar activePage="shop" />
        <p style={{ padding: 48, color: "#888" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{css}</style>
      <Navbar activePage="shop" />

      {/* BREADCRUMB */}
      <div style={s.breadcrumb}>
        <span style={s.breadLink} onClick={() => router.push("/shop")}>Shop</span>
        <span style={s.breadSep}> › </span>
        <span style={s.breadLink} onClick={() => router.push("/shop")}>{product.category}</span>
        <span style={s.breadSep}> › </span>
        <span style={s.breadCurrent}>{product.name}</span>
      </div>

      {/* MAIN CONTENT */}
      <div style={s.container}>
        {/* LEFT — Images */}
        <div style={s.imageSection}>
          <div style={s.mainImgWrap}>
            {product.images[selectedImg] && (
              <Image src={productImageUrl(product.images[selectedImg])} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={s.mainImg} />
            )}
            {product.tag && (
              <span style={{
                ...s.badge,
                background: product.tag === "Hot" ? "#e05080" : product.tag === "Sale" ? "#7b2fa8" : "#5b2d8e"
              }}>{product.tag}</span>
            )}
            <button style={s.wishBtnImg} onClick={handleToggleWishlist} className="wish-img-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? "#c0395a" : "none"} stroke="#c0395a" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Thumbnails */}
          <div style={s.thumbs}>
            {product.images.map((img, i) => (
              <div
                key={i}
                style={{...s.thumb, border: selectedImg === i ? "2.5px solid #c0395a" : "2px solid #e8dce8"}}
                onClick={() => setSelectedImg(i)}
                className="thumb"
              >
                <Image src={productImageUrl(img)} alt="" fill sizes="68px" style={s.thumbImg} />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Details */}
        <div style={s.detailSection}>
          <p style={s.category}>{product.category}</p>
          <h1 style={s.productName}>{product.name}</h1>

          {/* Price */}
          <div style={s.priceRow}>
            <span style={s.price}>{formatMoney(product.priceCents)}</span>
            {product.compareAtPriceCents && (
              <span style={s.originalPrice}>{formatMoney(product.compareAtPriceCents)}</span>
            )}
          </div>

          <p style={s.description}>{product.description}</p>

          {/* Color */}
          <div style={s.section}>
            <p style={s.sectionLabel}>
              Color: <span style={s.colorName}>
                {COLOR_NAMES[selectedColor] || "Soft Lavender"}
              </span>
            </p>
            <div style={s.colorRow}>
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  style={{
                    ...s.colorCircle,
                    backgroundColor: c,
                    border: selectedColor === i ? "3px solid #c0395a" : "2px solid #e8dce8",
                    transform: selectedColor === i ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div style={s.section}>
            <div style={s.sizeHeader}>
              <p style={s.sectionLabel}>Select Size</p>
              <span style={s.sizeGuide}>Size Guide</span>
            </div>
            <div style={s.sizeRow}>
              {product.sizes.map(sz => (
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

          {/* Action Buttons */}
          <button
            style={{...s.addToBagBtn, background: addedToBag ? "#5b2d8e" : "#c0395a"}}
            className="add-bag-btn"
            onClick={handleAddToBag}
          >
            {addedToBag ? "✓ Added to Bag!" : "ADD TO BAG"}
          </button>

          <button
            style={{...s.wishlistBtn, color: inWishlist ? "#c0395a" : "#2d1a3a"}}
            className="wishlist-btn"
            onClick={handleToggleWishlist}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={inWishlist ? "#c0395a" : "none"} stroke={inWishlist ? "#c0395a" : "#2d1a3a"} strokeWidth="2" style={{ marginRight: 8 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {inWishlist ? "SAVED TO WISHLIST" : "ADD TO WISHLIST"}
          </button>

          {/* Accordion */}
          {[
            { key: "fabric", label: "Fabric & Care", content: product.fabric },
            { key: "shipping", label: "Shipping & Returns", content: "Free standard shipping on orders over $80. Express shipping available. Returns accepted within 30 days of purchase in original condition." },
            { key: "sustainability", label: "Sustainability", content: "We are committed to ethical production. All our pieces are made in fair-trade certified facilities using sustainable materials where possible." },
          ].map(item => (
            <div key={item.key} style={s.accordion}>
              <div
                style={s.accordionHeader}
                onClick={() => toggleSection(item.key)}
                className="accordion-header"
              >
                <span style={s.accordionLabel}>{item.label}</span>
                <span style={s.accordionIcon}>{openSection === item.key ? "∧" : "∨"}</span>
              </div>
              {openSection === item.key && (
                <p style={s.accordionContent}>{item.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PURPLE BANNER */}
      <div style={s.banner}>
        <h2 style={s.bannerTitle}>The Art of Draping</h2>
        <p style={s.bannerSub}>Every gown is a sculpture in motion. Experience the unparalleled feeling of luxury silk against your skin.</p>
      </div>

      <Footer />
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { fontFamily: "'Inter','Segoe UI',sans-serif", backgroundColor: "#fdf8fb", minHeight: "100vh" },

  breadcrumb: { padding: "14px 48px", display: "flex", alignItems: "center", gap: 4 },
  breadLink: { fontSize: 12, color: "#888", cursor: "pointer", textDecoration: "none" },
  breadSep: { fontSize: 12, color: "#ccc" },
  breadCurrent: { fontSize: 12, color: "#2d1a3a", fontWeight: 500 },

  container: { display: "flex", gap: 48, padding: "24px 48px 48px", maxWidth: 1100, margin: "0 auto" },

  // LEFT
  imageSection: { width: 320, flexShrink: 0 },
  mainImgWrap: { position: "relative", borderRadius: 16, overflow: "hidden", height: 380, marginBottom: 12 },
  mainImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.3s" },
  badge: { position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 700, color: "#fff", padding: "3px 10px", borderRadius: 20 },
  wishBtnImg: { position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", border: "none", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  thumbs: { display: "flex", gap: 8 },
  thumb: { position: "relative", width: 68, height: 68, borderRadius: 10, overflow: "hidden", cursor: "pointer", flexShrink: 0 },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" },

  // RIGHT
  detailSection: { flex: 1 },
  category: { fontSize: 11, color: "#9b6fd0", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  productName: { fontSize: 28, fontWeight: 700, color: "#2d1a3a", fontFamily: "'Georgia',serif", margin: "0 0 12px 0", lineHeight: 1.3 },
  priceRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  price: { fontSize: 22, fontWeight: 700, color: "#c0395a" },
  originalPrice: { fontSize: 16, color: "#bbb", textDecoration: "line-through" },
  description: { fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 20 },

  section: { marginBottom: 18 },
  sectionLabel: { fontSize: 13, fontWeight: 600, color: "#2d1a3a", marginBottom: 10 },
  colorName: { fontWeight: 400, color: "#666" },
  colorRow: { display: "flex", gap: 10 },
  colorCircle: { width: 28, height: 28, borderRadius: "50%", cursor: "pointer", transition: "transform 0.2s, border 0.2s" },

  sizeHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sizeGuide: { fontSize: 12, color: "#9b6fd0", cursor: "pointer", textDecoration: "underline" },
  sizeRow: { display: "flex", gap: 8 },
  sizeBtn: { width: 44, height: 36, borderRadius: 8, border: "1.5px solid #e8dce8", background: "#fff", fontSize: 13, color: "#555", cursor: "pointer", fontWeight: 500 },
  sizeBtnActive: { width: 44, height: 36, borderRadius: 8, border: "1.5px solid #c0395a", background: "#c0395a", fontSize: 13, color: "#fff", cursor: "pointer", fontWeight: 700 },

  addToBagBtn: { width: "100%", padding: "14px 0", borderRadius: 10, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 1, marginBottom: 10, transition: "background 0.3s, transform 0.2s" },
  wishlistBtn: { width: "100%", padding: "12px 0", borderRadius: 10, background: "#fff", border: "1.5px solid #e8dce8", fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, transition: "border-color 0.2s" },

  accordion: { borderTop: "1px solid #f0e8f5", paddingTop: 12, marginBottom: 12 },
  accordionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", paddingBottom: 8 },
  accordionLabel: { fontSize: 13, fontWeight: 600, color: "#2d1a3a" },
  accordionIcon: { fontSize: 14, color: "#9b6fd0" },
  accordionContent: { fontSize: 13, color: "#666", lineHeight: 1.7, paddingBottom: 8 },

  banner: { background: "linear-gradient(135deg, #7b2fa8, #c0395a)", margin: "0 48px 48px", borderRadius: 16, padding: "52px 48px", textAlign: "center" },
  bannerTitle: { fontFamily: "'Georgia',serif", fontStyle: "italic", fontSize: 28, color: "#fff", margin: "0 0 12px 0" },
  bannerSub: { fontSize: 14, color: "rgba(255,255,255,0.82)", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 },
};

const css = `
  .wish-img-btn:hover { background: #fdf3f6 !important; }
  .thumb:hover { opacity: 0.85; }
  .size-btn:hover { border-color: #c0395a !important; color: #c0395a !important; }
  .add-bag-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(192,57,90,0.35); }
  .wishlist-btn:hover { border-color: #c0395a !important; }
  .accordion-header:hover span { color: #c0395a !important; }
`;