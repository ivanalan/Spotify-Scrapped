# D-045: One-like ocean field + intro circle heart (combo A)

**Status:** Locked (production); share card 0 **field + moon** superseded by [D-051](D-051-share-card-0-rose.md) (rose · ocean moon; ghosts stay)  
**Date:** 2026-10-27  
**Surfaces:** `/scrapped` API deck scene 4 (field + 4A heart) · scene 8 soft close · scene 9 share card 0 ghosts · share card 2 floater colors.

## Decision

Promote heart-bloom explore **combo A** into production:

| Axis | Choice |
|------|--------|
| Scene 4 field | Volume ocean crest → deep: `#A5F3FC` → `#0284C7` → `#075985` (`ONE_LIKE_OCEAN_GRADIENT`; `data-scrapped-field="one-like-nest"`) |
| Stamp | Intro circle rose `#C9185B` |
| Blooms (solid, op 1) | Hot `#E070FF` · disk lilac `#C9A0F5` · disk orchid `#9B4DE8` (inner→outer; largest bloom bottom z) |
| List floaters | Same ladder + rose: hot · lilac · orchid · rose · hot |
| Share card 0 | ~~Plain ocean deep + circle moon~~ → rose · ocean moon in [D-051](D-051-share-card-0-rose.md); ghost fill `#FBEAFF` |
| Share card 2 floaters | Same floater ladder as scene 4 ([D-044](D-044-share-one-like-artists-b1.md) count/geometry unchanged) |
| Soft close | Flat ocean deep `#075985` field (`soft-close-ocean`); iris geometry promoted to hearts in [D-047](D-047-soft-close-heart-iris.md) (was circle rings hot → lilac → orchid → `#3B0764`) |

Explore lock: `docs/mocks/heart-bloom-solids.html` remix **A · rose stamp**. Stops pulled from volume ocean accents + intro `INTRO_SHARED_GRADIENT` / `INTRO_DISK_COLORS`.

## Why

Scene 4 and the share finale needed one cohesive system. Ocean blues rhyme the volume wave; circle pinks/purples rhyme the intro breathing disks. Solid blooms + matching floaters stop the list frame from reading as a second palette (old pink/gold).

## Displaced

- Scene 4 teal nest C0 (`#5EEAD4` → `#1A7A6E` → `#0F4C5C`)
- 4A pink → rose → gold cascade and pink/gold floaters
- Share card 0 plain teal `#1A7A6E` ([D-033](D-033-share-finale-b2-plain-teal.md) field only; density / IA stay)
- Share card 2 floater colors pink / gold / rose

## Cost

Soft close no longer matches soft-close flat teal from [D-016](D-016-middeck-metaphor-promote.md); it rhymes ocean deep + circle blooms instead. Storyboard / docs that still say “teal nest” for scene 4 should point here. Do not restore teal nest, mono teal iris, or gold blooms without a new decision.

## Source of truth

- Tokens: `ONE_LIKE_OCEAN_GRADIENT` · `ONE_LIKE_HEART` · `SHARE_FINALE_KIT` in `src/lib/scrapped-card-palette.ts`
- Field CSS: `globals.css` `[data-scrapped-field="one-like-nest"]`
- Chrome: `OneLikeHeartChrome.tsx` + `middeck-metaphors.css`
- Prior density / IA: [D-033](D-033-share-finale-b2-plain-teal.md) · [D-012](D-012-share-finale-inset.md)
