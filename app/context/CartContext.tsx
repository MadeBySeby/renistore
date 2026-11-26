"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { productSizes, type Product } from "@/lib/products";

export interface CartItem {
  /** Catalog product id, or a local id for AI-estimate custom orders. */
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  size?: string;
  /** Lowest of MAX_QUANTITY and the stock shown for the chosen size. */
  maxQuantity?: number;
  quantity: number;
  /** When set, this line is an AI price estimate, not a catalog product. */
  estimate?: {
    productPriceGEL: number;
    shippingGEL: number;
    estimatedWeightKg: number;
  };
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  addItem: (product: Product, size?: string, quantity?: number) => void;
  addEstimate: (item: {
    name: string;
    price: number;
    imageUrl?: string;
    estimate: NonNullable<CartItem["estimate"]>;
  }) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

export const MAX_QUANTITY = 20;
const CART_STORAGE_KEY = "renistore.cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Same product in different sizes is a separate cart line. Estimate lines use their own id. */
export function cartLineKey(item: Pick<CartItem, "productId" | "size">): string {
  return `${item.productId}:${item.size ?? ""}`;
}

function clampQuantity(quantity: number, max = MAX_QUANTITY) {
  return Math.min(max, MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Loaded after mount so server and client render the same (empty) cart first.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable: the cart still works for this visit.
    }
  }, [items, ready]);

  const addItem = useCallback((product: Product, size?: string, quantity = 1) => {
    const stock = productSizes(product).find((entry) => entry.size === size)?.stock;
    const maxQuantity = stock === undefined ? MAX_QUANTITY : Math.min(stock, MAX_QUANTITY);
    if (maxQuantity < 1) return;
    const key = cartLineKey({ productId: product.id, size });
    setItems((current) => {
      const existing = current.find((item) => cartLineKey(item) === key);
      if (existing) {
        return current.map((item) =>
          cartLineKey(item) === key
            ? { ...item, maxQuantity, quantity: clampQuantity(item.quantity + quantity, maxQuantity) }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: String(product.id),
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          imageUrl: product.image_url,
          size,
          maxQuantity,
          quantity: clampQuantity(quantity, maxQuantity),
        },
      ];
    });
  }, []);

  const addEstimate = useCallback(
    (item: {
      name: string;
      price: number;
      imageUrl?: string;
      estimate: NonNullable<CartItem["estimate"]>;
    }) => {
      const productId = `estimate-${Date.now()}`;
      setItems((current) => [
        ...current,
        {
          productId,
          name: item.name,
          slug: "custom-estimate",
          price: Number(item.price),
          imageUrl: item.imageUrl,
          maxQuantity: MAX_QUANTITY,
          quantity: 1,
          estimate: item.estimate,
        },
      ]);
    },
    [],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        cartLineKey(item) === key ? { ...item, quantity: clampQuantity(quantity, item.maxQuantity) } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => cartLineKey(item) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, count, total, ready, addItem, addEstimate, setQuantity, removeItem, clear };
  }, [items, ready, addItem, addEstimate, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
