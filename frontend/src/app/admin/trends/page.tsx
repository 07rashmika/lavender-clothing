"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface TopProduct {
  productId: string;
  name: string;
  image: string | null;
  unitsSold: number;
}

interface TopColor {
  color: string;
  unitsSold: number;
}

interface TopCustomizationColor {
  color: string;
  requestCount: number;
}

interface SalesDay {
  date: string;
  orders: number;
  revenueCents: number;
}

interface TrendsData {
  topProducts: TopProduct[];
  topColors: TopColor[];
  topCustomizationColors: TopCustomizationColor[];
  salesByDay: SalesDay[];
}

export default function TrendsDashboard() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/trends")
      .then(setData)
      .catch((err) => {
        console.error("[admin/trends] fetch failed:", err);
        setError("Couldn't load trend data.");
      });
  }, []);

  const maxColorUnits = Math.max(1, ...(data?.topColors.map((c) => c.unitsSold) ?? [1]));
  const maxProductUnits = Math.max(1, ...(data?.topProducts.map((p) => p.unitsSold) ?? [1]));
  const maxCustomCount = Math.max(1, ...(data?.topCustomizationColors.map((c) => c.requestCount) ?? [1]));
  const maxDayRevenue = Math.max(1, ...(data?.salesByDay.map((d) => d.revenueCents) ?? [1]));

  return (
    <div>
      <h1 style={s.title}>Trends</h1>
      <p style={s.subtitle}>Popular products, colors, and sales patterns across the store.</p>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.grid2}>
        {/* Top-selling products */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Best-Selling Products</h2>
          <div style={s.barList}>
            {(data?.topProducts ?? []).map((p) => (
              <div key={p.productId} style={s.barRow}>
                <span style={s.barLabel}>{p.name}</span>
                <div style={s.barTrack}>
                  <div style={{ ...s.barFill, width: `${(p.unitsSold / maxProductUnits) * 100}%` }} />
                </div>
                <span style={s.barValue}>{p.unitsSold}</span>
              </div>
            ))}
            {data && data.topProducts.length === 0 && <p style={s.emptyText}>No sales data yet.</p>}
          </div>
        </div>

        {/* Most-purchased colors */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Popular Colors (Purchases)</h2>
          <div style={s.barList}>
            {(data?.topColors ?? []).map((c) => (
              <div key={c.color} style={s.barRow}>
                <span style={s.barLabel}>{c.color}</span>
                <div style={s.barTrack}>
                  <div style={{ ...s.barFill, width: `${(c.unitsSold / maxColorUnits) * 100}%` }} />
                </div>
                <span style={s.barValue}>{c.unitsSold}</span>
              </div>
            ))}
            {data && data.topColors.length === 0 && <p style={s.emptyText}>No purchase data yet.</p>}
          </div>
        </div>
      </div>

      <div style={s.grid2}>
        {/* Custom design color trends */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Popular Colors (Custom Requests)</h2>
          <div style={s.barList}>
            {(data?.topCustomizationColors ?? []).map((c) => (
              <div key={c.color} style={s.barRow}>
                <span style={s.barLabel}>{c.color}</span>
                <div style={s.barTrack}>
                  <div style={{ ...s.barFill, width: `${(c.requestCount / maxCustomCount) * 100}%`, background: "#c9a8e0" }} />
                </div>
                <span style={s.barValue}>{c.requestCount}</span>
              </div>
            ))}
            {data && data.topCustomizationColors.length === 0 && <p style={s.emptyText}>No customization requests yet.</p>}
          </div>
        </div>

        {/* Sales trend, last 30 days */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Sales — Last 30 Days</h2>
          <div style={s.salesChart}>
            {(data?.salesByDay ?? []).map((d) => (
              <div key={d.date} style={s.salesBarWrap} title={`${d.date}: ${d.orders} orders, ${(d.revenueCents / 100).toFixed(2)}`}>
                <div style={{ ...s.salesBar, height: `${(d.revenueCents / maxDayRevenue) * 100}%` }} />
              </div>
            ))}
            {data && data.salesByDay.length === 0 && <p style={s.emptyText}>No orders in the last 30 days.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  title: { fontSize: 26, fontFamily: "Georgia, serif", color: "#3a2a5c", margin: "0 0 4px" },
  subtitle: { fontSize: 13.5, color: "#8a7a94", marginBottom: 24 },
  errorBox: {
    background: "#fdeeee", color: "#a3453f", padding: "12px 16px", borderRadius: 10,
    fontSize: 13, marginBottom: 16,
  },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(120,90,190,0.08)" },
  cardTitle: { fontSize: 16, fontFamily: "Georgia, serif", color: "#3d2e4a", margin: "0 0 16px" },

  barList: { display: "flex", flexDirection: "column", gap: 12 },
  barRow: { display: "grid", gridTemplateColumns: "110px 1fr 32px", alignItems: "center", gap: 10 },
  barLabel: { fontSize: 12.5, color: "#4a3a5a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  barTrack: { background: "#f4eefb", borderRadius: 8, height: 10, overflow: "hidden" },
  barFill: { background: "#7c5cbf", height: "100%", borderRadius: 8 },
  barValue: { fontSize: 12, fontWeight: 700, color: "#3a2a5c", textAlign: "right" },
  emptyText: { fontSize: 13, color: "#a89ab0", textAlign: "center", padding: "20px 0" },

  salesChart: { display: "flex", alignItems: "flex-end", gap: 4, height: 140 },
  salesBarWrap: { flex: 1, height: "100%", display: "flex", alignItems: "flex-end" },
  salesBar: { width: "100%", background: "#a389d4", borderRadius: "4px 4px 0 0", minHeight: 2 },
};