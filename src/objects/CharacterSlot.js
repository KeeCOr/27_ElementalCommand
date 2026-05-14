import Phaser from 'phaser'
import { GEM_COLORS, GEM_LABEL } from '../constants.js'

const SLOT_W = 90
const SLOT_H = 100

export default class CharacterSlot extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} characterData - src/data/characters.js 항목
   */
  constructor(scene, x, y, characterData) {
    super(scene, x, y)
    this.characterData = characterData
    this.hp = characterData.maxHp

    // 배경
    this.bg = scene.add.rectangle(0, 0, SLOT_W, SLOT_H, characterData.color, 0.25)
      .setStrokeStyle(2, characterData.color)
    this.add(this.bg)

    // 이름
    this.nameText = scene.add.text(0, -40, characterData.name, {
      fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)
    this.add(this.nameText)

    // HP바 배경
    this.hpBarBg = scene.add.rectangle(0, -20, 80, 8, 0x333333)
    this.add(this.hpBarBg)

    // HP바 채우기 (왼쪽 정렬을 위해 origin 0, 0.5)
    this.hpBar = scene.add.rectangle(-40, -20, 80, 8, 0x44ff44).setOrigin(0, 0.5)
    this.add(this.hpBar)

    // HP 수치
    this.hpText = scene.add.text(0, -8, `${this.hp}`, {
      fontSize: '10px', color: '#aaffaa'
    }).setOrigin(0.5)
    this.add(this.hpText)

    // 스킬 시퀀스 아이콘
    const seqLen = characterData.skillSequence.length
    this.seqIcons = characterData.skillSequence.map((type, i) => {
      const icon = scene.add.circle(
        (i - (seqLen - 1) / 2) * 20,
        16,
        7,
        GEM_COLORS[type]
      )
      this.add(icon)
      return icon
    })

    // 활성 테두리 (기본 투명)
    this.activeBorder = scene.add.rectangle(0, 0, SLOT_W + 6, SLOT_H + 6, 0, 0)
      .setStrokeStyle(3, 0xffffff)
    this.activeBorder.setAlpha(0)
    this.add(this.activeBorder)

    scene.add.existing(this)
  }

  /** 현재 활성 캐릭터 강조 토글 */
  setActive(active) {
    this.activeBorder.setAlpha(active ? 1 : 0)
    this.setScale(active ? 1.08 : 1)
  }

  /**
   * 데미지 적용.
   * @returns {boolean} 사망 여부
   */
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount)
    this._updateHpBar()
    return this.hp <= 0
  }

  _updateHpBar() {
    const ratio = this.hp / this.characterData.maxHp
    this.hpBar.setScale(ratio, 1)
    this.hpText.setText(`${this.hp}`)
    const color = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff4444
    this.hpBar.setFillStyle(color)
  }

  isDead() {
    return this.hp <= 0
  }
}
