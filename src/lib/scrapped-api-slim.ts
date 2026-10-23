/**
 * Slim ScrappedApiReport shapes for cookie seal and durable Neon snapshots.
 */

import type { ApiMetricCard, ScrappedApiReport } from "@/lib/scrapped-api";

/** Deck + share + soundtrack rows (Lab prose not required). */
export const DECK_PERSIST_CARD_IDS = [
  "liked-this-year",
  "left-long-run",
  "left-long-artists",
  "one-save-artists",
  "second-chance",
  "fallen-rotation",
] as const;

const DEFAULT_ITEM_CAP = 5;

function slimCard(
  card: ApiMetricCard,
  itemCap: number,
  stripLabProse: boolean,
): ApiMetricCard {
  return {
    id: card.id,
    title: card.title,
    calculated: stripLabProse ? "" : card.calculated,
    means: stripLabProse ? "" : card.means,
    bar: stripLabProse ? "" : card.bar,
    source: stripLabProse ? "" : card.source,
    headline: card.headline,
    items: card.items.slice(0, itemCap).map((item) => ({
      id: item.id,
      trackId: item.trackId,
      label: item.label,
      sublabel: item.sublabel,
      detail: item.detail,
      value: item.value,
      imageUrl: item.imageUrl,
    })),
  };
}

/**
 * Cookie / Lab cache: keep every card, drop Lab prose, cap rows, keep art +
 * headline `detail` (ghosted counts).
 */
export function slimReportForCookie(
  report: ScrappedApiReport,
  itemCap: number = DEFAULT_ITEM_CAP,
): ScrappedApiReport {
  return {
    year: report.year,
    fetchedAt: report.fetchedAt,
    profileName: report.profileName,
    headlines: report.headlines.map((h) => ({
      id: h.id,
      percent: h.percent,
      label: h.label,
      detail: h.detail,
    })),
    summary: report.summary,
    cards: report.cards.map((card) => slimCard(card, itemCap, true)),
  };
}

/**
 * Durable post-seat replay: deck cards only (no Lab lists / likedUris).
 */
export function slimReportForDeckPersist(
  report: ScrappedApiReport,
  itemCap: number = DEFAULT_ITEM_CAP,
): ScrappedApiReport {
  const want = new Set<string>(DECK_PERSIST_CARD_IDS);
  return {
    year: report.year,
    fetchedAt: report.fetchedAt,
    profileName: report.profileName,
    headlines: report.headlines.map((h) => ({
      id: h.id,
      percent: h.percent,
      label: h.label,
      detail: h.detail,
    })),
    summary: report.summary,
    cards: report.cards
      .filter((card) => want.has(card.id))
      .map((card) => slimCard(card, itemCap, true)),
  };
}
