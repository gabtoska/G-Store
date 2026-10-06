import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AuthForm } from "@/components/auth/auth-form";
import { currentUser } from "@/server/authorization";
import { safeReturnPath } from "@/lib/navigation";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeReturnPath((await searchParams).next);
  if (await currentUser()) redirect(next);
  return (
    <Container className="py-16">
      <div className="panel mx-auto max-w-md">
        <p className="text-xs uppercase tracking-widest text-accent">
          Your G Store account
        </p>
        <h1 className="mb-7 mt-2 font-display text-4xl">Welcome back.</h1>
        <AuthForm mode="login" next={next} />
      </div>
    </Container>
  );
}
