import Phaser from 'phaser'
import { GEM_LABEL, BOARD_CONFIG, UI_FONT } from '../constants.js'

const { hexRadius } = BOARD_CONFIG

export default class Gem extends Phaser.GameObjects.Container {
  constructor(scene, x, y, gemType, col, row) {
    super(scene, x, y)
    this.gemType = gemType
    this.col = col
    this.row = row

    this.sprite = scene.add.image(0, 0, `gem-${gemType}`).setDisplaySize(hexRadius * 2.12, hexRadius * 2.12)
    this.add(this.sprite)

    this.highlightRing = scene.add.graphics()
    this.add(this.highlightRing)

    this.label = scene.add.text(0, 1, GEM_LABEL[gemType], {
      fontSize: '14px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#111827',
      strokeThickness: 3
    }).setOrigin(0.5)
    this.add(this.label)

    scene.add.existing(this)
  }

  setHighlight(active) {
    this.highlightRing.clear()
    if (active) {
      this.highlightRing.lineStyle(4, 0xffffff, 0.95).strokeCircle(0, 0, hexRadius * 0.95)
      this.highlightRing.lineStyle(8, 0x8fffff, 0.25).strokeCircle(0, 0, hexRadius * 1.03)
    }
    this.sprite.setAlpha(active ? 1 : 0.96)
    this.setScale(active ? 1.12 : 1)
  }
}
