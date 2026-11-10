/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Skrin Utama / Menu Permulaan (Title Screen)
 */

import React, { useState } from 'react';
import { CharacterGender, GraphicQuality } from '../types/game.ts';
import { Compass, Volume2, ShieldCheck, Sparkles, User, Settings2 } from 'lucide-react';

interface TitleScreenProps {
  onStart: (gender: CharacterGender, quality: GraphicQuality) => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onOpenSettings }) => {
  const [selectedGender, setSelectedGender] = useState<CharacterGender>('lelaki');
  const [selectedQuality, setSelectedQuality] = useState<GraphicQuality>('tinggi');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 text-white overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-emerald-950/90 p-6 md:p-8 shadow-2xl shadow-emerald-950/70 text-center">
        {/* Lencana Kurikulum Standard Malaysia */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-900/60 px-4 py-1.5 text-xs md:text-sm font-semibold text-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Bahan Bantu Mengajar (BBM) Digital Bahasa Melayu Tahun 3 · KSSR Semakan</span>
        </div>

        {/* Tajuk Utama */}
        <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md font-['Fredoka']">
          MISI TAMAN LESTARI
        </h1>
        <p className="mt-1 text-lg md:text-2xl font-bold text-emerald-300 font-['Fredoka']">
          Pengembaraan Wira Alam
        </p>
        <p className="mt-2 text-xs md:text-sm text-emerald-100/80 max-w-xl mx-auto">
          Terokai 6 kawasan dunia terbuka, kumpulkan kosa kata alam sekitar, fahami isi tersurat dan rungkai isi tersirat demi menyelamatkan ekosistem taman!
        </p>

        {/* Pemilihan Watak Wira Alam */}
        <div className="mt-6 rounded-2xl bg-slate-950/60 p-4 border border-emerald-500/30 text-left">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <User className="h-4 w-4" /> Pilih Watak Wira Alam:
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedGender('lelaki')}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                selectedGender === 'lelaki'
                  ? 'border-emerald-400 bg-emerald-900/50 shadow-md shadow-emerald-500/30'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <span className="text-2xl">👦</span>
              <div>
                <p className="text-sm font-bold text-white">Wira Amir</p>
                <p className="text-xs text-emerald-300">Seragam Renjer Hutan</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGender('perempuan')}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                selectedGender === 'perempuan'
                  ? 'border-emerald-400 bg-emerald-900/50 shadow-md shadow-emerald-500/30'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <span className="text-2xl">👧</span>
              <div>
                <p className="text-sm font-bold text-white">Wira Aina</p>
                <p className="text-xs text-emerald-300">Seragam Renjer Alam</p>
              </div>
            </button>
          </div>
        </div>

        {/* Pilihan Kualiti Grafik (Sesuai untuk komputer sekolah) */}
        <div className="mt-4 flex flex-wrap items-center justify-between rounded-xl bg-slate-950/40 px-4 py-2.5 border border-slate-800 text-xs text-slate-300">
          <span className="font-semibold text-emerald-400">Kualiti Grafik 3D:</span>
          <div className="flex gap-2">
            {(['rendah', 'sederhana', 'tinggi'] as GraphicQuality[]).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSelectedQuality(q)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase transition ${
                  selectedQuality === q
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Butang Tindakan Utama */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            data-start="true"
            onClick={() => onStart(selectedGender, selectedQuality)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 px-8 py-4 text-lg md:text-xl font-black text-slate-950 shadow-xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-['Fredoka']"
          >
            <Sparkles className="h-6 w-6 text-slate-950" />
            <span>MULA PENGEMBARAAN</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-slate-900/80 px-6 py-4 text-sm font-bold text-emerald-200 hover:bg-slate-800 transition"
          >
            <Settings2 className="h-5 w-5 text-emerald-400" />
            <span>TETAPAN & UJIAN SUARA</span>
          </button>
        </div>

        {/* Panduan Kawalan Papan Kekunci & Sentuh */}
        <div className="mt-6 border-t border-emerald-900/50 pt-4 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span><strong className="text-white">WASD / Sentuh:</strong> Gerak</span>
          <span>•</span>
          <span><strong className="text-white">Ruang (Space):</strong> Lompat</span>
          <span>•</span>
          <span><strong className="text-white">Shift:</strong> Lari Pantas</span>
          <span>•</span>
          <span><strong className="text-white">[E]:</strong> Interaksi</span>
          <span>•</span>
          <span><strong className="text-white">[M]:</strong> Peta</span>
          <span>•</span>
          <span><strong className="text-white">[J]:</strong> Jurnal Misi</span>
        </div>
      </div>
    </div>
  );
};
