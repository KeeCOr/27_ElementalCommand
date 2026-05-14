import Phaser from 'phaser'
import { GEM_COLORS, GEM_LABEL, BOARD_CONFIG } from '../constants.js'

const { hexRadius } = BOARD_CONFIG

export default class Gem extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - 픽셀 중심 x
   * @param {number} y - 픽셀 중심 y
   * @param {string} gemType - 'fire' | 'water' | 'grass' | 'light' | 'dark'
   * @param {number} col - 그리드 열
   * @param {number} row - 그리드 행
   */
  constructor(scene, x, y, gemType, col, row) {
    super(scene, x, y)
    this.gemType = gemType
    this.col = col
    this.row = row

    this.hex = scene.add.graphics()
    this._drawHex(GEM_COLORS[gemType], false)
    this.add(this.hex)

    this.label = scene.add.text(0, 0, GEM_LABEL[gemType], {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.add(this.label)

    scene.add.existing(this)
  }

  _drawHex(fillColor, highlighted) {
    this.hex.clear()
    this.hex.fillStyle(fillColor, highlighted ? 0.6 : 1)
    this.hex.lineStyle(highlighted ? 3 : 2, 0xffffff, highlighted ? 1 : 0.3)
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      points.push({ x: hexRadius * Math.cos(angle), y: hexRadius * Math.sin(angle) })
    }
    this.hex.fillPoints(points, true)
    this.hex.strokePoints(points, true)
  }

  /** 드래그 경로에 포함될 때 강조 표시 */
  setHighlight(active) {
    this._drawHex(GEM_COLORS[this.gemType], active)
    this.setScale(active ? 1.12 : 1)
  }
}
