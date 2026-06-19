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
5. Implemented locally, pending final verification: provide one searchable destination list derived from all user-facing `allPoints` entries across buildings and floors; service route nodes and start points remain excluded.
