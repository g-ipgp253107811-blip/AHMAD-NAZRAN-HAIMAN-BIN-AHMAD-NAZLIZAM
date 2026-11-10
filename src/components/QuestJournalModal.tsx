/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Jurnal Misi & Kamus Kosa Kata (Quest Journal & Vocabulary)
 */

import React, { useState } from 'react';
import { MissionState, KosaKataItem, FloraFaunaCollectible } from '../types/game.ts';
import { INITIAL_KOSA_KATA, FLORA_FAUNA_COLLECTIBLES } from '../game/curriculumData.ts';
import { checkOverallProgress } from '../game/rules.ts';
import { BookOpen, CheckCircle, Sparkles, Trophy, Award, Search, X } from 'lucide-react';

interface QuestJournalModalProps {
  missionState: MissionState;
  collectedWordIds: string[];
  foundCollectibleIds: string[];
  onClose: () => void;
}

export const QuestJournalModal: React.FC<QuestJournalModalProps> = ({
  missionState,
  collectedWordIds,
  foundCollectibleIds,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'misi' | 'kosa_kata' | 'khazanah'>('misi');
  const [searchQuery, setSearchQuery] = useState('');

  const progress = checkOverallProgress(missionState);

  // Senarai Kosa Kata Lengkap
  const allVocab = INITIAL_KOSA_KATA.filter((item) =>
    item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4 text-white overflow-y-auto font-['Plus_Jakarta_Sans']">
      <div className="relative w-full max-w-3xl rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Jurnal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tajuk Jurnal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Jurnal Rasmi Wira Alam BM Tahun 3</span>
            </div>
            <h3 className="mt-1 text-2xl font-black text-white font-['Fredoka']">
              Jurnal Penerokaan & Pembelajaran
            </h3>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-950/70 px-4 py-2 border border-slate-800">
            <Trophy className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Kemajuan Keseluruhan</p>
              <p className="text-base font-black text-amber-300 font-['Fredoka']">
                {progress.totalPercentage}% · {progress.unlockedTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="mt-4 flex gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('misi')}
            className={`rounded-xl px-4 py-2 text-xs md:text-sm font-bold transition cursor-pointer ${
              activeTab === 'misi'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            📋 Misi Pembelajaran (4)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kosa_kata')}
            className={`rounded-xl px-4 py-2 text-xs md:text-sm font-bold transition cursor-pointer ${
              activeTab === 'kosa_kata'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            📖 Kamus Kosa Kata ({collectedWordIds.length}/8)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('khazanah')}
            className={`rounded-xl px-4 py-2 text-xs md:text-sm font-bold transition cursor-pointer ${
              activeTab === 'khazanah'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            🌿 Khazanah Flora & Fauna ({foundCollectibleIds.length}/6)
          </button>
        </div>

        {/* Kandungan Tab */}
        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-4">
          {/* TAB 1: MISI UTAMA */}
          {activeTab === 'misi' && (
            <div className="space-y-3">
              {/* Misi 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                      1
                    </span>
                    <h4 className="text-sm md:text-base font-bold text-white font-['Fredoka']">
                      Misi 1: Pemburu Kosa Kata
                    </h4>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    missionState.misi1_kosaKata.completed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {missionState.misi1_kosaKata.completed ? 'Selesai' : `${missionState.misi1_kosaKata.collectedWordIds.length}/8 Kosa Kata`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Baca 3 papan maklumat (Kitar Semula, Habitat, Sungai Tercemar) dan kumpulkan sekurang-kurangnya 6 kosa kata alam sekitar.
                </p>
              </div>

              {/* Misi 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-950 text-blue-400 font-bold text-xs border border-blue-500/30">
                      2
                    </span>
                    <h4 className="text-sm md:text-base font-bold text-white font-['Fredoka']">
                      Misi 2: Penyiasat Maklumat (Isi Tersurat)
                    </h4>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    missionState.misi2_penyiasatMaklumat.completed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {missionState.misi2_penyiasatMaklumat.completed ? 'Selesai' : `${missionState.misi2_penyiasatMaklumat.correctNpcIds.length}/3 Soalan`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Temubual 3 watak NPC (Pak Osman, Si Oyen, Puan Aminah) dan jawab soalan pemahaman maklumat jelas (isi tersurat).
                </p>
              </div>

              {/* Misi 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-950 text-purple-400 font-bold text-xs border border-purple-500/30">
                      3
                    </span>
                    <h4 className="text-sm md:text-base font-bold text-white font-['Fredoka']">
                      Misi 3: Detektif Isi Tersirat
                    </h4>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    missionState.misi3_detektifTersirat.completed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {missionState.misi3_detektifTersirat.completed ? 'Selesai' : `${missionState.misi3_detektifTersirat.completedPuzzleIds.length}/3 Selesai`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Rungkai 3 situasi visual alam dan buat inferens logik tentang sebab akibat pemeliharaan alam sekitar.
                </p>
              </div>

              {/* Misi 4 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-950 text-teal-400 font-bold text-xs border border-teal-500/30">
                      4
                    </span>
                    <h4 className="text-sm md:text-base font-bold text-white font-['Fredoka']">
                      Misi 4: Penyelamat Taman (Pemulihan Alam)
                    </h4>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    missionState.misi4_penyelamatTaman.completed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {missionState.misi4_penyelamatTaman.completed ? 'Selesai' : 'Sedang Berjalan'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Kutip sampah, asingkan mengikut tong kitar semula, bersihkan sungai dan tanam anak pokok di Kawasan Pemuliharaan.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: KAMUS KOSA KATA */}
          {activeTab === 'kosa_kata' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari perkataan atau makna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allVocab.map((item) => {
                  const isCollected = collectedWordIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-4 transition ${
                        isCollected
                          ? 'border-cyan-500/40 bg-cyan-950/30'
                          : 'border-slate-800/80 bg-slate-950/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm md:text-base font-bold text-white font-['Fredoka']">
                          {item.word}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCollected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isCollected ? 'Ditemui' : 'Belum Ditemui'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                        <strong>Maksud:</strong> {item.definition}
                      </p>
                      <p className="mt-1 text-[11px] text-cyan-200/80 italic">
                        "{item.exampleSentence}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: KHAZANAH FLORA & FAUNA */}
          {activeTab === 'khazanah' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FLORA_FAUNA_COLLECTIBLES.map((c) => {
                const isFound = foundCollectibleIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border p-4 transition ${
                      isFound
                        ? 'border-amber-500/40 bg-amber-950/30'
                        : 'border-slate-800/80 bg-slate-950/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm md:text-base font-bold text-amber-200 font-['Fredoka']">
                        {isFound ? c.name : 'Khazanah Tersembunyi ???'}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFound ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isFound ? 'Ditemui' : 'Tersembunyi'}
                      </span>
                    </div>

                    {isFound ? (
                      <>
                        <p className="mt-1 text-[11px] text-amber-300/80 font-mono italic">
                          {c.scientificName} · {c.malayStatus}
                        </p>
                        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                          {c.description}
                        </p>
                        <div className="mt-2 rounded-xl bg-slate-950/70 p-2 border border-amber-500/20 text-[11px] text-amber-100">
                          <strong>💡 Fakta Menarik:</strong> {c.funFact}
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400 italic">
                        Cari relik bercahaya emas ini di sekitar kawasan taman untuk membuka maklumat dan fakta menarik!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
