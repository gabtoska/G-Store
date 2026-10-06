"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { requestJson } from "@/lib/client-api";
import { loginSchema, registerSchema } from "@/lib/validation";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "register";
  next: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = (
        mode === "register" ? registerSchema : loginSchema
      ).safeParse(data);
      if (!result.success) throw new Error(result.error.issues[0].message);
      if (mode === "register") await requestJson("/api/register", result.data);
      const signedIn = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signedIn?.error)
        throw new Error(
          mode === "register"
            ? "Account created. Please log in to continue."
            : "Unable to log in. Check your email and password, or try again later.",
        );
      window.location.assign(next);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to continue.");
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {mode === "register" && (
        <label className="field-label">
          Name
          <input
            name="name"
            required
            autoComplete="name"
            maxLength={80}
            className="field"
          />
        </label>
      )}
      <label className="field-label">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          className="field"
        />
      </label>
      <label className="field-label">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 12 : 1}
          maxLength={128}
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          className="field"
        />
        {mode === "register" && (
          <span className="text-xs text-ink/60">
            Use 12–128 characters. A long, unique passphrase works well.
          </span>
        )}
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="w-full">
        {busy
          ? "Please wait…"
          : mode === "register"
            ? "Create account"
            : "Log in"}
      </Button>
      <p className="text-sm text-ink/70">
        {mode === "login" ? "New to G Store? " : "Already have an account? "}
        <Link
          className="font-semibold text-accent underline"
          href={`${mode === "login" ? "/register" : "/login"}?next=${encodeURIComponent(next)}`}
        >
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
