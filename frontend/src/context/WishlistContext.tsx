"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  colorSwatch?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "lavender_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      api
        .get("/wishlist")
        .then((data) => setItems(data ?? []))
        .catch((err) => console.error("Failed to load wishlist", err))
        .finally(() => setLoaded(true));
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load wishlist", e);
    }
    setLoaded(true);
  }, [user, authLoading]);

  useEffect(() => {
    if (loaded && !user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded, user]);

  const addToWishlist = async (item: WishlistItem) => {
    if (user) {
      try {
        const updated = await api.post("/wishlist", { productId: item.id });
        setItems(updated);
      } catch (e) {
        console.error("Failed to add to wishlist", e);
      }
      return;
    }

    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
  };

  const removeFromWishlist = async (id: string) => {
    if (user) {
      try {
        const updated = await api.delete(`/wishlist/${id}`);
        setItems(updated);
      } catch (e) {
        console.error("Failed to remove from wishlist", e);
      }
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleWishlist = async (item: WishlistItem) => {
    const exists = items.some((i) => i.id === item.id);
    if (exists) {
      await removeFromWishlist(item.id);
    } else {
      await addToWishlist(item);
    }
  };

  const isInWishlist = (id: string) => items.some((i) => i.id === id);

  const wishlistCount = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, wishlistCount }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
