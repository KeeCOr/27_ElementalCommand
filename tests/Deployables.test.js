import { describe, expect, it } from 'vitest'
import {
  BUILDINGS,
  HEROES,
  getDeployableById
} from '../src/data/deployables.js'
import {
  ART_BUILDINGS,
  ART_HEROES,
  textureKeyForBuilding,
  textureKeyForHero
} from '../src/systems/AssetManifest.js'
import { validateArtManifestCoverage } from '../src/systems/ArtFactory.js'

describe('deployable roster', () => {
  it('provides starter buildings with placement stats', () => {
    expect(BUILDINGS.map(building => building.id)).toEqual(['barracks', 'arrowTower', 'manaWell'])
    expect(BUILDINGS.every(building => building.kind === 'building')).toBe(true)
    expect(BUILDINGS.every(building => building.cost > 0 && building.placement === 'tile')).toBe(true)
  })

  it('provides starter heroes with call-in stats', () => {
    expect(HEROES.map(hero => hero.id)).toEqual(['captain', 'seer', 'sentinel'])
    expect(HEROES.every(hero => hero.kind === 'hero')).toBe(true)
    expect(HEROES.every(hero => hero.cooldown > 0 && hero.placement === 'field')).toBe(true)
  })

  it('can find any deployable by id', () => {
    expect(getDeployableById('arrowTower')?.name).toBe('Arrow Tower')
    expect(getDeployableById('sentinel')?.name).toBe('Stone Sentinel')
    expect(getDeployableById('missing')).toBeUndefined()
  })

  it('adds deployable art entries to the manifest', () => {
    expect(ART_BUILDINGS.map(building => building.key)).toEqual([
      'building-barracks',
      'building-arrowTower',
      'building-manaWell'
    ])
    expect(ART_HEROES.map(hero => hero.key)).toEqual([
      'hero-captain',
      'hero-seer',
      'hero-sentinel'
    ])
    expect(textureKeyForBuilding('barracks')).toBe('building-barracks')
    expect(textureKeyForHero('captain')).toBe('hero-captain')
  })

  it('has procedural art definitions for every deployable', () => {
    expect(() => validateArtManifestCoverage()).not.toThrow()
  })
})
