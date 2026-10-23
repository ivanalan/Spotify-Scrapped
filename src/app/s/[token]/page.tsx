import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScrappedExperience } from "@/components/scrapped/ScrappedExperience";
import { getStoryReportByToken } from "@/lib/story-snapshot/db";

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Scrapped",
  description: "A private Scrapped story snapshot. No sign-in required.",
  robots: { index: false, follow: false },
};

/**
 * Frozen personal story replay after seat revoke (D-041).
 * Same walkthrough chrome as /example; data from Neon by unguessable token.
 */
export default async function StorySnapshotPage({ params }: Props) {
  const { token } = await params;
  const report = await getStoryReportByToken(token);
  if (!report) notFound();

  return (
    <ScrappedExperience report={report} chromeMode="walkthrough" />
  );
}
