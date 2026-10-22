import type { Metadata } from "next";
import { ScrappedGate } from "@/components/scrapped/ScrappedGate";

export const metadata: Metadata = {
  title: "Ready: Scrapped",
  description:
    "You’re off the Scrapped waitlist. Sign in with Spotify while a seat is open.",
  robots: { index: false, follow: false },
};

/**
 * Invite landing (D-032). Not linked from main UI; email CTA only.
 * Soft 24h window copy; Sign in → Spotify OAuth.
 */
export default function ReadyPage() {
  return <ScrappedGate mode="auth" offWaitlist />;
}
