"use client";

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.footerTop}>

        {/* Brand */}
        <div>
          <div style={s.footerLogo}>Lavender</div>
          <p style={s.footerTagline}>Fashion that blooms with you.</p>
          <div style={s.socials}>
            <span style={s.social}>f</span>
            <span style={s.social}>in</span>
            <span style={s.social}>ig</span>
          </div>
        </div>

        {/* Shopping */}
        <div>
          <p style={s.footerHeading}>Shopping</p>
          {["Collections", "New Arrivals", "Returns", "Shipping Policy"].map(l => (
            <p key={l} style={s.footerLink}>{l}</p>
          ))}
        </div>

        {/* Support */}
        <div>
          <p style={s.footerHeading}>Support</p>
          {["About Us", "Contact", "FAQ"].map(l => (
            <p key={l} style={s.footerLink}>{l}</p>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p style={s.footerHeading}>Contact Us</p>
          <p style={s.footerLink}>123 Bloom Street, Suite 4</p>
          <p style={s.footerLink}>Colombo, LK 00300</p>
          <p style={s.footerLink}>hello@lavender.com</p>
        </div>

      </div>

      <div style={s.footerBottom}>
        © 2025 Lavender Clothing. All rights reserved.
      </div>
    </footer>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  footer: {
    backgroundColor: "#1e0a35",
    padding: "48px 48px 24px",
  },
  footerTop: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
    gap: 40,
    marginBottom: 40,
  },
  footerLogo: {
    fontFamily: "'Georgia', serif",
    fontSize: 22,
    color: "#d4b8f0",
    fontWeight: 700,
    marginBottom: 8,
  },
  footerTagline: {
    fontSize: 13,
    color: "rgba(200,170,240,0.55)",
    marginBottom: 16,
  },
  socials: {
    display: "flex",
    gap: 10,
  },
  social: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid rgba(180,140,230,0.3)",
    color: "rgba(200,170,240,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    cursor: "pointer",
  },
  footerHeading: {
    fontSize: 12,
    fontWeight: 700,
    color: "#c8a8f0",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  footerLink: {
    fontSize: 12,
    color: "rgba(200,170,240,0.5)",
    marginBottom: 8,
    cursor: "pointer",
  },
  footerBottom: {
    borderTop: "1px solid rgba(180,140,230,0.15)",
    paddingTop: 20,
    fontSize: 11,
    color: "rgba(200,170,240,0.3)",
    textAlign: "center",
  },
};