import { GEM_TYPES } from '../constants.js'
import { areNeighbors } from './HexGeometry.js'
import { spawnGem } from './GemSpawner.js'

export const SPECIAL_ITEM_CHANCES = {
  bomb: 0.04,
  lineClear: 0.03
}

export const OBSTACLE = 'obstacle'
export const BOMB = 'bomb'
export const LINE_CLEAR = 'lineClear'
export const STAGE_HP_GROWTH = 1.75

export function isElementGem(type) {
  return GEM_TYPES.includes(type)
}

export function isBlocker(type) {
  return type === OBSTACLE
}

export function spawnBoardCell(weights, rng = Math.random) {
  const roll = rng()
  if (roll < SPECIAL_ITEM_CHANCES.bomb) return BOMB
  if (roll < SPECIAL_ITEM_CHANCES.bomb + SPECIAL_ITEM_CHANCES.lineClear) return LINE_CLEAR
  return spawnGem(weights)
}

export function collectConsumedCells(cells, path) {
  const consumed = new Map()
  const rows = cells.length
  const cols = cells[0]?.length || 0

  const add = (col, row) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return
    if (isBlocker(cells[row][col])) return
    consumed.set(`${col},${row}`, { col, row })
  }

  for (const cell of path) {
    add(cell.col, cell.row)
    if (cell.gemType === BOMB) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (areNeighbors(cell.col, cell.row, col, row, cols, rows)) add(col, row)
        }
      }
    }
    if (cell.gemType === LINE_CLEAR) {
      for (let col = 0; col < cols; col++) add(col, cell.row)
    }
  }

  return [...consumed.values()].sort((a, b) => a.row - b.row || a.col - b.col)
}

export function chooseObstacleCell(cells, rng = Math.random) {
  const candidates = []
  for (let row = 0; row < cells.length; row++) {
    for (let col = 0; col < (cells[row]?.length || 0); col++) {
      if (isElementGem(cells[row][col])) candidates.push({ col, row })
    }
  }
  if (candidates.length === 0) return null
  const index = Math.min(Math.floor(rng() * candidates.length), candidates.length - 1)
  return candidates[index]
}

export function accumulateWeakness(weaknessGems, progress, destroyedTypes) {
  const requirements = Array.isArray(weaknessGems) && weaknessGems.every(entry => entry && typeof entry === 'object' && 'type' in entry)
    ? weaknessGems
    : getWeaknessRequirements(weaknessGems)
  const required = Object.fromEntries(requirements.map(({ type, count }) => [type, count]))
  const next = { ...progress }
  for (const type of destroyedTypes) {
    if (!required[type]) continue
    next[type] = Math.min((next[type] || 0) + 1, required[type])
  }

  const complete = Object.entries(required).every(([type, count]) => (next[type] || 0) >= count)
  return {
    complete,
    progress: complete ? {} : next
  }
}

export function getWeaknessRequirements(weaknessGems) {
  if (!weaknessGems) return []
  if (Array.isArray(weaknessGems)) {
    if (weaknessGems.every(entry => entry && typeof entry === 'object' && 'type' in entry && 'count' in entry)) {
      return weaknessGems.map(entry => ({ type: entry.type, count: entry.count }))
    }
    return Object.entries(countTypes(weaknessGems)).map(([type, count]) => ({ type, count }))
  }
  return Object.entries(weaknessGems).map(([type, count]) => ({ type, count }))
}

export function scaleEnemyForStage(enemyData, stageId) {
  const stageIndex = Math.max(0, (stageId || 1) - 1)
  const baseMaxHp = enemyData.baseMaxHp || enemyData.maxHp
  return {
    ...enemyData,
    baseMaxHp,
    maxHp: Math.round(baseMaxHp * Math.pow(STAGE_HP_GROWTH, stageIndex))
  }
}

export function getCharacterSkills(character) {
  if (Array.isArray(character.skills) && character.skills.length > 0) {
    return character.skills.slice(0, 3)
  }
  return [{
    id: `${character.id}-skill`,
    name: character.skillName,
    requiredGems: character.skillSequence,
    multiplier: character.skillMultiplier
  }]
}

export function resolveBattleParty(party, roster, maxSize = 4) {
  if (Array.isArray(party) && party.length > 0) return party.slice(0, maxSize)
  return roster.slice(0, maxSize)
}

function countTypes(types) {
  const counts = {}
  for (const type of types || []) {
    counts[type] = (counts[type] || 0) + 1
  }
  return counts
}
