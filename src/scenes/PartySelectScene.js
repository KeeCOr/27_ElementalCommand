import Phaser from 'phaser'
import { CHARACTERS } from '../data/characters.js'
import { GEM_LABEL, GAME_WIDTH, GAME_HEIGHT, UI_FONT } from '../constants.js'

export default class PartySelectScene extends Phaser.Scene {
  constructor() { super({ key: 'PartySelectScene' }) }

  init(data) { this.stageId = data.stageId }

  create() {
    this.selectedParty = []
    this.cardMap = new Map()

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-menu')

    this.add.text(GAME_WIDTH / 2, 52, 'Assemble Party', {
      fontSize: '24px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 5
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 82, 'Pick up to four commanders', {
      fontSize: '13px',
      fontFamily: UI_FONT,
      color: '#b7c7ff'
    }).setOrigin(0.5)

    CHARACTERS.forEach((char, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 120 + col * 242
      const y = 168 + row * 132

      const card = this.add.image(x, y, 'ui-party-card')
      const hitZone = this.add.zone(x, y, 214, 116)
        .setInteractive({ useHandCursor: true })
      this.cardMap.set(char.id, card)

      this.add.image(x - 70, y + 5, `portrait-${char.id}`).setDisplaySize(62, 62)

      this.add.text(x + 24, y - 34, char.name, {
        fontSize: '13px',
        fontFamily: UI_FONT,
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      const seqStr = char.skillSequence.map(t => GEM_LABEL[t]).join('  ')
      this.add.text(x + 24, y - 11, seqStr, {
        fontSize: '13px',
        fontFamily: UI_FONT,
        color: '#d9f2ff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      this.add.text(x + 24, y + 12, char.skillName, {
        fontSize: '11px',
        fontFamily: UI_FONT,
        color: '#fff1a8'
      }).setOrigin(0.5)

      this.add.text(x + 24, y + 34, `ATK ${char.attack}  HP ${char.maxHp}`, {
        fontSize: '10px',
        fontFamily: UI_FONT,
        color: '#aab7d8'
      }).setOrigin(0.5)

      hitZone.on('pointerover', () => card.setTint(0xd8ecff))
      hitZone.on('pointerout', () => this._refreshCardTint(char.id))
      hitZone.on('pointerdown', () => this._toggleCharacter(char))
    })

    this.partyDisplay = this.add.text(GAME_WIDTH / 2, 568, 'Party: empty', {
      fontSize: '13px',
      fontFamily: UI_FONT,
      color: '#fff1a8'
    }).setOrigin(0.5)

    this.startBtn = this.add.image(GAME_WIDTH / 2, 634, 'ui-button-disabled')
      .setDisplaySize(224, 58)

    this.startHitZone = this.add.zone(GAME_WIDTH / 2, 634, 224, 58)
      .setInteractive({ useHandCursor: true })

    this.startLabel = this.add.text(GAME_WIDTH / 2, 634, 'Select Commander', {
      fontSize: '18px',
      fontFamily: UI_FONT,
      color: '#d5def4',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.startHitZone.on('pointerover', () => {
      if (this.selectedParty.length > 0) this.startBtn.setTint(0xcaffdf)
    })
    this.startHitZone.on('pointerout', () => {
      this.startBtn.clearTint()
      this._refreshStartButton()
    })
    this.startHitZone.on('pointerdown', () => {
      if (this.selectedParty.length === 0) return
      this.scene.start('BattleScene', { stageId: this.stageId, party: this.selectedParty })
    })
    this._refreshStartButton()
  }

  _toggleCharacter(char) {
    const idx = this.selectedParty.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      this.selectedParty.splice(idx, 1)
    } else {
      if (this.selectedParty.length >= 4) return
      this.selectedParty.push(char)
    }
    this._refreshCardTint(char.id)
    const names = this.selectedParty.map(c => c.name).join(', ') || 'empty'
    this.partyDisplay.setText(`Party: ${names}`)
    this._refreshStartButton()
  }

  _refreshCardTint(characterId) {
    const card = this.cardMap.get(characterId)
    if (!card) return
    const selected = this.selectedParty.some(c => c.id === characterId)
    if (selected) card.setTint(0x87ffca)
    else card.clearTint()
  }

  _refreshStartButton() {
    const ready = this.selectedParty.length > 0
    this.startBtn.setTexture(ready ? 'ui-button-ready' : 'ui-button-disabled')
    this.startLabel.setText(ready ? `Start Battle (${this.selectedParty.length})` : 'Select Commander')
    this.startLabel.setColor(ready ? '#d6ffe8' : '#d5def4')
  }
}
