"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { requestJson } from "@/lib/client-api";
import { formatMoney } from "@/lib/format";
import {
  addressSchema,
  type CheckoutInput,
  type ShippingAddress,
} from "@/lib/validation";
import type { OrderQuote } from "@/server/orders";

type SavedAddress = ShippingAddress & { id: string };
export function CheckoutForm({
  addresses,
  name,
}: {
  addresses: SavedAddress[];
  name: string;
}) {
  const { state, dispatch, isHydrated } = useCart();
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<{
    quote: OrderQuote;
    payload: CheckoutInput;
    address: ShippingAddress;
    cartKey: string;
  } | null>(null);
  const items = state.lines.map(({ productId, color, size, quantity }) => ({
    productId,
    color,
    size,
    quantity,
  }));
  const cartKey = JSON.stringify(items);
  const currentReview = review?.cartKey === cartKey ? review : null;

  async function reviewOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const saved = addresses.find((address) => address.id === addressId);
      const address =
        saved ??
        addressSchema.parse({
          fullName: data.fullName,
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          region: data.region,
          postalCode: data.postalCode,
          country: "US",
        });
      const quote = await requestJson<OrderQuote>("/api/checkout/quote", {
        items,
      });
      const payload: CheckoutInput = {
        items,
        ...(saved ? { addressId } : { address }),
        saveAddress: data.saveAddress === "on",
        requestKey: crypto.randomUUID(),
        quoteHash: quote.quoteHash,
      };
      setReview({ quote, payload, address, cartKey });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to review your order.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function placeOrder() {
    if (!currentReview || busy) return;
    setBusy(true);
    setError("");
    try {
      const order = await requestJson<{ id: string }>(
        "/api/orders",
        currentReview.payload,
      );
      dispatch({ type: "clear" });
      window.location.assign(`/account/orders/${order.id}?placed=1`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to place your order.",
      );
      setBusy(false);
    }
  }
  if (!isHydrated) return <p role="status">Loading your saved cart…</p>;
  if (!state.lines.length)
    return (
      <div className="panel text-center">
        <h2 className="font-display text-3xl">Your cart is empty.</h2>
        <Link href="/shop" className="action-link mt-5">
          Explore the shop
        </Link>
      </div>
    );

  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_370px] lg:items-start">
      <section className="panel space-y-6">
        <p className="rounded-2xl bg-accent/10 p-4 text-sm text-accent">
          Demo checkout · Pay on delivery simulation. No card details, charge,
          or physical shipment.
        </p>
        {currentReview ? (
          <div className="space-y-5">
            <h2 className="font-display text-3xl">Review your order</h2>
            <p className="text-sm text-ink/65">
              Prices and availability have been checked. Confirm the delivery
              details and total below.
            </p>
            <address className="rounded-2xl bg-cloud p-5 text-sm not-italic leading-relaxed">
              <strong>{currentReview.address.fullName}</strong>
              <p>{currentReview.address.line1}</p>
              <p>{currentReview.address.line2}</p>
              <p>
                {currentReview.address.city}, {currentReview.address.region}{" "}
                {currentReview.address.postalCode}
              </p>
              <p>United States</p>
            </address>
            <Button onClick={placeOrder} disabled={busy} className="w-full">
              {busy
                ? "Placing order…"
                : `Place demo order · ${formatMoney(currentReview.quote.totalCents)}`}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setReview(null);
                setError("");
              }}
              className="w-full"
            >
              Edit shipping / refresh review
            </Button>
          </div>
        ) : (
          <form onSubmit={reviewOrder} className="space-y-5">
            <h2 className="font-display text-3xl">Shipping details</h2>
            <p className="text-sm text-ink/65">
              This demo supports US addresses and USD pricing.
            </p>
            {addresses.length > 0 && (
              <label className="field-label">
                Saved address
                <select
                  className="field"
                  value={addressId}
                  onChange={(event) => setAddressId(event.target.value)}
                >
                  <option value="">Use a new address</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.fullName} — {address.line1}, {address.city}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {!addressId && (
              <>
                <label className="field-label">
                  Full name
                  <input
                    className="field"
                    name="fullName"
                    required
                    maxLength={100}
                    defaultValue={name}
                    autoComplete="shipping name"
                  />
                </label>
                <label className="field-label">
                  Street address
                  <input
                    className="field"
                    name="line1"
                    required
                    maxLength={150}
                    autoComplete="shipping address-line1"
                  />
                </label>
                <label className="field-label">
                  Apartment, suite (optional)
                  <input
                    className="field"
                    name="line2"
                    maxLength={150}
                    autoComplete="shipping address-line2"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="field-label">
                    City
                    <input
                      className="field"
                      name="city"
                      required
                      maxLength={80}
                      autoComplete="shipping address-level2"
                    />
                  </label>
                  <label className="field-label">
                    State
                    <input
                      className="field"
                      name="region"
                      required
                      maxLength={80}
                      autoComplete="shipping address-level1"
                    />
                  </label>
                  <label className="field-label">
                    ZIP code
                    <input
                      className="field"
                      name="postalCode"
                      required
                      pattern="[0-9]{5}(-[0-9]{4})?"
                      title="US ZIP code, for example 10001"
                      maxLength={10}
                      autoComplete="shipping postal-code"
                    />
                  </label>
                  <label className="field-label">
                    Country
                    <input className="field" value="United States" readOnly />
                  </label>
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="saveAddress" defaultChecked />
                  Save this address for next time
                </label>
              </>
            )}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Checking prices and stock…" : "Review order"}
            </Button>
          </form>
        )}
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <p className="mt-2">
              If your connection was interrupted, retry placing this order
              before starting a new review.
            </p>
          </div>
        )}
      </section>
      <aside className="panel space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl">Your order</h2>
          <Link href="/cart" className="text-sm underline">
            Edit cart
          </Link>
        </div>
        <ul className="divide-y divide-black/10">
          {(currentReview?.quote.items ?? state.lines).map((line) => (
            <li
              key={JSON.stringify([line.productId, line.color, line.size])}
              className="py-3 text-sm"
            >
              <div className="flex justify-between gap-4">
                <span>
                  {line.name} × {line.quantity}
                </span>
                <strong className="whitespace-nowrap">
                  {formatMoney(line.priceCents * line.quantity)}
                </strong>
              </div>
              <p className="mt-1 text-xs text-ink/60">
                {line.color} / {line.size}
              </p>
            </li>
          ))}
        </ul>
        {currentReview ? (
          <dl className="space-y-3 border-t border-black/10 pt-4 text-sm">
            {[
              ["Subtotal", currentReview.quote.subtotalCents],
              ["Shipping", currentReview.quote.shippingCents],
              ["Demo tax (8%)", currentReview.quote.taxCents],
              ["Total", currentReview.quote.totalCents],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt>{label}</dt>
                <dd className="font-semibold">{formatMoney(Number(value))}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-ink/60">
            Review your order to check current prices, shipping, and the final
            total.
          </p>
        )}
      </aside>
    </div>
  );
}
