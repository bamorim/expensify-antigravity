# Task: Expense Submission

## Meta Information

- **Task ID**: `TASK-006`
- **Title**: Expense Submission
- **Status**: `Not Started`
- **Priority**: `P0`
- **Created**: 2025-11-20
- **Updated**: 2025-11-20
- **Estimated Effort**: 1 Day
- **Actual Effort**:

## Related Documents

- **PRD**: [docs/product/prd-main.md](../product/prd-main.md)
- **Dependencies**: `TASK-005`

## Description

Allow employees to submit expenses. The system should validate the expense against the active policies.

## Acceptance Criteria

- [ ] User can submit an expense with Amount, Date, Category, and Description
- [ ] System checks against policies
- [ ] If policy violated (e.g. over limit), warn user or reject (depending on rule)
- [ ] Expense is saved with status (Pending, Auto-Approved, etc.)

## TODOs

- [ ] Define `Expense` schema
- [ ] Create TRPC router for Expense submission
- [ ] Implement Policy Resolution Logic
- [ ] Create UI for Expense submission form

## Completion Checklist

- [ ] All acceptance criteria met
- [ ] Code follows project standards
- [ ] Tests written and passing
- [ ] Documentation updated (if needed)
- [ ] Code review completed
