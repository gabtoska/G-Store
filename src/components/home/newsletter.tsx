"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-gradient-to-br from-accent via-[#206f58] to-[#134536] p-8 text-cloud shadow-float sm:p-10">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-brass/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-coral/35 blur-3xl" />
          <div className="relative space-y-5">
            <p className="text-xs uppercase tracking-[0.16em] text-cloud/70">Members Club</p>
            <h2 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              Unlock exclusive drops before they go live.
            </h2>
            <p className="max-w-xl text-sm text-cloud/85 sm:text-base">
              Get private lookbooks, early access links, and style notes from our creative team.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="h-12 flex-1 rounded-full border border-white/25 bg-white/10 px-5 text-sm text-cloud outline-none placeholder:text-cloud/65 focus:border-white/60"
              />
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="border-white/50 bg-white text-ink hover:border-white hover:bg-cloud"
              >
                Join Now
              </Button>
            </form>
            {submitted ? (
              <p className="text-xs uppercase tracking-[0.15em] text-brass">You are in. Welcome to G Store Members.</p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
