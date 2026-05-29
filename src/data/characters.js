export const CHARACTERS = [
  {
    id: 'warrior',
    name: 'Ember Guard',
    element: 'fire',
    maxHp: 1200,
    attack: 180,
    skillSequence: ['fire', 'fire', 'water'],
    skillName: 'Blazing Cleave',
    skillMultiplier: 3.0,
    skills: [
      { id: 'blazing-cleave', name: 'Blazing Cleave', requiredGems: ['fire', 'fire', 'water'], multiplier: 3.0 },
      { id: 'ember-rush', name: 'Ember Rush', requiredGems: ['fire', 'water', 'fire'], multiplier: 2.4 },
      { id: 'guard-break', name: 'Guard Break', requiredGems: ['fire', 'fire', 'fire'], multiplier: 3.8 }
    ],
    color: 0xff4444
  },
  {
    id: 'mage',
    name: 'Tide Arcanist',
    element: 'water',
    maxHp: 800,
    attack: 250,
    skillSequence: ['water', 'water', 'light'],
    skillName: 'Glacial Bloom',
    skillMultiplier: 3.5,
    skills: [
      { id: 'glacial-bloom', name: 'Glacial Bloom', requiredGems: ['water', 'water', 'light'], multiplier: 3.5 },
      { id: 'tidal-lance', name: 'Tidal Lance', requiredGems: ['water', 'light', 'water'], multiplier: 2.7 },
      { id: 'arcane-tide', name: 'Arcane Tide', requiredGems: ['water', 'water', 'water'], multiplier: 4.0 }
    ],
    color: 0x4488ff
  },
  {
    id: 'ranger',
    name: 'Wildwood Ranger',
    element: 'grass',
    maxHp: 1000,
    attack: 200,
    skillSequence: ['grass', 'dark', 'grass'],
    skillName: 'Thorn Volley',
    skillMultiplier: 2.5,
    skills: [
      { id: 'thorn-volley', name: 'Thorn Volley', requiredGems: ['grass', 'dark', 'grass'], multiplier: 2.5 },
      { id: 'snare-shot', name: 'Snare Shot', requiredGems: ['grass', 'grass', 'dark'], multiplier: 3.1 },
      { id: 'wild-barrage', name: 'Wild Barrage', requiredGems: ['grass', 'grass', 'grass'], multiplier: 3.6 }
    ],
    color: 0x44cc44
  },
  {
    id: 'paladin',
    name: 'Dawn Paladin',
    element: 'light',
    maxHp: 1500,
    attack: 150,
    skillSequence: ['light', 'light', 'fire'],
    skillName: 'Radiant Oath',
    skillMultiplier: 2.8,
    skills: [
      { id: 'radiant-oath', name: 'Radiant Oath', requiredGems: ['light', 'light', 'fire'], multiplier: 2.8 },
      { id: 'sunward-smite', name: 'Sunward Smite', requiredGems: ['light', 'fire', 'light'], multiplier: 3.2 },
      { id: 'dawn-shelter', name: 'Dawn Shelter', requiredGems: ['light', 'light', 'light'], multiplier: 3.7 }
    ],
    color: 0xffee44
  },
  {
    id: 'assassin',
    name: 'Umbral Blade',
    element: 'dark',
    maxHp: 900,
    attack: 300,
    skillSequence: ['dark', 'dark', 'dark'],
    skillName: 'Midnight Cut',
    skillMultiplier: 4.0,
    skills: [
      { id: 'midnight-cut', name: 'Midnight Cut', requiredGems: ['dark', 'dark', 'dark'], multiplier: 4.0 },
      { id: 'shade-step', name: 'Shade Step', requiredGems: ['dark', 'fire', 'dark'], multiplier: 3.2 },
      { id: 'eclipse-fang', name: 'Eclipse Fang', requiredGems: ['dark', 'light', 'dark'], multiplier: 3.4 }
    ],
    color: 0xaa44cc
  }
]
