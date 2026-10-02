import { GEM_TYPES } from '../constants.js'

/**
 * 파티 구성 기반 젬 타입 가중치 맵 생성.
 * @param {Array} party - 캐릭터 오브젝트 배열 (null 허용)
 * @returns {{ fire, water, grass, light, dark }} 합계 1.0
 */
export function buildWeights(party) {
  const base = { fire: 20, water: 20, grass: 20, light: 20, dark: 20 }
  for (const char of party) {
    if (char && base[char.element] !== undefined) {
      base[char.element] += 8
    }
  }
  const total = Object.values(base).reduce((a, b) => a + b, 0)
  const weights = {}
  for (const [k, v] of Object.entries(base)) {
    weights[k] = v / total
  }
  return weights
}

/**
 * 가중치 기반으로 젬 타입 1개 랜덤 반환.
 * @param {Object} weights - buildWeights() 결과
 * @returns {string} gem type
 */
export function spawnGem(weights) {
  const rand = Math.random()
  let cumulative = 0
  for (const type of GEM_TYPES) {
    cumulative += weights[type]
    if (rand < cumulative) return type
  }
  return GEM_TYPES[GEM_TYPES.length - 1]
}

/**
 * 보드 전체 젬 타입 배열 생성.
 * @param {number} count
 * @param {Object} weights - buildWeights() 결과
 * @returns {string[]}
 */
export function spawnBoard(count, weights) {
  return Array.from({ length: count }, () => spawnGem(weights))
}
