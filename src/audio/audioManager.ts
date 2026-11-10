/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Enjin Audio Prosedural Web Audio API
 * Muzik Alam Semula Jadi, Suasana Ambien, Kesan Bunyi (SFX) & Pijakan Kaki
 */

import { AudioSettings, WeatherType, ZoneId } from '../types/game.ts';
import { ttsEngine } from './ttsService.ts';

class ProceduralAudioManager {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master Gain & Bus Sub-Gains
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private weatherGain: GainNode | null = null;

  // State
  private isDucking = false;
  private currentZone: ZoneId = 'PINTU_MASUK';
  private currentWeather: WeatherType = 'cerah';
  private bgmIntervalId: number | null = null;
  private ambientIntervalId: number | null = null;
  private weatherNoiseNode: AudioNode | null = null;

  public settings: AudioSettings = {
    masterVolume: 0.8,
    bgmVolume: 0.6,
    sfxVolume: 0.85,
    ambientVolume: 0.7,
    voiceVolume: 1.0,
    isMuted: false,
    subtitlesEnabled: true,
    preferredVoice: 'ms-MY-YasminNeural',
  };

  constructor() {
    ttsEngine.setDuckingCallback((ducking) => {
      this.isDucking = ducking;
      this.updateBgmDucking();
    });
  }

  /**
   * Permulaan Web Audio selepas interaksi pengguna (User Gesture)
   */
  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.settings.isMuted ? 0 : this.settings.masterVolume,
        this.ctx.currentTime
      );
      this.masterGain.connect(this.ctx.destination);

      // Sub-Gains
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.settings.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.settings.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.weatherGain = this.ctx.createGain();
      this.weatherGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.weatherGain.connect(this.masterGain);

      this.isInitialized = true;

      // Mulakan gelung muzik & ambien prosedur
      this.startBgmLoop();
      this.startAmbientGenerators();
      this.updateWeatherAmbience();
    } catch (e) {
      console.warn('Web Audio init postponed until gesture', e);
    }
  }

  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(
      this.settings.isMuted ? 0 : this.settings.masterVolume,
      t,
      0.05
    );
    if (this.bgmGain) {
      const targetBgm = this.isDucking ? this.settings.bgmVolume * 0.25 : this.settings.bgmVolume;
      this.bgmGain.gain.setTargetAtTime(targetBgm, t, 0.1);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(this.settings.sfxVolume, t, 0.05);
    }
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(this.settings.ambientVolume, t, 0.05);
    }
  }

  private updateBgmDucking() {
    if (!this.ctx || !this.bgmGain) return;
    const t = this.ctx.currentTime;
    const target = this.isDucking ? this.settings.bgmVolume * 0.25 : this.settings.bgmVolume;
    this.bgmGain.gain.setTargetAtTime(target, t, 0.15);
  }

  public setZone(zone: ZoneId) {
    if (this.currentZone !== zone) {
      this.currentZone = zone;
    }
  }

  public setWeather(weather: WeatherType) {
    this.currentWeather = weather;
    this.updateWeatherAmbience();
  }

  /**
   * Muzik Latar Belakang Prosedural Berteraskan Melodi Alam Semula Jadi Pentatonik
   */
  private startBgmLoop() {
    if (this.bgmIntervalId) return;

    // Skala Pentatonik C (C4, D4, E4, G4, A4, C5, D5, E5)
    const baseFreqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    let step = 0;

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.settings.isMuted) return;

      // Pilih not mengikut corak zon
      let noteIndex = 0;
      let duration = 0.6;
      let volume = 0.08;

      if (this.currentZone === 'HUTAN_HIJAU') {
        const forestPattern = [0, 2, 4, 3, 5, 4, 2, 1];
        noteIndex = forestPattern[step % forestPattern.length];
        duration = 0.9;
        volume = 0.06;
      } else if (this.currentZone === 'SUNGAI_LESTARI') {
        const riverPattern = [4, 5, 7, 5, 3, 2, 0, 2];
        noteIndex = riverPattern[step % riverPattern.length];
        duration = 1.1;
        volume = 0.05;
      } else if (this.currentZone === 'PUSAT_KITAR_SEMULA') {
        const recyclePattern = [1, 3, 5, 2, 4, 1, 3, 6];
        noteIndex = recyclePattern[step % recyclePattern.length];
        duration = 0.45;
        volume = 0.07;
      } else {
        const entrancePattern = [0, 3, 4, 5, 4, 3, 2, 0];
        noteIndex = entrancePattern[step % entrancePattern.length];
        duration = 0.75;
        volume = 0.06;
      }

      this.playSynthNote(baseFreqs[noteIndex % baseFreqs.length], duration, volume);
      step++;
    }, 600);
  }

  private playSynthNote(freq: number, duration: number, peakVol: number) {
    if (!this.ctx || !this.bgmGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Filter lembut menyerupai seruling kayu / marimba
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, t + duration);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(peakVol, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * Penjana Bunyi Ambien (Kicauan Burung, Desiran Angin, Air Sungai)
   */
  private startAmbientGenerators() {
    if (this.ambientIntervalId) return;

    this.ambientIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.ambientGain || this.settings.isMuted) return;

      // Kicauan burung hutan rawak
      if (
        this.currentZone === 'HUTAN_HIJAU' ||
        this.currentZone === 'PINTU_MASUK' ||
        this.currentZone === 'KAWASAN_PEMULIHARAAN'
      ) {
        if (Math.random() < 0.65) {
          this.playBirdChirp();
        }
      }

      // Percikan air di zon sungai
      if (this.currentZone === 'SUNGAI_LESTARI' && Math.random() < 0.5) {
        this.playWaterSplash();
      }
    }, 2800);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 2200 + Math.random() * 800;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 600, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(startFreq - 200, t + 0.16);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.03, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  private playWaterSplash() {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.18);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * Audio Spatial Berjarak 3D (Distance & Panning Attenuation)
   */
  public playPositionalSound(
    type: 'waterfall' | 'bird' | 'water_splash' | 'discovery',
    sourceX: number,
    sourceZ: number,
    playerX: number,
    playerZ: number,
    maxDistance: number = 32
  ) {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const dx = sourceX - playerX;
    const dz = sourceZ - playerZ;
    const distance = Math.hypot(dx, dz);
    if (distance > maxDistance) return;

    const volumeScale = Math.max(0, 1 - distance / maxDistance);
    const pan = Math.max(-1, Math.min(1, dx / 16));

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    let panNode: StereoPannerNode | null = null;
    if (typeof this.ctx.createStereoPanner === 'function') {
      panNode = this.ctx.createStereoPanner();
      panNode.pan.setValueAtTime(pan, t);
    }

    if (type === 'waterfall' || type === 'water_splash') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.25);
      gain.gain.setValueAtTime(0.08 * volumeScale, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(1600, t + 0.15);
      gain.gain.setValueAtTime(0.06 * volumeScale, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    }

    if (panNode) {
      osc.connect(gain);
      gain.connect(panNode);
      panNode.connect(this.sfxGain);
    } else {
      osc.connect(gain);
      gain.connect(this.sfxGain);
    }

    osc.start(t);
    osc.stop(t + 0.32);
  }

  /**
   * Ambien Cuaca (Hujan Lehat & Gemuruh Jauh / Angin Kencang)
   */
  private updateWeatherAmbience() {
    if (!this.ctx || !this.weatherGain) return;
    const t = this.ctx.currentTime;

    if (this.currentWeather === 'hujan') {
      this.weatherGain.gain.setTargetAtTime(this.settings.ambientVolume * 0.5, t, 0.5);
      if (!this.weatherNoiseNode) {
        this.weatherNoiseNode = this.createRainNoiseNode();
      }
    } else if (this.currentWeather === 'berangin') {
      this.weatherGain.gain.setTargetAtTime(this.settings.ambientVolume * 0.35, t, 0.5);
    } else {
      this.weatherGain.gain.setTargetAtTime(0, t, 0.5);
    }
  }

  private createRainNoiseNode(): AudioNode | null {
    if (!this.ctx || !this.weatherGain) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.weatherGain);
    noise.start();
    return noise;
  }

  // ==========================================
  // KESAN BUNYI TINDAKAN (ACTION SFX)
  // ==========================================

  public playFootstep(surface: 'grass' | 'stone' | 'wood' = 'grass') {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (surface === 'wood') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
      filter.frequency.setValueAtTime(350, t);
    } else if (surface === 'stone') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.05);
      filter.frequency.setValueAtTime(800, t);
    } else {
      // Grass
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);
      filter.frequency.setValueAtTime(250, t);
    }

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playJump() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.18);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playLand() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playVocabularyCollected() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.38);
      }, idx * 90);
    });
  }

  public playCorrectAnswer() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const freqs = [587.33, 880.0]; // D5, A5
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.45);
      }, i * 110);
    });
  }

  public playWrongAnswer() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.2);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  public playTrashPickup() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playTreePlanted() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const t = this.ctx.currentTime;
    const freqs = [330, 440, 550, 660];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.35);
      }, i * 80);
    });
  }

  public playRiverRestored() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const t = this.ctx.currentTime;
    const freqs = [523, 659, 784, 1046, 1318];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.55);
      }, i * 100);
    });
  }

  public playMissionFanfare() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const chords = [
      [392, 493.88, 587.33], // G major
      [440, 554.37, 659.25], // A major
      [523.25, 659.25, 783.99], // C major
      [587.33, 739.99, 880.0, 1174.66], // D major full
    ];

    chords.forEach((chord, step) => {
      setTimeout(() => {
        const ctx = this.ctx;
        const sfxGain = this.sfxGain;
        if (!ctx || !sfxGain) return;
        const now = ctx.currentTime;
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.65);
        });
      }, step * 220);
    });
  }

  /**
   * Bunyi Haiwan untuk Permainan Teka Kicauan Burung
   */
  public playSpecificBirdCall(type: 'flute_trill' | 'deep_resonant' | 'whoop_call' | 'croak_rhythm') {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    if (type === 'deep_resonant') {
      // Enggang Badak (Kok-kok-kaah)
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(180, t + 0.2);
      osc.frequency.exponentialRampToValueAtTime(95, t + 0.6);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.75);
    } else if (type === 'flute_trill') {
      // Murai Batu (melodic trill)
      const freqs = [1800, 2200, 1950, 2400, 2100, 2600, 2200];
      freqs.forEach((f, i) => {
        setTimeout(() => {
          if (!this.ctx || !this.sfxGain) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.14);
        }, i * 65);
      });
    } else if (type === 'whoop_call') {
      // Ungka (whoop swoop)
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.35);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.65);

      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.8);
    } else if (type === 'croak_rhythm') {
      // Katak Pokok (croak croak)
      [0, 140, 280].forEach((delay) => {
        setTimeout(() => {
          if (!this.ctx || !this.sfxGain) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.linearRampToValueAtTime(120, now + 0.08);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.12);
        }, delay);
      });
    }
  }
}

export const audioManager = new ProceduralAudioManager();
