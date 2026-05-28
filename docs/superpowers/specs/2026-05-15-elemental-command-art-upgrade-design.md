# Elemental Command Art Upgrade Design

Date: 2026-05-15
Project: Elemental Command
Scope: Hybrid art upgrade for a mobile fantasy puzzle RPG look.

## Goal

Make the current playable prototype look like a more complete fantasy puzzle RPG while keeping the existing Phaser structure stable. The upgrade should focus on the first-screen impression and the battle screen, where players spend most of their time.

## Visual Direction

Use a colorful mobile fantasy RPG style:

- A dark magical battlefield background with readable contrast.
- Element gems that look like polished fantasy stones instead of flat colored hexes.
- Character cards with portrait art, element frames, and clearer skill identity.
- Enemy slots with monster portraits or silhouettes, stronger HP bars, and attack gauges.
- Short elemental impact effects when skills fire.

The style should feel polished but still lightweight enough for the current MVP.

## Asset Strategy

Use a hybrid approach:

- Add generated bitmap assets for high-impact visuals: background, elemental gems, character portraits, enemy portraits, and UI panels.
- Keep Phaser-drawn geometry for layout, hit areas, bars, outlines, and simple state changes.
- Add small code-driven effects such as glow, screen shake, particles, and hit flashes instead of making every animation a sprite sheet.

This keeps the implementation low-risk and avoids replacing working gameplay systems.

## Assets To Add

Create or add the following under `public/assets/`:

- `battle-bg-ruins.png`: vertical fantasy battlefield background.
- `gem-fire.png`, `gem-water.png`, `gem-grass.png`, `gem-light.png`, `gem-dark.png`: transparent elemental hex gems.
- `portrait-warrior.png`, `portrait-mage.png`, `portrait-ranger.png`, `portrait-paladin.png`, `portrait-assassin.png`: character portraits.
- `enemy-goblin.png`, `enemy-orc.png`, `enemy-darkKnight.png`, `enemy-fireSpirit.png`, `enemy-shadowBeast.png`: enemy portraits matching `src/data/enemies.js`.
- `panel-card.png` or equivalent frame texture for cards and slots if it improves the screen without complicating layout.

All gameplay-critical objects still need fallback drawing when an image is missing, so the game remains runnable during asset iteration.

## Scene Changes

### BootScene

Load the new image assets. Keep preload simple and explicit. Do not add a complex loading screen in this pass.

### StageSelectScene

Improve first impression with a background image or atmospheric panel styling. Keep stage selection behavior unchanged.

### PartySelectScene

Replace flat character cards with richer cards:

- Portrait near the top or left side.
- Element-colored border.
- Skill sequence shown with small gem icons.
- Attack and HP text kept compact and readable.

Selection should still support up to four characters and must preserve current behavior.

### BattleScene

Use the battle background image behind all combat objects. Add subtle dark overlays if readability needs it.

Keep layout roughly the same:

- Enemies near the top.
- Party in the middle.
- Hex board in the lower half.

Improve skill feedback with elemental particles, a short camera shake, and damage/hit visual cues.

### Gem

Prefer image gems when available, but keep the current hex drawing fallback. Highlight should scale the gem, add glow, and keep the drag path readable.

### CharacterSlot And EnemySlot

Add portrait images and stronger frames while preserving HP and timer logic. Dead enemies can fade out instead of disappearing instantly if simple to implement.

## Testing

Run the existing Vitest suite after changes. Also start the Vite dev server and visually verify:

- Stage selection loads.
- Party selection cards are readable.
- Battle screen background, gems, character portraits, and enemy portraits render.
- Dragging gems still works.
- Skill/basic attacks still advance turns and update HP.

## Non-Goals

- No new gameplay systems.
- No sprite-sheet animation pipeline.
- No inventory, character growth, shop, or story UI.
- No mobile packaging changes in this pass.
