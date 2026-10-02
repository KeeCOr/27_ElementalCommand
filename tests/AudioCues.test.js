import { describe, expect, it, vi } from 'vitest'
import {
  AUDIO_CUES,
  preloadAudioCues,
  playAudioCue,
  selectBattleResultCue
} from '../src/systems/AudioCues.js'

describe('AudioCues', () => {
  it('maps battle feedback events to Kenney ogg assets', () => {
    expect(Object.keys(AUDIO_CUES)).toEqual([
      'elementSelect',
      'commandConfirm',
      'skillAttack',
      'basicAttack',
      'weaknessBreak',
      'enemyHit',
      'victory',
      'defeat'
    ])
    expect(AUDIO_CUES.elementSelect.path).toBe('assets/audio/kenney-interface-select-001.ogg')
    expect(AUDIO_CUES.commandConfirm.path).toBe('assets/audio/kenney-digital-powerup-01.ogg')
    expect(AUDIO_CUES.weaknessBreak.path).toBe('assets/audio/kenney-impact-bell-heavy-000.ogg')
    expect(AUDIO_CUES.victory.path).toBe('assets/audio/kenney-jingle-pizzi-00.ogg')
  })

  it('preloads every cue with the runtime key and asset path', () => {
    const scene = {
      load: {
        audio: vi.fn()
      }
    }

    preloadAudioCues(scene)

    expect(scene.load.audio).toHaveBeenCalledTimes(Object.keys(AUDIO_CUES).length)
    expect(scene.load.audio).toHaveBeenCalledWith('audio-element-select', 'assets/audio/kenney-interface-select-001.ogg')
    expect(scene.load.audio).toHaveBeenCalledWith('audio-defeat', 'assets/audio/kenney-jingle-hit-07.ogg')
  })

  it('plays known cues safely and ignores unknown cues', () => {
    const scene = {
      sound: {
        play: vi.fn()
      }
    }

    expect(playAudioCue(scene, 'skillAttack')).toBe(true)
    expect(scene.sound.play).toHaveBeenCalledWith('audio-skill-attack', { volume: 0.58 })

    expect(playAudioCue(scene, 'missingCue')).toBe(false)
    expect(scene.sound.play).toHaveBeenCalledTimes(1)
  })

  it('selects result jingles from battle result state', () => {
    expect(selectBattleResultCue('victory')).toBe('victory')
    expect(selectBattleResultCue('defeat')).toBe('defeat')
    expect(selectBattleResultCue('other')).toBeNull()
  })
})
