"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState
} from "react";

import { Product, CartLine, CartState } from "@/lib/types";

const CART_STORAGE_KEY = "g-store-cart-v1";

type AddLinePayload = {
  product: Product;
  color: string;
  size: string;
  quantity?: number;
};

type CartAction =
  | { type: "hydrate"; payload: CartState }
  | { type: "add"; payload: AddLinePayload }
  | { type: "remove"; payload: { lineId: string } }
  | { type: "setQuantity"; payload: { lineId: string; quantity: number } }
  | { type: "clear" };

interface CartContextValue {
  state: CartState;
  dispatch: Dispatch<CartAction>;
}

const CartContext = createContext<CartContextValue | null>(null);

const initialState: CartState = {
  lines: []
};

function getLineId(slug: string, color: string, size: string): string {
  return `${slug}::${color}::${size}`.toLowerCase();
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "add": {
      const quantity = action.payload.quantity ?? 1;
      const lineId = getLineId(action.payload.product.slug, action.payload.color, action.payload.size);
      const existing = state.lines.find((line) => line.id === lineId);

      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.id === lineId
              ? {
                  ...line,
                  quantity: line.quantity + quantity
                }
              : line
          )
        };
      }

      const newLine: CartLine = {
        id: lineId,
        productId: action.payload.product.id,
        slug: action.payload.product.slug,
        name: action.payload.product.name,
        priceCents: action.payload.product.priceCents,
        image: action.payload.product.gallery[0],
        color: action.payload.color,
        size: action.payload.size,
        quantity
      };

      return {
        lines: [...state.lines, newLine]
      };
    }
    case "remove":
      return {
        lines: state.lines.filter((line) => line.id !== action.payload.lineId)
      };
    case "setQuantity":
      return {
        lines: state.lines
          .map((line) => (line.id === action.payload.lineId ? { ...line, quantity: action.payload.quantity } : line))
          .filter((line) => line.quantity > 0)
      };
    case "clear":
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsHydrated(true);
      return;
    }

    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as CartState;
      if (!parsed.lines) {
        return;
      }

      dispatch({
        type: "hydrate",
        payload: parsed
      });
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const value = useMemo(
    () => ({
      state,
      dispatch
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  const itemCount = context.state.lines.reduce((total, line) => total + line.quantity, 0);
  const subtotalCents = context.state.lines.reduce((total, line) => total + line.priceCents * line.quantity, 0);
  const shippingCents = subtotalCents === 0 ? 0 : subtotalCents > 25000 ? 0 : 1200;
  const taxCents = Math.round(subtotalCents * 0.08);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    ...context,
    itemCount,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents
  };
}
