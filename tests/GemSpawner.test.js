import { describe, it, expect } from 'vitest'
import { buildWeights, spawnGem, spawnBoard } from '../src/systems/GemSpawner.js'

describe('buildWeights', () => {
  it('파티가 없으면 5속성 균등 20%', () => {
    const w = buildWeights([])
    expect(w.fire).toBeCloseTo(0.2)
    expect(w.water).toBeCloseTo(0.2)
    expect(w.grass).toBeCloseTo(0.2)
    expect(w.light).toBeCloseTo(0.2)
    expect(w.dark).toBeCloseTo(0.2)
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1.0)
  })

  it('파티 멤버 속성이 확률 상승', () => {
    const w = buildWeights([{ element: 'fire' }, { element: 'fire' }])
    expect(w.fire).toBeGreaterThan(w.water)
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1.0)
  })

  it('null 슬롯 무시', () => {
    const w = buildWeights([{ element: 'fire' }, null, null, null])
    expect(w.fire).toBeGreaterThan(w.water)
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1.0)
  })
})

describe('spawnBoard', () => {
  it('요청한 개수만큼 젬 반환', () => {
    const w = buildWeights([])
    expect(spawnBoard(30, w)).toHaveLength(30)
  })

  it('유효한 젬 타입만 반환', () => {
    const valid = new Set(['fire', 'water', 'grass', 'light', 'dark'])
    const w = buildWeights([])
    for (const gem of spawnBoard(30, w)) {
      expect(valid.has(gem)).toBe(true)
    }
  })
})
