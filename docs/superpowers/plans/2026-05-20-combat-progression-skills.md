# Combat Progression Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stage-based exponential enemy HP, count-based weakness requirements, and selectable per-character skill lists.

**Architecture:** Keep pure combat math in `src/systems/CombatBoard.js` so it can be tested without Phaser. Keep character skill data in `src/data/characters.js`; `BattleScene` owns the selected skill UI and passes the selected skill into attack resolution. `EnemySlot` remains the visual owner for weakness progress and HP bars.

**Tech Stack:** Phaser 3, Vite, Vitest, Electron builder packaging.

---

### Task 1: Pure Combat Helpers

**Files:**
- Modify: `tests/CombatBoard.test.js`
- Modify: `src/systems/CombatBoard.js`

- [x] Add tests for `scaleEnemyForStage`, `getWeaknessRequirements`, and count-based `accumulateWeakness`.
- [x] Verify the new tests fail before implementation.
- [x] Implement the helpers in `CombatBoard.js`.
- [x] Verify `npm test -- tests/CombatBoard.test.js` passes.

### Task 2: Skill Data And Selection

**Files:**
- Modify: `src/data/characters.js`
- Modify: `src/scenes/BattleScene.js`
- Modify: `tests/CombatBoard.test.js`

- [x] Add tests that character skill data supports one to three skills and exposes `requiredGems`.
- [x] Verify the new tests fail before implementation.
- [x] Convert each character to a `skills` array while preserving fallback compatibility for existing fields where useful.
- [x] Update `BattleScene` to render the active character skill list, select one skill, and use the selected skill's required gems and multiplier.
- [x] Verify targeted tests pass.

### Task 3: Enemy Slot Weakness Display

**Files:**
- Modify: `src/objects/EnemySlot.js`
- Modify: `tests/EnemySlot.test.js`

- [x] Add source-level tests that weakness UI uses count labels instead of duplicate-only dots.
- [x] Verify the tests fail before implementation.
- [x] Update `EnemySlot` to show one entry per gem type with progress text like `0/3`.
- [x] Verify targeted tests pass.

### Task 4: Docs, Browser Check, Executable

**Files:**
- Modify: `docs/superpowers/specs/2026-05-15-elemental-command-combat-board-design.md`
- Modify: `docs/superpowers/plans/2026-05-15-elemental-command-art-upgrade.md`
- Modify: `ElementalCommand_v0.1.0_portable.exe`
- Modify: `release/ElementalCommand_v0.1.0_portable.exe`

- [x] Update planning/spec docs with the latest combat progression rules.
- [x] Run `npm test` and `npm run build`.
- [ ] Browser-check the battle scene and skill selection UI.
- [x] Rebuild and launch-check the portable executable.
- [ ] Commit only this feature set and the required executable/docs updates.
