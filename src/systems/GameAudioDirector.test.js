import { describe, expect, it, vi } from 'vitest';
import { GameAudioDirector } from './GameAudioDirector.js';

function factory(created) {
  return () => {
    const audio = { src: '', loop: false, volume: 0, currentTime: 0, paused: true, play: vi.fn(function () { this.paused = false; }), pause: vi.fn(function () { this.paused = true; }) };
    created.push(audio);
    return audio;
  };
}

describe('GameAudioDirector', () => {
  it('starts one looping BGM only after an explicit call', () => {
    const created = [], director = new GameAudioDirector({ audioFactory: factory(created), bgmUrl: '/bgm.wav', cues: {} });
    expect(created).toHaveLength(0);
    director.startFromGesture(); director.startFromGesture();
    expect(created).toHaveLength(1); expect(created[0].loop).toBe(true); expect(created[0].src).toBe('/bgm.wav');
  });
  it('keeps BGM and SFX volume controls independent', () => {
    const created = [], director = new GameAudioDirector({ audioFactory: factory(created), bgmUrl: '/bgm.wav', cues: { action: '/action.wav' } });
    director.setBgmVolume(.2); director.setSfxVolume(.7); director.startFromGesture(); director.playCue('action');
    expect(created[0].volume).toBe(.2); expect(created[1].volume).toBe(.7);
  });
  it('clamps mix levels and mutes active music safely', () => {
    const created = [], director = new GameAudioDirector({ audioFactory: factory(created), bgmUrl: '/bgm.wav', cues: {} });
    director.setBgmVolume(8); director.setSfxVolume(-3); director.startFromGesture(); director.setMuted(true);
    expect(director.settings).toEqual({ bgmVolume: 1, sfxVolume: 0, muted: true }); expect(created[0].volume).toBe(0);
  });
  it('caps simultaneous SFX at eight voices', () => {
    const created = [], director = new GameAudioDirector({ audioFactory: factory(created), bgmUrl: '/bgm.ogg', cues: { action: '/action.ogg' } });
    for (let i = 0; i < 9; i += 1) director.playCue('action');
    expect(director.activeVoiceCount).toBe(8); expect(created[0].pause).toHaveBeenCalledOnce();
  });
  it('pauses and resumes BGM across visibility changes', () => {
    const created = [], director = new GameAudioDirector({ audioFactory: factory(created), bgmUrl: '/bgm.ogg', cues: {} });
    director.startFromGesture(); director.handleVisibility(true); director.handleVisibility(false);
    expect(created[0].pause).toHaveBeenCalledOnce(); expect(created[0].play).toHaveBeenCalledTimes(2);
  });
});
