# Navigation specification

This document fixes the current indoor-navigation model. It must be checked before changing navigation UI, route graph, maps, points, or building/floor behavior.

## Primary goal

Navigation must feel like an indoor map application:

- search destination first;
- map is always the main surface;
- route is clear and segmented when it crosses floors or buildings;
- transition points are visible and explained;
- the user should not have to guess which building, floor, or entrance is involved.

## Data model

The current navigation data lives in `src/pages/user/NavigatePage.vue`.

Confirmed sources:

- `allPoints` is the single source for user-facing destinations, starts, doors, corridors, stairs, and temporary points.
- User-facing destinations are points with a label and a category other than `corridor` and `start`.
- Start picker can include labeled start points.
- Route graph is defined by `edges`.
- Route search uses graph traversal between start and destination.

Rules:

- Do not create a second destination list outside `allPoints`.
- Do not add visible destinations without adding them to the graph when a route is expected.
- Do not expose unlabeled corridor/service nodes as destinations.
- Do not rename confirmed room IDs without user approval.

## Current confirmed route facts

Technical building IDs in the current code are stable implementation IDs, not user-facing names:

- `b1` is the administrative two-floor building, user-facing name `АБК`, site-plan object `009`.
- `b2` is the temporary placeholder for `Производственный корпус 1`, site-plan object `008`.
- Do not rename technical IDs such as `b1`, `b2`, `B2-E01`, or `B2-P01` until a separate route-graph migration is explicitly requested.

АБК, floor 1:

- `F1-S01` maps to `F2-S01`.
- `F1-S02` maps to `F2-S02`.
- `F1-B01` is the confirmed first-floor transition from АБК to Производственный корпус 1.
- Male/female changing rooms, toilets, and showers on АБК floor 1 are accessed through the Производственный корпус 1 side and must show the access note `Вход через производственный корпус 1`.

АБК, floor 2:

- Second-floor room IDs `F2-R01` through `F2-R11` are confirmed by the user.
- `F2-D01A` is used; the unused `F2-D01B` opening is excluded.
- Corridor and door nodes must keep all confirmed second-floor destinations reachable.

Производственный корпус 1:

- Current Производственный корпус 1 geometry is temporary and explicitly authorized as a placeholder.
- `B2-E01` links to `F1-B01`.
- `B2-P01` is a temporary test destination.
- Replace only the placeholder map, coordinates, nodes, and edges after the real Производственный корпус 1 plan is supplied.
- Do not treat the placeholder geometry as fact.

Future production objects:

- Production corpus objects `Корпус 2`, `Корпус 3`, `Корпус 4`, `Корпус 5`, `Корпус 7`, `Корпус 8`, and `Спортзал` are expected future objects.
- Keep object/building switching capable of showing them.
- Do not invent plans, rooms, or transitions for them before the user provides data.

General site plan:

- The user supplied `Общий план.svg` as the production site plan.
- The confirmed object index is documented in `docs/navigation/site-plan-object-index.md`.
- The marked reference SVG is `docs/navigation/site-plan-ids.svg`.
- The working navigation overview map is `public/maps/site_plan.svg`.
- User-facing overview labels must show object names only, without technical site-plan IDs or label frames.
- Confirmed site-plan object mapping:
  - `001` — 4 корпус
  - `002` — Спортзал
  - `003` — 3 корпус
  - `004` — 8 корпус
  - `005` — 2 корпус
  - `006` — 5 корпус
  - `007` — 7 корпус
  - `008` — 1 корпус
  - `009` — АБК
- These site-plan IDs are for production objects, not rooms inside buildings.
- Current code mapping:
  - `b1` corresponds to `009` АБК.
  - `b2` corresponds to `008` Производственный корпус 1.
  - `b_site_2` corresponds to `005` Корпус 2.
  - `b3` corresponds to `003` Корпус 3.
  - `b4` corresponds to `001` Корпус 4.
  - `b5` corresponds to `006` Корпус 5.
  - `b7` corresponds to `007` Корпус 7.
- `b8` corresponds to `004` Корпус 8.
- `gym` corresponds to `002` Спортзал.

## Smart zoom

The general production overview supports smart zoom into detailed object maps.

Rules:

- Smart zoom uses the actual zoom focus point, not only the screen center.
- On the general production overview, when the user zooms into a mapped object, show a soft prompt before switching maps.
- A second zoom action or tapping the prompt opens the selected object.
- If the selected object has a confirmed detailed map, open that map.
- If the selected object has no confirmed detailed map yet, open the object state with the standard “map not loaded yet” message.
- On a detailed object map, zooming out to the base scale shows a soft prompt to return to the general production overview.
- A second zoom-out action or tapping the prompt returns to the general production overview.
- Confirmed detailed smart-zoom map targets at the moment are АБК and Производственный корпус 1.
- Do not invent detailed maps, rooms, route nodes, or transitions for future objects before their real plans are confirmed.

## Inter-building transitions and notes

Every inter-building transition must be explicit.

Rules:

- Any edge whose endpoints belong to different buildings is an inter-building transition.
- The map must show a transition marker at the local endpoint of that edge.
- Route instructions must mention moving to the next building.
- If a destination or start requires access through a neighboring building, the list and route card must show an access note.
- Do not remove the Производственный корпус 1 access note for the changing-room/toilet/shower block unless the user explicitly changes that route fact.

Current required note:

- `Вход через производственный корпус 1` for:
  - `locker_m`
  - `locker_f`
  - `wc_m`
  - `wc_f`
  - `wc_f_bottom`
  - `shower_m`
  - `shower_f`

## Inter-floor routing

Rules:

- Use only confirmed stairs/transition nodes.
- Segment the route by building and floor.
- The route card must allow switching to the needed segment.
- Do not silently jump floors without showing the user which floor segment they are on.

## UI contract

Approved navigation layout:

- Top overlay: destination search and object/building switch only.
- Left overlay: floor numbers only.
- Right overlay: zoom in, zoom out, reset view.
- Bottom overlay: route card, start/destination summary, segmented route steps.

Do not:

- Duplicate route summary in the top overlay.
- Show room-number labels directly on the map.
- Add POI dots inside rooms without explicit user approval.
- Move the map below controls; the map must remain the primary element.

## Map labels

Allowed on map:

- room/function names;
- transition markers;
- start and destination markers;
- route path;
- temporary placeholder labels when a map is not final.

Not allowed on map unless the user asks:

- room-number subtitles such as `Каб. 101`;
- additional POI dots inside already-clickable rooms.

Room numbers may remain in:

- point metadata;
- search results;
- route cards;
- admin/reference documentation.

## Validation checklist

After changing navigation:

1. `npm run build`.
2. Verify every user-facing destination is reachable from a valid start.
3. Verify cross-floor route segmentation still works.
4. Verify cross-building route uses confirmed transition nodes.
5. Verify inter-building transitions have a visible marker or access note.
6. Verify no service corridor nodes appear in destination search.
7. Verify no unrelated page behavior changed.
