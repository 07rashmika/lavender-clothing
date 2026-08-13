"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Button,
  Card,
  Badge,
  SummaryRow,
  EmptyState,
  colors,
  fonts,
} from "@/components/ui";
import { api } from "@/lib/api";
import Canvas3D from "@/app/customizer/Canvas3D";
import type { DesignLayer, GarmentPart } from "@/app/customizer/Studio";

const DEFAULT_FREE_SHIP_THRESHOLD_CENTS = 20000;
const DEFAULT_TAX_RATE_BPS = 800;
const customFallback: Record<GarmentPart, string> = {
  front: "#c8d0f0",
  back: "#c8d0f0",
  "left-sleeve": "#c8d0f0",
  "right-sleeve": "#c8d0f0",
  collar: "#c8d0f0",
};

export default function BagPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  const [freeShipThresholdCents, setFreeShipThresholdCents] = useState(
    DEFAULT_FREE_SHIP_THRESHOLD_CENTS,
  );
  const [taxRateBps, setTaxRateBps] = useState(DEFAULT_TAX_RATE_BPS);

  useEffect(() => {
    api
      .get("/settings/public")
      .then((data) => {
        setFreeShipThresholdCents(data.freeShipThresholdCents);
        setTaxRateBps(data.taxRateBps);
      })
      .catch((err) => console.error("[bag] settings fetch failed:", err));
  }, []);

  const subtotalCents = Math.round(subtotal * 100);
  const freeShipThreshold = freeShipThresholdCents / 100;
  const shippingNote =
    subtotal >= freeShipThreshold ? "FREE" : "Calculated at checkout";
  const tax = Math.round((subtotalCents * taxRateBps) / 10000) / 100;
  const total = subtotal + tax;

  return (
    <div style={{ backgroundColor: colors.pageBg, minHeight: "100vh" }}>
      <Navbar activePage="bag" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <h1
          style={{
            fontSize: 32,
            fontFamily: fonts.heading,
            color: colors.textBody,
            marginBottom: 4,
          }}
        >
          Your Bag
        </h1>
        <p style={{ color: colors.textFaint, marginBottom: 32, fontSize: 14 }}>
          You have {items.length} curated item{items.length !== 1 ? "s" : ""} in
          your selection.
        </p>

        {items.length === 0 ? (
          <EmptyState
            message="Your bag is empty."
            actionLabel="Start Shopping"
            onAction={() => router.push("/shop")}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: 32,
              alignItems: "start",
            }}
          >
            {/* Item list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {items.map((item) => (
                <Card
                  key={`${item.id}-${item.color}-${item.size}`}
                  padding={20}
                  style={{ display: "flex", gap: 20 }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 90,
                      height: 100,
                      borderRadius: 10,
                      overflow: "hidden",
                      flexShrink: 0,
                      background: "#f3e9ee",
                    }}
                  >
                    {item.customizationId ? (
                      <Canvas3D
                        height="100px"
                        color={item.colorSwatch || customFallback.front}
                        panelColors={
                          {
                            ...customFallback,
                            ...(item.customizationConfig?.panels ?? {}),
                          } as Record<GarmentPart, string>
                        }
                        modelPath="/models/tshirt.glb"
                        material={item.material || "Organic Cotton"}
                        layers={
                          (item.customizationConfig?.layers ??
                            []) as DesignLayer[]
                        }
                        resetToken={0}
                      />
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="90px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
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
                          <Badge
                            label={item.badge}
                            style={{ marginBottom: 6 }}
                          />
                        )}
                        <h3
                          style={{
                            fontSize: 16,
                            color: colors.textBody,
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {item.name}
                        </h3>
                        {item.sku && (
                          <p
                            style={{
                              fontSize: 12,
                              color: colors.textPlaceholder,
                              margin: "2px 0 0",
                            }}
                          >
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: 600,
                          color: colors.textBody,
                          fontSize: 16,
                        }}
                      >
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 40, margin: "14px 0" }}>
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: colors.textPlaceholder,
                            letterSpacing: 0.5,
                            marginBottom: 6,
                          }}
                        >
                          COLOR
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: item.colorSwatch || "#ccc",
                              border: "1px solid #ddd",
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{ fontSize: 13, color: colors.textBody }}
                          >
                            {item.color}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: colors.textPlaceholder,
                            letterSpacing: 0.5,
                            marginBottom: 6,
                          }}
                        >
                          SIZE
                        </p>
                        <div
                          style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: 6,
                            padding: "3px 12px",
                            fontSize: 13,
                            color: colors.textBody,
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
                          border: `1px solid ${colors.border}`,
                          borderRadius: 20,
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.color,
                              item.size,
                              item.quantity - 1,
                            )
                          }
                          style={qtyBtnStyle}
                        >
                          −
                        </button>
                        <span
                          style={{
                            padding: "0 14px",
                            fontSize: 14,
                            color: colors.textBody,
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.color,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                          style={qtyBtnStyle}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.color, item.size)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "none",
                          border: "none",
                          color: "#b08a9a",
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        ⛔Remove
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order summary */}
            <Card sticky>
              <h2
                style={{
                  fontSize: 18,
                  fontFamily: fonts.heading,
                  color: colors.textBody,
                  marginBottom: 16,
                }}
              >
                Order Summary
              </h2>

              <SummaryRow
                label={`Subtotal (${items.reduce((s, i) => s + i.quantity, 0)} items)`}
                value={`LKR ${subtotal.toFixed(2)}`}
              />
              <SummaryRow label="Shipping" value={shippingNote} />
              <SummaryRow label="Tax" value={`LKR ${tax.toFixed(2)}`} />

              <div
                style={{
                  borderTop: `1px solid ${colors.border}`,
                  margin: "14px 0",
                  paddingTop: 14,
                }}
              >
                <SummaryRow label="Total" value={`LKR ${total.toFixed(2)}`} bold />
              </div>

              <Button
                variant="primary"
                fullWidth
                size="md"
                style={{ marginTop: 12 }}
                onClick={() => router.push("/checkout")}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                fullWidth
                size="md"
                style={{ marginTop: 10 }}
                onClick={() => router.push("/shop")}
              >
                Continue Shopping
              </Button>

              <hr
                style={{
                  border: "none",
                  borderTop: `1px solid ${colors.border}`,
                  margin: "18px 0",
                }}
              />

              <p
                style={{
                  fontSize: 12,
                  color: colors.textFaint,
                  marginBottom: 8,
                }}
              >
                🚚 Free shipping on orders over LKR {freeShipThreshold}
              </p>
              <p style={{ fontSize: 12, color: colors.textFaint }}>
                🛡 Secure payment & 30-day easy returns
              </p>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "6px 12px",
  fontSize: 15,
  color: "#4a3a5a",
  cursor: "pointer",
};
