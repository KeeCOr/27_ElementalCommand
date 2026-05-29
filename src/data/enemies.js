export const ENEMIES = {
  goblin: {
    id: 'goblin',
    name: 'Moss Imp',
    maxHp: 500,
    attack: 60,
    attackInterval: 4000,
    weaknessGems: ['fire', 'fire', 'grass'],
    color: 0x88cc44
  },
  orc: {
    id: 'orc',
    name: 'Iron Brute',
    maxHp: 1200,
    attack: 120,
    attackInterval: 5000,
    weaknessGems: ['water', 'water', 'light', 'light', 'light'],
    color: 0x667733
  },
  darkKnight: {
    id: 'darkKnight',
    name: 'Grave Warden',
    maxHp: 2000,
    attack: 180,
    attackInterval: 6000,
    weaknessGems: ['light', 'light', 'fire', 'fire', 'water', 'water'],
    color: 0x334455
  },
  fireSpirit: {
    id: 'fireSpirit',
    name: 'Cinder Wisp',
    maxHp: 800,
    attack: 200,
    attackInterval: 3000,
    weaknessGems: ['water', 'water', 'water', 'dark', 'dark'],
    color: 0xff6600
  },
  shadowBeast: {
    id: 'shadowBeast',
    name: 'Night Maw',
    maxHp: 3000,
    attack: 250,
    attackInterval: 7000,
    weaknessGems: ['light', 'light', 'light', 'grass', 'grass', 'fire', 'fire', 'fire'],
    color: 0x220033
  }
}
