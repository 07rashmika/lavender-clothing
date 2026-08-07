"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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
  material?: string;
  customizationId?: string;
  customizationConfig?: { panels?: Record<string, string>; layers?: unknown[] };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => Promise<void>;
  addCustomizationToCart: (design: Omit<CartItem, "quantity"> & { customizationId: string }, qty?: number) => Promise<boolean>;
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
  const requestQueues = useRef(new Map<string, Promise<unknown>>());
  const localCartRevision = useRef(0);

  // Cart buttons update the UI immediately. Requests for the same item are then
  // sent one-by-one, preventing a slow older quantity request from overwriting
  // a newer choice on the server.
  const queueCartRequest = (key: string, request: () => Promise<unknown>) => {
    const previous = requestQueues.current.get(key) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(request);
    requestQueues.current.set(key, next);
    void next.finally(() => {
      if (requestQueues.current.get(key) === next) requestQueues.current.delete(key);
    });
    return next;
  };

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      const requestRevision = localCartRevision.current;
      api
        .get("/cart")
        .then((data) => {
          // Do not let the initial, slower cart load erase an item the user
          // just added from My Designs or the shop.
          if (requestRevision === localCartRevision.current) setItems(data ?? []);
        })
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
      localCartRevision.current += 1;
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id && i.color === item.color && i.size === item.size);
        return existing ? prev.map(i => i === existing ? { ...i, quantity: i.quantity + qty } : i) : [...prev, { ...item, quantity: qty }];
      });
      try {
        await queueCartRequest(`product:${item.id}:${item.color}:${item.size}`, () => api.post("/cart", {
          productId: item.id,
          color: item.color,
          colorSwatch: item.colorSwatch,
          size: item.size,
          quantity: qty,
        }));
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

  const addCustomizationToCart = async (design: Omit<CartItem, "quantity"> & { customizationId: string }, qty = 1): Promise<boolean> => {
    if (user) {
      localCartRevision.current += 1;
      setItems(prev => [...prev.filter(item => item.id !== `customization:${design.customizationId}`), { ...design, id: `customization:${design.customizationId}`, quantity: qty }]);
      try { await queueCartRequest(`customization:${design.customizationId}`, () => api.post(`/cart/customizations/${design.customizationId}`, { quantity: qty })); return true; } catch (e) { console.error("Failed to add custom design", e); return false; }
    }
    setItems(prev => [...prev, { ...design, id: `customization:${design.customizationId}`, quantity: qty }]); return true;
  };

  const removeFromCart = async (id: string, color: string, size: string) => {
    if (id.startsWith("customization:")) {
      const customizationId = id.slice("customization:".length);
      if (user) localCartRevision.current += 1;
      setItems(current => current.filter(item => item.id !== id));
      if (user) { try { await queueCartRequest(`customization:${customizationId}`, () => api.delete(`/cart/customizations/${customizationId}`)); } catch (e) { console.error("Failed to remove custom design", e); } }
      else setItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    if (user) {
      localCartRevision.current += 1;
      setItems(current => current.filter(item => !(item.id === id && item.color === color && item.size === size)));
      try {
        await queueCartRequest(`product:${id}:${color}:${size}`, () => api.delete(
          `/cart/${id}?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}`
        ));
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

    if (id.startsWith("customization:")) {
      const customizationId = id.slice("customization:".length);
      if (user) localCartRevision.current += 1;
      setItems(current => current.map(item => item.id === id ? { ...item, quantity } : item));
      if (user) { try { await queueCartRequest(`customization:${customizationId}`, () => api.patch(`/cart/customizations/${customizationId}`, { quantity })); } catch (e) { console.error("Failed to update custom design", e); } }
      else setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
      return;
    }

    if (user) {
      localCartRevision.current += 1;
      setItems(current => current.map(item => item.id === id && item.color === color && item.size === size ? { ...item, quantity } : item));
      try {
        await queueCartRequest(`product:${id}:${color}:${size}`, () => api.patch(`/cart/${id}`, { color, size, quantity }));
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
      localCartRevision.current += 1;
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
      value={{ items, addToCart, addCustomizationToCart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount }}
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
