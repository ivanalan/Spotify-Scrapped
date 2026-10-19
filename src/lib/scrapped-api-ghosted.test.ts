import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  leftLongGhostedCount,
  type ScrappedApiReport,
} from "@/lib/scrapped-api";

function baseReport(
  overrides: Partial<ScrappedApiReport> & {
    detail?: string;
    percent?: number | null;
    itemCount?: number;
    longTrackCount?: number;
  } = {},
): ScrappedApiReport {
  const {
    detail = "12 of 50",
    percent = 24,
    itemCount = 5,
    longTrackCount = 50,
    ...rest
  } = overrides;
  return {
    year: 2026,
    fetchedAt: "2026-01-01T00:00:00.000Z",
    profileName: "Test",
    headlines: [
      {
        id: "left-long",
        percent,
        label: "ghosted",
        detail,
      },
    ],
    summary: {
      likedCount: 0,
      likedThisYearCount: 0,
      likedNeverToppedCount: 0,
      shortLikedCount: 0,
      monthOnlyTrackCount: 0,
      monthOnlyArtistCount: 0,
      shortTrackCount: 0,
      mediumTrackCount: 0,
      longTrackCount,
      shortArtistCount: 0,
      mediumArtistCount: 0,
      longArtistCount: 0,
      shortTopTrackId: null,
    },
    cards: [
      {
        id: "left-long-run",
        title: "Left the long run",
        calculated: "",
        means: "",
        bar: "",
        source: "",
        items: Array.from({ length: itemCount }, (_, i) => ({
          id: `t${i}`,
          trackId: `t${i}`,
          label: `Song ${i}`,
          detail: `multi-year #${i + 1}`,
          value: 50 - i,
          imageUrl: null,
        })),
      },
    ],
    ...rest,
  };
}

describe("leftLongGhostedCount", () => {
  it("prefers exact detail when present", () => {
    assert.equal(leftLongGhostedCount(baseReport({ detail: "12 of 50" })), 12);
  });

  it("rebuilds from percent when cookie wiped detail", () => {
    assert.equal(
      leftLongGhostedCount(
        baseReport({ detail: "", percent: 24, longTrackCount: 50, itemCount: 5 }),
      ),
      12,
    );
  });

  it("never claims zero when left-long-run still has songs", () => {
    assert.equal(
      leftLongGhostedCount(
        baseReport({
          detail: "",
          percent: null,
          longTrackCount: 50,
          itemCount: 3,
        }),
      ),
      3,
    );
  });

  it("returns 0 when percent is 0 and there are no items", () => {
    assert.equal(
      leftLongGhostedCount(
        baseReport({
          detail: "",
          percent: 0,
          longTrackCount: 50,
          itemCount: 0,
        }),
      ),
      0,
    );
  });

  it("floors percent estimate at visible item count", () => {
    // Rounding can undershoot; visible rows win the max.
    assert.equal(
      leftLongGhostedCount(
        baseReport({
          detail: "",
          percent: 1,
          longTrackCount: 50,
          itemCount: 5,
        }),
      ),
      5,
    );
  });
});
