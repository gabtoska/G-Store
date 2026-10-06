"use client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-20">
      <div className="panel text-center" role="alert">
        <h1 className="font-display text-4xl">We couldn’t load this page.</h1>
        <p className="my-5 text-ink/70">
          Please try again in a moment. Your saved cart is still on this device.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </Container>
  );
}
