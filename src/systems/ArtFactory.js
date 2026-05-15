import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js'

const GEM_PALETTES = {
  fire: { main: 0xf25a3d, dark: 0x7b1f24, light: 0xffd18a, accent: 0xff8f2e },
  water: { main: 0x3f8cff, dark: 0x123a84, light: 0xb8ecff, accent: 0x65d7ff },
  grass: { main: 0x49c86a, dark: 0x14532c, light: 0xd5ff8f, accent: 0x8bf26a },
  light: { main: 0xffe36a, dark: 0x8a6d12, light: 0xffffff, accent: 0xfff3a6 },
  dark: { main: 0x9b5bff, dark: 0x261047, light: 0xd9b3ff, accent: 0xff65d8 }
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

export function createArtAssets(scene) {
  if (scene.textures.exists('bg-menu')) return
  createBackground(scene, 'bg-menu', 0x16152a, 0x24375c, 0x6b4fd8)
  createBackground(scene, 'bg-battle', 0x101729, 0x203646, 0x2fb6a3)
  createPanelTextures(scene)
  Object.entries(GEM_PALETTES).forEach(([type, palette]) => createGemTexture(scene, type, palette))
  Object.entries(CHARACTER_ART).forEach(([id, palette]) => createCharacterTexture(scene, id, palette))
  Object.entries(ENEMY_ART).forEach(([id, palette]) => createEnemyTexture(scene, id, palette))
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
  g.fillStyle(0x11182c, 0.92).fillRoundedRect(0, 0, 300, 76, 8)
  g.lineStyle(2, 0x58d7ff, 0.45).strokeRoundedRect(1, 1, 298, 74, 8)
  g.fillStyle(0xffffff, 0.06).fillRoundedRect(8, 7, 284, 26, 6)
  g.generateTexture('ui-stage-card', 300, 76)
  g.clear()
  g.fillStyle(0x10182b, 0.96).fillRoundedRect(0, 0, 214, 116, 8)
  g.lineStyle(2, 0xffffff, 0.28).strokeRoundedRect(1, 1, 212, 114, 8)
  g.fillStyle(0xffffff, 0.055).fillRoundedRect(8, 8, 198, 30, 6)
  g.generateTexture('ui-party-card', 214, 116)
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

function hexPoints(cx, cy, r) {
  const points = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  }
  return points
}
