# Page contracts

This file describes the purpose and non-negotiable behavior of the main portal pages. Use it before changing page layout, data flow, or user scenarios.

## Global rules

- Preserve approved behavior and data flows unless the user explicitly asks to change them.
- Do not move functionality between pages without approval.
- Do not duplicate the same administrative or employee action in multiple places unless this is already an approved pattern.
- New pages should follow the shared mobile-first shell from `docs/UI_GUIDE.md`.

## Authentication

Purpose: employee login by phone number and permanent password.

Confirmed rules:

- Login is always the employee phone number in the `+7 (999) 999-99-99` format.
- There is no employee self-service password reset.
- Administrator creates employee accounts with the employee card.
- Administrator generates the initial secure password and can replace it for recovery.
- Existing mock accounts may keep numeric passwords for local testing.
- Production credentials must ultimately be handled by a backend, not client-only mock data.

Do not:

- Restore OTP-style login unless the user explicitly asks.
- Add employee-side password recovery unless the user explicitly asks.

## Profile

Purpose: compact employee overview and module progress.

Confirmed rules:

- The employee marks adaptation tasks only in the dedicated "Моя адаптация" section.
- The profile displays progress and employee data; it does not manage adaptation tasks.
- Direct manager is assigned by an administrator in the employee card.
- Quick contacts stay in the current composition until the production contact list is defined.
- The "active" badge was removed; verification is represented near the employee name after adaptation completion.

Do not:

- Turn profile into a task-management page.
- Change quick-contact composition without user approval.

## Navigation

Purpose: intuitive indoor navigation across offices, floors, buildings, and production objects.

Confirmed rules:

- The map is always the primary element.
- Top controls are limited to destination search and object/building switch.
- Bottom route card is the single route-summary area.
- All user-facing destinations come from `allPoints`.
- Service route nodes and start-only nodes are excluded from destination search.
- Rooms remain clickable through room boundaries.
- Room numbers are not shown directly on the map, but may remain in list/search metadata.
- Inter-floor routes must use confirmed stairs.
- Inter-building routes must use confirmed building transitions and show an explicit transition/access note.
- The general production overview uses the marked site plan from `public/maps/site_plan.svg`.
- The general production overview must show user-facing object names only; technical site-plan IDs stay out of the UI.
- General overview smart zoom may offer a soft prompt into any selected site object and a soft prompt back to the general overview on zoom-out.
- Objects without confirmed detailed maps must keep the standard “map not loaded yet” state.
- Производственный корпус 1 currently uses a clearly marked temporary placeholder until the real plan is supplied.

Do not:

- Invent new rooms, labels, or transitions.
- Replace the confirmed site plan with a temporary drawn overview.
- Invent detailed maps for future objects through smart zoom.
- Treat temporary Производственный корпус 1 geometry as factual.
- Remove transition notices for neighboring buildings.

Detailed navigation rules live in `docs/NAVIGATION_SPEC.md`.

## Admin panel

Purpose: administrator management for employees, content, roles, reports, and settings.

Confirmed rules:

- Employee card is the single source of truth for profile data, login phone number, role, manager assignment, access blocking, password recovery, and archive status.
- Do not duplicate employee access management in system settings.
- Settings can describe policies and link to the employee card or roles.
- Admin dashboard, badges, and reports must use the same stores as employee-facing flows where those stores exist.
- Controls must be readable and explicitly clickable.
- Placeholder actions must say clearly when production integration is not connected yet.

Do not:

- Add a parallel employee-access list outside the employee card.
- Change employee-facing flows while editing the admin panel unless explicitly requested.

## News

Purpose: employee news feed and article reading.

Rules:

- Preserve current news data flow and published-news behavior.
- Keep list cards readable with sufficient bottom padding.
- Admin news editing must remain connected to the same news source used by the employee feed where applicable.

## Documents

Purpose: employee document access and status overview.

Rules:

- Preserve current document statuses and employee-facing structure.
- Keep document rows readable and clickable.
- Do not invent production document integrations without explicit scope.

## Events

Purpose: employee event list and event details/registration states where implemented.

Rules:

- Preserve existing event data flow.
- Keep cards/list items readable and touch-friendly.
- Do not change event business rules without explicit user approval.

## Learning

Purpose: employee learning overview and progress.

Rules:

- Preserve current learning store and progress rules.
- Keep learning progress aligned with admin/dashboard reporting where applicable.

## My adaptation

Purpose: the only employee-facing place where the employee marks adaptation task completion.

Rules:

- Employee task marking stays here, not in profile.
- Profile and admin adaptation progress should use the same plan data when a plan exists.

## Adding a new page

Before adding a page:

1. Define purpose and primary user scenario.
2. Identify source of truth for data.
3. Use existing shell, cards, list, search, and bottom-navigation patterns.
4. Add a contract section here if the page becomes part of the roadmap.
