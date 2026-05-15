# Elemental Command Art Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Elemental Command so the MVP looks like a polished mobile fantasy puzzle RPG with richer background art, gems, character cards, enemy slots, and combat feedback.

**Architecture:** Keep gameplay systems unchanged and place art definitions behind a small asset manifest plus a procedural art factory. Scenes and game objects consume texture keys from the manifest while retaining Phaser-drawn hit areas, bars, outlines, and interaction logic.

**Tech Stack:** Phaser 3.80, Vite 5, JavaScript ES modules, Vitest.

---

## File Structure

- Create `src/systems/AssetManifest.js`: single source of truth for generated texture keys and ids.
- Create `tests/AssetManifest.test.js`: pure unit tests that confirm manifest coverage for gems, characters, enemies, and backgrounds.
- Modify `src/systems/ArtFactory.js`: generate procedural bitmap-like textures using Phaser graphics and the manifest.
- Modify `src/scenes/BootScene.js`: initialize generated art once before entering the first scene.
- Modify `src/scenes/StageSelectScene.js`: replace flat menu background/cards with generated fantasy menu art.
- Modify `src/scenes/PartySelectScene.js`: add portraits, card styling, selection tint, and compact readable stats.
- Modify `src/scenes/BattleScene.js`: use battle background and add skill/basic hit feedback hooks.
- Modify `src/objects/Gem.js`: prefer generated gem textures and keep highlight behavior clear.
- Modify `src/objects/HexBoard.js`: add board frame and stronger drag path visuals without changing path rules.
- Modify `src/objects/CharacterSlot.js`: add character portraits, frames, and HP presentation.
- Modify `src/objects/EnemySlot.js`: add enemy portraits, aura, hit tween, and death fade.
- Modify `src/constants.js`: keep readable ASCII labels and shared UI font.

---

### Task 1: Add Asset Manifest And Tests

**Files:**
- Create: `src/systems/AssetManifest.js`
- Create: `tests/AssetManifest.test.js`

- [ ] **Step 1: Write the failing manifest test**

Create `tests/AssetManifest.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  ART_BACKGROUNDS,
  ART_CHARACTERS,
  ART_ENEMIES,
  ART_GEMS,
  textureKeyForCharacter,
  textureKeyForEnemy,
  textureKeyForGem
} from '../src/systems/AssetManifest.js'
import { GEM_TYPES } from '../src/constants.js'
import { CHARACTERS } from '../src/data/characters.js'
import { ENEMIES } from '../src/data/enemies.js'

describe('AssetManifest', () => {
  it('covers every gem type', () => {
    expect(ART_GEMS.map(gem => gem.id)).toEqual(GEM_TYPES)
    expect(textureKeyForGem('fire')).toBe('gem-fire')
  })

  it('covers every playable character', () => {
    expect(ART_CHARACTERS.map(character => character.id)).toEqual(CHARACTERS.map(character => character.id))
    expect(textureKeyForCharacter('warrior')).toBe('portrait-warrior')
  })

  it('covers every enemy id', () => {
    expect(ART_ENEMIES.map(enemy => enemy.id)).toEqual(Object.keys(ENEMIES))
    expect(textureKeyForEnemy('darkKnight')).toBe('enemy-darkKnight')
  })

  it('defines the menu and battle backgrounds', () => {
    expect(ART_BACKGROUNDS.map(background => background.key)).toEqual(['bg-menu', 'bg-battle'])
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/AssetManifest.test.js`

Expected: FAIL because `src/systems/AssetManifest.js` does not exist.

- [ ] **Step 3: Add the manifest implementation**

Create `src/systems/AssetManifest.js`:

```js
import { GEM_TYPES } from '../constants.js'
import { CHARACTERS } from '../data/characters.js'
import { ENEMIES } from '../data/enemies.js'

export const ART_BACKGROUNDS = [
  { key: 'bg-menu', top: 0x16152a, bottom: 0x24375c, accent: 0x6b4fd8 },
  { key: 'bg-battle', top: 0x101729, bottom: 0x203646, accent: 0x2fb6a3 }
]

export const ART_GEMS = GEM_TYPES.map(id => ({ id, key: textureKeyForGem(id) }))

export const ART_CHARACTERS = CHARACTERS.map(character => ({
  id: character.id,
  key: textureKeyForCharacter(character.id),
  color: character.color
}))

export const ART_ENEMIES = Object.keys(ENEMIES).map(id => ({
  id,
  key: textureKeyForEnemy(id),
  color: ENEMIES[id].color
}))

export function textureKeyForGem(id) {
  return `gem-${id}`
}

export function textureKeyForCharacter(id) {
  return `portrait-${id}`
}

export function textureKeyForEnemy(id) {
  return `enemy-${id}`
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/AssetManifest.test.js`

Expected: PASS with 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/systems/AssetManifest.js tests/AssetManifest.test.js
git commit -m "test: add art asset manifest coverage"
```

---

### Task 2: Generate Procedural Art Textures

**Files:**
- Modify: `src/systems/ArtFactory.js`
- Modify: `src/scenes/BootScene.js`
- Test: `tests/AssetManifest.test.js`

- [ ] **Step 1: Update `ArtFactory.js` to consume the manifest**

Ensure `src/systems/ArtFactory.js` imports the manifest:

```js
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js'
import {
  ART_BACKGROUNDS,
  ART_CHARACTERS,
  ART_ENEMIES,
  ART_GEMS
} from './AssetManifest.js'
```

At the top of `createArtAssets(scene)`, keep the idempotent guard:

```js
export function createArtAssets(scene) {
  if (scene.textures.exists('bg-menu')) return
  ART_BACKGROUNDS.forEach(background => {
    createBackground(scene, background.key, background.top, background.bottom, background.accent)
  })
  createPanelTextures(scene)
  ART_GEMS.forEach(gem => createGemTexture(scene, gem.id, GEM_PALETTES[gem.id]))
  ART_CHARACTERS.forEach(character => createCharacterTexture(scene, character.id, CHARACTER_ART[character.id]))
  ART_ENEMIES.forEach(enemy => createEnemyTexture(scene, enemy.id, ENEMY_ART[enemy.id]))
}
```

Keep the existing helper functions for `createBackground`, `createPanelTextures`, `createGemTexture`, `createCharacterTexture`, `createEnemyTexture`, and `hexPoints`. If a helper is missing, copy it from the current `src/systems/ArtFactory.js` working tree version before this task starts.

- [ ] **Step 2: Wire BootScene**

Update `src/scenes/BootScene.js`:

```js
import Phaser from 'phaser'
import { createArtAssets } from '../systems/ArtFactory.js'

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }) }

  preload() {}

  create() {
    createArtAssets(this)
    this.scene.start('StageSelectScene')
  }
}
```

- [ ] **Step 3: Run manifest tests**

Run: `npm test -- tests/AssetManifest.test.js`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/systems/ArtFactory.js src/scenes/BootScene.js
git commit -m "feat: generate fantasy art textures"
```

---

### Task 3: Upgrade Menu And Party Screens

**Files:**
- Modify: `src/constants.js`
- Modify: `src/scenes/StageSelectScene.js`
- Modify: `src/scenes/PartySelectScene.js`

- [ ] **Step 1: Normalize shared UI constants**

Ensure `src/constants.js` has ASCII labels and a shared UI font:

```js
export const GEM_LABEL = {
  fire: 'F',
  water: 'W',
  grass: 'N',
  light: 'L',
  dark: 'D'
}

export const UI_FONT = 'Arial, Helvetica, sans-serif'
```

- [ ] **Step 2: Apply menu art to StageSelectScene**

Update `src/scenes/StageSelectScene.js` so `create()` starts with:

```js
this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-menu')
```

Use `ui-stage-card` images for stage buttons:

```js
const card = this.add.image(GAME_WIDTH / 2, y, 'ui-stage-card')
  .setInteractive({ useHandCursor: true })
card.on('pointerover', () => card.setTint(0xcfefff))
card.on('pointerout', () => card.clearTint())
card.on('pointerdown', () => this.scene.start('PartySelectScene', { stageId: stage.id }))
```

Keep the existing stage iteration and scene transition behavior unchanged.

- [ ] **Step 3: Apply card art to PartySelectScene**

Update character cards to use `ui-party-card` and portrait textures:

```js
const card = this.add.image(x, y, 'ui-party-card')
  .setInteractive({ useHandCursor: true })
this.cardMap.set(char.id, card)

this.add.image(x - 70, y + 5, `portrait-${char.id}`).setDisplaySize(62, 62)
```

Use compact stats text:

```js
this.add.text(x + 24, y + 34, `ATK ${char.attack}  HP ${char.maxHp}`, {
  fontSize: '10px',
  fontFamily: UI_FONT,
  color: '#aab7d8'
}).setOrigin(0.5)
```

Preserve selection logic and keep the maximum party size at 4.

- [ ] **Step 4: Run smoke tests**

Run: `npm test`

Expected: all existing system tests and `AssetManifest` tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/constants.js src/scenes/StageSelectScene.js src/scenes/PartySelectScene.js
git commit -m "feat: polish menu and party screens"
```

---

### Task 4: Upgrade Battle Objects And Combat Feedback

**Files:**
- Modify: `src/scenes/BattleScene.js`
- Modify: `src/objects/Gem.js`
- Modify: `src/objects/HexBoard.js`
- Modify: `src/objects/CharacterSlot.js`
- Modify: `src/objects/EnemySlot.js`

- [ ] **Step 1: Use the generated battle background**

In `BattleScene.create()`, replace the flat rectangle background with:

```js
this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-battle')
```

Keep `stage.name`, enemy setup, party setup, board creation, drag handling, and result text behavior.

- [ ] **Step 2: Add skill feedback**

In `_fireSkill(charSlot)`, keep the damage calculation and add a stronger flash:

```js
const dmg = Math.floor(charSlot.characterData.attack * charSlot.characterData.skillMultiplier)
this._dealDamageToEnemies(dmg)
this.cameras.main.flash(250, 255, 238, 150)
this.cameras.main.shake(120, 0.004)
```

In `_fireBasicAttack(charSlot)`, leave gameplay unchanged:

```js
this._dealDamageToEnemies(charSlot.characterData.attack)
```

- [ ] **Step 3: Use gem textures with readable highlights**

In `Gem`, create the sprite and highlight ring:

```js
this.sprite = scene.add.image(0, 0, `gem-${gemType}`).setDisplaySize(hexRadius * 2.12, hexRadius * 2.12)
this.add(this.sprite)

this.highlightRing = scene.add.graphics()
this.add(this.highlightRing)
```

Use this highlight behavior:

```js
setHighlight(active) {
  this.highlightRing.clear()
  if (active) {
    this.highlightRing.lineStyle(4, 0xffffff, 0.95).strokeCircle(0, 0, hexRadius * 0.95)
    this.highlightRing.lineStyle(8, 0x8fffff, 0.25).strokeCircle(0, 0, hexRadius * 1.03)
  }
  this.sprite.setAlpha(active ? 1 : 0.96)
  this.setScale(active ? 1.12 : 1)
}
```

- [ ] **Step 4: Add board frame and drag path glow**

In `HexBoard`, add a board frame graphics object before building the grid:

```js
this.boardFrame = scene.add.graphics()
this._drawBoardFrame()
this.lineGraphics = scene.add.graphics().setDepth(5)
```

Add `_drawBoardFrame()`:

```js
_drawBoardFrame() {
  this.boardFrame.clear()
  this.boardFrame.fillStyle(0x07101f, 0.42).fillRoundedRect(58, 346, 364, 300, 18)
  this.boardFrame.lineStyle(2, 0x58d7ff, 0.15).strokeRoundedRect(59, 347, 362, 298, 18)
}
```

Update `_drawPath()` to draw a glow and a crisp line:

```js
_drawPath() {
  this.lineGraphics.clear()
  if (this.dragPath.length < 2) return
  this.lineGraphics.lineStyle(9, 0x7df9ff, 0.23)
  this._strokeDragPath()
  this.lineGraphics.lineStyle(4, 0xffffff, 0.85)
  this._strokeDragPath()
}
```

- [ ] **Step 5: Add portraits to character and enemy slots**

In `CharacterSlot`, add:

```js
this.portrait = scene.add.image(0, 11, `portrait-${characterData.id}`).setDisplaySize(58, 58)
this.add(this.portrait)
```

In `EnemySlot`, add:

```js
this.body = scene.add.image(0, -12, `enemy-${enemyData.id}`).setDisplaySize(92, 92)
this.add(this.body)
```

Preserve existing `takeDamage`, `isDead`, timer, HP bar, and active-character behavior.

- [ ] **Step 6: Run tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/scenes/BattleScene.js src/objects/Gem.js src/objects/HexBoard.js src/objects/CharacterSlot.js src/objects/EnemySlot.js
git commit -m "feat: polish battle art and feedback"
```

---

### Task 5: Verify In Browser And Build

**Files:**
- No source changes expected unless verification finds a concrete issue.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Build the app**

Run: `npm run build`

Expected: Vite completes successfully and writes `dist/`.

- [ ] **Step 3: Start the dev server**

Run: `npm run dev -- --host 127.0.0.1 --port 5173`

Expected: Vite serves the app at `http://127.0.0.1:5173/`.

- [ ] **Step 4: Visual smoke check**

Open `http://127.0.0.1:5173/` and verify:

- Stage select shows a fantasy background and readable stage cards.
- Party select shows five portrait cards and selected cards tint green.
- Starting a battle with at least one character shows the battle background.
- Enemies use portrait art and visible HP/timer bars.
- Character slots use portrait art and visible HP bars.
- The hex board uses gem textures.
- Dragging adjacent gems draws a visible path.
- Releasing a drag advances the active character and deals damage.

- [ ] **Step 5: Commit any verification fixes**

If fixes were required:

```bash
git add src
git commit -m "fix: resolve art upgrade smoke issues"
```

If no fixes were required, do not create an empty commit.

---

## Self-Review

- Spec coverage: the plan covers background art, gem art, character portraits, enemy portraits, richer slots, menu polish, battle polish, skill feedback, tests, and browser verification.
- Completion scan: no unresolved marker words or open-ended completion instructions remain.
- Type consistency: texture keys use `gem-${id}`, `portrait-${id}`, and `enemy-${id}` consistently across manifest, factory, scenes, and objects.
