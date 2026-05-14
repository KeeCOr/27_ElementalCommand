export const CHARACTERS = [
  {
    id: 'warrior',
    name: '전사',
    element: 'fire',
    maxHp: 1200,
    attack: 180,
    skillSequence: ['fire', 'fire', 'water'],
    skillName: '불꽃 베기',
    skillMultiplier: 3.0,
    color: 0xff4444
  },
  {
    id: 'mage',
    name: '마법사',
    element: 'water',
    maxHp: 800,
    attack: 250,
    skillSequence: ['water', 'water', 'light'],
    skillName: '냉기 폭발',
    skillMultiplier: 3.5,
    color: 0x4488ff
  },
  {
    id: 'ranger',
    name: '레인저',
    element: 'grass',
    maxHp: 1000,
    attack: 200,
    skillSequence: ['grass', 'dark', 'grass'],
    skillName: '독화살',
    skillMultiplier: 2.5,
    color: 0x44cc44
  },
  {
    id: 'paladin',
    name: '팔라딘',
    element: 'light',
    maxHp: 1500,
    attack: 150,
    skillSequence: ['light', 'light', 'fire'],
    skillName: '신성한 검',
    skillMultiplier: 2.8,
    color: 0xffee44
  },
  {
    id: 'assassin',
    name: '암살자',
    element: 'dark',
    maxHp: 900,
    attack: 300,
    skillSequence: ['dark', 'dark', 'dark'],
    skillName: '어둠의 일격',
    skillMultiplier: 4.0,
    color: 0xaa44cc
  }
]
