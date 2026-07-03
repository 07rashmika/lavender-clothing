"use client";

import React from "react";
import { colors, radius, fonts } from "./theme";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: colors.textFaint,
  marginBottom: 6,
};

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: radius.sm + 2,
  border: `1.5px solid ${colors.border}`,
  fontSize: 14,
  color: colors.textBody,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: fonts.body,
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  wrapperStyle?: React.CSSProperties;
}

/** Labeled text input. Used in Checkout (shipping/card) and Contact forms. */
export function Field({ label, value, onChange, placeholder, type = "text", wrapperStyle }: FieldProps) {
  return (
    <div style={{ marginBottom: 14, flex: 1, ...wrapperStyle }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        style={baseInputStyle}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  wrapperStyle?: React.CSSProperties;
}

/** Labeled dropdown. Used in Contact form (Topic). */
export function SelectField({ label, value, onChange, options, wrapperStyle }: SelectFieldProps) {
  return (
    <div style={{ marginBottom: 14, ...wrapperStyle }}>
      <label style={labelStyle}>{label}</label>
      <select
        style={{ ...baseInputStyle, background: "#fff", cursor: "pointer" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

/** Labeled textarea. Used in Contact form (Message). */
export function TextareaField({ label, value, onChange, placeholder, rows = 5 }: TextareaFieldProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        style={{ ...baseInputStyle, resize: "vertical", fontFamily: "inherit" }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}