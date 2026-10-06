import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import { NavLinks } from "@/components/NavLinks";

export async function Nav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-6 px-6 py-4 md:px-8">
        <Link
          href="/"
          className="font-heading text-lg tracking-[-0.02em] text-foreground"
        >
          Spotify Scrapped
        </Link>
        <div className="flex flex-wrap items-baseline justify-end gap-x-5 gap-y-2">
          <NavLinks />
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
