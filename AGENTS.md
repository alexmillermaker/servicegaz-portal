# Project working agreements

## Scope and preservation

- Preserve all implemented product behavior, architecture, visual decisions, data flows, and integrations unless the user explicitly requests a change to them.
- Do not distort, replace, simplify, refactor, or "improve" existing solutions outside the requested scope.
- Do not invent requirements, labels, business rules, room names, routes, or missing product decisions. Ask the user when required information is absent or ambiguous.
- Make the smallest targeted change that completes the currently agreed roadmap step.
- Keep unrelated files and user changes untouched.

## Roadmap discipline

- Work strictly in the order agreed with the user.
- Do not start a later roadmap step until the current step is reviewed or the user explicitly asks to continue.
- Before implementation, separate confirmed facts from assumptions. Do not implement assumptions as facts.
- Verify the affected behavior and run the relevant existing checks without expanding the task into unrelated cleanup.

## Current navigation roadmap

1. Completed: prepare a separate numbered reference map for the second floor without changing the working navigation screen.
2. Completed: collect and confirm the user's mapping between assigned room IDs and real room names/types.
3. Implemented locally, pending review: add room boundaries, labels, and clickable areas by analogy with the first floor.
4. Implemented locally and validated: confirmed doors and corridor nodes are connected to the second-floor route graph; all 11 destinations are reachable, and the unused F2-D01B opening is excluded.
5. Completed and deployed: provide one searchable destination list derived from all user-facing `allPoints` entries across buildings and floors; service route nodes and start points remain excluded.
6. Completed and confirmed: prepare a separate numbered reference map of first-floor transition nodes without changing the working navigation screen or route graph. F1-S01 maps to F2-S01, F1-S02 maps to F2-S02, and F1-B01 is the confirmed first-floor passage from Building 1 to Building 2.
7. Current temporary implementation, explicitly authorized by the user: use a clearly labelled first-floor Building 2 placeholder with B2-E01 linked to F1-B01 and one test destination B2-P01. Use it to validate segmented cross-floor/cross-building routing. Replace only the placeholder map, coordinates, nodes, and edges after the user supplies the real Building 2 plan; do not treat temporary geometry as fact.

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
