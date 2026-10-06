"use client";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { cartReducer, parseStoredCart, type CartAction } from "@/lib/cart";
import { calculateTotals } from "@/lib/pricing";
import type { CartState } from "@/lib/types";

const KEY = "g-store-cart-v2";
const CartContext = createContext<{
  state: CartState;
  dispatch: Dispatch<CartAction>;
  isHydrated: boolean;
} | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(KEY) ?? localStorage.getItem("g-store-cart-v1");
      if (stored)
        dispatch({
          type: "hydrate",
          payload: parseStoredCart(JSON.parse(stored)),
        });
    } catch {
      /* Storage may be unavailable or contain invalid JSON. */
    } finally {
      setIsHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Keep in-memory cart usable. */
    }
  }, [state, isHydrated]);
  const value = useMemo(
    () => ({ state, dispatch, isHydrated }),
    [state, isHydrated],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return {
    ...context,
    itemCount: context.state.lines.reduce(
      (total, line) => total + line.quantity,
      0,
    ),
    ...calculateTotals(context.state.lines),
  };
}
