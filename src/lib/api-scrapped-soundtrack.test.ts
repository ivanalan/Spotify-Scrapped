import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScrappedApiReport } from "@/lib/scrapped-api";
import {
  ARTIST_ACT_SLIDES,
  getApiSlideSoundtrackUri,
  getApiSlideSoundtrackUris,
  needsArtistSoundtrackResolve,
  needsSecondArtistSoundtrackResolve,
} from "@/lib/api-scrapped-soundtrack";

function reportFixture(overrides?: {
  songTrackId?: string;
  songTrackId2?: string;
  songTrackId3?: string;
  songTrackId4?: string;
  artistId?: string;
  artistTrackId?: string | null;
  artist2Id?: string;
  artist2TrackId?: string | null;
  reunionTrackId?: string;
  oneSaveTrackId?: string;
  shortTopTrackId?: string;
  likedThisYearTrackId?: string;
}): ScrappedApiReport {
  const songTrackId = overrides?.songTrackId ?? "songLead111";
  const songTrackId2 = overrides?.songTrackId2 ?? "songLead222";
  const songTrackId3 = overrides?.songTrackId3 ?? "songLead333";
  const songTrackId4 = overrides?.songTrackId4 ?? "songLead444";
  const artistId = overrides?.artistId ?? "2YZyLoL8N0Wb9xBt1NhZWg"; // Kendrick
  const artistTrackId =
    overrides?.artistTrackId === undefined
      ? null
      : overrides.artistTrackId;
  const artist2Id = overrides?.artist2Id ?? "artistTwoId";
  const artist2TrackId =
    overrides?.artist2TrackId === undefined
      ? "artistTwoTrack"
      : overrides.artist2TrackId;
  const reunionTrackId = overrides?.reunionTrackId ?? "reunion999";
  const oneSaveTrackId = overrides?.oneSaveTrackId ?? "oneSaveTrack";
  const shortTopTrackId = overrides?.shortTopTrackId ?? "shortTopNow";
  const likedThisYearTrackId =
    overrides?.likedThisYearTrackId ?? "likedYearTrack";

  return {
    year: 2026,
    fetchedAt: new Date().toISOString(),
    profileName: "Test",
    headlines: [],
    summary: {
      likedCount: 0,
      likedThisYearCount: 1,
      likedNeverToppedCount: 0,
      shortLikedCount: 0,
      monthOnlyTrackCount: 0,
      monthOnlyArtistCount: 0,
      shortTrackCount: 1,
      mediumTrackCount: 0,
      longTrackCount: 50,
      shortArtistCount: 0,
      mediumArtistCount: 0,
      longArtistCount: 50,
      shortTopTrackId,
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
          {
            id: songTrackId2,
            trackId: songTrackId2,
            label: "Second Ghost",
            sublabel: "Someone",
            detail: "multi-year #2",
            value: 49,
          },
          {
            id: songTrackId3,
            trackId: songTrackId3,
            label: "Third Ghost",
            sublabel: "Someone",
            detail: "multi-year #3",
            value: 48,
          },
          {
            id: songTrackId4,
            trackId: songTrackId4,
            label: "Fourth Ghost",
            sublabel: "Someone",
            detail: "multi-year #4",
            value: 47,
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
          {
            id: artist2Id,
            trackId: artist2TrackId ?? undefined,
            label: "Second Artist",
            detail: "multi-year #2",
            value: 49,
          },
        ],
      },
      {
        id: "one-save-artists",
        title: "One-save shelf",
        calculated: "",
        means: "",
        bar: "",
        source: "",
        items: [
          {
            id: "oneSaveArtist",
            trackId: oneSaveTrackId,
            label: "One Save Act",
            detail: "Song Name · 100d on the shelf",
            value: 100,
          },
        ],
      },
      {
        id: "liked-this-year",
        title: "Liked this year",
        calculated: "",
        means: "",
        bar: "",
        source: "",
        items: [
          {
            id: likedThisYearTrackId,
            trackId: likedThisYearTrackId,
            label: "Year Like",
            sublabel: "Artist",
            detail: "liked 2026-01-01",
            value: 10,
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
  it("assigns a distinct track per slide when material allows", () => {
    const report = reportFixture({
      artistTrackId: "kendrickTrack",
      artist2TrackId: "artistTwoTrack",
    });
    const uris = getApiSlideSoundtrackUris(report);
    assert.equal(uris[0], "spotify:track:shortTopNow");
    assert.equal(uris[1], "spotify:track:likedYearTrack");
    assert.equal(uris[2], "spotify:track:songLead111");
    assert.equal(uris[3], "spotify:track:songLead222");
    assert.equal(uris[4], "spotify:track:oneSaveTrack");
    assert.equal(uris[5], "spotify:track:kendrickTrack");
    assert.equal(uris[6], "spotify:track:artistTwoTrack");
    assert.equal(uris[7], "spotify:track:reunion999");
    assert.equal(uris[8], "spotify:track:songLead333");
    assert.equal(uris[9], "spotify:track:songLead444");
    assert.equal(uris.length, 10);
    const unique = new Set(uris.filter(Boolean));
    assert.equal(unique.size, 10);
  });

  it("uses the #1 ghosted song on scene 2 and the second on scene 3", () => {
    const report = reportFixture({ artistTrackId: "kendrickTrack" });
    assert.equal(
      getApiSlideSoundtrackUri(report, 2),
      "spotify:track:songLead111",
    );
    assert.equal(
      getApiSlideSoundtrackUri(report, 3),
      "spotify:track:songLead222",
    );
  });

  it("never lets open/liked slides steal the top ghosted soundtrack", () => {
    // Reproduces: short-top missing + no liked-this-year → old logic claimed
    // ghosted[0] for scene 0, so scene 2 played ghosted[1] (Wallows) instead
    // of the on-screen #1 (Dapper).
    const report = reportFixture({
      songTrackId: "dapperAnderson",
      songTrackId2: "callingAfterMeWallows",
      artistTrackId: "kendrickTrack",
    });
    report.summary.shortTopTrackId = null;
    report.cards = report.cards.filter((c) => c.id !== "liked-this-year");

    const uris = getApiSlideSoundtrackUris(report);
    assert.equal(uris[2], "spotify:track:dapperAnderson");
    assert.equal(uris[3], "spotify:track:callingAfterMeWallows");
    // Open slide may fall back to leftover ghosted (#3), but must not claim #1
    // before the content pin — so #1 stays on scene 2.
    assert.notEqual(uris[0], "spotify:track:dapperAnderson");
  });

  it("uses a client-resolved artist URI override when the report has no sample", () => {
    const report = reportFixture({ artistTrackId: null });
    const resolved = "spotify:track:resolvedKendrick";
    // Without override, scene 5 still gets a distinct unused track from the pool.
    assert.ok(getApiSlideSoundtrackUri(report, 5));
    assert.notEqual(
      getApiSlideSoundtrackUri(report, 5),
      getApiSlideSoundtrackUri(report, 0),
    );
    assert.equal(
      getApiSlideSoundtrackUri(report, 5, {
        artistSoundtrackUri: resolved,
      }),
      resolved,
    );
  });

  it("switches at plot twist + reunion (scene 7) to the reunion track", () => {
    const report = reportFixture({
      artistTrackId: "kendrickTrack",
      reunionTrackId: "reunionSong",
    });
    assert.equal(
      getApiSlideSoundtrackUri(report, 7),
      "spotify:track:reunionSong",
    );
  });

  it("keeps ARTIST_ACT_SLIDES on scenes 5–6", () => {
    assert.deepEqual([...ARTIST_ACT_SLIDES], [5, 6]);
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

describe("needsSecondArtistSoundtrackResolve", () => {
  it("requests resolve when #2 artist lacks a distinct track", () => {
    const report = reportFixture({
      artistTrackId: "kendrickTrack",
      artist2TrackId: null,
    });
    const need = needsSecondArtistSoundtrackResolve(report);
    assert.ok(need);
    assert.equal(need.artistId, "artistTwoId");
  });

  it("skips when #2 already has a distinct track", () => {
    const report = reportFixture({
      artistTrackId: "kendrickTrack",
      artist2TrackId: "artistTwoTrack",
    });
    assert.equal(needsSecondArtistSoundtrackResolve(report), null);
  });
});
