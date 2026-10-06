"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { ORDER_TRANSITIONS } from "@/lib/order-rules";
import { requestJson } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
export function OrderStatusForm({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const next = new FormData(event.currentTarget).get("status");
    try {
      await requestJson(
        `/api/admin/orders/${id}`,
        { status: next, expectedStatus: status },
        "PATCH",
      );
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update status.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="panel space-y-4">
      <h2 className="font-display text-2xl">Update order status</h2>
      {ORDER_TRANSITIONS[status].length ? (
        <>
          <div className="flex flex-wrap gap-3">
            <select
              name="status"
              aria-label="New order status"
              className="field max-w-xs"
            >
              {ORDER_TRANSITIONS[status].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <Button type="submit" disabled={busy}>
              {busy ? "Updating…" : "Update status"}
            </Button>
          </div>
          <p className="text-sm text-ink/65">
            Cancelling a pending or processing order restores stock once.
            Shipped and delivered orders cannot be cancelled.
          </p>
        </>
      ) : (
        <p className="text-sm text-ink/65">
          This order has reached its final status.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
