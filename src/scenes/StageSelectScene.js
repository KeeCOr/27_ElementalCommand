import Phaser from 'phaser'
import { STAGES } from '../data/stages.js'
import { GAME_WIDTH, GAME_HEIGHT, UI_FONT, GEM_COLORS, AFFINITY_CHART } from '../constants.js'

// Element display config
const ELEMENT_CONFIG = {
  fire:  { label: 'Fire',  symbol: '🔥', hex: '#ff6655' },
  water: { label: 'Water', symbol: '💧', hex: '#55aaff' },
  grass: { label: 'Grass', symbol: '🌿', hex: '#55cc66' },
  light: { label: 'Light', symbol: '⚡', hex: '#ffee55' },
  dark:  { label: 'Dark',  symbol: '🌑', hex: '#cc77ff' }
}

export default class StageSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'StageSelectScene' }) }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-menu')

    // ── Title ──────────────────────────────────────────────────────────────
    this.add.text(GAME_WIDTH / 2, 52, 'Elemental Command', {
      fontSize: '28px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 5
    }).setOrigin(0.5)

    // ── How to play guide ──────────────────────────────────────────────────
    this._buildHowToPlay(76)

    // ── Element affinity chart ─────────────────────────────────────────────
    this._buildAffinityChart(284)

    // ── Stage list ─────────────────────────────────────────────────────────
    this.add.text(GAME_WIDTH / 2, 490, 'Choose a campaign node', {
      fontSize: '13px',
      fontFamily: UI_FONT,
      color: '#b7c7ff'
    }).setOrigin(0.5)

    STAGES.forEach((stage, i) => {
      const y = 530 + i * 60
      if (y > GAME_HEIGHT - 30) return
      const card = this.add.image(GAME_WIDTH / 2, y, 'ui-stage-card')
        .setInteractive({ useHandCursor: true })
        .setDisplaySize(340, 52)

      this.add.text(112, y - 8, `0${stage.id}`, {
        fontSize: '18px',
        fontFamily: UI_FONT,
        color: '#58d7ff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      this.add.text(GAME_WIDTH / 2, y - 8, stage.name, {
        fontSize: '15px',
        fontFamily: UI_FONT,
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      this.add.text(GAME_WIDTH / 2, y + 12, `${stage.enemies.length} enemies detected`, {
        fontSize: '10px',
        fontFamily: UI_FONT,
        color: '#aab7d8'
      }).setOrigin(0.5)

      card.on('pointerover', () => card.setTint(0xcfefff))
      card.on('pointerout', () => card.clearTint())
      card.on('pointerdown', () => this.scene.start('PartySelectScene', { stageId: stage.id }))
    })
  }

  // ── How To Play panel ────────────────────────────────────────────────────
  _buildHowToPlay(topY) {
    const panelW = 440
    const panelH = 104
    const cx = GAME_WIDTH / 2
    const cy = topY + panelH / 2

    // Panel background
    const bg = this.add.graphics()
    bg.fillStyle(0x0c1120, 0.88).fillRoundedRect(cx - panelW / 2, topY, panelW, panelH, 8)
    bg.lineStyle(2, 0x4a7bc8, 0.5).strokeRoundedRect(cx - panelW / 2 + 1, topY + 1, panelW - 2, panelH - 2, 8)

    this.add.text(cx, topY + 12, 'HOW TO PLAY', {
      fontSize: '11px', fontFamily: UI_FONT, color: '#7ab8ff', fontStyle: 'bold'
    }).setOrigin(0.5)

    const tips = [
      '① Drag gems on the hex board to create a path',
      '② Match your commander\'s sequence → Fire skill (3× damage!)',
      '③ Place same-element commanders side by side for synergy'
    ]
    tips.forEach((tip, i) => {
      this.add.text(cx - 200, topY + 32 + i * 22, tip, {
        fontSize: '11px', fontFamily: UI_FONT, color: '#d8e8ff'
      })
    })

    void cy // suppress unused warning
  }

  // ── Element affinity chart ───────────────────────────────────────────────
  _buildAffinityChart(topY) {
    const panelW = 440
    const panelH = 188
    const cx = GAME_WIDTH / 2

    const bg = this.add.graphics()
    bg.fillStyle(0x0a0f1e, 0.9).fillRoundedRect(cx - panelW / 2, topY, panelW, panelH, 8)
    bg.lineStyle(2, 0x6b4fd8, 0.55).strokeRoundedRect(cx - panelW / 2 + 1, topY + 1, panelW - 2, panelH - 2, 8)

    this.add.text(cx, topY + 13, 'ELEMENT AFFINITY', {
      fontSize: '11px', fontFamily: UI_FONT, color: '#c09cff', fontStyle: 'bold'
    }).setOrigin(0.5)

    // Triangle cycle  (fire→grass→water→fire) + light↔dark
    const cycleRows = [
      { atk: 'fire',  def: 'grass', label: '🔥 Fire  →  🌿 Grass (×1.5)' },
      { atk: 'grass', def: 'water', label: '🌿 Grass →  💧 Water (×1.5)' },
      { atk: 'water', def: 'fire',  label: '💧 Water →  🔥 Fire  (×1.5)' },
      { atk: 'light', def: 'dark',  label: '⚡ Light  →  🌑 Dark  (×1.5)' },
      { atk: 'dark',  def: 'light', label: '🌑 Dark   →  ⚡ Light (×1.5)' }
    ]

    cycleRows.forEach((row, i) => {
      const col = i < 3 ? 0 : 1
      const rowIdx = i < 3 ? i : i - 3
      const x = cx - panelW / 2 + 20 + col * 220
      const y = topY + 34 + rowIdx * 22

      const atkCfg = ELEMENT_CONFIG[row.atk]
      const defCfg = ELEMENT_CONFIG[row.def]

      // Attacker color badge
      const atkCircle = this.add.graphics()
      atkCircle.fillStyle(Phaser.Display.Color.HexStringToColor(atkCfg.hex).color, 1).fillCircle(x + 7, y + 7, 7)

      this.add.text(x + 18, y, `${atkCfg.label}`, {
        fontSize: '11px', fontFamily: UI_FONT, color: atkCfg.hex
      })

      this.add.text(x + 18 + 46, y, ` → `, {
        fontSize: '11px', fontFamily: UI_FONT, color: '#ffffff'
      })

      // Defender color badge
      const defCircle = this.add.graphics()
      defCircle.fillStyle(Phaser.Display.Color.HexStringToColor(defCfg.hex).color, 1).fillCircle(x + 95, y + 7, 7)

      this.add.text(x + 106, y, `${defCfg.label}`, {
        fontSize: '11px', fontFamily: UI_FONT, color: defCfg.hex
      })

      this.add.text(x + 106 + 36, y, `×1.5`, {
        fontSize: '10px', fontFamily: UI_FONT, color: '#6aff9a', fontStyle: 'bold'
      })
    })

    // Divider line between columns
    const divX = cx + 2
    const g2 = this.add.graphics()
    g2.lineStyle(1, 0x334466, 0.8).lineBetween(divX, topY + 28, divX, topY + panelH - 8)

    // Placement strategy hint
    this.add.text(cx, topY + panelH - 28, '💡 Tip: Place same-element commanders in the same row for gem synergy', {
      fontSize: '10px', fontFamily: UI_FONT, color: '#8fd8ff',
      wordWrap: { width: panelW - 24 }
    }).setOrigin(0.5)
  }
}
