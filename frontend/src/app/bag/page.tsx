"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FREE_SHIPPING_THRESHOLD = 200;

export default function BagPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  const shippingNote =
    subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : "Calculated at checkout";
  const tax = 0;
  const total = subtotal + tax;

  return (
    <div style={{ backgroundColor: "#fdf6f9", minHeight: "100vh" }}>
      <Navbar activePage="bag" />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontFamily: "Georgia, serif",
            color: "#4a3a5a",
            marginBottom: "4px",
          }}
        >
          Your Bag
        </h1>
        <p style={{ color: "#8a7a94", marginBottom: "32px", fontSize: "14px" }}>
          You have {items.length} curated item{items.length !== 1 ? "s" : ""} in your
          selection.
        </p>

        {items.length === 0 ? (
          <EmptyBag />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: "32px",
              alignItems: "start",
            }}
          >
            {/* Item list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}`}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    padding: "20px",
                    display: "flex",
                    gap: "20px",
                    boxShadow: "0 2px 10px rgba(150,100,150,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "90px",
                      height: "100px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      flexShrink: 0,
                      background: "#f3e9ee",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        {item.badge && (
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "0.5px",
                              color: "#fff",
                              background:
                                item.badge === "NEW" ? "#e05c8a" : "#d99a3d",
                              borderRadius: "4px",
                              padding: "2px 8px",
                              marginBottom: "6px",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        <h3
                          style={{
                            fontSize: "16px",
                            color: "#3d2e4a",
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {item.name}
                        </h3>
                        {item.sku && (
                          <p style={{ fontSize: "12px", color: "#a89ab0", margin: "2px 0 0" }}>
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <span style={{ fontWeight: 600, color: "#3d2e4a", fontSize: "16px" }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "40px", margin: "14px 0" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "#a89ab0", letterSpacing: "0.5px", marginBottom: "6px" }}>
                          COLOR
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              background: item.colorSwatch || "#ccc",
                              border: "1px solid #ddd",
                              display: "inline-block",
                            }}
                          />
                          <span style={{ fontSize: "13px", color: "#4a3a5a" }}>{item.color}</span>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#a89ab0", letterSpacing: "0.5px", marginBottom: "6px" }}>
                          SIZE
                        </p>
                        <div
                          style={{
                            border: "1px solid #e0d3e0",
                            borderRadius: "6px",
                            padding: "3px 12px",
                            fontSize: "13px",
                            color: "#4a3a5a",
                          }}
                        >
                          {item.size}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #e0d3e0",
                          borderRadius: "20px",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.color, item.size, item.quantity - 1)
                          }
                          style={qtyBtnStyle}
                        >
                          −
                        </button>
                        <span style={{ padding: "0 14px", fontSize: "14px", color: "#3d2e4a" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.color, item.size, item.quantity + 1)
                          }
                          style={qtyBtnStyle}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.color, item.size)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "none",
                          border: "none",
                          color: "#b08a9a",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 2px 10px rgba(150,100,150,0.06)",
                position: "sticky",
                top: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontFamily: "Georgia, serif",
                  color: "#3d2e4a",
                  marginBottom: "16px",
                }}
              >
                Order Summary
              </h2>

              <SummaryRow label={`Subtotal (${items.reduce((s, i) => s + i.quantity, 0)} items)`} value={`$${subtotal.toFixed(2)}`} />
              <SummaryRow label="Shipping" value={shippingNote} />
              <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} />

              <div
                style={{
                  borderTop: "1px solid #eee",
                  margin: "14px 0",
                  paddingTop: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: "17px",
                  color: "#3d2e4a",
                }}
              >
                <span>Total</span>
                <span style={{ color: "#c6558a" }}>${total.toFixed(2)}</span>
              </div>

              <Link href="/checkout">
                <button
                  style={{
                    width: "100%",
                    background: "#c6558a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "24px",
                    padding: "13px 0",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "12px",
                  }}
                >
                  Proceed to Checkout
                </button>
              </Link>

              <Link href="/shop">
                <button
                  style={{
                    width: "100%",
                    background: "#fff",
                    color: "#c6558a",
                    border: "1px solid #c6558a",
                    borderRadius: "24px",
                    padding: "13px 0",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  Continue Shopping
                </button>
              </Link>

              <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "18px 0" }} />

              <p style={{ fontSize: "12px", color: "#8a7a94", display: "flex", gap: "8px", marginBottom: "8px" }}>
                🚚 Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}
              </p>
              <p style={{ fontSize: "12px", color: "#8a7a94", display: "flex", gap: "8px" }}>
                🛡 Secure payment & 30-day easy returns
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "13px",
        color: "#6a5a74",
        marginBottom: "8px",
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: "#3d2e4a" }}>{value}</span>
    </div>
  );
}

function EmptyBag() {
  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <p style={{ fontSize: "18px", color: "#6a5a74", marginBottom: "16px" }}>
        Your bag is empty.
      </p>
      <Link href="/shop">
        <button
          style={{
            background: "#c6558a",
            color: "#fff",
            border: "none",
            borderRadius: "24px",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Start Shopping
        </button>
      </Link>
    </div>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "6px 12px",
  fontSize: "15px",
  color: "#4a3a5a",
  cursor: "pointer",
};