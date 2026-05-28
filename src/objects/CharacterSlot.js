import Phaser from 'phaser'
import { GEM_COLORS, UI_FONT } from '../constants.js'

const SLOT_W = 96
const SLOT_H = 118

export default class CharacterSlot extends Phaser.GameObjects.Container {
  constructor(scene, x, y, characterData) {
    super(scene, x, y)
    this.characterData = characterData
    this.hp = characterData.maxHp

    this.bg = scene.add.graphics()
    this._drawFrame(0.35)
    this.add(this.bg)

    this.portrait = scene.add.image(0, 11, `portrait-${characterData.id}`).setDisplaySize(58, 58)
    this.add(this.portrait)

    this.nameText = scene.add.text(0, -48, characterData.name, {
      fontSize: '10px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 3
    }).setOrigin(0.5)
    this.add(this.nameText)

    this.hpBarBg = scene.add.rectangle(0, -30, 78, 7, 0x111827)
    this.add(this.hpBarBg)

    this.hpBar = scene.add.rectangle(-39, -30, 78, 7, 0x44ff88).setOrigin(0, 0.5)
    this.add(this.hpBar)

    const seqLen = characterData.skillSequence.length
    this.seqIcons = characterData.skillSequence.map((type, i) => {
      const xPos = (i - (seqLen - 1) / 2) * 18
      const icon = scene.add.circle(xPos, 50, 6, GEM_COLORS[type])
        .setStrokeStyle(1, 0xffffff, 0.5)
      this.add(icon)
      return icon
    })

    this.activeBorder = scene.add.graphics()
    this.add(this.activeBorder)

    scene.add.existing(this)
  }

  setActive(active) {
    this.activeBorder.clear()
    if (active) {
      this.activeBorder.lineStyle(3, 0xffffff, 0.95).strokeRoundedRect(-SLOT_W / 2 - 4, -SLOT_H / 2 - 4, SLOT_W + 8, SLOT_H + 8, 9)
      this.activeBorder.lineStyle(7, this.characterData.color, 0.25).strokeRoundedRect(-SLOT_W / 2 - 7, -SLOT_H / 2 - 7, SLOT_W + 14, SLOT_H + 14, 12)
    }
    this._drawFrame(active ? 0.55 : 0.35)
    this.setScale(active ? 1.06 : 1)
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount)
    this._updateHpBar()
    return this.hp <= 0
  }

  _updateHpBar() {
    const ratio = this.hp / this.characterData.maxHp
    this.hpBar.setScale(ratio, 1)
    const color = ratio > 0.5 ? 0x44ff88 : ratio > 0.25 ? 0xffc857 : 0xff5b5b
    this.hpBar.setFillStyle(color)
    this.setAlpha(this.hp <= 0 ? 0.45 : 1)
  }

  _drawFrame(alpha) {
    this.bg.clear()
    this.bg.fillStyle(0x101729, 0.88).fillRoundedRect(-SLOT_W / 2, -SLOT_H / 2, SLOT_W, SLOT_H, 8)
    this.bg.lineStyle(2, this.characterData.color, alpha).strokeRoundedRect(-SLOT_W / 2, -SLOT_H / 2, SLOT_W, SLOT_H, 8)
    this.bg.fillStyle(this.characterData.color, 0.12).fillRoundedRect(-SLOT_W / 2 + 6, -SLOT_H / 2 + 7, SLOT_W - 12, 34, 6)
  }

  isDead() {
    return this.hp <= 0
  }
}
