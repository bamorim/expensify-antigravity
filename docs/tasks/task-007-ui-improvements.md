# Task 007: UI Improvements

## Status
- [ ] Not Started

## Priority
P1

## Description
Improve the UI/UX of the application by introducing proper app shells and a landing page.

## Requirements
1. **Landing Page**: A clean, public-facing page at `/`.
2. **Org-specific App Shell**: For routes under `/orgs/[orgId]`. Should include navigation for Dashboard and Members.
3. **Non-org App Shell**: For routes like `/settings`, `/onboarding`, or when no org is selected.
4. **User Preferences**: A page to update user profile (name).

## Technical Notes
- Use Tailwind CSS for styling.
- Ensure responsive design.
- Re-use existing auth components.
