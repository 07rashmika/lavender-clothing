"use client";

import React from "react";
import { colors } from "./theme";

interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
}

/**
 * A single "Label ......... Value" row.
 * Used in Bag and Checkout order summaries (Subtotal, Shipping, Tax, Total).
 */
export default function SummaryRow({ label, value, bold = false }: SummaryRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: bold ? 17 : 13,
        fontWeight: bold ? 700 : 400,
        color: bold ? colors.textBody : colors.textMuted,
        marginBottom: bold ? 0 : 8,
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: bold ? colors.primarySoft : colors.textBody }}>{value}</span>
    </div>
  );
}