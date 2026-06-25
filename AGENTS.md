# Project working agreements

## Documentation contract

- `AGENTS.md` is the top-level working agreement for Codex and other agents.
- `docs/UI_GUIDE.md` fixes shared UI/layout rules.
- `docs/PAGE_CONTRACTS.md` fixes the purpose, source of truth, and non-negotiable behavior of each major page.
- `docs/NAVIGATION_SPEC.md` fixes the indoor-navigation data model, route rules, transition rules, and approved navigation UI.
- Before changing a page, read the relevant contract document and keep the change inside that scope.
- If a user request conflicts with a documented rule, follow the user's explicit request and update the relevant document in the same change so the contract stays current.

## Scope and preservation

- Preserve all implemented product behavior, architecture, visual decisions, data flows, and integrations unless the user explicitly requests a change to them.
- Do not distort, replace, simplify, refactor, or "improve" existing solutions outside the requested scope.
- Do not invent requirements, labels, business rules, room names, routes, or missing product decisions. Ask the user when required information is absent or ambiguous.
- Make the smallest targeted change that completes the currently agreed roadmap step.
- Keep unrelated files and user changes untouched.
- Do not commit local scratch files such as `.agent.md` unless the user explicitly asks.

## Roadmap discipline

- Work strictly in the order agreed with the user.
- Do not start a later roadmap step until the current step is reviewed or the user explicitly asks to continue.
- Before implementation, separate confirmed facts from assumptions. Do not implement assumptions as facts.
- Verify the affected behavior and run the relevant existing checks without expanding the task into unrelated cleanup.
- For UI/layout changes, verify the affected page against `docs/UI_GUIDE.md` and `docs/PAGE_CONTRACTS.md`.
- For navigation changes, verify route behavior against `docs/NAVIGATION_SPEC.md`.

## Current navigation roadmap

1. Completed: prepare a separate numbered reference map for the second floor without changing the working navigation screen.
2. Completed: collect and confirm the user's mapping between assigned room IDs and real room names/types.
3. Completed and deployed: add room boundaries, labels, and clickable areas by analogy with the first floor.
4. Completed and deployed: confirmed doors and corridor nodes are connected to the second-floor route graph; all 11 destinations are reachable, and the unused F2-D01B opening is excluded.
5. Completed and deployed: provide one searchable destination list derived from all user-facing `allPoints` entries across buildings and floors; service route nodes and start points remain excluded.
6. Completed and confirmed: prepare a separate numbered reference map of first-floor transition nodes without changing the working navigation screen or route graph. F1-S01 maps to F2-S01, F1-S02 maps to F2-S02, and F1-B01 is the confirmed first-floor passage from Building 1 to Building 2.
7. Current temporary implementation, explicitly authorized by the user: use a clearly labelled first-floor Building 2 placeholder with B2-E01 linked to F1-B01 and one test destination B2-P01. Use it to validate segmented cross-floor/cross-building routing. Replace only the placeholder map, coordinates, nodes, and edges after the user supplies the real Building 2 plan; do not treat temporary geometry as fact.
8. Completed and deployed: navigation UI uses map-first indoor-navigation layout: search and object switch at the top, floor selector on the left, zoom on the right, and one bottom route card.
9. Completed and deployed: inter-building transitions must be explicitly marked; the confirmed F1-B01 to B2-E01 transition is marked, and the Building 1 floor 1 changing-room/toilet/shower block keeps the `Вход через Корпус 2` access note.
10. Completed and deployed: room numbers are not shown directly on the map; room numbers may remain in data, search metadata, and reference documents.

## Current authentication roadmap

1. Current implementation: replace the six-digit OTP-style model with a permanent phone-number login and password while preserving existing roles, access statuses, routing, profiles, and employee data. The login is always the employee phone number and keeps the `+7 (999) 999-99-99` input format.
2. Employee accounts must be created together with the employee card in the admin employee section. Only an administrator can generate the initial secure password or replace it during access recovery.
3. There is no employee self-service password reset. The login screen must direct employees to an administrator for recovery.
4. Existing mock accounts keep their numeric passwords for backward-compatible local testing; newly created and recovered accounts receive generated strong passwords. Production credentials must ultimately be stored and verified by a backend, not in the client mock dataset.

## Current profile roadmap

1. The profile is a compact overview of employee data and current module progress; adaptation tasks are not managed from the profile.
2. The employee marks their own adaptation tasks only in the dedicated "Моя адаптация" section. Profile and admin adaptation progress must use the same plan data when a plan exists.
3. The direct manager is assigned by an administrator while creating or updating the employee card. The profile uses that assignment for the manager quick contact when it is available.
4. Keep the current quick-contact composition and presentation unchanged until the user defines the production contact list.

## Current admin panel roadmap

1. The employee card is the single source of truth for employee profile data, login phone number, role, manager assignment, access blocking, password recovery, and archive status.
2. Do not duplicate employee access management inside system settings. Settings may describe policies and link to the employee card or roles section, but must not provide a parallel employee access list.
3. Admin dashboard, sidebar badges, and reports must use the same current employee, adaptation, document, and learning stores as the employee-facing interface where those stores already exist.
4. Admin UI controls must be readable and explicitly clickable. Buttons that look actionable must either perform the action or show a clear placeholder message when the production integration is intentionally not connected yet.
5. Keep the existing employee-facing flows unchanged unless the user explicitly asks to change them.
