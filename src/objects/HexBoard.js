import Phaser from 'phaser'
import Gem from './Gem.js'
import { BOARD_CONFIG, GAME_WIDTH, GEM_COLORS } from '../constants.js'
import { hexToPixel, areNeighbors, HEX_WIDTH } from '../systems/HexGeometry.js'
import { spawnBoard } from '../systems/GemSpawner.js'
import { chooseObstacleCell, collectConsumedCells, isBlocker, spawnBoardCell } from '../systems/CombatBoard.js'

const { cols, rows, hexRadius } = BOARD_CONFIG
const BOARD_ORIGIN_X = (GAME_WIDTH - cols * HEX_WIDTH) / 2
const BOARD_ORIGIN_Y = 410

export default class HexBoard extends Phaser.GameObjects.Container {
  constructor(scene, weights) {
    super(scene, 0, 0)
    this.scene = scene
    this.weights = weights
    this.gems = []
    this.dragPath = []
    this.isDragging = false

    this.boardFrame = scene.add.graphics()
    this.add(this.boardFrame)
    this._drawBoardFrame()
    scene.add.existing(this)

    this.lineGraphics = scene.add.graphics().setDepth(5)

    this._buildGrid()
    this._setupInput()
  }

  _drawBoardFrame() {
    this.boardFrame.clear()
    this.boardFrame.fillStyle(0x07101f, 0.42).fillRoundedRect(58, 362, 364, 358, 18)
    this.boardFrame.lineStyle(2, 0x58d7ff, 0.15).strokeRoundedRect(59, 363, 362, 356, 18)
  }

  _buildGrid() {
    const types = spawnBoard(cols * rows, this.weights)
    let i = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const { x, y } = hexToPixel(col, row, BOARD_ORIGIN_X, BOARD_ORIGIN_Y)
        const gem = this._createGem(x, y, types[i++], col, row)
        if (!this.gems[col]) this.gems[col] = []
        this.gems[col][row] = gem
      }
    }
  }

  _createGem(x, y, type, col, row) {
    const gem = new Gem(this.scene, x, y, type, col, row)
    gem.setInteractive(
      new Phaser.Geom.Circle(0, 0, hexRadius * 0.9),
      Phaser.Geom.Circle.Contains
    )
    return gem
  }

  _setupInput() {
    this.scene.input.on('pointerdown', (p) => {
      const gem = this._gemAtPoint(p.x, p.y)
      if (gem) this._startDrag(gem)
    })
    this.scene.input.on('pointermove', (p) => {
      if (!this.isDragging) return
      const gem = this._gemAtPoint(p.x, p.y)
      if (gem) this._extendDrag(gem)
    })
    this.scene.input.on('pointerup', () => {
      if (this.isDragging) this._endDrag()
    })
  }

  _gemAtPoint(px, py) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const gem = this.gems[col]?.[row]
        if (!gem) continue
        const dx = px - gem.x
        const dy = py - gem.y
        if (dx * dx + dy * dy <= hexRadius * hexRadius * 0.81 && !isBlocker(gem.gemType)) return gem
      }
    }
    return null
  }

  _startDrag(gem) {
    if (isBlocker(gem.gemType)) return
    this.isDragging = true
    this.dragPath = [{ col: gem.col, row: gem.row, gemType: gem.gemType }]
    gem.setHighlight(true)
    this._drawPath()
  }

  _extendDrag(gem) {
    if (isBlocker(gem.gemType)) return
    if (this.dragPath.some(p => p.col === gem.col && p.row === gem.row)) return
    const last = this.dragPath[this.dragPath.length - 1]
    if (!areNeighbors(last.col, last.row, gem.col, gem.row, cols, rows)) return

    this.dragPath.push({ col: gem.col, row: gem.row, gemType: gem.gemType })
    gem.setHighlight(true)
    this._drawPath()
  }

  _endDrag() {
    this.isDragging = false
    const path = [...this.dragPath]
    this.dragPath = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.gems[col]?.[row]?.setHighlight(false)
      }
    }
    this.lineGraphics.clear()
    this.emit('dragComplete', path)
  }

  _drawPath() {
    this.lineGraphics.clear()
    if (this.dragPath.length < 2) return
    this.lineGraphics.lineStyle(9, 0x7df9ff, 0.23)
    this._strokeDragPath()
    this.lineGraphics.lineStyle(4, 0xffffff, 0.85)
    this._strokeDragPath()
  }

  _strokeDragPath() {
    this.lineGraphics.beginPath()
    for (let i = 0; i < this.dragPath.length; i++) {
      const { col, row } = this.dragPath[i]
      const gem = this.gems[col][row]
      if (i === 0) this.lineGraphics.moveTo(gem.x, gem.y)
      else this.lineGraphics.lineTo(gem.x, gem.y)
    }
    this.lineGraphics.strokePath()
  }

  refreshBoard() {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.gems[col]?.[row]?.destroy()
      }
    }
    this.gems = []
    this._buildGrid()
  }

  consumePath(path) {
    const cells = this._cellTypes()
    const consumed = collectConsumedCells(cells, path)
    const consumedWithTypes = consumed.map(cell => ({
      ...cell,
      gemType: this.gems[cell.col]?.[cell.row]?.gemType
    }))
    for (const { col, row } of consumed) {
      this._replaceGem(col, row, spawnBoardCell(this.weights))
    }
    return consumedWithTypes
  }

  addObstacle() {
    const target = chooseObstacleCell(this._cellTypes())
    if (!target) return null
    this._replaceGem(target.col, target.row, 'obstacle')
    return target
  }

  _replaceGem(col, row, type) {
    const oldGem = this.gems[col]?.[row]
    if (!oldGem || isBlocker(oldGem.gemType)) return null
    const { x, y } = oldGem
    this._playReplacementBurst(x, y, type)
    oldGem.disableInteractive()
    oldGem.setDepth(18)
    this.scene.tweens.add({
      targets: oldGem,
      alpha: 0,
      scale: 1.34,
      angle: oldGem.angle + 8,
      duration: 150,
      ease: 'Cubic.easeOut',
      onComplete: () => oldGem.destroy()
    })

    const gem = this._createGem(x, y, type, col, row)
    gem.setAlpha(0)
    gem.setScale(0.34)
    gem.setDepth(19)
    this.scene.tweens.add({
      targets: gem,
      alpha: 1,
      scale: 1.08,
      duration: 170,
      delay: 80,
      ease: 'Back.easeOut'
    })
    this.scene.tweens.add({
      targets: gem,
      scale: 1,
      duration: 80,
      delay: 250,
      ease: 'Sine.easeOut',
      onComplete: () => gem.setDepth(0)
    })
    this.gems[col][row] = gem
    return gem
  }

  _playReplacementBurst(x, y, type) {
    const color = GEM_COLORS[type] ?? 0xffffff
    const burst = this.scene.add.graphics().setPosition(x, y).setDepth(17)
    burst.lineStyle(3, color, 0.85).strokeCircle(0, 0, 26)
    burst.lineStyle(2, 0xffffff, 0.65).strokeCircle(0, 0, 16)
    burst.lineStyle(2, color, 0.75)
    for (let i = 0; i < 6; i++) {
      const angle = Phaser.Math.DegToRad(i * 60 + 30)
      const inner = 19
      const outer = 34
      burst.lineBetween(
        Math.cos(angle) * inner,
        Math.sin(angle) * inner,
        Math.cos(angle) * outer,
        Math.sin(angle) * outer
      )
    }

    this.scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale: 1.55,
      duration: 250,
      ease: 'Cubic.easeOut',
      onComplete: () => burst.destroy()
    })
  }

  _cellTypes() {
    const cells = []
    for (let row = 0; row < rows; row++) {
      cells[row] = []
      for (let col = 0; col < cols; col++) {
        cells[row][col] = this.gems[col]?.[row]?.gemType
      }
    }
    return cells
  }
}
