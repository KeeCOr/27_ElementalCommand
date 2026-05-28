import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const enemySlotSource = readFileSync('src/objects/EnemySlot.js', 'utf8')

describe('EnemySlot damage feedback', () => {
  it('returns the enemy portrait to centered x after hit tween feedback', () => {
    const hasCenteredYoyoTween = /x:\s*\{\s*from:\s*0,\s*to:\s*-4\s*\}[\s\S]*?yoyo:\s*true/.test(enemySlotSource)
    const hasExplicitReset = /onComplete:\s*\(\)\s*=>\s*\{\s*this\.body\.x\s*=\s*0\s*\}/.test(enemySlotSource)

    expect(hasCenteredYoyoTween || hasExplicitReset).toBe(true)
  })
})

describe('EnemySlot attack tuning', () => {
  it('charges attacks three times slower and deals three times damage', () => {
    expect(enemySlotSource).toMatch(/ATTACK_INTERVAL_MULTIPLIER\s*=\s*3/)
    expect(enemySlotSource).toMatch(/ATTACK_DAMAGE_MULTIPLIER\s*=\s*3/)
    expect(enemySlotSource).toMatch(/attackInterval\s*\*\s*ATTACK_INTERVAL_MULTIPLIER/)
    expect(enemySlotSource).toMatch(/attack\s*\*\s*ATTACK_DAMAGE_MULTIPLIER/)
  })

  it('resets the attack timer when weakness breaks', () => {
    expect(enemySlotSource).toMatch(/this\.attackTimer\s*=\s*0/)
    expect(enemySlotSource).toMatch(/this\.timerBar\.setScale\(0,\s*1\)/)
  })
})

describe('EnemySlot weakness display', () => {
  it('renders count-based weakness progress labels', () => {
    expect(enemySlotSource).toMatch(/getWeaknessRequirements/)
    expect(enemySlotSource).toMatch(/\$\{progress\}\/\$\{entry\.count\}/)
    expect(enemySlotSource).toMatch(/progressText\.setText/)
  })
})
