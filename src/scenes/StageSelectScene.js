import Phaser from 'phaser'
import { STAGES } from '../data/stages.js'
import { GAME_WIDTH, GAME_HEIGHT, UI_FONT } from '../constants.js'
import { playAudioCue } from '../systems/AudioCues.js'
import { getUiSkinStateFrame } from '../systems/UiSkin.js'

const SURFACE_TEXTURE = 'ec-surface-frame-9s'
const STATE_TEXTURE = 'ec-state-frame-atlas'
// Phaser nineslice argument order: leftWidth, rightWidth, topHeight, bottomHeight.
const CARD_MARGINS = [24, 24, 18, 18]
const BUTTON_MARGINS = [20, 20, 14, 14]

const PANEL_DEPTH = 0
const HIGHLIGHT_DEPTH = 1
const CONTENT_DEPTH = 2
const HIT_ZONE_DEPTH = 3

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
    }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

    this.add.text(GAME_WIDTH / 2, 122, 'Choose a campaign node', {
      fontSize: '14px',
      fontFamily: UI_FONT,
      color: '#b7c7ff'
    }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

    this.add.nineslice(
      GAME_WIDTH / 2, 164, STATE_TEXTURE, getUiSkinStateFrame('ready'),
      190, 42, ...BUTTON_MARGINS
    ).setAlpha(0.72).setDepth(PANEL_DEPTH)

    this.add.text(GAME_WIDTH / 2, 164, `${STAGES.length} Stages Available`, {
      fontSize: '14px',
      fontFamily: UI_FONT,
      color: '#d6ffe8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

    STAGES.forEach((stage, i) => {
      const y = 226 + i * 88
      this.add.nineslice(
        GAME_WIDTH / 2, y, SURFACE_TEXTURE, null,
        300, 76, ...CARD_MARGINS
      ).setDepth(PANEL_DEPTH)
      const highlight = this.add.rectangle(GAME_WIDTH / 2, y, 300, 76)
        .setStrokeStyle(2, 0xcfefff, 0.85)
        .setDepth(HIGHLIGHT_DEPTH)
        .setVisible(false)
      const hitZone = this.add.zone(GAME_WIDTH / 2, y, 300, 76)
        .setDepth(HIT_ZONE_DEPTH)
        .setInteractive({ useHandCursor: true })

      this.add.text(112, y - 12, `0${stage.id}`, {
        fontSize: '20px',
        fontFamily: UI_FONT,
        color: '#58d7ff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

      this.add.text(158, y - 13, stage.name, {
        fontSize: '17px',
        fontFamily: UI_FONT,
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(CONTENT_DEPTH)

      this.add.text(158, y + 15, `${stage.enemies.length} enemies detected`, {
        fontSize: '11px',
        fontFamily: UI_FONT,
        color: '#aab7d8'
      }).setOrigin(0, 0.5).setDepth(CONTENT_DEPTH)

      stage.enemies.slice(0, 3).forEach((enemy, enemyIndex) => {
        this.add.image(320 + enemyIndex * 27, y + 2, `enemy-${enemy.id}`)
          .setDisplaySize(30, 30)
          .setAlpha(0.92)
          .setDepth(CONTENT_DEPTH)
      })

      hitZone.on('pointerover', () => highlight.setVisible(true))
      hitZone.on('pointerout', () => highlight.setVisible(false))
      hitZone.on('pointerdown', () => {
        playAudioCue(this, 'elementSelect')
        this.scene.start('PartySelectScene', { stageId: stage.id })
      })
    })
  }
}
