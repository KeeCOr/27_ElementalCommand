export const GEM_TYPES = ['fire', 'water', 'grass', 'light', 'dark']

export const GEM_COLORS = {
  fire: 0xff4444,
  water: 0x4488ff,
  grass: 0x44cc44,
  light: 0xffee44,
  dark: 0xaa44cc
}

export const GEM_LABEL = {
  fire: 'F',
  water: 'W',
  grass: 'N',
  light: 'L',
  dark: 'D'
}

// Element affinity: attacker -> defender -> multiplier (>1 = strong, <1 = weak)
export const ELEMENT_AFFINITY = {
  fire:  { grass: 1.5, water: 0.7, fire: 1.0, light: 1.0, dark: 1.0 },
  water: { fire:  1.5, grass: 0.7, water: 1.0, light: 1.0, dark: 1.0 },
  grass: { water: 1.5, fire:  0.7, grass: 1.0, light: 1.0, dark: 1.0 },
  light: { dark:  1.5, light: 0.7, fire: 1.0, water: 1.0, grass: 1.0 },
  dark:  { light: 1.5, dark:  0.7, fire: 1.0, water: 1.0, grass: 1.0 }
}

// Human-readable affinity chart for onboarding display
// Each entry: [attacker emoji-label, arrow, defender emoji-label]
export const AFFINITY_CHART = [
  { strong: 'fire',  weak: 'grass', strongLabel: '🔥 Fire',    weakLabel: '🌿 Grass' },
  { strong: 'grass', weak: 'water', strongLabel: '🌿 Grass',   weakLabel: '💧 Water' },
  { strong: 'water', weak: 'fire',  strongLabel: '💧 Water',   weakLabel: '🔥 Fire'  },
  { strong: 'light', weak: 'dark',  strongLabel: '⚡ Light',   weakLabel: '🌑 Dark'  },
  { strong: 'dark',  weak: 'light', strongLabel: '🌑 Dark',    weakLabel: '⚡ Light' }
]

export const BOARD_CONFIG = {
  cols: 5,
  rows: 6,
  hexRadius: 36
}

export const GAME_WIDTH = 480
export const GAME_HEIGHT = 854
export const UI_FONT = 'Arial, Helvetica, sans-serif'
