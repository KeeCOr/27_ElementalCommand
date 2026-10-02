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
import { validateArtManifestCoverage } from '../src/systems/ArtFactory.js'
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
})
