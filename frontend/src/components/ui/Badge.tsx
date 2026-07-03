"use client";

import React from "react";
import { colors } from "./theme";

type TagType = "New" | "Hot" | "Limited" | "Sale" | string;

const tagColor = (tag: TagType): string => {
  switch (tag) {
    case "Hot":
      return colors.tagHot;
    case "Limited":
      return colors.tagLimited;
    case "Sale":
      return colors.tagSale;
    case "New":
    default:
      return colors.tagNew;
  }
};

interface BadgeProps {
  label: TagType;
  style?: React.CSSProperties;
}

/**
 * Small colored pill used on product cards and wishlist items
 * (New / Hot / Limited / Sale). Used in Shop, Home, Wishlist, Bag.
 */
export default function Badge({ label, style }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        color: "#fff",
        background: tagColor(label),
        borderRadius: 20,
        padding: "3px 8px",
        ...style,
      }}
    >
      {label}
    </span>
  );
}