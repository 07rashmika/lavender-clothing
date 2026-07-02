"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

type Step = 1 | 2 | 3;
type PaymentMethod = "card" | "cod" | null;

interface ShippingData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

const TAX_RATE = 0.08;
const FEE = 2.0; // shipping / COD service charge

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<Step>(1);
  const [shipping, setShipping] = useState<ShippingData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [placed, setPlaced] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState<{
    orderNumber: string;
    orderDate: string;
    items: typeof items;
    subtotal: number;
    fee: number;
    tax: number;
    total: number;
    shipping: ShippingData;
    paymentMethod: PaymentMethod;
  } | null>(null);

  const shippingComplete = Object.values(shipping).every((v) => v.trim() !== "");
  const cardComplete = card.number.trim() !== "" && card.expiry.trim() !== "" && card.cvv.trim() !== "";

  const tax = subtotal * TAX_RATE;
  const total = subtotal + FEE + tax;

  const handleShippingField = (field: keyof ShippingData, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const goToPayment = () => {
    if (shippingComplete) setStep(2);
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === "cod") {
      setStep(3);
    }
  };

  const goToReviewFromCard = () => {
    if (cardComplete) setStep(3);
  };

  const placeOrder = () => {
    const orderNumber = "LAV-" + Math.floor(1000 + Math.random() * 9000);
    const orderDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    setOrderSnapshot({
      orderNumber,
      orderDate,
      items: [...items],
      subtotal,
      fee: FEE,
      tax,
      total,
      shipping: { ...shipping },
      paymentMethod,
    });
    setPlaced(true);
    clearCart();
  };

  if (items.length === 0 && !placed) {
    return (
      <div style={s.page}>
        <Navbar activePage="bag" />
        <div style={{ ...s.container, textAlign: "center", padding: "100px 24px" }}>
          <p style={{ fontSize: 18, color: "#6a5a74", marginBottom: 16 }}>
            Your bag is empty — nothing to check out.
          </p>
          <button style={s.placeOrderBtn} onClick={() => router.push("/shop")}>
            Browse the Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (placed && orderSnapshot) {
    return (
      <div style={s.page}>
        <Navbar activePage="bag" />

        <div style={s.container}>
          {/* Step indicator - all complete */}
          <div style={s.stepper}>
            <StepDot number={1} label="Shipping" active current={false} />
            <div style={{ ...s.stepLine, background: "#c0395a" }} />
            <StepDot number={2} label="Payment" active current={false} />
            <div style={{ ...s.stepLine, background: "#c0395a" }} />
            <StepDot number={3} label="Review" active current={false} />
          </div>

          <div style={s.confirmWrap}>
            <div style={s.confirmIcon}>🛍️</div>
            <h1 style={s.confirmTitle}>Thank You for Your Order!</h1>
            <p style={s.confirmSubtitle}>
              Your style journey continues. We&apos;ve received your order and are preparing it
              for a beautiful arrival.
            </p>

            <div style={s.invoiceCard}>
              <div style={s.invoiceHeaderRow}>
                <div>
                  <p style={s.invoiceLabel}>Order Number</p>
                  <p style={s.invoiceValueAccent}>#{orderSnapshot.orderNumber}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={s.invoiceLabel}>Order Date</p>
                  <p style={s.invoiceValueAccent}>{orderSnapshot.orderDate}</p>
                </div>
              </div>

              <div style={s.invoiceHeaderRow}>
                <div>
                  <p style={s.invoiceLabel}>Shipping Address</p>
                  <p style={s.invoiceText}>
                    {orderSnapshot.shipping.firstName} {orderSnapshot.shipping.lastName}<br />
                    {orderSnapshot.shipping.address}<br />
                    {orderSnapshot.shipping.city}, {orderSnapshot.shipping.state} {orderSnapshot.shipping.zip}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={s.invoiceLabel}>Payment Method</p>
                  <p style={s.invoiceText}>
                    {orderSnapshot.paymentMethod === "card" ? "💳 Card" : "📦 Cash on Delivery"}
                  </p>
                </div>
              </div>

              <p style={s.invoiceLabel}>Order Items</p>
              {orderSnapshot.items.map((item) => (
                <div key={`${item.id}-${item.color}-${item.size}`} style={s.invoiceItemRow}>
                  <div>
                    <p style={s.invoiceItemName}>{item.name}</p>
                    <p style={s.invoiceItemMeta}>Qty: {item.quantity}</p>
                  </div>
                  <p style={s.invoiceItemPrice}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              <div style={s.invoiceTotals}>
                <SummaryRow label="Subtotal" value={`$${orderSnapshot.subtotal.toFixed(2)}`} />
                <SummaryRow
                  label={orderSnapshot.paymentMethod === "cod" ? "COD Service Charge" : "Shipping"}
                  value={`$${orderSnapshot.fee.toFixed(2)}`}
                />
                <div style={{ ...s.totalRow, marginTop: 8, marginBottom: 0 }}>
                  <span>Total</span>
                  <span style={{ color: "#c6558a" }}>${orderSnapshot.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button style={{ ...s.placeOrderBtn, maxWidth: 300, margin: "24px auto 0" }} onClick={() => router.push("/shop")}>
              Continue Shopping
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Navbar activePage="bag" />

      <div style={s.container}>
        <h1 style={s.title}>Checkout & Payment</h1>

        {/* Step indicator */}
        <div style={s.stepper}>
          <StepDot number={1} label="Shipping" active={step >= 1} current={step === 1} />
          <div style={{ ...s.stepLine, background: step >= 2 ? "#c0395a" : "#e8dce8" }} />
          <StepDot number={2} label="Payment" active={step >= 2} current={step === 2} />
          <div style={{ ...s.stepLine, background: step >= 3 ? "#c0395a" : "#e8dce8" }} />
          <StepDot number={3} label="Review" active={step >= 3} current={step === 3} />
        </div>

        <div style={s.grid}>
          {/* Main form column */}
          <div>
            {step === 1 && (
              <section style={s.card}>
                <h2 style={s.sectionTitle}>Shipping Address</h2>
                <div style={s.row2}>
                  <Field label="First Name" value={shipping.firstName} onChange={(v) => handleShippingField("firstName", v)} placeholder="Sophie" />
                  <Field label="Last Name" value={shipping.lastName} onChange={(v) => handleShippingField("lastName", v)} placeholder="Chen" />
                </div>
                <Field label="Address" value={shipping.address} onChange={(v) => handleShippingField("address", v)} placeholder="123 Lavender Lane, Apt 4B" />
                <div style={s.row3}>
                  <Field label="City" value={shipping.city} onChange={(v) => handleShippingField("city", v)} placeholder="Los Angeles" />
                  <Field label="State" value={shipping.state} onChange={(v) => handleShippingField("state", v)} placeholder="CA" />
                  <Field label="ZIP" value={shipping.zip} onChange={(v) => handleShippingField("zip", v)} placeholder="90210" />
                </div>
                <button
                  style={{ ...s.placeOrderBtn, opacity: shippingComplete ? 1 : 0.5, marginTop: 20 }}
                  onClick={goToPayment}
                  disabled={!shippingComplete}
                >
                  Continue to Payment
                </button>
              </section>
            )}

            {step === 2 && (
              <section style={s.card}>
                <h2 style={s.sectionTitle}>Payment Method</h2>
                <div style={s.row2}>
                  <PaymentOption
                    label="Card"
                    icon="💳"
                    selected={paymentMethod === "card"}
                    onClick={() => selectPaymentMethod("card")}
                  />
                  <PaymentOption
                    label="Cash on Delivery"
                    icon="📦"
                    selected={paymentMethod === "cod"}
                    onClick={() => selectPaymentMethod("cod")}
                  />
                </div>

                {paymentMethod === "card" && (
                  <div style={{ marginTop: 20 }}>
                    <Field label="Card Number" value={card.number} onChange={(v) => setCard((p) => ({ ...p, number: v }))} placeholder="0000 0000 0000 0000" />
                    <div style={s.row2}>
                      <Field label="Expiry Date" value={card.expiry} onChange={(v) => setCard((p) => ({ ...p, expiry: v }))} placeholder="MM/YY" />
                      <Field label="CVV" value={card.cvv} onChange={(v) => setCard((p) => ({ ...p, cvv: v }))} placeholder="•••" />
                    </div>
                    <button
                      style={{ ...s.placeOrderBtn, opacity: cardComplete ? 1 : 0.5, marginTop: 12 }}
                      onClick={goToReviewFromCard}
                      disabled={!cardComplete}
                    >
                      Continue to Review
                    </button>
                  </div>
                )}
              </section>
            )}

            {step === 3 && (
              <section style={s.card}>
                <h2 style={s.sectionTitle}>Review Your Order</h2>

                <div style={s.reviewBlock}>
                  <p style={s.reviewLabel}>Shipping to</p>
                  <p style={s.reviewText}>
                    {shipping.firstName} {shipping.lastName}<br />
                    {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}
                  </p>
                </div>

                <div style={s.reviewBlock}>
                  <p style={s.reviewLabel}>Payment Method</p>
                  <p style={s.reviewText}>
                    {paymentMethod === "card" ? "Card ending in " + card.number.slice(-4) : "Cash on Delivery"}
                  </p>
                </div>

                {paymentMethod === "cod" && (
                  <div style={s.codNotice}>
                    ⓘ Please have the exact amount of ${total.toFixed(2)} ready for our delivery
                    partner. A ${FEE.toFixed(2)} delivery fee applies.
                  </div>
                )}

                <button style={{ ...s.placeOrderBtn, marginTop: 20 }} onClick={placeOrder}>
                  Place Order →
                </button>
              </section>
            )}
          </div>

          {/* Order summary sidebar */}
          <aside style={s.summaryCard}>
            <h2 style={s.sectionTitle}>Order Summary</h2>
            {items.map((item) => (
              <div key={`${item.id}-${item.color}-${item.size}`} style={s.summaryItem}>
                <img src={item.image} alt={item.name} style={s.summaryImg} />
                <div style={{ flex: 1 }}>
                  <p style={s.summaryItemName}>{item.name}</p>
                  <p style={s.summaryItemMeta}>{item.color} / {item.size} × {item.quantity}</p>
                </div>
                <p style={s.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}

            <div style={{ borderTop: "1px solid #eee", margin: "14px 0", paddingTop: "14px" }}>
              <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <SummaryRow
                label={paymentMethod === "cod" ? "COD Service Charge" : "Shipping"}
                value={`$${FEE.toFixed(2)}`}
              />
              <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} />
            </div>

            <div style={s.totalRow}>
              <span>Total</span>
              <span style={{ color: "#c6558a" }}>${total.toFixed(2)}</span>
            </div>

            <p style={s.secureNote}>🔒 Secure checkout powered by Lavender Payments</p>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function StepDot({ number, label, active, current }: { number: number; label: string; active: boolean; current: boolean }) {
  return (
    <div style={s.stepDotWrap}>
      <div
        style={{
          ...s.stepCircle,
          background: active ? "#c0395a" : "#f0e8f0",
          color: active ? "#fff" : "#a89ab0",
          border: current ? "2px solid #7b2d55" : "none",
        }}
      >
        {number}
      </div>
      <span style={{ ...s.stepLabel, color: active ? "#3d2e4a" : "#a89ab0" }}>{label}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 14, flex: 1 }}>
      <label style={s.fieldLabel}>{label}</label>
      <input
        style={s.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PaymentOption({ label, icon, selected, onClick }: { label: string; icon: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "18px 0",
        borderRadius: 10,
        border: selected ? "2px solid #c0395a" : "1.5px solid #e8dce8",
        background: selected ? "#fdf0f4" : "#fff",
        cursor: "pointer",
        fontSize: 13,
        color: selected ? "#c0395a" : "#4a3a5a",
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      {label}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6a5a74", marginBottom: 8 }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: "#3d2e4a" }}>{value}</span>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { backgroundColor: "#fdf6f9", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "48px 24px" },
  title: { fontSize: 28, fontFamily: "Georgia, serif", color: "#4a3a5a", marginBottom: 24 },

  stepper: { display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", maxWidth: 400 },
  stepDotWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  stepCircle: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 },
  stepLabel: { fontSize: 11, fontWeight: 600 },
  stepLine: { flex: 1, height: 2, margin: "0 8px 20px" },

  grid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" },

  card: { background: "#fff", borderRadius: 14, padding: 28, boxShadow: "0 2px 10px rgba(150,100,150,0.06)" },
  sectionTitle: { fontSize: 17, fontFamily: "Georgia, serif", color: "#3d2e4a", marginBottom: 18 },

  row2: { display: "flex", gap: 16 },
  row3: { display: "flex", gap: 16 },

  fieldLabel: { display: "block", fontSize: 12, color: "#8a7a94", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e8dce8", fontSize: 14, color: "#3d2e4a", outline: "none", boxSizing: "border-box" },

  reviewBlock: { marginBottom: 16 },
  reviewLabel: { fontSize: 11, color: "#a89ab0", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  reviewText: { fontSize: 14, color: "#3d2e4a", lineHeight: 1.5 },
  codNotice: { fontSize: 12.5, color: "#8a6d3d", background: "#fdf6e3", border: "1px solid #f0e0b0", borderRadius: 8, padding: "10px 14px", marginTop: 8 },

  summaryCard: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(150,100,150,0.06)", position: "sticky", top: 24 },
  summaryItem: { display: "flex", gap: 10, alignItems: "center", marginBottom: 14 },
  summaryImg: { width: 44, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: "#f3e9ee" },
  summaryItemName: { fontSize: 13, color: "#3d2e4a", fontWeight: 600, margin: 0 },
  summaryItemMeta: { fontSize: 11, color: "#a89ab0", margin: "2px 0 0" },
  summaryItemPrice: { fontSize: 13, color: "#3d2e4a", fontWeight: 600, margin: 0 },

  totalRow: { display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17, color: "#3d2e4a", marginBottom: 16 },
  secureNote: { fontSize: 11.5, color: "#8a7a94", textAlign: "center", marginTop: 4 },

  placeOrderBtn: {
    width: "100%", background: "#c6558a", color: "#fff", border: "none", borderRadius: 24,
    padding: "13px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },

  confirmWrap: { maxWidth: 500, margin: "0 auto", textAlign: "center" },
  confirmIcon: {
    width: 90, height: 90, borderRadius: "50%", background: "#f3e5f1", margin: "0 auto 20px",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
  },
  confirmTitle: { fontSize: 26, fontFamily: "Georgia, serif", color: "#4a3a5a", marginBottom: 8 },
  confirmSubtitle: { fontSize: 13.5, color: "#8a7a94", marginBottom: 28, lineHeight: 1.5 },

  invoiceCard: { background: "#fff", borderRadius: 14, padding: 24, textAlign: "left", boxShadow: "0 2px 10px rgba(150,100,150,0.06)" },
  invoiceHeaderRow: { display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 16 },
  invoiceLabel: { fontSize: 11, color: "#a89ab0", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  invoiceValueAccent: { fontSize: 14, fontWeight: 700, color: "#c0395a", margin: 0 },
  invoiceText: { fontSize: 13, color: "#3d2e4a", lineHeight: 1.5, margin: 0 },
  invoiceItemRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f5eef2" },
  invoiceItemName: { fontSize: 13.5, fontWeight: 600, color: "#3d2e4a", margin: 0 },
  invoiceItemMeta: { fontSize: 11.5, color: "#a89ab0", margin: "2px 0 0" },
  invoiceItemPrice: { fontSize: 13.5, fontWeight: 600, color: "#3d2e4a", margin: 0 },
  invoiceTotals: { background: "#fdf6f9", borderRadius: 10, padding: "14px 16px", marginTop: 16 },
};