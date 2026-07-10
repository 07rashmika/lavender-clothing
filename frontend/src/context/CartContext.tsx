"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

export interface CartItem {
  id: string;
  name: string;
  sku?: string;
  price: number;
  image: string;
  color: string;
  colorSwatch?: string; // hex code for color dot
  size: string;
  quantity: number;
  badge?: string; // e.g. "NEW", "LIMITED EDITION"
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => Promise<void>;
  removeFromCart: (id: string, color: string, size: string) => Promise<void>;
  updateQuantity: (id: string, color: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "lavender_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      api
        .get("/cart")
        .then((data) => setItems(data ?? []))
        .catch((err) => console.error("Failed to load cart", err))
        .finally(() => setLoaded(true));
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    setLoaded(true);
  }, [user, authLoading]);

  useEffect(() => {
    if (loaded && !user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded, user]);

  const addToCart = async (item: Omit<CartItem, "quantity">, qty = 1) => {
    if (user) {
      try {
        const updated = await api.post("/cart", {
          productId: item.id,
          color: item.color,
          colorSwatch: item.colorSwatch,
          size: item.size,
          quantity: qty,
        });
        setItems(updated);
      } catch (e) {
        console.error("Failed to add to cart", e);
      }
      return;
    }

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && i.color === item.color && i.size === item.size
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeFromCart = async (id: string, color: string, size: string) => {
    if (user) {
      try {
        const updated = await api.delete(
          `/cart/${id}?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}`
        );
        setItems(updated);
      } catch (e) {
        console.error("Failed to remove from cart", e);
      }
      return;
    }

    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.color === color && i.size === size))
    );
  };

  const updateQuantity = async (id: string, color: string, size: string, quantity: number) => {
    if (quantity < 1) return;

    if (user) {
      try {
        const updated = await api.patch(`/cart/${id}`, { color, size, quantity });
        setItems(updated);
      } catch (e) {
        console.error("Failed to update cart", e);
      }
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.color === color && i.size === size ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete("/cart");
      } catch (e) {
        console.error("Failed to clear cart", e);
      }
    }
    setItems([]);
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
