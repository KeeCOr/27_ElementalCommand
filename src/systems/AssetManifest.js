import { GEM_TYPES } from '../constants.js'
import { CHARACTERS } from '../data/characters.js'
import { ENEMIES } from '../data/enemies.js'
import { BUILDINGS, HEROES } from '../data/deployables.js'

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

export const ART_BUILDINGS = BUILDINGS.map(building => ({
  id: building.id,
  key: textureKeyForBuilding(building.id)
}))

export const ART_HEROES = HEROES.map(hero => ({
  id: hero.id,
  key: textureKeyForHero(hero.id)
}))

export const ART_SOURCE_IMAGES = {
  menuBackground: { key: 'asset-bg-menu', path: 'assets/bg-menu.png', targetKey: 'bg-menu' },
  battleBackground: { key: 'asset-bg-battle', path: 'assets/bg-battle.png', targetKey: 'bg-battle' }
}

export const ART_SHEET_SOURCES = [
  {
    key: 'asset-character-sheet',
    path: 'assets/character-portraits-sheet.png',
    targetKeys: ART_CHARACTERS.map(character => character.key)
  },
  {
    key: 'asset-enemy-sheet',
    path: 'assets/enemy-portraits-sheet.png',
    targetKeys: ART_ENEMIES.map(enemy => enemy.key)
  },
  {
    key: 'asset-deployable-sheet',
    path: 'assets/deployables-sheet.png',
    targetKeys: [
      ...ART_BUILDINGS.map(building => building.key),
      ...ART_HEROES.map(hero => hero.key)
    ]
  },
  {
    key: 'asset-gem-sheet',
    path: 'assets/gem-items-sheet.png',
    targetKeys: [
      ...ART_GEMS.map(gem => gem.key),
      textureKeyForGem('bomb'),
      textureKeyForGem('lineClear'),
      textureKeyForGem('obstacle')
    ]
  }
]

export const ART_UI_TEXTURES = [
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
]

export function textureKeyForGem(id) {
  return `gem-${id}`
}

export function textureKeyForCharacter(id) {
  return `portrait-${id}`
}

export function textureKeyForEnemy(id) {
  return `enemy-${id}`
}

export function textureKeyForBuilding(id) {
  return `building-${id}`
}

export function textureKeyForHero(id) {
  return `hero-${id}`
}
