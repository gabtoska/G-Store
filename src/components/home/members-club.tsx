import Link from "next/link";
import { Container } from "@/components/ui/container";
export function MembersClub() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-gradient-to-br from-accent via-[#206f58] to-[#134536] p-8 text-cloud shadow-float sm:p-10">
          <div className="relative space-y-5">
            <p className="text-xs uppercase tracking-widest text-cloud/70">
              Account features
            </p>
            <h2 className="max-w-2xl font-display text-4xl sm:text-5xl">
              Create an account to complete the checkout flow.
            </h2>
            <p className="max-w-xl text-sm text-cloud/85 sm:text-base">
              Registration enables saved addresses, server-validated demo
              orders, and an order history tied to your account.
            </p>
            <Link
              href="/register"
              className="inline-flex rounded-full bg-white px-7 py-3 text-sm font-semibold text-ink"
            >
              Create your account
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
