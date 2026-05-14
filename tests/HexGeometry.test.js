import { describe, it, expect } from 'vitest'
import { getNeighbors, areNeighbors } from '../src/systems/HexGeometry.js'

const COLS = 5, ROWS = 6

describe('getNeighbors', () => {
  it('중앙 셀은 이웃 6개', () => {
    expect(getNeighbors(2, 2, COLS, ROWS)).toHaveLength(6)
  })

  it('모서리 셀은 이웃 6개 미만', () => {
    expect(getNeighbors(0, 0, COLS, ROWS).length).toBeLessThan(6)
  })

  it('모든 이웃은 보드 범위 내', () => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        for (const [c, r] of getNeighbors(col, row, COLS, ROWS)) {
          expect(c).toBeGreaterThanOrEqual(0)
          expect(c).toBeLessThan(COLS)
          expect(r).toBeGreaterThanOrEqual(0)
          expect(r).toBeLessThan(ROWS)
        }
      }
    }
  })
})

describe('areNeighbors', () => {
  it('인접 셀은 이웃', () => {
    expect(areNeighbors(2, 2, 3, 2, COLS, ROWS)).toBe(true)
  })

  it('자기 자신은 이웃 아님', () => {
    expect(areNeighbors(2, 2, 2, 2, COLS, ROWS)).toBe(false)
  })

  it('멀리 떨어진 셀은 이웃 아님', () => {
    expect(areNeighbors(0, 0, 4, 5, COLS, ROWS)).toBe(false)
  })
})
