import type { Metadata } from "next";
import { ScrappedAboutPage } from "@/components/scrapped/ScrappedAboutPage";

export const metadata: Metadata = {
  title: "About — Scrapped",
  description:
    "What Scrapped is, why there is a waitlist, and that this independent fan project is not affiliated with Spotify.",
};

export default function AboutPage() {
  return <ScrappedAboutPage />;
}
