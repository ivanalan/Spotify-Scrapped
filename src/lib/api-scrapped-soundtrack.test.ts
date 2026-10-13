import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScrappedApiReport } from "@/lib/scrapped-api";
import {
  ARTIST_ACT_SLIDES,
  getApiSlideSoundtrackUri,
  needsArtistSoundtrackResolve,
  songActLeadUri,
} from "@/lib/api-scrapped-soundtrack";

function reportFixture(overrides?: {
  songTrackId?: string;
  artistId?: string;
  artistTrackId?: string | null;
  reunionTrackId?: string;
}): ScrappedApiReport {
  const songTrackId = overrides?.songTrackId ?? "songLead111";
  const artistId = overrides?.artistId ?? "2YZyLoL8N0Wb9xBt1NhZWg"; // Kendrick
  const artistTrackId =
    overrides?.artistTrackId === undefined
      ? null
      : overrides.artistTrackId;
  const reunionTrackId = overrides?.reunionTrackId ?? "reunion999";

  return {
    year: 2026,
    fetchedAt: new Date().toISOString(),
    profileName: "Test",
    headlines: [],
    summary: {
      likedCount: 0,
      shortTrackCount: 0,
      mediumTrackCount: 0,
      longTrackCount: 50,
      shortArtistCount: 0,
      mediumArtistCount: 0,
      longArtistCount: 50,
    },
    cards: [
      {
        id: "left-long-run",
        title: "Left the long run",
        calculated: "",
        means: "",
        bar: "",
        source: "",
        items: [
          {
            id: songTrackId,
            trackId: songTrackId,
            label: "Underworld",
            sublabel: "Alice Phoebe Lou",
            detail: "multi-year #1",
            value: 50,
          },
        ],
      },
      {
        id: "left-long-artists",
        title: "Artists who left the long run",
        calculated: "",
        means: "",
        bar: "",
        source: "",
        items: [
          {
            id: artistId,
            trackId: artistTrackId ?? undefined,
            label: "Kendrick Lamar",
            detail: "multi-year #1",
            value: 50,
          },
        ],
      },
      {
        id: "second-chance",
        title: "Second-chance returns",
        calculated: "",
        means: "",
        bar: "",
        source: "",
        items: [
          {
            id: reunionTrackId,
            trackId: reunionTrackId,
            label: "Comeback",
            sublabel: "Someone",
            detail: "4-week #1",
            value: 50,
          },
        ],
      },
      {
        id: "fallen-rotation",
        title: "Fallen",
        calculated: "",
        means: "",
        bar: "",
        source: "",
        items: [],
      },
    ],
  };
}

describe("getApiSlideSoundtrackUri", () => {
  it("keeps the song lead through open + library scenes (0–1)", () => {
    const report = reportFixture({ artistTrackId: "kendrickTrack" });
    const lead = songActLeadUri(report);
    for (let i = 0; i <= 1; i++) {
      assert.equal(getApiSlideSoundtrackUri(report, i), lead);
    }
  });

  it("uses the #1 ghosted song through the song act (scenes 2–4)", () => {
    const report = reportFixture({ artistTrackId: "kendrickTrack" });
    const lead = songActLeadUri(report);
    for (let i = 2; i <= 4; i++) {
      assert.equal(getApiSlideSoundtrackUri(report, i), lead);
    }
  });

  it("does not switch on artist scenes when Kendrick has no sample track (falls back to lead)", () => {
    const report = reportFixture({ artistTrackId: null });
    const lead = songActLeadUri(report);
    for (const i of ARTIST_ACT_SLIDES) {
      assert.equal(
        getApiSlideSoundtrackUri(report, i),
        lead,
        `scene ${i} should fall back to lead without artist track`,
      );
    }
  });

  it("switches to a Kendrick track on artist-act scenes when trackId is present", () => {
    const kendrickTrack = "kendrickHumbling";
    const report = reportFixture({ artistTrackId: kendrickTrack });
    const lead = songActLeadUri(report);
    const artistUri = `spotify:track:${kendrickTrack}`;
    assert.notEqual(artistUri, lead);
    for (const i of ARTIST_ACT_SLIDES) {
      assert.equal(
        getApiSlideSoundtrackUri(report, i),
        artistUri,
        `scene ${i} should play Kendrick`,
      );
    }
  });

  it("uses a client-resolved artist URI override when the report has no sample", () => {
    const report = reportFixture({ artistTrackId: null });
    const resolved = "spotify:track:resolvedKendrick";
    const lead = songActLeadUri(report);
    assert.equal(getApiSlideSoundtrackUri(report, 5), lead);
    for (const i of ARTIST_ACT_SLIDES) {
      assert.equal(
        getApiSlideSoundtrackUri(report, i, {
          artistSoundtrackUri: resolved,
        }),
        resolved,
      );
    }
  });

  it("switches again at plot twist (scene 8) to the reunion track", () => {
    const report = reportFixture({
      artistTrackId: "kendrickTrack",
      reunionTrackId: "reunionSong",
    });
    assert.equal(
      getApiSlideSoundtrackUri(report, 8),
      "spotify:track:reunionSong",
    );
  });
});

describe("needsArtistSoundtrackResolve", () => {
  it("requests resolve when Kendrick has no trackId (no tops/liked sample)", () => {
    const report = reportFixture({ artistTrackId: null });
    const need = needsArtistSoundtrackResolve(report);
    assert.ok(need);
    assert.equal(need.artistId, "2YZyLoL8N0Wb9xBt1NhZWg");
    assert.equal(need.artistName, "Kendrick Lamar");
    assert.equal(need.avoidTrackId, "songLead111");
  });

  it("requests resolve when artist sample is the same as the song lead", () => {
    const report = reportFixture({
      songTrackId: "sameTrack",
      artistTrackId: "sameTrack",
    });
    const need = needsArtistSoundtrackResolve(report);
    assert.ok(need);
    assert.equal(need.avoidTrackId, "sameTrack");
  });

  it("skips resolve when artist already has a distinct track", () => {
    const report = reportFixture({ artistTrackId: "otherTrack" });
    assert.equal(needsArtistSoundtrackResolve(report), null);
  });
});
