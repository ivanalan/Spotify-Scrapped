import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { ProductMain, ProductNavShell } from "@/components/ProductChrome";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scrapped",
  description:
    "Scrapped is your anti-wrapped. Songs you hated and artists you skipped.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("dark h-full antialiased")}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ProductNavShell>
          <Nav />
        </ProductNavShell>
        <ProductMain>{children}</ProductMain>
      </body>
    </html>
  );
}
