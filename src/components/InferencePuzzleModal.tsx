/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Cabaran Detektif Isi Tersirat (Misi 3 - Kemahiran Menginferens)
 */

import React, { useState } from 'react';
import { InferencePuzzleData } from '../types/game.ts';
import { audioManager } from '../audio/audioManager.ts';
import { Search, Lightbulb, CheckCircle, HelpCircle, X } from 'lucide-react';

interface InferencePuzzleModalProps {
  puzzle: InferencePuzzleData;
  onClose: () => void;
  onComplete: (puzzleId: string) => void;
}

export const InferencePuzzleModal: React.FC<InferencePuzzleModalProps> = ({
  puzzle,
  onClose,
  onComplete,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const handleSelectOption = (optionId: string) => {
    if (feedback?.isCorrect) return;
    setSelectedOptionId(optionId);

    const isCorrect = optionId === puzzle.correctOptionId;
    if (isCorrect) {
      audioManager.playCorrectAnswer();
      setFeedback({
        isCorrect: true,
        text: `Tepat sekali! ${puzzle.explanation}`,
      });
      onComplete(puzzle.id);
    } else {
      audioManager.playWrongAnswer();
      setFeedback({
        isCorrect: false,
        text: 'Kurang tepat. Ingat, isi tersirat tidak dinyatakan secara terus dalam ayat, tetapi perlu disimpulkan secara logik.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 text-white overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl shadow-emerald-950/80">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Cabaran"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Lencana & Tajuk Cabaran */}
        <div className="border-b border-emerald-500/30 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
            <Search className="h-3.5 w-3.5 text-amber-400" />
            <span>Misi 3: Detektif Isi Tersirat · Menginferens Maklumat</span>
          </div>
          <h3 className="mt-2 text-xl md:text-2xl font-black text-white font-['Fredoka']">
            {puzzle.title}
          </h3>
        </div>

        {/* Petunjuk Visual Situasi */}
        <div className="mt-4 rounded-2xl bg-slate-950/90 p-4 border border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" />
            <span>Petunjuk Kejadian Alam:</span>
          </span>
          <p className="mt-2 text-sm md:text-base italic text-slate-200 font-medium">
            "{puzzle.clue}"
          </p>
        </div>

        {/* Soalan Menginferens */}
        <div className="mt-5">
          <p className="text-base md:text-lg font-bold text-white font-['Fredoka']">
            {puzzle.question}
          </p>

          <div className="mt-3 flex flex-col gap-2.5">
            {puzzle.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let btnClass = 'border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 text-slate-200';

              if (isSelected) {
                btnClass = feedback?.isCorrect
                  ? 'border-emerald-500 bg-emerald-950/80 text-emerald-200 shadow-md shadow-emerald-500/20'
                  : 'border-rose-500 bg-rose-950/80 text-rose-200';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${btnClass}`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 font-bold text-xs shrink-0">
                    {opt.id.slice(-1).toUpperCase()}
                  </span>
                  <span className="text-xs md:text-sm font-semibold">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Petua Bantuan (Hint) */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <Lightbulb className="h-4 w-4" />
              <span>{showHint ? 'Sembunyikan Petua' : 'Perlukan Petua?'}</span>
            </button>
          </div>

          {showHint && (
            <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200 animate-in fade-in">
              <strong>Bimbingan Guru:</strong> {puzzle.hint}
            </div>
          )}

          {/* Maklum Balas Pembetulan */}
          {feedback && (
            <div
              className={`mt-4 rounded-xl border p-3.5 text-xs md:text-sm font-medium ${
                feedback.isCorrect
                  ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-200 flex items-center gap-2'
                  : 'border-rose-500/50 bg-rose-950/60 text-rose-200'
              }`}
            >
              {feedback.isCorrect && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}
        </div>

        {/* Tindakan Tamat */}
        {feedback?.isCorrect && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition font-['Fredoka']"
            >
              Simpan Penemuan & Teruskan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
