import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js'
import {
  ART_BACKGROUNDS,
  ART_BUILDINGS,
  ART_CHARACTERS,
  ART_ENEMIES,
  ART_GEMS,
  ART_HEROES,
  ART_SHEET_SOURCES,
  ART_SOURCE_IMAGES
} from './AssetManifest.js'
import { getUiSkinStateFrame } from './UiSkin.js'

export const UI_SURFACE_TEXTURE_KEY = 'ec-surface-frame-9s'
export const UI_STATE_TEXTURE_KEY = 'ec-state-frame-atlas'

// [left, top, right, bottom] margins declared by the shipped PNG skin.
const UI_SURFACE_MARGINS = [24, 18, 24, 18]
const UI_STATE_MARGINS = [20, 14, 20, 14]

const GEM_PALETTES = {
  fire: { main: 0xf25a3d, dark: 0x7b1f24, light: 0xffd18a, accent: 0xff8f2e },
  water: { main: 0x3f8cff, dark: 0x123a84, light: 0xb8ecff, accent: 0x65d7ff },
  grass: { main: 0x49c86a, dark: 0x14532c, light: 0xd5ff8f, accent: 0x8bf26a },
  light: { main: 0xffe36a, dark: 0x8a6d12, light: 0xffffff, accent: 0xfff3a6 },
  dark: { main: 0x9b5bff, dark: 0x261047, light: 0xd9b3ff, accent: 0xff65d8 },
  bomb: { main: 0xff8f2e, dark: 0x6f2614, light: 0xffe0a3, accent: 0xff4438 },
  lineClear: { main: 0x58d7ff, dark: 0x124966, light: 0xe2fbff, accent: 0xffffff },
  obstacle: { main: 0x5f6470, dark: 0x20242c, light: 0xaeb6c5, accent: 0x303642 }
}

const CHARACTER_ART = {
  warrior: { main: 0xe65a43, trim: 0xffc46b, skin: 0xf0b178, mark: 0x6d1d1d },
  mage: { main: 0x4d8fff, trim: 0xc6f4ff, skin: 0xdca879, mark: 0x1c3d8f },
  ranger: { main: 0x45b764, trim: 0xd6f27a, skin: 0xc99465, mark: 0x27512f },
  paladin: { main: 0xf1d95f, trim: 0xffffff, skin: 0xf0bb86, mark: 0x7c6820 },
  assassin: { main: 0x8f50d8, trim: 0xff62d0, skin: 0xb9856d, mark: 0x24112d }
}

const ENEMY_ART = {
  goblin: { main: 0x7ec75a, trim: 0xd3f08b, eye: 0xfff06a },
  orc: { main: 0x6d7c46, trim: 0xc9a66a, eye: 0xff593d },
  darkKnight: { main: 0x34445a, trim: 0x8aa0c8, eye: 0xb85cff },
  fireSpirit: { main: 0xf26b23, trim: 0xffdb69, eye: 0xffffff },
  shadowBeast: { main: 0x241032, trim: 0x8f4bd8, eye: 0xff4cc7 }
}

const BUILDING_ART = {
  barracks: { main: 0x8f5a3c, trim: 0xf0c078, roof: 0x5a2f24 },
  arrowTower: { main: 0x5f7182, trim: 0xb9d7ee, roof: 0x33485a },
  manaWell: { main: 0x306a82, trim: 0x77e7ff, roof: 0x183548 }
}

const HERO_ART = {
  captain: { main: 0xd88a3d, trim: 0xffe0a3, mark: 0x5a2f18 },
  seer: { main: 0x6f5fd8, trim: 0xe2d4ff, mark: 0x2b174e },
  sentinel: { main: 0x73808d, trim: 0xd7e2ec, mark: 0x27313a }
}


/** Nine-sliced background surface (trays, HUD group panels). */
export function createUiSurface(scene, x, y, width, height) {
  return addNineSlice(scene, x, y, UI_SURFACE_TEXTURE_KEY, undefined, width, height, UI_SURFACE_MARGINS)
}

/** Nine-sliced state frame (cards, buttons) driven by the state atlas. */
export function createUiStateFrame(scene, x, y, width, height, state = 'normal') {
  return addNineSlice(scene, x, y, UI_STATE_TEXTURE_KEY, getUiSkinStateFrame(state), width, height, UI_STATE_MARGINS)
}

/** Swaps an existing state frame to another atlas state without resizing it. */
export function applyUiStateFrame(panel, state) {
  if (!panel) return panel
  const [left, top, right, bottom] = UI_STATE_MARGINS
  // Capture the output size first: swapping the frame can reset it to the source frame size.
  const width = panel.width
  const height = panel.height
  panel.setTexture(UI_STATE_TEXTURE_KEY, getUiSkinStateFrame(state))
  panel.setSlices(width, height, left, right, top, bottom)
  return panel
}

function addNineSlice(scene, x, y, key, frame, width, height, [left, top, right, bottom]) {
  return scene.add.nineslice(x, y, key, frame, width, height, left, right, top, bottom)
}

export function createArtAssets(scene) {
  if (scene.textures.exists('bg-menu')) return

  if (hasCompleteImageArtPack(scene)) {
    createImageBackedArtAssets(scene)
    return
  }

  validateArtManifestCoverage()
  ART_BACKGROUNDS.forEach(background => {
    createBackground(scene, background.key, background.top, background.bottom, background.accent)
  })
  ART_GEMS.forEach(gem => createGemTexture(scene, gem.id, GEM_PALETTES[gem.id]))
  createGemTexture(scene, 'bomb', GEM_PALETTES.bomb)
  createGemTexture(scene, 'lineClear', GEM_PALETTES.lineClear)
  createObstacleTexture(scene)
  ART_CHARACTERS.forEach(character => createCharacterTexture(scene, character.id, CHARACTER_ART[character.id]))
  ART_ENEMIES.forEach(enemy => createEnemyTexture(scene, enemy.id, ENEMY_ART[enemy.id]))
  ART_BUILDINGS.forEach(building => createBuildingTexture(scene, building.id, BUILDING_ART[building.id]))
  ART_HEROES.forEach(hero => createHeroTexture(scene, hero.id, HERO_ART[hero.id]))
}

function hasCompleteImageArtPack(scene) {
  const backgroundKeys = Object.values(ART_SOURCE_IMAGES).map(source => source.key)
  const sheetKeys = ART_SHEET_SOURCES.map(source => source.key)
  return [...backgroundKeys, ...sheetKeys].every(key => scene.textures.exists(key))
}

function createImageBackedArtAssets(scene) {
  Object.values(ART_SOURCE_IMAGES).forEach(source => {
    createScaledImageTexture(scene, source.key, source.targetKey, GAME_WIDTH, GAME_HEIGHT)
  })

  ART_SHEET_SOURCES.forEach(source => {
    source.targetKeys.forEach((targetKey, index) => {
      createSquareSheetTexture(scene, source.key, targetKey, index, source.targetKeys.length)
    })
  })
}

/** Centered CSS-cover crop rectangle within a sourceWidth x sourceHeight image. */
export function getCoverCropRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  ;[sourceWidth, sourceHeight, targetWidth, targetHeight].forEach(value => {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('getCoverCropRect requires positive, finite dimensions')
    }
  })

  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
  const width = targetWidth / scale
  const height = targetHeight / scale

  return {
    x: (sourceWidth - width) / 2,
    y: (sourceHeight - height) / 2,
    width,
    height
  }
}

function createScaledImageTexture(scene, sourceKey, targetKey, width, height) {
  const source = scene.textures.get(sourceKey).getSourceImage()
  const texture = scene.textures.createCanvas(targetKey, width, height)
  const ctx = texture.getContext()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  const crop = getCoverCropRect(source.width, source.height, width, height)
  ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height)
  texture.refresh()
}

function createSquareSheetTexture(scene, sourceKey, targetKey, index, frameCount) {
  const source = scene.textures.get(sourceKey).getSourceImage()
  const frameWidth = source.width / frameCount
  const side = Math.min(frameWidth, source.height)
  const sx = index * frameWidth + (frameWidth - side) / 2
  const sy = (source.height - side) / 2
  const texture = scene.textures.createCanvas(targetKey, 128, 128)
  const ctx = texture.getContext()
  ctx.clearRect(0, 0, 128, 128)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, sx, sy, side, side, 0, 0, 128, 128)
  texture.refresh()
}

export function validateArtManifestCoverage({
  gems = ART_GEMS,
  characters = ART_CHARACTERS,
  enemies = ART_ENEMIES,
  buildings = ART_BUILDINGS,
  heroes = ART_HEROES
} = {}) {
  assertArtDefinitions('gem', gems, GEM_PALETTES)
  assertArtDefinitions('character', characters, CHARACTER_ART)
  assertArtDefinitions('enemy', enemies, ENEMY_ART)
  assertArtDefinitions('building', buildings, BUILDING_ART)
  assertArtDefinitions('hero', heroes, HERO_ART)
}

function assertArtDefinitions(label, entries, definitions) {
  const missing = entries
    .map(entry => entry.id)
    .filter(id => !definitions[id])

  if (missing.length > 0) {
    throw new Error(`Missing procedural art definition for ${label}: ${missing.join(', ')}`)
  }
}

function createBackground(scene, key, topColor, bottomColor, accentColor) {
  const g = scene.add.graphics()
  g.fillStyle(topColor, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  for (let i = 0; i < 18; i++) {
    const y = Math.floor((GAME_HEIGHT / 18) * i)
    g.fillStyle(bottomColor, 0.025 + i * 0.002).fillRect(0, y, GAME_WIDTH, GAME_HEIGHT / 14)
  }
  g.fillStyle(accentColor, 0.12).fillCircle(70, 110, 110)
  g.fillStyle(0xffffff, 0.04).fillCircle(390, 170, 150)
  g.fillStyle(0x000000, 0.18).fillRect(0, 690, GAME_WIDTH, 164)
  for (let i = 0; i < 42; i++) {
    const x = (i * 83) % GAME_WIDTH
    const y = 36 + ((i * 47) % 260)
    g.fillStyle(0xffffff, 0.12 + (i % 4) * 0.03).fillCircle(x, y, 1 + (i % 3))
  }
  g.generateTexture(key, GAME_WIDTH, GAME_HEIGHT)
  g.destroy()
}

function createGemTexture(scene, type, palette) {
  const g = scene.add.graphics()
  const pts = hexPoints(40, 40, 34)
  g.fillStyle(0x000000, 0.35).fillPoints(hexPoints(42, 45, 34), true)
  g.fillStyle(palette.dark, 1).fillPoints(pts, true)
  g.fillStyle(palette.main, 1).fillPoints(hexPoints(40, 38, 29), true)
  g.lineStyle(3, palette.light, 0.85).strokePoints(pts, true)
  g.lineStyle(2, 0xffffff, 0.25).strokePoints(hexPoints(40, 38, 23), true)
  g.fillStyle(palette.accent, 0.9).fillCircle(30, 28, 9)
  g.fillStyle(0xffffff, 0.55).fillEllipse(49, 28, 18, 7)
  g.generateTexture(`gem-${type}`, 80, 80)
  g.destroy()
}

function createObstacleTexture(scene) {
  const g = scene.add.graphics()
  const pts = hexPoints(40, 40, 34)
  g.fillStyle(0x000000, 0.45).fillPoints(hexPoints(42, 45, 34), true)
  g.fillStyle(GEM_PALETTES.obstacle.dark, 1).fillPoints(pts, true)
  g.fillStyle(GEM_PALETTES.obstacle.main, 1).fillPoints(hexPoints(40, 38, 29), true)
  g.lineStyle(3, GEM_PALETTES.obstacle.light, 0.7).strokePoints(pts, true)
  g.lineStyle(4, 0x232832, 0.95).lineBetween(27, 29, 53, 55)
  g.lineBetween(53, 29, 27, 55)
  g.generateTexture('gem-obstacle', 80, 80)
  g.destroy()
}

function createCharacterTexture(scene, id, palette) {
  const g = scene.add.graphics()
  g.fillStyle(0x000000, 0.28).fillEllipse(48, 82, 56, 16)
  g.fillStyle(palette.main, 0.28).fillCircle(48, 48, 42)
  g.lineStyle(3, palette.trim, 0.55).strokeCircle(48, 48, 39)
  g.fillStyle(palette.main, 1).fillRoundedRect(27, 42, 42, 38, 10)
  g.fillStyle(palette.skin, 1).fillCircle(48, 35, 17)
  g.fillStyle(palette.mark, 1).fillCircle(41, 35, 2).fillCircle(55, 35, 2)
  g.lineStyle(4, palette.trim, 1).lineBetween(27, 69, 69, 48)
  g.fillStyle(0xffffff, 0.24).fillRoundedRect(34, 47, 28, 9, 4)
  g.generateTexture(`portrait-${id}`, 96, 96)
  g.destroy()
}

function createEnemyTexture(scene, id, palette) {
  const g = scene.add.graphics()
  g.fillStyle(0x000000, 0.35).fillEllipse(55, 92, 68, 18)
  g.fillStyle(palette.main, 1).fillEllipse(55, 52, 54, 68)
  g.fillStyle(palette.trim, 0.95).fillTriangle(23, 46, 40, 18, 45, 50)
  g.fillTriangle(87, 46, 70, 18, 65, 50)
  g.fillStyle(palette.eye, 1).fillCircle(43, 45, 5).fillCircle(67, 45, 5)
  g.lineStyle(4, 0x000000, 0.25).strokeEllipse(55, 52, 54, 68)
  g.lineStyle(3, palette.trim, 0.8).lineBetween(38, 68, 72, 68)
  g.generateTexture(`enemy-${id}`, 110, 110)
  g.destroy()
}

function createBuildingTexture(scene, id, palette) {
  const g = scene.add.graphics()
  g.fillStyle(0x000000, 0.3).fillEllipse(48, 78, 62, 14)
  g.fillStyle(palette.main, 1).fillRoundedRect(24, 38, 52, 38, 6)
  g.fillStyle(palette.roof, 1).fillTriangle(18, 40, 48, 16, 82, 40)
  g.lineStyle(3, palette.trim, 0.82).strokeRoundedRect(24, 38, 52, 38, 6)
  g.fillStyle(palette.trim, 0.75).fillRect(43, 54, 10, 22)
  g.generateTexture(`building-${id}`, 96, 96)
  g.destroy()
}

function createHeroTexture(scene, id, palette) {
  const g = scene.add.graphics()
  g.fillStyle(0x000000, 0.28).fillEllipse(48, 82, 56, 14)
  g.fillStyle(palette.main, 1).fillRoundedRect(28, 42, 40, 36, 10)
  g.fillStyle(palette.trim, 1).fillCircle(48, 34, 17)
  g.fillStyle(palette.mark, 1).fillCircle(42, 34, 3).fillCircle(56, 34, 3)
  g.lineStyle(4, palette.trim, 0.9).lineBetween(30, 66, 68, 44)
  g.generateTexture(`hero-${id}`, 96, 96)
  g.destroy()
}

function hexPoints(cx, cy, r) {
  const points = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  }
  return points
}
