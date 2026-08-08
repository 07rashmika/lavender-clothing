"use client";

import React from "react";
import { colors, radius, shadow } from "./theme";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: number | string;
  sticky?: boolean;
}

/**
 * White rounded card with soft shadow — used for form sections, order
 * summaries, product panels, etc. across Bag, Checkout, Contact, Wishlist.
 */
export default function Card({ padding = 24, sticky = false, style, children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      style={{
        background: colors.cardBg,
        borderRadius: radius.lg,
        padding,
        boxShadow: shadow.card,
        position: sticky ? "sticky" : undefined,
        top: sticky ? 24 : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}