export const AUDIO_CUES = {
  elementSelect: {
    key: 'audio-element-select',
    path: 'assets/audio/kenney-interface-select-001.ogg',
    volume: 0.42
  },
  commandConfirm: {
    key: 'audio-command-confirm',
    path: 'assets/audio/kenney-digital-powerup-01.ogg',
    volume: 0.5
  },
  skillAttack: {
    key: 'audio-skill-attack',
    path: 'assets/audio/kenney-impact-punch-heavy-000.ogg',
    volume: 0.58
  },
  basicAttack: {
    key: 'audio-basic-attack',
    path: 'assets/audio/kenney-impact-generic-light-000.ogg',
    volume: 0.46
  },
  weaknessBreak: {
    key: 'audio-weakness-break',
    path: 'assets/audio/kenney-impact-bell-heavy-000.ogg',
    volume: 0.62
  },
  enemyHit: {
    key: 'audio-enemy-hit',
    path: 'assets/audio/kenney-impact-metal-medium-000.ogg',
    volume: 0.5
  },
  victory: {
    key: 'audio-victory',
    path: 'assets/audio/kenney-jingle-pizzi-00.ogg',
    volume: 0.56
  },
  defeat: {
    key: 'audio-defeat',
    path: 'assets/audio/kenney-jingle-hit-07.ogg',
    volume: 0.52
  }
}

export function preloadAudioCues(scene) {
  Object.values(AUDIO_CUES).forEach(cue => {
    scene.load.audio(cue.key, cue.path)
  })
}

export function playAudioCue(scene, cueId) {
  const cue = AUDIO_CUES[cueId]
  if (!cue || !scene?.sound?.play) return false
  scene.sound.play(cue.key, { volume: cue.volume })
  return true
}

export function selectBattleResultCue(result) {
  if (result === 'victory') return 'victory'
  if (result === 'defeat') return 'defeat'
  return null
}
