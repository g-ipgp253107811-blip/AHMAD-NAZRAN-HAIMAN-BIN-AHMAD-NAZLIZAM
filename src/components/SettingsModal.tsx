/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Panel Tetapan Audio, Suara TTS Bahasa Melayu & Cuaca Taman
 */

import React, { useState } from 'react';
import { AudioSettings, WeatherType, GraphicQuality } from '../types/game.ts';
import { ttsEngine } from '../audio/ttsService.ts';
import { audioManager } from '../audio/audioManager.ts';
import { Settings, Volume2, CloudRain, Sun, Wind, Sunrise, Mic, RotateCcw, X } from 'lucide-react';

interface SettingsModalProps {
  settings: AudioSettings;
  weather: WeatherType;
  quality: GraphicQuality;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  onUpdateWeather: (newWeather: WeatherType) => void;
  onUpdateQuality: (newQuality: GraphicQuality) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  weather,
  quality,
  onUpdateSettings,
  onUpdateWeather,
  onUpdateQuality,
  onClose,
}) => {
  const [testStatus, setTestStatus] = useState<string>('');

  const testSentences = [
    'Selamat datang ke Taman Lestari! Mari kita menjaga alam sekitar bersama-sama.',
    'Habitat ialah tempat tinggal semula jadi haiwan dan tumbuhan.',
    'Kitar semula membantu mengurangkan jumlah sampah.',
  ];

  const handleTestVoice = (sentence: string) => {
    setTestStatus('Memainkan suara percubaan...');
    ttsEngine.speak({
      text: sentence,
      voiceName: settings.preferredVoice === 'ms-MY-OsmanNeural' ? 'ms-MY-OsmanNeural' : 'ms-MY-YasminNeural',
      pitch: 1.0,
      rate: 0.95,
      onEnd: () => setTestStatus('Ujian suara selesai.'),
      onError: () => setTestStatus('Ralat audio. Menggunakan suara pelayar.'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 text-white overflow-y-auto font-['Plus_Jakarta_Sans']">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Tetapan"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tajuk Tetapan */}
        <div className="border-b border-emerald-500/30 pb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
            <Settings className="h-4 w-4" />
            <span>Pusat Kawalan & Tetapan Permainan</span>
          </div>
          <h3 className="mt-2 text-2xl font-black text-white font-['Fredoka']">
            Tetapan Audio & Persekitaran
          </h3>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-6">
          {/* BAHAGIAN 1: KELANTANGAN AUDIO */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Volume2 className="h-4 w-4" /> Kelantangan Bunyi (Volume):
            </h4>

            {/* Master Volume */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Kelantangan Utama (Master)</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* BGM Volume */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Muzik Latar (BGM)</span>
                <span>{Math.round(settings.bgmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.bgmVolume}
                onChange={(e) => onUpdateSettings({ bgmVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Kesan Bunyi Tindakan (SFX)</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Suara Dialog */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Suara Percakapan Watak</span>
                <span>{Math.round(settings.voiceVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.voiceVolume}
                onChange={(e) => onUpdateSettings({ voiceVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* BAHAGIAN 2: UJIAN SUARA TEKS-KE-PERTUTURAN (TTS) */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Mic className="h-4 w-4" /> Ujian Sebutan Suara Bahasa Melayu:
            </h4>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ preferredVoice: 'ms-MY-YasminNeural' })}
                className={`flex-1 rounded-xl border p-2.5 text-xs font-bold transition ${
                  settings.preferredVoice === 'ms-MY-YasminNeural'
                    ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                Suara Narator (Yasmin - Perempuan)
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ preferredVoice: 'ms-MY-OsmanNeural' })}
                className={`flex-1 rounded-xl border p-2.5 text-xs font-bold transition ${
                  settings.preferredVoice === 'ms-MY-OsmanNeural'
                    ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                Suara Panduan (Osman - Lelaki)
              </button>
            </div>

            <div className="space-y-2 mt-2">
              <span className="text-[11px] text-slate-400">Tekan ayat untuk menguji kelancaran sebutan:</span>
              {testSentences.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTestVoice(s)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-left text-xs text-slate-200 hover:border-emerald-500 transition"
                >
                  <span className="truncate pr-2">"{s}"</span>
                  <RotateCcw className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>

            {testStatus && (
              <p className="text-[11px] text-emerald-300 font-semibold">{testStatus}</p>
            )}
          </div>

          {/* BAHAGIAN 3: SISTEM CUACA DINAMIK */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Sun className="h-4 w-4" /> Suasana Cuaca Dunia Terbuka:
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { type: 'cerah', label: 'Cerah', icon: <Sun className="h-4 w-4 text-yellow-400" /> },
                { type: 'hujan', label: 'Hujan', icon: <CloudRain className="h-4 w-4 text-cyan-400" /> },
                { type: 'berangin', label: 'Berangin', icon: <Wind className="h-4 w-4 text-teal-400" /> },
                { type: 'senja', label: 'Senja', icon: <Sunrise className="h-4 w-4 text-orange-400" /> },
              ].map((w) => (
                <button
                  key={w.type}
                  type="button"
                  onClick={() => onUpdateWeather(w.type as WeatherType)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${
                    weather === w.type
                      ? 'border-emerald-400 bg-emerald-950 text-white shadow'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {w.icon}
                  <span className="text-xs font-bold">{w.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BAHAGIAN 4: KUALITI GRAFIK 3D */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Kualiti Grafik Komputer:
            </h4>
            <div className="flex gap-2">
              {(['rendah', 'sederhana', 'tinggi'] as GraphicQuality[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onUpdateQuality(q)}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold uppercase transition ${
                    quality === q
                      ? 'border-emerald-400 bg-emerald-600 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition font-['Fredoka']"
          >
            Simpan Tetapan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
