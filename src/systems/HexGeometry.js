import { BOARD_CONFIG } from '../constants.js'

const { hexRadius } = BOARD_CONFIG

export const HEX_WIDTH     = Math.sqrt(3) * hexRadius  // 수평 중심 간격
export const HEX_HEIGHT    = 2 * hexRadius
export const HEX_SPACING_X = HEX_WIDTH
export const HEX_SPACING_Y = hexRadius * 1.5           // 수직 중심 간격

/**
 * 그리드 (col, row) → 픽셀 중심 (x, y) 변환.
 * odd-r offset: 홀수 행은 HEX_WIDTH * 0.5 오른쪽으로 이동.
 */
export function hexToPixel(col, row, originX, originY) {
  const offset = (row % 2 === 1) ? HEX_SPACING_X * 0.5 : 0
  const x = originX + col * HEX_SPACING_X + offset + HEX_WIDTH * 0.5
  const y = originY + row * HEX_SPACING_Y + hexRadius
  return { x, y }
}

/**
 * (col, row) 의 이웃 셀 목록. 보드 범위 밖 제거.
 * @returns {Array<[number, number]>}
 */
export function getNeighbors(col, row, cols, rows) {
  const isOdd = row % 2 === 1
  const candidates = isOdd
    ? [
        [col,     row - 1],
        [col + 1, row - 1],
        [col - 1, row    ],
        [col + 1, row    ],
        [col,     row + 1],
        [col + 1, row + 1]
      ]
    : [
        [col - 1, row - 1],
        [col,     row - 1],
        [col - 1, row    ],
        [col + 1, row    ],
        [col - 1, row + 1],
        [col,     row + 1]
      ]
  return candidates.filter(([c, r]) => c >= 0 && c < cols && r >= 0 && r < rows)
}

/** 두 셀이 이웃인지 확인 */
export function areNeighbors(col1, row1, col2, row2, cols, rows) {
  return getNeighbors(col1, row1, cols, rows).some(([c, r]) => c === col2 && r === row2)
}
