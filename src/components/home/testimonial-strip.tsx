import { Container } from "@/components/ui/container";

const storeNotes = [
  {
    title: "Cart persists",
    detail: "Saved on this device",
  },
  {
    title: "Checkout rechecks",
    detail: "Price, options, and stock",
  },
  {
    title: "Orders stay available",
    detail: "Saved to your account",
  },
];

export function StoreNotes() {
  return (
    <section className="pb-6 sm:pb-10">
      <Container>
        <div className="grid border-y border-black/20 sm:grid-cols-3">
          {storeNotes.map((note, index) => (
            <article
              key={note.title}
              className="grid grid-cols-[2rem_1fr] gap-3 border-b border-black/15 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
            >
              <span className="pt-0.5 text-[10px] tabular-nums text-ink/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">{note.title}</h2>
                <p className="mt-1 text-xs text-ink/50">{note.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
