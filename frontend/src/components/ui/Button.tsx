"use client";

import React from "react";
import { colors, radius, fonts } from "./theme";

type Variant = "primary" | "outline" | "white" | "text";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "8px 18px", fontSize: 12 },
  md: { padding: "12px 28px", fontSize: 14 },
  lg: { padding: "14px 32px", fontSize: 15 },
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    color: "#fff",
    border: "none",
  },
  outline: {
    background: "transparent",
    color: colors.primary,
    border: `1.5px solid ${colors.primary}`,
  },
  white: {
    background: "#fff",
    color: colors.primary,
    border: "none",
  },
  text: {
    background: "transparent",
    color: colors.primary,
    border: "none",
    textDecoration: "underline",
  },
};

/**
 * Reusable button used across Shop, Bag, Checkout, Wishlist, Contact, Home.
 * Usage: <Button variant="primary" onClick={...}>Add to Bag</Button>
 */
export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  style,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      style={{
        borderRadius: radius.pill,
        fontWeight: 600,
        fontFamily: fonts.body,
        cursor: rest.disabled ? "not-allowed" : "pointer",
        opacity: rest.disabled ? 0.5 : 1,
        width: fullWidth ? "100%" : undefined,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}