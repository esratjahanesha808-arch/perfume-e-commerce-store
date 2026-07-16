# LUXORA — Session Flow

Last Updated: 2026-07-16

This workflow defines the expected order of work inside a single chat session.

## 1) Read Current Context
- Read memory and handoff documents first.
- Confirm current phase, open issues, and priorities before making changes.

## 2) Review Implementation State
- Inspect relevant code paths for the current task.
- Validate what is already implemented versus documented expectations.

## 3) Plan Next Step
- Select a small, testable scope (usually one issue or one tightly related issue set).
- Define acceptance criteria before editing.

## 4) Implement Changes
- Apply minimal, targeted code updates.
- Do not include unrelated refactors.

## 5) Run QA
- Run required checks (`lint`, `build`, targeted endpoint or UI checks).
- Collect concrete evidence for pass/fail outcomes.

## 6) Retest Fixes
- Re-test the exact behavior that was broken.
- Re-run affected regression checklist items.

## 7) Commit Changes
- Summarize modified files and rationale.
- Update docs (`open-issues`, `qa-report`, `regression-checklist`, `handoff`) to match current state.
