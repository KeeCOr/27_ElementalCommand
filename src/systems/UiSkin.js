export const UI_SKIN_STATE_FRAMES = {
  normal: 0,
  selected: 1,
  ready: 2,
  disabled: 3
}

export const UI_SKIN_ASSETS = [
  {
    key: 'ec-surface-frame-9s',
    type: 'image',
    path: 'assets/ec-surface-frame-9s.png',
    nineSlice: [24, 18, 24, 18]
  },
  {
    key: 'ec-state-frame-atlas',
    type: 'spritesheet',
    path: 'assets/ec-state-frame-atlas.png',
    frameConfig: { frameWidth: 256, frameHeight: 80 },
    states: UI_SKIN_STATE_FRAMES
  }
]

export function getUiSkinStateFrame(state) {
  const frame = UI_SKIN_STATE_FRAMES[state]
  return typeof frame === 'number' ? frame : UI_SKIN_STATE_FRAMES.normal
}
