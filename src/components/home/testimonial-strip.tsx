import { Container } from "@/components/ui/container";

const storeNotes = [
  {
    quote: "Your next signature look starts with a thoughtful edit.",
    title: "Curated collections",
    detail: "Find your style",
  },
  {
    quote: "Save your pieces today. Pick up where you left off.",
    title: "Your personal edit",
    detail: "A cart that remembers",
  },
  {
    quote: "Explore the full checkout experience with no real payment.",
    title: "Portfolio demo",
    detail: "Try the experience",
  },
];

export function StoreNotes() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-4 lg:grid-cols-3">
          {storeNotes.map((note) => (
            <article
              key={note.title}
              className="rounded-[28px] border border-black/10 bg-white/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
            >
              <p className="font-display text-2xl leading-snug text-ink">
                {note.quote}
              </p>
              <p className="mt-6 text-xs uppercase tracking-[0.15em] text-ink/60">
                {note.title} / {note.detail}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
