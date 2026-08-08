"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type LegalTab = "privacy" | "terms" | "shipping";

const legalContent: Record<LegalTab, { title: string; updated: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: May 24, 2024",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect information that you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, postal address, phone number, payment information, and any other information you choose to provide. We are committed to ensuring your personal style and data remain protected under our high security standards.",
      },
      {
        heading: "2. How We Use Your Information",
        body: "We use the information we collect to provide, maintain, and improve our services, such as to process your transactions and send you related information, including confirmations and invoices. We also use it to communicate with you about products, services, offers, and events at Lavender.",
      },
      {
        heading: "3. Cookies & Tracking",
        body: "Our boutique website uses cookies to enhance your shopping experience, remember your preferences, and analyze how you interact with our platform. You can manage your cookie preferences through your browser settings at any time.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "Last updated: May 24, 2024",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: "By accessing or using the Lavender website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our site or services.",
      },
      {
        heading: "2. Orders & Payment",
        body: "All orders are subject to availability and confirmation of the order price. Payment must be received in full before an order is processed and shipped, except where Cash on Delivery is selected and available in your area.",
      },
      {
        heading: "3. Intellectual Property",
        body: "All content on this site, including designs, logos, images, and text, is the property of Lavender Clothing and is protected by copyright and trademark laws. Reproduction without written consent is prohibited.",
      },
    ],
  },
  shipping: {
    title: "Shipping & Returns",
    updated: "Last updated: May 24, 2024",
    sections: [
      {
        heading: "1. Shipping Times",
        body: "Orders are typically processed within 1-2 business days. Standard delivery within Sri Lanka takes 3-5 business days depending on your location. Delivery times may vary during peak seasons or promotional periods.",
      },
      {
        heading: "2. Return Policy",
        body: "We accept returns within 30 days of delivery for items in original, unworn condition with tags attached. To initiate a return, please contact our support team with your order number and reason for return.",
      },
      {
        heading: "3. Refunds & Exchanges",
        body: "Once your return is received and inspected, we will notify you of the approval status. Approved refunds are processed to your original payment method within 5-7 business days. Exchanges are subject to stock availability.",
      },
    ],
  },
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "Order Inquiry", message: "" });
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState<LegalTab>("privacy");

  const handleField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const active = legalContent[activeTab];

  return (
    <div style={s.page}>
      <Navbar activePage="contact" />

      <div style={s.container}>
        <p style={s.eyebrow}>CUSTOMER CARE</p>
        <h1 style={s.heroTitle}>We&apos;re here to help you shine.</h1>
        <p style={s.heroSubtitle}>
          Whether you have a question about our collections, need help with sizing, or just want
          to say hello, we&apos;re always happy to hear from you.
        </p>

        <div style={s.contactGrid}>
          {/* Left: Get in Touch */}
          <div style={s.getInTouch}>
            <h2 style={s.sectionTitle}>Get in Touch</h2>

            <div style={s.contactRow}>
              <span style={s.contactIcon}>✉️</span>
              <div>
                <p style={s.contactLabel}>Email Us</p>
                <p style={s.contactValue}>lavenderclothing.contact@gmail.com</p>
              </div>
            </div>

            <div style={s.contactRow}>
              <span style={s.contactIcon}>📞</span>
              <div>
                <p style={s.contactLabel}>Text or Call</p>
                <p style={s.contactValue}>+947 77 59 210</p>
              </div>
            </div>

            <div style={s.contactRow}>
              <span style={s.contactIcon}>📍</span>
              <div>
                <p style={s.contactLabel}>Flagship Studio</p>
                <p style={s.contactValue}>728 Petal Lane, Fashion Dstr</p>
              </div>
            </div>

            <p style={s.followLabel}>Follow our journey</p>
            <div style={s.socialRow}>
              <span style={s.socialIcon}>📤</span>
              <span style={s.socialIcon}>♡</span>
              <span style={s.socialIcon}>🎵</span>
            </div>
          </div>

          {/* Right: Form */}
          <form style={s.formCard} onSubmit={handleSend}>
            <div style={s.row2}>
              <Field label="Your Name" value={form.name} onChange={(v) => handleField("name", v)} placeholder="Enter your name" />
              <Field label="Email Address" value={form.email} onChange={(v) => handleField("email", v)} placeholder="name@example.com" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={s.fieldLabel}>Topic</label>
              <select
                style={s.select}
                value={form.topic}
                onChange={(e) => handleField("topic", e.target.value)}
              >
                <option>Order Inquiry</option>
                <option>Sizing Help</option>
                <option>Returns & Exchanges</option>
                <option>Wholesale / Partnership</option>
                <option>General Question</option>
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={s.fieldLabel}>Message</label>
              <textarea
                style={s.textarea}
                value={form.message}
                onChange={(e) => handleField("message", e.target.value)}
                placeholder="Tell us how we can help..."
                rows={5}
              />
            </div>

            <button type="submit" style={s.sendBtn}>
              {sent ? "Message Sent ✓" : "Send Message ➤"}
            </button>
          </form>
        </div>

        {/* Map */}
        <div style={s.mapWrap}>
          <iframe
            title="Lavender Studio Location"
            src="https://maps.google.com/maps?q=Colombo,Sri+Lanka&z=14&output=embed"
            style={s.map}
            loading="lazy"
          />
        </div>

        {/* Legal Center */}
        <div style={s.legalSection}>
          <h2 style={{ ...s.sectionTitle, marginBottom: 20 }}>Legal Center</h2>
          <div style={s.legalGrid}>
            <div style={s.legalTabs}>
              <LegalTabBtn label="Privacy Policy" active={activeTab === "privacy"} onClick={() => setActiveTab("privacy")} />
              <LegalTabBtn label="Terms & Conditions" active={activeTab === "terms"} onClick={() => setActiveTab("terms")} />
              <LegalTabBtn label="Shipping & Returns" active={activeTab === "shipping"} onClick={() => setActiveTab("shipping")} />
            </div>

            <div style={s.legalContent}>
              <h3 style={s.legalTitle}>{active.title}</h3>
              <p style={s.legalUpdated}>{active.updated}</p>
              {active.sections.map((sec) => (
                <div key={sec.heading} style={{ marginBottom: 18 }}>
                  <p style={s.legalHeading}>{sec.heading}</p>
                  <p style={s.legalBody}>{sec.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
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

function LegalTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...s.legalTabBtn,
        color: active ? "#c0395a" : "#6a5a74",
        borderLeft: active ? "2.5px solid #c0395a" : "2.5px solid transparent",
        background: active ? "#fdf0f4" : "transparent",
        fontWeight: active ? 700 : 500,
      }}
    >
      {label}
    </button>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { backgroundColor: "#fdf6f9", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "48px 24px 0" },

  eyebrow: { textAlign: "center", fontSize: 11, letterSpacing: 2, color: "#c0395a", fontWeight: 700, marginBottom: 10 },
  heroTitle: { textAlign: "center", fontSize: 34, fontFamily: "Georgia, serif", color: "#2d1a3a", marginBottom: 12 },
  heroSubtitle: { textAlign: "center", fontSize: 14, color: "#8a7a94", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 },

  contactGrid: { display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginBottom: 40 },

  getInTouch: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(150,100,150,0.06)" },
  sectionTitle: { fontSize: 18, fontFamily: "Georgia, serif", color: "#3d2e4a", marginBottom: 18 },
  contactRow: { display: "flex", gap: 12, marginBottom: 18, alignItems: "flex-start" },
  contactIcon: { fontSize: 16, marginTop: 2 },
  contactLabel: { fontSize: 11, color: "#a89ab0", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  contactValue: { fontSize: 13, color: "#3d2e4a", fontWeight: 600 },
  followLabel: { fontSize: 11, color: "#a89ab0", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 20, marginBottom: 10 },
  socialRow: { display: "flex", gap: 12 },
  socialIcon: {
    width: 32, height: 32, borderRadius: "50%", background: "#f5eef2", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer",
  },

  formCard: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(150,100,150,0.06)" },
  row2: { display: "flex", gap: 16 },
  fieldLabel: { display: "block", fontSize: 12, color: "#8a7a94", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e8dce8", fontSize: 14, color: "#3d2e4a", outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e8dce8", fontSize: 14, color: "#3d2e4a", outline: "none", background: "#fff", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e8dce8", fontSize: 14, color: "#3d2e4a", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" },
  sendBtn: { width: "100%", background: "#c6558a", color: "#fff", border: "none", borderRadius: 24, padding: "13px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" },

  mapWrap: { borderRadius: 14, overflow: "hidden", marginBottom: 56, boxShadow: "0 2px 10px rgba(150,100,150,0.06)" },
  map: { width: "100%", height: 260, border: "none", display: "block" },

  legalSection: { paddingBottom: 60 },
  legalGrid: { display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 },
  legalTabs: { display: "flex", flexDirection: "column", gap: 4 },
  legalTabBtn: { textAlign: "left", padding: "10px 14px", borderRadius: 6, border: "none", fontSize: 13, cursor: "pointer" },

  legalContent: { background: "#fff", borderRadius: 14, padding: 28, boxShadow: "0 2px 10px rgba(150,100,150,0.06)" },
  legalTitle: { fontSize: 20, fontFamily: "Georgia, serif", color: "#c0395a", marginBottom: 4 },
  legalUpdated: { fontSize: 12, color: "#a89ab0", marginBottom: 20 },
  legalHeading: { fontSize: 14, fontWeight: 700, color: "#3d2e4a", marginBottom: 6 },
  legalBody: { fontSize: 13.5, color: "#6a5a74", lineHeight: 1.7 },
};