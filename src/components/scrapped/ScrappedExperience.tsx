"use client";

import { useState } from "react";
import { ApiScrappedDeck } from "@/components/scrapped/ApiScrappedDeck";
import { ScrappedGate } from "@/components/scrapped/ScrappedGate";
import type { ScrappedApiReport } from "@/lib/scrapped-api";

type Props = {
  report: ScrappedApiReport;
};

export function ScrappedExperience({ report }: Props) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <ScrappedGate
        mode="ready"
        displayName={report.profileName}
        onContinue={() => setStarted(true)}
      />
    );
  }

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <ApiScrappedDeck report={report} initialSoundOn />
    </div>
  );
}
