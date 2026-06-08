export const BUILDINGS = [
  {
    id: 'barracks',
    name: 'Barracks',
    kind: 'building',
    cost: 120,
    placement: 'tile',
    effect: 'Summons infantry pressure over time.'
  },
  {
    id: 'arrowTower',
    name: 'Arrow Tower',
    kind: 'building',
    cost: 150,
    placement: 'tile',
    effect: 'Fires at the nearest enemy on cooldown.'
  },
  {
    id: 'manaWell',
    name: 'Mana Well',
    kind: 'building',
    cost: 100,
    placement: 'tile',
    effect: 'Improves special gem generation.'
  }
]

export const HEROES = [
  {
    id: 'captain',
    name: 'Field Captain',
    kind: 'hero',
    cooldown: 18,
    placement: 'field',
    effect: 'Boosts party basic attacks briefly.'
  },
  {
    id: 'seer',
    name: 'Crystal Seer',
    kind: 'hero',
    cooldown: 22,
    placement: 'field',
    effect: 'Reveals and accelerates weakness progress.'
  },
  {
    id: 'sentinel',
    name: 'Stone Sentinel',
    kind: 'hero',
    cooldown: 26,
    placement: 'field',
    effect: 'Absorbs the next enemy strike.'
  }
]

export const DEPLOYABLES = [...BUILDINGS, ...HEROES]

export function getDeployableById(id) {
  return DEPLOYABLES.find(deployable => deployable.id === id)
}
