/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Sistem Teks-ke-Pertuturan (TTS) Bahasa Melayu Standard Malaysia
 * Azure Cognitive Speech + Web Speech API Fallback
 */

export interface TtsSpeakOptions {
  text: string;
  voiceName?: 'ms-MY-YasminNeural' | 'ms-MY-OsmanNeural';
  pitch?: number; // 0.5 to 1.5
  rate?: number; // 0.8 to 1.2
  characterId?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class MalaysianTtsEngine {
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private lastOptions: TtsSpeakOptions | null = null;
  private onDuckingChange: ((isDucking: boolean) => void) | null = null;

  public setDuckingCallback(cb: (isDucking: boolean) => void) {
    this.onDuckingChange = cb;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Menghentikan sebarang pertuturan yang sedang dimainkan
   */
  public stop() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    if (this.onDuckingChange) {
      this.onDuckingChange(false);
    }
  }

  /**
   * Jeda pertuturan
   */
  public pause() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.isPaused = true;
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  /**
   * Sambung pertuturan
   */
  public resume() {
    if (this.currentAudioElement && this.isPaused) {
      this.currentAudioElement.play();
      this.isPaused = false;
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  /**
   * Main semula pertuturan terakhir
   */
  public replay() {
    if (this.lastOptions) {
      this.speak(this.lastOptions);
    }
  }

  /**
   * Mainkan teks Bahasa Melayu
   */
  public async speak(options: TtsSpeakOptions) {
    this.stop();
    this.lastOptions = options;
    this.isSpeaking = true;
    this.isPaused = false;

    if (this.onDuckingChange) {
      this.onDuckingChange(true);
    }

    if (options.onStart) {
      options.onStart();
    }

    const voiceName = options.voiceName || 'ms-MY-YasminNeural';
    const pitchStr = options.pitch ? `${Math.round((options.pitch - 1) * 50)}%` : '0%';
    const rateStr = options.rate ? `${Math.round((options.rate - 1) * 30)}%` : '0%';

    // Percubaan 1: Panggil backend proxy Azure Speech (/api/tts)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: options.text,
          voice: voiceName,
          pitch: pitchStr,
          rate: rateStr,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && (contentType.includes('audio/mpeg') || contentType.includes('audio/wav') || contentType.includes('audio/'))) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        this.currentAudioElement = audio;

        audio.onended = () => {
          this.isSpeaking = false;
          this.isPaused = false;
          if (this.onDuckingChange) this.onDuckingChange(false);
          if (options.onEnd) options.onEnd();
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (e) => {
          console.warn('Audio playback error, falling back to Web Speech API', e);
          this.speakWithWebSpeech(options);
        };

        await audio.play();
        return;
      }
    } catch {
      // Teruskan ke fallback Web Speech API tanpa memutuskan aliran
    }

    // Percubaan 2: Pelayar Web Speech API Fallback
    this.speakWithWebSpeech(options);
  }

  /**
   * Fallback Web Speech API dengan keutamaan ms-MY
   */
  private speakWithWebSpeech(options: TtsSpeakOptions) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      if (this.onDuckingChange) this.onDuckingChange(false);
      if (options.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(options.text);
    this.currentUtterance = utterance;

    // Dapatkan suara Bahasa Melayu terbaik
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(
      (v) => v.lang === 'ms-MY' || v.lang.startsWith('ms') || v.name.toLowerCase().includes('malay')
    );

    // Fallback sekiranya tiada ms-MY, gunakan id-ID (serumpun)
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => v.lang === 'id-ID' || v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia')
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'ms-MY';
    }

    // Tetapkan nada mengikut watak
    utterance.pitch = options.pitch || 1.0;
    utterance.rate = options.rate || 0.95; // Sedikit santai untuk murid Tahun 3

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onDuckingChange) this.onDuckingChange(false);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onDuckingChange) this.onDuckingChange(false);
      if (options.onError) options.onError(e);
      if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Senarai suara Bahasa Melayu yang dikesan dalam pelayar
   */
  public getAvailableMalayVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const voices = window.speechSynthesis.getVoices();
    return voices.filter(
      (v) =>
        v.lang.startsWith('ms') ||
        v.lang.startsWith('id') ||
        v.name.toLowerCase().includes('malay') ||
        v.name.toLowerCase().includes('indonesia')
    );
  }
}

export const ttsEngine = new MalaysianTtsEngine();
