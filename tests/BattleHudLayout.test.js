import { describe, expect, it } from 'vitest'
import { buildBattleHudGroups } from '../src/systems/BattleHudLayout.js'

describe('battle HUD layout', () => {
  it('separates active skill selection from command preview result', () => {
    const groups = buildBattleHudGroups({
      characterName: 'Astra',
      selectedSkillName: 'Flame Chain',
      preview: {
        enemyName: 'Slime Guard',
        resolvedEffect: 'Breaks fire weakness',
        counterLine: 'Counters: F 1/2 > 2/2',
        tacticalImplication: 'Next command deals bonus damage',
        willBreakWeakness: true,
      },
    })

    expect(groups).toEqual([
      {
        id: 'skill-selection',
        label: 'SKILL SELECTION',
        role: 'primary-action',
        lines: ['Astra', 'Selected: Flame Chain'],
      },
      {
        id: 'command-preview',
        label: 'COMMAND PREVIEW',
        role: 'result-preview',
        emphasis: 'break',
        lines: [
          'Target: Slime Guard',
          'Breaks fire weakness',
          'Counters: F 1/2 > 2/2',
          'Next command deals bonus damage',
        ],
      },
    ])
  })
})