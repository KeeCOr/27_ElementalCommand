export const BUILDINGS = [
  {
    id: 'barracks',
    kind: 'building',
    name: 'Barracks',
    role: 'Melee spawn',
    cost: 80,
    placement: 'tile',
    description: 'Deploys steady front-line soldiers.'
  },
  {
    id: 'arrowTower',
    kind: 'building',
    name: 'Arrow Tower',
    role: 'Ranged defense',
    cost: 110,
    placement: 'tile',
    description: 'Controls lanes with quick ranged shots.'
  },
  {
    id: 'manaWell',
    kind: 'building',
    name: 'Mana Well',
    role: 'Support',
    cost: 95,
    placement: 'tile',
    description: 'Feeds the party with extra skill energy.'
  }
]

export const HEROES = [
  {
    id: 'captain',
    kind: 'hero',
    name: 'Field Captain',
    role: 'Assault',
    cost: 140,
    cooldown: 18,
    placement: 'field',
    description: 'Leads a short burst of direct damage.'
  },
  {
    id: 'seer',
    kind: 'hero',
    name: 'Crystal Seer',
    role: 'Control',
    cost: 130,
    cooldown: 22,
    placement: 'field',
    description: 'Reveals weak points and slows enemy timers.'
  },
  {
    id: 'sentinel',
    kind: 'hero',
    name: 'Stone Sentinel',
    role: 'Tank',
    cost: 160,
    cooldown: 26,
    placement: 'field',
    description: 'Absorbs pressure when the board is crowded.'
  }
]

export const DEPLOYABLES = [...BUILDINGS, ...HEROES]

export function getDeployableById(id) {
  return DEPLOYABLES.find(deployable => deployable.id === id)
}
