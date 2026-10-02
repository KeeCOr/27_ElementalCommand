import { describe, it, expect } from 'vitest'
import { getNeighbors, areNeighbors, hexToPixel, HEX_WIDTH, HEX_SPACING_X } from '../src/systems/HexGeometry.js'
import { BOARD_CONFIG } from '../src/constants.js'

const { hexRadius } = BOARD_CONFIG

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

describe('hexToPixel', () => {
  it('짝수 행(row=0)의 첫 셀은 origin에서 HEX_WIDTH*0.5, hexRadius 위치', () => {
    const { x, y } = hexToPixel(0, 0, 0, 0)
    expect(x).toBeCloseTo(HEX_WIDTH * 0.5, 5)
    expect(y).toBeCloseTo(hexRadius, 5)
  })

  it('홀수 행은 짝수 행보다 HEX_SPACING_X*0.5 오른쪽', () => {
    const even = hexToPixel(2, 0, 0, 0)
    const odd  = hexToPixel(2, 1, 0, 0)
    expect(odd.x - even.x).toBeCloseTo(HEX_SPACING_X * 0.5, 5)
  })

  it('origin 파라미터가 결과에 반영됨', () => {
    const { x, y } = hexToPixel(0, 0, 100, 200)
    expect(x).toBeCloseTo(100 + HEX_WIDTH * 0.5, 5)
    expect(y).toBeCloseTo(200 + hexRadius, 5)
  })
})
