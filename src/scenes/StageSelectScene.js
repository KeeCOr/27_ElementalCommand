import Phaser from 'phaser'
import { STAGES } from '../data/stages.js'
import { GAME_WIDTH, GAME_HEIGHT, UI_FONT } from '../constants.js'

export default class StageSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'StageSelectScene' }) }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-menu')

    this.add.text(GAME_WIDTH / 2, 78, 'Elemental Command', {
      fontSize: '30px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 5
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 122, 'Choose a campaign node', {
      fontSize: '14px',
      fontFamily: UI_FONT,
      color: '#b7c7ff'
    }).setOrigin(0.5)

    STAGES.forEach((stage, i) => {
      const y = 210 + i * 88
      const card = this.add.image(GAME_WIDTH / 2, y, 'ui-stage-card')
        .setInteractive({ useHandCursor: true })

      this.add.text(112, y - 12, `0${stage.id}`, {
        fontSize: '20px',
        fontFamily: UI_FONT,
        color: '#58d7ff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      this.add.text(GAME_WIDTH / 2, y - 12, stage.name, {
        fontSize: '17px',
        fontFamily: UI_FONT,
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      this.add.text(GAME_WIDTH / 2, y + 15, `${stage.enemies.length} enemies detected`, {
        fontSize: '11px',
        fontFamily: UI_FONT,
        color: '#aab7d8'
      }).setOrigin(0.5)

      card.on('pointerover', () => card.setTint(0xcfefff))
      card.on('pointerout', () => card.clearTint())
      card.on('pointerdown', () => this.scene.start('PartySelectScene', { stageId: stage.id }))
    })
  }
}
