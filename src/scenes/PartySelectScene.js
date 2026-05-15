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

      card.on('pointerover', () => card.setTint(0xd8ecff))
      card.on('pointerout', () => this._refreshCardTint(char.id))
      card.on('pointerdown', () => this._toggleCharacter(char))
    })

    this.partyDisplay = this.add.text(GAME_WIDTH / 2, 568, 'Party: empty', {
      fontSize: '13px',
      fontFamily: UI_FONT,
      color: '#fff1a8'
    }).setOrigin(0.5)

    this.startBtn = this.add.rectangle(GAME_WIDTH / 2, 634, 224, 58, 0x1d6b48, 0.9)
      .setStrokeStyle(2, 0x6affb6)
      .setInteractive({ useHandCursor: true })

    this.add.text(GAME_WIDTH / 2, 634, 'Start Battle', {
      fontSize: '20px',
      fontFamily: UI_FONT,
      color: '#d6ffe8',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.startBtn.on('pointerover', () => this.startBtn.setFillStyle(0x238b60))
    this.startBtn.on('pointerout', () => this.startBtn.setFillStyle(0x1d6b48, 0.9))
    this.startBtn.on('pointerdown', () => {
      if (this.selectedParty.length === 0) return
      this.scene.start('BattleScene', { stageId: this.stageId, party: this.selectedParty })
    })
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
  }

  _refreshCardTint(characterId) {
    const card = this.cardMap.get(characterId)
    if (!card) return
    const selected = this.selectedParty.some(c => c.id === characterId)
    if (selected) card.setTint(0x87ffca)
    else card.clearTint()
  }
}
