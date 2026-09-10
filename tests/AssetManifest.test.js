import { describe, expect, it } from 'vitest'
import {
  ART_BACKGROUNDS,
  ART_CHARACTERS,
  ART_ENEMIES,
  ART_GEMS,
  ART_SHEET_SOURCES,
  ART_SOURCE_IMAGES,
  ART_UI_TEXTURES,
  textureKeyForCharacter,
  textureKeyForEnemy,
  textureKeyForGem
} from '../src/systems/AssetManifest.js'
import { getCoverCropRect, validateArtManifestCoverage } from '../src/systems/ArtFactory.js'
import { GEM_TYPES, UI_FONT } from '../src/constants.js'
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

  it('maps generated image assets to preload keys', () => {
    expect(Object.values(ART_SOURCE_IMAGES).map(source => source.path)).toEqual([
      'assets/bg-menu.png',
      'assets/bg-battle.png'
    ])
    expect(ART_SHEET_SOURCES.map(source => source.path)).toEqual([
      'assets/character-portraits-sheet.png',
      'assets/enemy-portraits-sheet.png',
      'assets/deployables-sheet.png',
      'assets/gem-items-sheet.png'
    ])
  })

  it('defines generated UI frame and button runtime texture keys', () => {
    expect(ART_UI_TEXTURES).toEqual([
      'ui-stage-card',
      'ui-party-card',
      'ui-button-ready',
      'ui-button-disabled',
      'ui-skill-card',
      'ui-skill-card-selected',
      'ui-deploy-card',
      'ui-deploy-card-selected',
      'ui-deploy-tray',
      'ui-skill-tray'
    ])
  })

  it('maps art sheets to the runtime texture keys used by game objects', () => {
    const byKey = Object.fromEntries(ART_SHEET_SOURCES.map(source => [source.key, source]))

    expect(byKey['asset-character-sheet'].targetKeys).toEqual(ART_CHARACTERS.map(character => character.key))
    expect(byKey['asset-enemy-sheet'].targetKeys).toEqual(ART_ENEMIES.map(enemy => enemy.key))
    expect(byKey['asset-deployable-sheet'].targetKeys).toEqual([
      'building-barracks',
      'building-arrowTower',
      'building-manaWell',
      'hero-captain',
      'hero-seer',
      'hero-sentinel'
    ])
    expect(byKey['asset-gem-sheet'].targetKeys).toEqual([
      'gem-fire',
      'gem-water',
      'gem-grass',
      'gem-light',
      'gem-dark',
      'gem-bomb',
      'gem-lineClear',
      'gem-obstacle'
    ])
  })

  it('has procedural art definitions for every manifest entry', () => {
    expect(() => validateArtManifestCoverage()).not.toThrow()
  })

  it('reports a clear error when a manifest entry has no procedural art definition', () => {
    expect(() => validateArtManifestCoverage({
      gems: [...ART_GEMS, { id: 'storm', key: 'gem-storm' }]
    })).toThrow('Missing procedural art definition for gem: storm')
  })

  it('crops a 1280x720 landscape source into a 480x854 portrait rect symmetrically, keeping full source height', () => {
    const rect = getCoverCropRect(1280, 720, 480, 854)

    expect(rect.y).toBe(0)
    expect(rect.height).toBe(720)
    expect(rect.width).toBeCloseTo(404.683840749414, 6)
    expect(rect.x).toBeCloseTo(437.658079625293, 6)
    // Symmetric left/right crop: the two shaved-off margins must be equal.
    expect(rect.x).toBeCloseTo(1280 - rect.width - rect.x, 6)
  })

  it('crops a 941x1672 near-portrait source into 480x854 with a mathematically exact, centered, near-lossless cover crop', () => {
    const rect = getCoverCropRect(941, 1672, 480, 854)

    expect(rect.y).toBe(0)
    expect(rect.height).toBe(1672)
    expect(rect.width).toBeCloseTo(939.765807962528, 6)
    expect(rect.x).toBeCloseTo(0.617096018736, 6)
    expect(rect.x).toBeCloseTo(941 - rect.width - rect.x, 6)
  })

  it('returns the full source rectangle when source and target share the same aspect ratio', () => {
    const rect = getCoverCropRect(480, 854, 240, 427)

    expect(rect).toEqual({ x: 0, y: 0, width: 480, height: 854 })
  })

  it('shares a UI font stack that includes Korean-capable fonts on every platform', () => {
    expect(UI_FONT).toContain('Noto Sans KR')
    expect(UI_FONT).toContain('Malgun Gothic')
  })
})
