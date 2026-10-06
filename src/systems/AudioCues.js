export const AUDIO_CUES = {
  elementSelect: {
    key: 'audio-element-select',
    path: 'assets/audio/ec-element-select-v1.wav',
    volume: 0.42
  },
  commandConfirm: {
    key: 'audio-command-confirm',
    path: 'assets/audio/ec-command-confirm-v1.wav',
    volume: 0.5
  },
  skillAttack: {
    key: 'audio-skill-attack',
    path: 'assets/audio/ec-skill-attack-v1.wav',
    volume: 0.58
  },
  basicAttack: {
    key: 'audio-basic-attack',
    path: 'assets/audio/ec-basic-attack-v1.wav',
    volume: 0.46
  },
  weaknessBreak: {
    key: 'audio-weakness-break',
    path: 'assets/audio/ec-weakness-break-v1.wav',
    volume: 0.62
  },
  enemyHit: {
    key: 'audio-enemy-hit',
    path: 'assets/audio/ec-enemy-hit-v1.wav',
    volume: 0.5
  },
  victory: {
    key: 'audio-victory',
    path: 'assets/audio/ec-victory-v1.wav',
    volume: 0.56
  },
  defeat: {
    key: 'audio-defeat',
    path: 'assets/audio/ec-defeat-v1.wav',
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
