import { describe, expect, it } from 'vitest'
import {
  accumulateWeakness,
  buildWeaknessCounterPulsePlan,
  buildCommandMatchupPreview,
  collectConsumedCells,
  chooseObstacleCell,
  getCharacterSkills,
  resolveBattleParty,
  getWeaknessRequirements,
  isElementGem,
  scaleEnemyForStage,
  spawnBoardCell
} from '../src/systems/CombatBoard.js'
import { CHARACTERS } from '../src/data/characters.js'

describe('spawnBoardCell', () => {
  const weights = { fire: 1, water: 0, grass: 0, light: 0, dark: 0 }

  it('can spawn bomb and line clear items at low roll ranges', () => {
    expect(spawnBoardCell(weights, () => 0.01)).toBe('bomb')
    expect(spawnBoardCell(weights, () => 0.05)).toBe('lineClear')
  })

  it('spawns party-weighted elemental gems outside item ranges', () => {
    expect(spawnBoardCell(weights, () => 0.5)).toBe('fire')
  })
})

describe('collectConsumedCells', () => {
  it('expands bombs to adjacent cells but leaves blockers untouched', () => {
    const cells = [
      ['fire', 'water', 'grass'],
      ['dark', 'bomb', 'obstacle'],
      ['light', 'fire', 'water']
    ]

    const consumed = collectConsumedCells(cells, [{ col: 1, row: 1, gemType: 'bomb' }])

    expect(consumed).toEqual(expect.arrayContaining([
      { col: 1, row: 1 },
      { col: 0, row: 1 },
      { col: 1, row: 0 },
      { col: 1, row: 2 }
    ]))
    expect(consumed).not.toContainEqual({ col: 2, row: 1 })
  })

  it('expands line clear items to the whole row except blockers', () => {
    const cells = [
      ['fire', 'water', 'grass'],
      ['dark', 'lineClear', 'obstacle'],
      ['light', 'fire', 'water']
    ]

    const consumed = collectConsumedCells(cells, [{ col: 1, row: 1, gemType: 'lineClear' }])

    expect(consumed).toEqual(expect.arrayContaining([
      { col: 0, row: 1 },
      { col: 1, row: 1 }
    ]))
    expect(consumed).not.toContainEqual({ col: 2, row: 1 })
  })
})

describe('chooseObstacleCell', () => {
  it('chooses only normal elemental gems as obstacle candidates', () => {
    const cells = [
      ['obstacle', 'bomb', 'lineClear'],
      ['dark', 'fire', 'water']
    ]

    expect(chooseObstacleCell(cells, () => 0)).toEqual({ col: 0, row: 1 })
    expect(chooseObstacleCell(cells, () => 0.99)).toEqual({ col: 2, row: 1 })
  })
})

describe('accumulateWeakness', () => {
  it('tracks duplicate weakness requirements cumulatively without order', () => {
    const first = accumulateWeakness(['fire', 'fire', 'water'], {}, ['water'])
    expect(first.complete).toBe(false)
    expect(first.progress).toEqual({ water: 1 })

    const second = accumulateWeakness(['fire', 'fire', 'water'], first.progress, ['fire'])
    expect(second.complete).toBe(false)
    expect(second.progress).toEqual({ water: 1, fire: 1 })

    const third = accumulateWeakness(['fire', 'fire', 'water'], second.progress, ['dark', 'fire'])
    expect(third.complete).toBe(true)
    expect(third.progress).toEqual({})
  })

  it('tracks explicit count requirements by type', () => {
    const requirements = getWeaknessRequirements(['light', 'light', 'light', 'fire', 'fire', 'water'])
    expect(requirements).toEqual([
      { type: 'light', count: 3 },
      { type: 'fire', count: 2 },
      { type: 'water', count: 1 }
    ])

    const first = accumulateWeakness(requirements, {}, ['light', 'fire', 'dark'])
    expect(first.complete).toBe(false)
    expect(first.progress).toEqual({ light: 1, fire: 1 })

    const second = accumulateWeakness(requirements, first.progress, ['light', 'light', 'fire', 'water'])
    expect(second.complete).toBe(true)
    expect(second.progress).toEqual({})
  })
})
describe('buildCommandMatchupPreview', () => {
  it('previews the strongest enemy weakness counter before a command resolves', () => {
    const preview = buildCommandMatchupPreview(
      { name: 'Glacial Bloom', requiredGems: ['water', 'water', 'light'] },
      [
        {
          enemyData: { name: 'Cinder Wisp', weaknessGems: ['water', 'water', 'water', 'dark', 'dark'] },
          weaknessProgress: { water: 1 },
          alive: true
        },
        {
          enemyData: { name: 'Moss Imp', weaknessGems: ['fire', 'fire', 'grass'] },
          weaknessProgress: {},
          alive: true
        }
      ]
    )

    expect(preview.enemyName).toBe('Cinder Wisp')
    expect(preview.advantageGems).toEqual(['water', 'water'])
    expect(preview.countersBefore).toEqual([{ type: 'water', current: 1, required: 3 }])
    expect(preview.countersAfter).toContainEqual({ type: 'water', current: 3, required: 3 })
    expect(preview.resolvedEffect).toContain('2 Water')
    expect(preview.tacticalImplication).toContain('Dark')
  })

  it('shows a weakness break when the selected command completes every counter', () => {
    const preview = buildCommandMatchupPreview(
      { name: 'Blazing Cleave', requiredGems: ['fire', 'fire', 'grass'] },
      [{
        enemyData: { name: 'Moss Imp', weaknessGems: ['fire', 'fire', 'grass'] },
        weaknessProgress: {},
        alive: true
      }]
    )

    expect(preview.enemyName).toBe('Moss Imp')
    expect(preview.willBreakWeakness).toBe(true)
    expect(preview.countersAfter).toEqual([
      { type: 'fire', current: 2, required: 2 },
      { type: 'grass', current: 1, required: 1 }
    ])
    expect(preview.resolvedEffect).toContain('breaks weakness')
    expect(preview.tacticalImplication).toContain('attack timer reset')
  })

  it('returns neutral feedback when a command has no visible enemy counter', () => {
    const preview = buildCommandMatchupPreview(
      { name: 'Shade Step', requiredGems: ['dark', 'dark', 'fire'] },
      [{
        enemyData: { name: 'Iron Brute', weaknessGems: ['water', 'water', 'light'] },
        weaknessProgress: {},
        alive: true
      }]
    )

    expect(preview.enemyName).toBe('No direct counter')
    expect(preview.advantageGems).toEqual([])
    expect(preview.countersBefore).toEqual([])
    expect(preview.countersAfter).toEqual([])
    expect(preview.tacticalImplication).toContain('switch targets')
  })
})
describe('buildWeaknessCounterPulsePlan', () => {
  it('uses completed preview counters for the matching resolved enemy', () => {
    const preview = {
      enemyName: 'Moss Imp',
      willBreakWeakness: true,
      countersAfter: [
        { type: 'fire', current: 2, required: 2 },
        { type: 'grass', current: 1, required: 1 }
      ]
    }

    const plan = buildWeaknessCounterPulsePlan(preview, {
      enemyData: { name: 'Moss Imp' }
    }, true)

    expect(plan).toEqual({
      enemyName: 'Moss Imp',
      gemTypes: ['fire', 'grass']
    })
  })

  it('does not pulse when the preview did not complete every counter', () => {
    const preview = {
      enemyName: 'Cinder Wisp',
      willBreakWeakness: false,
      countersAfter: [
        { type: 'water', current: 2, required: 3 }
      ]
    }

    expect(buildWeaknessCounterPulsePlan(preview, {
      enemyData: { name: 'Cinder Wisp' }
    }, true)).toBeNull()
  })

  it('does not pulse for a different enemy or unresolved weakness result', () => {
    const preview = {
      enemyName: 'Moss Imp',
      willBreakWeakness: true,
      countersAfter: [
        { type: 'fire', current: 2, required: 2 }
      ]
    }

    expect(buildWeaknessCounterPulsePlan(preview, {
      enemyData: { name: 'Cinder Wisp' }
    }, true)).toBeNull()
    expect(buildWeaknessCounterPulsePlan(preview, {
      enemyData: { name: 'Moss Imp' }
    }, false)).toBeNull()
  })
})

describe('scaleEnemyForStage', () => {
  it('scales enemy max HP exponentially by stage without mutating the base enemy', () => {
    const base = { id: 'test', maxHp: 1000, attack: 10 }
    const scaled = scaleEnemyForStage(base, 5)

    expect(scaled.maxHp).toBe(Math.round(1000 * Math.pow(1.75, 4)))
    expect(scaled.baseMaxHp).toBe(1000)
    expect(base.maxHp).toBe(1000)
  })
})

describe('resolveBattleParty', () => {
  it('falls back to starter characters when battle starts without a party payload', () => {
    const fallback = resolveBattleParty([], CHARACTERS)

    expect(fallback.map(character => character.id)).toEqual(CHARACTERS.slice(0, 4).map(character => character.id))
  })

  it('keeps an explicitly selected party', () => {
    const selected = [CHARACTERS[4]]

    expect(resolveBattleParty(selected, CHARACTERS)).toEqual(selected)
  })
})

describe('getCharacterSkills', () => {
  it('returns one to three selectable skills with required gems for every character', () => {
    for (const character of CHARACTERS) {
      const skills = getCharacterSkills(character)
      expect(skills.length).toBeGreaterThanOrEqual(1)
      expect(skills.length).toBeLessThanOrEqual(3)
      for (const skill of skills) {
        expect(skill.name).toBeTruthy()
        expect(skill.requiredGems.length).toBeGreaterThan(0)
        expect(skill.requiredGems.every(isElementGem)).toBe(true)
        expect(skill.multiplier).toBeGreaterThan(1)
      }
    }
  })
})

describe('isElementGem', () => {
  it('excludes items and obstacles from elemental matching', () => {
    expect(isElementGem('fire')).toBe(true)
    expect(isElementGem('bomb')).toBe(false)
    expect(isElementGem('lineClear')).toBe(false)
    expect(isElementGem('obstacle')).toBe(false)
  })
})


