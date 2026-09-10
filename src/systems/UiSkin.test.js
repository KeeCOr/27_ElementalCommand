import { describe, expect, it } from 'vitest';
import { UI_SKIN_ASSETS, UI_SKIN_STATE_FRAMES, getUiSkinStateFrame } from './UiSkin.js';

function assetByKey(key) {
  return UI_SKIN_ASSETS.find((asset) => asset.key === key);
}

describe('UiSkin', () => {
  it('declares the surface frame as a nine-sliced image with exact insets', () => {
    expect(assetByKey('ec-surface-frame-9s')).toEqual({
      key: 'ec-surface-frame-9s',
      type: 'image',
      path: 'assets/ec-surface-frame-9s.png',
      nineSlice: [24, 18, 24, 18]
    });
  });
  it('declares the state atlas as a sprite sheet whose frames map every UI state', () => {
    const atlas = assetByKey('ec-state-frame-atlas');
    expect(atlas.type).toBe('spritesheet');
    expect(atlas.path).toBe('assets/ec-state-frame-atlas.png');
    expect(atlas.frameConfig).toEqual({ frameWidth: 256, frameHeight: 80 });
    expect(atlas.states).toBe(UI_SKIN_STATE_FRAMES);
    expect(UI_SKIN_STATE_FRAMES).toEqual({ normal: 0, selected: 1, ready: 2, disabled: 3 });
    for (const [state, frame] of Object.entries(UI_SKIN_STATE_FRAMES)) expect(getUiSkinStateFrame(state)).toBe(frame);
  });
  it('falls back to the normal frame for unknown or non-numeric states', () => {
    expect(getUiSkinStateFrame('hovered')).toBe(UI_SKIN_STATE_FRAMES.normal);
    expect(getUiSkinStateFrame(undefined)).toBe(UI_SKIN_STATE_FRAMES.normal);
    expect(getUiSkinStateFrame(null)).toBe(UI_SKIN_STATE_FRAMES.normal);
    expect(getUiSkinStateFrame('')).toBe(UI_SKIN_STATE_FRAMES.normal);
    expect(getUiSkinStateFrame('toString')).toBe(UI_SKIN_STATE_FRAMES.normal);
  });
});
