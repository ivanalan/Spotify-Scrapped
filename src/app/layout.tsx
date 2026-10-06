import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spotify Scrapped",
  description:
    "Anti-Wrapped for skips and songs that didn’t stick — export Scrapped plus an API-only metrics lab.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("dark h-full antialiased")}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Nav />
        <main
          id="main"
          className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 md:px-8 md:py-24"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
