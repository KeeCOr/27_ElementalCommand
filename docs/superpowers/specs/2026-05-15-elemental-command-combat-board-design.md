# Elemental Command Combat Board Design

Date: 2026-05-15
Project: Elemental Command
Scope: Board refill, special items, selectable character skills, stage HP scaling, slower stronger enemy attacks, cumulative enemy weaknesses, and attack-created blockers.

## Confirmed Behavior

- Dragged board cells are consumed after attack or skill resolution.
- Consumed cells refill immediately.
- Refilled cells use party-based elemental weights.
- Refilled cells have a low chance to become a special item:
  - `bomb`: 4%.
  - `lineClear`: 3%.
  - Normal elemental gem: 93%.
- Bombs consumed in a drag also consume adjacent non-blocker cells.
- Line-clear items consumed in a drag also consume the whole row of non-blocker cells.
- Blockers cannot be selected, consumed, or replaced by refill effects.
- Enemy attacks are three times slower and deal three times damage.
- A successful enemy attack converts one normal elemental gem into an unbreakable blocker. There is no blocker limit.
- Each enemy has cumulative, order-independent `weaknessGems`.
- Duplicate entries in `weaknessGems` define the required count for that gem color.
- Destroyed elemental gems accumulate against every alive enemy's color-count weakness requirements.
- When an enemy weakness is completed:
  - It takes heavy weakness damage.
  - Its attack timer is reset to zero.
  - Its weakness progress resets for the next cycle.
- Skill activation shows a short large character portrait cut-in without stopping battle flow.
- The active character can have up to three selectable skills.
- The active character's skill list shows each skill name and required gem sequence.
- The selected skill controls the sequence check, skill cut-in name, and damage multiplier.
- Enemy max HP scales exponentially by stage using a 1.75x multiplier per stage step.
- Consumed or converted cells show an immediate replacement effect: old gem fades and expands, a short colored burst marks the cell, then the new gem pops into place.

## Implementation Notes

- Keep skill sequence checks based on elemental gems only.
- Keep path selection from entering blocker cells.
- Special items do not count as elemental gems for skill or weakness matching.
- Weakness progress UI should show one entry per color with current and required counts, such as `1/3`.
- Stage HP scaling should not mutate base enemy data.
- Character skill data should keep one to three skills per character, each with `requiredGems` and `multiplier`.
- Replacement animation must not delay board state updates; the new cell is available immediately while the visual transition plays.
- Use small pure helper functions for refill and weakness progress so regressions can be tested outside Phaser rendering.
- After implementation, rebuild the portable executable and update this document if completion details change.
