import Phaser from 'phaser'
import { STAGES } from '../data/stages.js'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js'

export default class StageSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'StageSelectScene' }) }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    this.add.text(GAME_WIDTH / 2, 80, 'Elemental Command', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 130, '스테이지 선택', {
      fontSize: '18px', color: '#aaaaaa'
    }).setOrigin(0.5)

    STAGES.forEach((stage, i) => {
      const y = 220 + i * 90
      const btn = this.add.rectangle(GAME_WIDTH / 2, y, 300, 70, 0x2a2a4e)
        .setStrokeStyle(2, 0x4444aa)
        .setInteractive({ useHandCursor: true })

      this.add.text(GAME_WIDTH / 2, y - 14, `Stage ${stage.id}`, {
        fontSize: '13px', color: '#aaaaff'
      }).setOrigin(0.5)

      this.add.text(GAME_WIDTH / 2, y + 10, stage.name, {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5)

      btn.on('pointerover', () => btn.setFillStyle(0x3a3a6e))
      btn.on('pointerout',  () => btn.setFillStyle(0x2a2a4e))
      btn.on('pointerdown', () => this.scene.start('PartySelectScene', { stageId: stage.id }))
    })
  }
}
