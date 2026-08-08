"use client";

import React from "react";
import Button from "./Button";
import { colors } from "./theme";

interface EmptyStateProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

/**
 * Centered "nothing here yet" block with a CTA button.
 * Used in Bag ("Your bag is empty") and Wishlist ("Your wishlist is empty").
 */
export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <p style={{ fontSize: 18, color: colors.textMuted, marginBottom: 16 }}>{message}</p>
      <Button variant="primary" size="md" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}