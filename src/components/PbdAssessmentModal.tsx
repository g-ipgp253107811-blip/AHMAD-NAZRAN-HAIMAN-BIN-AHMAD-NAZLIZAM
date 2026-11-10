/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Pentaksiran Bilik Darjah (PBD) & Sijil Wira Alam Berilmu
 * Standard Pembelajaran Bahasa Melayu Tahun 3 (2.2.1)
 */

import React, { useState } from 'react';
import { PBD_QUESTIONS } from '../game/curriculumData.ts';
import { calculatePbdLevel } from '../game/rules.ts';
import { PbdResult } from '../types/game.ts';
import { audioManager } from '../audio/audioManager.ts';
import { Award, CheckCircle, ShieldCheck, Printer, FileText, Sparkles, X } from 'lucide-react';

interface PbdAssessmentModalProps {
  studentName: string;
  onClose: () => void;
  onCompletePbd: (result: PbdResult) => void;
}

export const PbdAssessmentModal: React.FC<PbdAssessmentModalProps> = ({
  studentName,
  onClose,
  onCompletePbd,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [kbatResponse, setKbatResponse] = useState('');
  const [submittedResult, setSubmittedResult] = useState<PbdResult | null>(null);

  const handleSelectAnswer = (qId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Kira skor kosa kata (2 soalan)
    let kosaKataScore = 0;
    if (answers['q_vocab_1'] === 'opt_1_a') kosaKataScore += 1;
    if (answers['q_vocab_2'] === 'opt_2_a') kosaKataScore += 1;

    // Kira skor tersurat (1 soalan)
    let tersuratScore = 0;
    if (answers['q_tersurat_1'] === 'opt_3_a') tersuratScore += 1;

    // Kira skor tersirat (1 soalan)
    let tersiratScore = 0;
    if (answers['q_tersirat_1'] === 'opt_4_a') tersiratScore += 1;

    // Kira skor KBAT (berdasarkan kepanjangan & perkataan bermakna)
    let kbatScore = 1;
    if (kbatResponse.trim().length >= 15) {
      kbatScore = 2; // Jawapan bernas berserta alasan
    }

    const pbdCalc = calculatePbdLevel(kosaKataScore, tersuratScore, tersiratScore, kbatScore);

    const result: PbdResult = {
      score: pbdCalc.totalScore,
      maxScore: pbdCalc.maxScore,
      tahapPenguasaan: pbdCalc.tahapPenguasaan,
      tahapTitle: pbdCalc.tahapTitle,
      deskripsi: pbdCalc.deskripsi,
      ulasanGuru: pbdCalc.ulasanGuru,
      kbatJawapan: kbatResponse,
      kbatSkor: kbatScore,
      tarikhSelesai: new Date().toLocaleDateString('ms-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    audioManager.playMissionFanfare();
    setSubmittedResult(result);
    onCompletePbd(result);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 text-white overflow-y-auto font-['Plus_Jakarta_Sans']">
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl flex flex-col max-h-[92vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Pentaksiran"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tajuk Pentaksiran */}
        <div className="border-b border-emerald-500/30 pb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Pentaksiran Bilik Darjah (PBD) Bahasa Melayu Tahun 3</span>
          </div>
          <h3 className="mt-2 text-2xl font-black text-white font-['Fredoka']">
            Ujian Kefahaman Wira Alam Lestari
          </h3>
          <p className="text-xs text-slate-400">
            Standard Pembelajaran 2.2.1: Kosa Kata, Isi Tersurat, Isi Tersirat & KBAT
          </p>
        </div>

        {/* Borang Soalan jika belum dihantar */}
        {!submittedResult ? (
          <form onSubmit={handleSubmit} className="mt-4 flex-1 overflow-y-auto pr-2 space-y-6">
            {PBD_QUESTIONS.map((q, idx) => {
              if (q.type === 'kbat') {
                return (
                  <div key={q.id} className="rounded-2xl border border-amber-500/40 bg-slate-950/70 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      {q.title}
                    </span>
                    <p className="mt-1 text-sm font-bold text-white font-['Fredoka']">
                      {idx + 1}. {q.prompt}
                    </p>
                    {q.stimulus && (
                      <p className="mt-1 text-xs text-slate-300 italic">"{q.stimulus}"</p>
                    )}
                    <textarea
                      required
                      rows={3}
                      value={kbatResponse}
                      onChange={(e) => setKbatResponse(e.target.value)}
                      placeholder="Tulis tindakan kamu dan berikan alasan yang bernas..."
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs md:text-sm text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                    />
                  </div>
                );
              }

              return (
                <div key={q.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {q.title}
                  </span>
                  <p className="mt-1 text-sm font-bold text-white font-['Fredoka']">
                    {idx + 1}. {q.prompt}
                  </p>
                  {q.stimulus && (
                    <p className="mt-1 text-xs text-slate-300 italic">"{q.stimulus}"</p>
                  )}

                  <div className="mt-3 space-y-2">
                    {q.options?.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 rounded-xl border p-2.5 text-xs md:text-sm cursor-pointer transition ${
                          answers[q.id] === opt.id
                            ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => handleSelectAnswer(q.id, opt.id)}
                          className="text-emerald-500 focus:ring-emerald-400"
                        />
                        <span>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 text-sm font-black text-slate-950 shadow-lg hover:scale-102 transition font-['Fredoka'] cursor-pointer"
              >
                Hantar Jawapan & Jana Sijil PBD
              </button>
            </div>
          </form>
        ) : (
          /* SIJIL & KEPUTUSAN PBD RASMI */
          <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-4">
            <div className="rounded-3xl border-4 border-amber-400/80 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 p-6 text-center shadow-2xl">
              <Sparkles className="mx-auto h-12 w-12 text-amber-400" />
              <h4 className="mt-2 text-xs uppercase font-extrabold tracking-widest text-amber-300">
                KEMENTERIAN PENDIDIKAN MALAYSIA · PBD
              </h4>
              <h2 className="mt-1 text-2xl md:text-3xl font-black text-white font-['Fredoka']">
                SIJIL WIRA ALAM BERILMU
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Dengan ini diperakui bahawa wira cilik berikut:
              </p>

              <p className="mt-3 text-xl md:text-2xl font-black text-emerald-300 font-['Fredoka'] underline decoration-emerald-400 underline-offset-4">
                {studentName} (Murid Tahun 3)
              </p>

              <div className="mt-4 rounded-2xl bg-slate-950/80 p-4 border border-amber-400/40 text-left space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">Tahap Penguasaan (TP):</span>
                  <span className="text-sm font-black text-amber-400 font-['Fredoka']">
                    {submittedResult.tahapTitle} (Skor: {submittedResult.score}/{submittedResult.maxScore})
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  <strong>Deskripsi Standard:</strong> {submittedResult.deskripsi}
                </p>

                <p className="text-xs text-emerald-300">
                  <strong>Ulasan Guru Penilai:</strong> {submittedResult.ulasanGuru}
                </p>

                <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-400 flex justify-between">
                  <span>Tarikh Selesai: {submittedResult.tarikhSelesai}</span>
                  <span>Status: Terbukti Menguasai BBM Digital</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-900 px-6 py-2.5 text-xs font-bold text-emerald-200 hover:bg-slate-800 transition"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Sijil</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition font-['Fredoka']"
              >
                Kembali ke Permainan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
