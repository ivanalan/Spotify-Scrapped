import type { Metadata } from "next";
import { ScrappedExperience } from "@/components/scrapped/ScrappedExperience";
import walkthroughReport from "@/data/walkthrough-report.json";
import {
  ensureApiReportSummary,
  type ScrappedApiReport,
} from "@/lib/scrapped-api";

export const metadata: Metadata = {
  title: "Example: Scrapped",
  description:
    "A sample Scrapped story deck from a frozen affinity snapshot. No sign-in required.",
};

/**
 * Anonymous example walkthrough (D-024).
 * Serves a Guest-redacted ScrappedApiReport: no Spotify Web API per visitor.
 * `ensureApiReportSummary` migrates older one-save row shapes (label=artist).
 */
export default function ExampleWalkthroughPage() {
  const report = ensureApiReportSummary(
    structuredClone(walkthroughReport) as ScrappedApiReport,
  );

  return (
    <ScrappedExperience
      report={report}
      chromeMode="walkthrough"
      backHref="/about"
    />
  );
}
