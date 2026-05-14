import Phaser from 'phaser'
import Gem from './Gem.js'
import { BOARD_CONFIG, GAME_WIDTH, GAME_HEIGHT } from '../constants.js'
import { hexToPixel, areNeighbors, HEX_WIDTH, HEX_SPACING_Y } from '../systems/HexGeometry.js'
import { spawnBoard } from '../systems/GemSpawner.js'

const { cols, rows, hexRadius } = BOARD_CONFIG

// 보드 좌상단 기준점 (픽셀)
const BOARD_ORIGIN_X = (GAME_WIDTH - cols * HEX_WIDTH) / 2
const BOARD_ORIGIN_Y = 400   // 플레이테스트 후 조정

export default class HexBoard extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} weights - buildWeights() 결과
   */
  constructor(scene, weights) {
    super(scene, 0, 0)
    this.scene = scene
    this.weights = weights

    // gems[col][row] = Gem
    this.gems = []
    // 드래그 경로: [{col, row, gemType}]
    this.dragPath = []
    this.isDragging = false

    this.lineGraphics = scene.add.graphics().setDepth(5)

    this._buildGrid()
    this._setupInput()

    scene.add.existing(this)
  }

  _buildGrid() {
    const types = spawnBoard(cols * rows, this.weights)
    let i = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const { x, y } = hexToPixel(col, row, BOARD_ORIGIN_X, BOARD_ORIGIN_Y)
        const gem = new Gem(this.scene, x, y, types[i++], col, row)
        gem.setInteractive(
          new Phaser.Geom.Circle(0, 0, hexRadius * 0.9),
          Phaser.Geom.Circle.Contains
        )
        if (!this.gems[col]) this.gems[col] = []
        this.gems[col][row] = gem
      }
    }
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
        if (dx * dx + dy * dy <= hexRadius * hexRadius * 0.81) return gem
      }
    }
    return null
  }

  _startDrag(gem) {
    this.isDragging = true
    this.dragPath = [{ col: gem.col, row: gem.row, gemType: gem.gemType }]
    gem.setHighlight(true)
    this._drawPath()
  }

  _extendDrag(gem) {
    // 이미 경로에 포함된 젬은 무시
    if (this.dragPath.some(p => p.col === gem.col && p.row === gem.row)) return
    // 마지막 젬의 이웃이어야 함
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

    // 하이라이트 해제
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.gems[col]?.[row]?.setHighlight(false)
      }
    }
    this.lineGraphics.clear()

    // dragComplete 이벤트로 경로 전달
    this.emit('dragComplete', path)
  }

  _drawPath() {
    this.lineGraphics.clear()
    if (this.dragPath.length < 2) return
    this.lineGraphics.lineStyle(5, 0xffffff, 0.7)
    this.lineGraphics.beginPath()
    for (let i = 0; i < this.dragPath.length; i++) {
      const { col, row } = this.dragPath[i]
      const gem = this.gems[col][row]
      if (i === 0) this.lineGraphics.moveTo(gem.x, gem.y)
      else         this.lineGraphics.lineTo(gem.x, gem.y)
    }
    this.lineGraphics.strokePath()
  }

  /** 보드를 새로 스폰 (전투 종료 또는 리셋 시 사용) */
  refreshBoard() {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.gems[col]?.[row]?.destroy()
      }
    }
    this.gems = []
    this._buildGrid()
  }
}
