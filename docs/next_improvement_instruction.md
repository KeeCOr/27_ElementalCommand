# ElementalCommand Next Improvement Instruction

Date: 2026-06-24

## Goal
Turn the current biggest project issue into a small, executable improvement batch. This file is intentionally scoped so the next worker can start without rereading the whole workspace audit.

## Instructions
1. Create one elemental matchup example that shows previewed advantage, resolved effect, and next tactical implication.
2. Add feedback for command selection so attribute counters are visible before and after action.
3. Audit runtime visual references for SVG/code-drawn elemental icons when touching combat UI.

## Completion Rules
- Do not include discarded projects in this batch.
- If gameplay, UI, systems, content, controls, build behavior, or project scope changes, update the project planning document and update log before build/release.
- If runtime source changes, run the nearest available validation and then perform the required build/package step from the project instructions.
- If a folder or asset looks ambiguous, document the decision instead of deleting it.

## 2026-06-30 Completion Note
- Completed by v0.3.0/v0.3.1: command matchup preview, resolved effect feedback, before/after weakness counter text, and separated skill-selection/command-preview HUD groups are present.
- Validation to rerun for release freshness: `npm test` and `npm run build`.
- Next recommended batch: add a small visual flash or icon pulse when the previewed weakness counter is completed, reusing existing bitmap assets and keeping code-drawn shapes limited to HUD/progress indicators.
