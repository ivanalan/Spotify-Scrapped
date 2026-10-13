import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";

/** Shown only on Plus/Lab (dev shell). Main Scrapped hides this via ProductNavShell. */
export async function Nav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-6 px-6 py-4 md:px-8">
        <Link
          href="/"
          className="font-heading text-lg tracking-[-0.02em] text-foreground"
        >
          Scrapped
        </Link>
        <AuthControls />
      </div>
    </header>
  );
}
