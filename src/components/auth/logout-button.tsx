"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await signOut({ callbackUrl: "/" });
          } catch {
            setBusy(false);
            setError("Could not log out. Try again.");
          }
        }}
      >
        {busy ? "Logging out…" : "Log out"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
