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
  barracks: { main: 0x9f6a45, trim: 0xe6c28b, roof: 0xc94b3f },
  arrowTower: { main: 0x8b7351, trim: 0xf0d38a, roof: 0x3f8cff },
  manaWell: { main: 0x4c7f93, trim: 0xa7f3ff, roof: 0x6b4fd8 }
}

const HERO_ART = {
  captain: { main: 0xe65a43, trim: 0xffd37a, skin: 0xf0b178 },
  seer: { main: 0x6b4fd8, trim: 0xb8ecff, skin: 0xdca879 },
  sentinel: { main: 0x7a8796, trim: 0xd6f2ff, skin: 0xb7a98a }
}

export function createArtAssets(scene) {
  if (scene.textures.exists('bg-menu')) return

  if (hasCompleteImageArtPack(scene)) {
    createImageBackedArtAssets(scene)
    createPanelTextures(scene)
    return
  }

  validateArtManifestCoverage()
  ART_BACKGROUNDS.forEach(background => {
    createBackground(scene, background.key, background.top, background.bottom, background.accent)
  })
  createPanelTextures(scene)
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

function createScaledImageTexture(scene, sourceKey, targetKey, width, height) {
  const source = scene.textures.get(sourceKey).getSourceImage()
  const texture = scene.textures.createCanvas(targetKey, width, height)
  const ctx = texture.getContext()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, width, height)
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
  enemies = ART_ENEMIES
} = {}) {
  assertArtDefinitions('gem', gems, GEM_PALETTES)
  assertArtDefinitions('character', characters, CHARACTER_ART)
  assertArtDefinitions('enemy', enemies, ENEMY_ART)
  assertArtDefinitions('building', ART_BUILDINGS, BUILDING_ART)
  assertArtDefinitions('hero', ART_HEROES, HERO_ART)
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

function createPanelTextures(scene) {
  const g = scene.add.graphics()
  drawFrame(g, 300, 76, {
    fill: 0x101827,
    edge: 0x5ae5ff,
    accent: 0xffd46a,
    glow: 0x1d4e72
  })
  g.generateTexture('ui-stage-card', 300, 76)
  g.clear()
  drawFrame(g, 214, 116, {
    fill: 0x0e1728,
    edge: 0x8de8ff,
    accent: 0xfff1a8,
    glow: 0x213353
  })
  g.generateTexture('ui-party-card', 214, 116)
  g.clear()
  drawButton(g, 224, 58, {
    fill: 0x1d6b48,
    fill2: 0x269a67,
    edge: 0x6affb6,
    shine: 0xd8ffe9
  })
  g.generateTexture('ui-button-ready', 224, 58)
  g.clear()
  drawButton(g, 224, 58, {
    fill: 0x252f44,
    fill2: 0x313b51,
    edge: 0x77839c,
    shine: 0xe6ecff
  })
  g.generateTexture('ui-button-disabled', 224, 58)
  g.clear()
  drawFrame(g, 104, 38, {
    fill: 0x10182b,
    edge: 0xffffff,
    accent: 0x58d7ff,
    glow: 0x18294a,
    alpha: 0.9
  })
  g.generateTexture('ui-skill-card', 104, 38)
  g.clear()
  drawFrame(g, 104, 38, {
    fill: 0x1f5b4c,
    edge: 0x87ffca,
    accent: 0xfff1a8,
    glow: 0x2d765f,
    alpha: 0.98
  })
  g.generateTexture('ui-skill-card-selected', 104, 38)
  g.clear()
  drawFrame(g, 70, 70, {
    fill: 0x10182b,
    edge: 0xffffff,
    accent: 0x8de8ff,
    glow: 0x172846,
    alpha: 0.94
  })
  g.generateTexture('ui-deploy-card', 70, 70)
  g.clear()
  drawFrame(g, 70, 70, {
    fill: 0x245b4c,
    edge: 0x87ffca,
    accent: 0xfff1a8,
    glow: 0x2d765f,
    alpha: 0.98
  })
  g.generateTexture('ui-deploy-card-selected', 70, 70)
  g.clear()
  drawFrame(g, 430, 96, {
    fill: 0x07101f,
    edge: 0x58d7ff,
    accent: 0xfff1a8,
    glow: 0x0d2038,
    alpha: 0.72
  })
  g.generateTexture('ui-deploy-tray', 430, 96)
  g.clear()
  drawFrame(g, 356, 44, {
    fill: 0x07101f,
    edge: 0x58d7ff,
    accent: 0x87ffca,
    glow: 0x0d2038,
    alpha: 0.68
  })
  g.generateTexture('ui-skill-tray', 356, 44)
  g.destroy()
}

function drawFrame(g, width, height, {
  fill,
  edge,
  accent,
  glow,
  alpha = 0.92
}) {
  g.fillStyle(0x000000, 0.28).fillRoundedRect(3, 4, width - 6, height - 4, 8)
  g.fillStyle(glow, 0.42).fillRoundedRect(0, 0, width, height, 8)
  g.fillStyle(fill, alpha).fillRoundedRect(3, 3, width - 6, height - 6, 7)
  g.fillStyle(0xffffff, 0.07).fillRoundedRect(8, 7, width - 16, Math.max(10, height * 0.28), 5)
  g.lineStyle(2, edge, 0.62).strokeRoundedRect(2, 2, width - 4, height - 4, 7)
  g.lineStyle(1, 0xffffff, 0.18).strokeRoundedRect(6, 6, width - 12, height - 12, 5)
  g.fillStyle(accent, 0.72)
  g.fillTriangle(11, 6, 28, 6, 11, 23)
  g.fillTriangle(width - 11, height - 6, width - 28, height - 6, width - 11, height - 23)
}

function drawButton(g, width, height, {
  fill,
  fill2,
  edge,
  shine
}) {
  g.fillStyle(0x000000, 0.35).fillRoundedRect(4, 6, width - 8, height - 4, 9)
  g.fillStyle(fill2, 0.98).fillRoundedRect(0, 0, width, height, 9)
  g.fillStyle(fill, 1).fillRoundedRect(4, 5, width - 8, height - 10, 7)
  g.fillStyle(shine, 0.16).fillRoundedRect(10, 8, width - 20, 16, 6)
  g.lineStyle(3, edge, 0.86).strokeRoundedRect(2, 2, width - 4, height - 4, 8)
  g.lineStyle(1, 0xffffff, 0.22).strokeRoundedRect(7, 7, width - 14, height - 14, 5)
  g.fillStyle(0xffffff, 0.16)
  g.fillTriangle(16, 12, 34, 12, 16, 30)
  g.fillTriangle(width - 16, height - 12, width - 34, height - 12, width - 16, height - 30)
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
  g.fillStyle(0x000000, 0.3).fillEllipse(44, 74, 58, 14)
  g.fillStyle(palette.main, 1).fillRoundedRect(19, 34, 50, 40, 5)
  g.fillStyle(palette.roof, 1).fillTriangle(15, 38, 44, 13, 73, 38)
  g.lineStyle(3, palette.trim, 0.9).strokeTriangle(15, 38, 44, 13, 73, 38)
  g.fillStyle(0x101729, 0.75).fillRoundedRect(36, 52, 15, 22, 3)
  if (id === 'arrowTower') {
    g.fillStyle(palette.trim, 1).fillRect(27, 20, 34, 9)
    g.lineStyle(3, palette.trim, 1).lineBetween(44, 18, 44, 5)
  }
  if (id === 'manaWell') {
    g.fillStyle(0x58d7ff, 0.85).fillCircle(44, 51, 12)
    g.fillStyle(0xffffff, 0.55).fillCircle(39, 46, 4)
  }
  g.generateTexture(`building-${id}`, 88, 88)
  g.destroy()
}

function createHeroTexture(scene, id, palette) {
  const g = scene.add.graphics()
  g.fillStyle(0x000000, 0.3).fillEllipse(44, 74, 52, 14)
  g.fillStyle(palette.main, 0.25).fillCircle(44, 42, 34)
  g.lineStyle(3, palette.trim, 0.8).strokeCircle(44, 42, 31)
  g.fillStyle(palette.main, 1).fillRoundedRect(27, 40, 34, 32, 8)
  g.fillStyle(palette.skin, 1).fillCircle(44, 30, 13)
  g.fillStyle(0x101729, 0.95).fillCircle(39, 30, 2).fillCircle(49, 30, 2)
  if (id === 'captain') g.lineStyle(4, palette.trim, 1).lineBetween(25, 64, 66, 35)
  if (id === 'seer') g.fillStyle(0x58d7ff, 0.85).fillCircle(44, 55, 7)
  if (id === 'sentinel') g.fillStyle(palette.trim, 0.9).fillRoundedRect(56, 41, 10, 25, 4)
  g.generateTexture(`hero-${id}`, 88, 88)
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
