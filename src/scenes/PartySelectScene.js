import Phaser from 'phaser'
import { CHARACTERS } from '../data/characters.js'
import { GEM_LABEL, GAME_WIDTH, GAME_HEIGHT, UI_FONT, GEM_COLORS } from '../constants.js'

const ELEMENT_HEX = {
  fire: '#ff6655', water: '#55aaff', grass: '#55cc66', light: '#ffee55', dark: '#cc77ff'
}
const ELEMENT_LABEL = {
  fire: '🔥', water: '💧', grass: '🌿', light: '⚡', dark: '🌑'
}

export default class PartySelectScene extends Phaser.Scene {
  constructor() { super({ key: 'PartySelectScene' }) }

  init(data) { this.stageId = data.stageId }

  create() {
    this.selectedParty = []
    this.cardMap = new Map()

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-menu')

    this.add.text(GAME_WIDTH / 2, 34, 'Assemble Party', {
      fontSize: '22px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 5
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 60, 'Pick up to four commanders', {
      fontSize: '12px',
      fontFamily: UI_FONT,
      color: '#b7c7ff'
    }).setOrigin(0.5)

    // ── Mini affinity bar ───────────────────────────────────────────────────
    this._buildMiniAffinityBar(78)

    CHARACTERS.forEach((char, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 120 + col * 242
      const y = 222 + row * 132

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

      // Element badge on top-right corner of card
      const elemHex = ELEMENT_HEX[char.element] || '#ffffff'
      const elemColor = Phaser.Display.Color.HexStringToColor(elemHex).color
      const badge = this.add.graphics()
      badge.fillStyle(elemColor, 0.9).fillCircle(x + 93, y - 48, 8)
      badge.lineStyle(1.5, 0xffffff, 0.6).strokeCircle(x + 93, y - 48, 8)
      this.add.text(x + 93, y - 48, ELEMENT_LABEL[char.element] || '', {
        fontSize: '9px', fontFamily: UI_FONT
      }).setOrigin(0.5)

      card.on('pointerover', () => card.setTint(0xd8ecff))
      card.on('pointerout', () => this._refreshCardTint(char.id))
      card.on('pointerdown', () => this._toggleCharacter(char))
    })

    this.partyDisplay = this.add.text(GAME_WIDTH / 2, 622, 'Party: empty', {
      fontSize: '13px',
      fontFamily: UI_FONT,
      color: '#fff1a8'
    }).setOrigin(0.5)

    this.startBtn = this.add.rectangle(GAME_WIDTH / 2, 690, 224, 58, 0x1d6b48, 0.9)
      .setStrokeStyle(2, 0x6affb6)
      .setInteractive({ useHandCursor: true })

    this.add.text(GAME_WIDTH / 2, 690, 'Start Battle', {
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

  // ── Mini element affinity reminder bar ────────────────────────────────────
  _buildMiniAffinityBar(topY) {
    const panelW = 440
    const panelH = 52
    const cx = GAME_WIDTH / 2

    const bg = this.add.graphics()
    bg.fillStyle(0x0a0f1e, 0.85).fillRoundedRect(cx - panelW / 2, topY, panelW, panelH, 6)
    bg.lineStyle(1.5, 0x6b4fd8, 0.45).strokeRoundedRect(cx - panelW / 2 + 1, topY + 1, panelW - 2, panelH - 2, 6)

    this.add.text(cx - panelW / 2 + 10, topY + 7, 'AFFINITY: Strong → ', {
      fontSize: '9px', fontFamily: UI_FONT, color: '#8899cc'
    })

    // Inline chain:  🔥→🌿  💧→🔥  🌿→💧  |  ⚡→🌑  🌑→⚡
    const chain = [
      { atk: 'fire', def: 'grass' },
      { atk: 'water', def: 'fire' },
      { atk: 'grass', def: 'water' }
    ]
    const light = [
      { atk: 'light', def: 'dark' },
      { atk: 'dark', def: 'light' }
    ]

    let startX = cx - panelW / 2 + 10
    const rowY = topY + 26

    chain.forEach((pair, i) => {
      const x = startX + i * 86
      const atkHex = ELEMENT_HEX[pair.atk]
      const defHex = ELEMENT_HEX[pair.def]
      const atkColor = Phaser.Display.Color.HexStringToColor(atkHex).color
      const defColor = Phaser.Display.Color.HexStringToColor(defHex).color

      const g = this.add.graphics()
      g.fillStyle(atkColor, 0.85).fillCircle(x + 8, rowY + 7, 7)
      g.fillStyle(defColor, 0.85).fillCircle(x + 50, rowY + 7, 7)

      this.add.text(x + 8, rowY + 7, ELEMENT_LABEL[pair.atk], { fontSize: '8px', fontFamily: UI_FONT }).setOrigin(0.5)
      this.add.text(x + 20, rowY, '→', { fontSize: '11px', fontFamily: UI_FONT, color: '#6aff9a' })
      this.add.text(x + 50, rowY + 7, ELEMENT_LABEL[pair.def], { fontSize: '8px', fontFamily: UI_FONT }).setOrigin(0.5)
    })

    // Separator
    const sepX = startX + chain.length * 86 + 4
    const sg = this.add.graphics()
    sg.lineStyle(1, 0x445577, 0.8).lineBetween(sepX, topY + 8, sepX, topY + panelH - 8)

    light.forEach((pair, i) => {
      const x = sepX + 12 + i * 86
      const atkHex = ELEMENT_HEX[pair.atk]
      const defHex = ELEMENT_HEX[pair.def]
      const atkColor = Phaser.Display.Color.HexStringToColor(atkHex).color
      const defColor = Phaser.Display.Color.HexStringToColor(defHex).color

      const g = this.add.graphics()
      g.fillStyle(atkColor, 0.85).fillCircle(x + 8, rowY + 7, 7)
      g.fillStyle(defColor, 0.85).fillCircle(x + 50, rowY + 7, 7)

      this.add.text(x + 8, rowY + 7, ELEMENT_LABEL[pair.atk], { fontSize: '8px', fontFamily: UI_FONT }).setOrigin(0.5)
      this.add.text(x + 20, rowY, '→', { fontSize: '11px', fontFamily: UI_FONT, color: '#6aff9a' })
      this.add.text(x + 50, rowY + 7, ELEMENT_LABEL[pair.def], { fontSize: '8px', fontFamily: UI_FONT }).setOrigin(0.5)
    })
  }
}
