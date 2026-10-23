import assert from "node:assert/strict";
import { describe, it } from "node:test";
import walkthroughReport from "@/data/walkthrough-report.json";
import type { ScrappedApiReport } from "@/lib/scrapped-api";
import {
  DECK_PERSIST_CARD_IDS,
  slimReportForCookie,
  slimReportForDeckPersist,
} from "@/lib/scrapped-api-slim";

describe("slimReportForDeckPersist", () => {
  it("keeps deck cards + headlines + summary art rows", () => {
    const full = walkthroughReport as ScrappedApiReport;
    const slim = slimReportForDeckPersist(full);
    assert.equal(slim.year, full.year);
    assert.equal(slim.headlines.length, full.headlines.length);
    assert.ok(slim.headlines.every((h) => typeof h.detail === "string"));
    assert.deepEqual(
      slim.cards.map((c) => c.id).sort(),
      [...DECK_PERSIST_CARD_IDS]
        .filter((id) => full.cards.some((c) => c.id === id))
        .sort(),
    );
    for (const card of slim.cards) {
      assert.ok(card.items.length <= 5);
      assert.equal(card.calculated, "");
    }
    const json = JSON.stringify(slim);
    assert.ok(json.length < JSON.stringify(full).length);
    assert.ok(json.length < 20_000);
  });
});

describe("slimReportForCookie", () => {
  it("keeps all cards with empty Lab prose", () => {
    const full = walkthroughReport as ScrappedApiReport;
    const slim = slimReportForCookie(full);
    assert.equal(slim.cards.length, full.cards.length);
    assert.ok(slim.cards.every((c) => c.calculated === "" && c.means === ""));
  });
});
