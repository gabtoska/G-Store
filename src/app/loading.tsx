import { Container } from "@/components/ui/container";

export default function Loading() {
  return (
    <div className="py-16">
      <Container>
        <div className="space-y-4">
          <div className="h-8 w-56 animate-pulse rounded-full bg-black/10" />
          <div className="h-24 animate-pulse rounded-[28px] bg-black/10" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-80 animate-pulse rounded-[28px] bg-black/10" />
            <div className="h-80 animate-pulse rounded-[28px] bg-black/10" />
            <div className="h-80 animate-pulse rounded-[28px] bg-black/10" />
          </div>
        </div>
      </Container>
    </div>
  );
}
