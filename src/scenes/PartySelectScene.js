import Phaser from 'phaser'
import { CHARACTERS } from '../data/characters.js'
import { GEM_LABEL, GAME_WIDTH, GAME_HEIGHT, UI_FONT } from '../constants.js'
import { playAudioCue } from '../systems/AudioCues.js'
import { getUiSkinStateFrame } from '../systems/UiSkin.js'

const SURFACE_TEXTURE = 'ec-surface-frame-9s'
const STATE_TEXTURE = 'ec-state-frame-atlas'
// Phaser nineslice argument order: leftWidth, rightWidth, topHeight, bottomHeight.
const CARD_MARGINS = [24, 24, 18, 18]
const BUTTON_MARGINS = [20, 20, 14, 14]
const CARD_HOVER_COLOR = 0xd8ecff
const CARD_SELECTED_COLOR = 0x87ffca

const PANEL_DEPTH = 0
const HIGHLIGHT_DEPTH = 1
const CONTENT_DEPTH = 2
const HIT_ZONE_DEPTH = 3

export default class PartySelectScene extends Phaser.Scene {
  constructor() { super({ key: 'PartySelectScene' }) }

  init(data) { this.stageId = data.stageId }

  create() {
    this.selectedParty = []
    this.cardMap = new Map()
    this.startState = null

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-menu')

    this.add.text(GAME_WIDTH / 2, 52, 'Assemble Party', {
      fontSize: '24px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

    this.add.text(GAME_WIDTH / 2, 82, 'Pick up to four commanders', {
      fontSize: '13px',
      fontFamily: UI_FONT,
      color: '#b7c7ff'
    }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

    CHARACTERS.forEach((char, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 120 + col * 242
      const y = 168 + row * 132

      const card = this.add.nineslice(
        x, y, SURFACE_TEXTURE, null,
        214, 116, ...CARD_MARGINS
      ).setDepth(PANEL_DEPTH)
      const highlight = this.add.rectangle(x, y, 214, 116)
        .setStrokeStyle(2, CARD_HOVER_COLOR, 0.85)
        .setDepth(HIGHLIGHT_DEPTH)
        .setVisible(false)
      const hitZone = this.add.zone(x, y, 214, 116)
        .setDepth(HIT_ZONE_DEPTH)
        .setInteractive({ useHandCursor: true })
      this.cardMap.set(char.id, { card, highlight, hovered: false })

      this.add.image(x - 70, y + 5, `portrait-${char.id}`)
        .setDisplaySize(62, 62)
        .setDepth(CONTENT_DEPTH)

      this.add.text(x + 24, y - 34, char.name, {
        fontSize: '13px',
        fontFamily: UI_FONT,
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

      const seqStr = char.skillSequence.map(t => GEM_LABEL[t]).join('  ')
      this.add.text(x + 24, y - 11, seqStr, {
        fontSize: '13px',
        fontFamily: UI_FONT,
        color: '#d9f2ff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

      this.add.text(x + 24, y + 12, char.skillName, {
        fontSize: '11px',
        fontFamily: UI_FONT,
        color: '#fff1a8'
      }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

      this.add.text(x + 24, y + 34, `ATK ${char.attack}  HP ${char.maxHp}`, {
        fontSize: '10px',
        fontFamily: UI_FONT,
        color: '#aab7d8'
      }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

      hitZone.on('pointerover', () => this._setCardHover(char.id, true))
      hitZone.on('pointerout', () => this._setCardHover(char.id, false))
      hitZone.on('pointerdown', () => this._toggleCharacter(char))
    })

    this.partyDisplay = this.add.text(GAME_WIDTH / 2, 568, 'Party: empty', {
      fontSize: '13px',
      fontFamily: UI_FONT,
      color: '#fff1a8'
    }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

    this.startBtn = this.add.nineslice(
      GAME_WIDTH / 2, 634, STATE_TEXTURE, getUiSkinStateFrame('disabled'),
      224, 58, ...BUTTON_MARGINS
    ).setDepth(PANEL_DEPTH)
    this.startState = 'disabled'

    this.startHighlight = this.add.rectangle(GAME_WIDTH / 2, 634, 224, 58)
      .setStrokeStyle(2, 0xcaffdf, 0.9)
      .setDepth(HIGHLIGHT_DEPTH)
      .setVisible(false)

    this.startHitZone = this.add.zone(GAME_WIDTH / 2, 634, 224, 58)
      .setDepth(HIT_ZONE_DEPTH)
      .setInteractive({ useHandCursor: true })

    this.startLabel = this.add.text(GAME_WIDTH / 2, 634, 'Select Commander', {
      fontSize: '18px',
      fontFamily: UI_FONT,
      color: '#d5def4',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

    this.startHitZone.on('pointerover', () => {
      if (this.selectedParty.length > 0) this.startHighlight.setVisible(true)
    })
    this.startHitZone.on('pointerout', () => {
      this.startHighlight.setVisible(false)
      this._refreshStartButton()
    })
    this.startHitZone.on('pointerdown', () => {
      if (this.selectedParty.length === 0) return
      playAudioCue(this, 'commandConfirm')
      this.scene.start('BattleScene', { stageId: this.stageId, party: this.selectedParty })
    })
    this._refreshStartButton()
  }

  _toggleCharacter(char) {
    playAudioCue(this, 'elementSelect')
    const idx = this.selectedParty.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      this.selectedParty.splice(idx, 1)
    } else {
      if (this.selectedParty.length >= 4) return
      this.selectedParty.push(char)
    }
    this._refreshCardState(char.id)
    const names = this.selectedParty.map(c => c.name).join(', ') || 'empty'
    this.partyDisplay.setText(`Party: ${names}`)
    this._refreshStartButton()
  }

  _setCardHover(characterId, hovered) {
    const entry = this.cardMap.get(characterId)
    if (!entry) return
    entry.hovered = hovered
    this._refreshCardState(characterId)
  }

  _refreshCardState(characterId) {
    const entry = this.cardMap.get(characterId)
    if (!entry) return
    const selected = this.selectedParty.some(c => c.id === characterId)
    entry.highlight
      .setStrokeStyle(2, selected ? CARD_SELECTED_COLOR : CARD_HOVER_COLOR, 0.85)
      .setVisible(selected || entry.hovered)
  }

  _refreshStartButton() {
    const ready = this.selectedParty.length > 0
    this._applyStartState(ready ? 'ready' : 'disabled')
    this.startLabel.setText(ready ? `Start Battle (${this.selectedParty.length})` : 'Select Commander')
    this.startLabel.setColor(ready ? '#d6ffe8' : '#d5def4')
  }

  _applyStartState(state) {
    if (this.startState === state) return
    this.startState = state
    // Capture the output size first: swapping the frame can reset it to the source frame size.
    const width = this.startBtn.width
    const height = this.startBtn.height
    this.startBtn.setTexture(STATE_TEXTURE, getUiSkinStateFrame(state))
    this.startBtn.setSlices(width, height, ...BUTTON_MARGINS)
  }
}
