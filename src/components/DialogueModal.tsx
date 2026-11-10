/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Panel Perbualan Watak NPC (Misi 2: Penyiasat Maklumat - Isi Tersurat)
 */

import React, { useState, useEffect } from 'react';
import { NpcData } from '../types/game.ts';
import { ttsEngine } from '../audio/ttsService.ts';
import { audioManager } from '../audio/audioManager.ts';
import { Volume2, RotateCcw, Square, CheckCircle, HelpCircle, X } from 'lucide-react';

interface DialogueModalProps {
  npc: NpcData;
  onClose: () => void;
  onAnswerCorrect: (npcId: string) => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  onClose,
  onAnswerCorrect,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Mainkan dialog pertuturan suara Bahasa Melayu sebaik sahaja panel dibuka
  useEffect(() => {
    playVoice();
    return () => {
      ttsEngine.stop();
    };
  }, [npc]);

  const playVoice = () => {
    setIsSpeaking(true);
    ttsEngine.speak({
      text: npc.dialogueText,
      voiceName: npc.voiceName as any,
      pitch: npc.pitch,
      rate: 0.95,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStopVoice = () => {
    ttsEngine.stop();
    setIsSpeaking(false);
  };

  const handleSelectOption = (optionId: string) => {
    if (feedback?.isCorrect) return; // Sudah selesai
    setSelectedOptionId(optionId);

    const isCorrect = optionId === npc.question.correctOptionId;
    if (isCorrect) {
      audioManager.playCorrectAnswer();
      setFeedback({
        isCorrect: true,
        text: `Tahniah! ${npc.question.explanation}`,
      });
      onAnswerCorrect(npc.id);
    } else {
      audioManager.playWrongAnswer();
      setFeedback({
        isCorrect: false,
        text: 'Cuba fikirkan semula berdasarkan ayat yang diucapkan oleh watak di atas.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 text-white overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl shadow-emerald-950/80">
        {/* Butang Tutup */}
        <button
          type="button"
          onClick={() => {
            handleStopVoice();
            onClose();
          }}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profil Watak NPC */}
        <div className="flex items-center gap-4 border-b border-emerald-500/30 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-900/60 text-4xl border border-emerald-400/50 shadow">
            {npc.avatarIcon}
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white font-['Fredoka']">
              {npc.name}
            </h3>
            <p className="text-xs md:text-sm font-semibold text-emerald-300">{npc.role}</p>
          </div>
        </div>

        {/* Teks Dialog Bahasa Melayu & Kawalan Suara */}
        <div className="mt-4 rounded-2xl bg-slate-950/80 p-4 border border-slate-800">
          <p className="text-sm md:text-base leading-relaxed text-slate-100 font-medium">
            "{npc.dialogueText}"
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span>Suara Bahasa Melayu Standard: <strong>{npc.voiceName}</strong></span>
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={playVoice}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/70 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-900 transition"
              >
                <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
                <span>Dengar Semula</span>
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={handleStopVoice}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/70 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-900 transition"
                >
                  <Square className="h-3.5 w-3.5 text-rose-400" />
                  <span>Henti</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bahagian Cabaran Misi 2: Penyiasat Maklumat (Isi Tersurat) */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <HelpCircle className="h-4 w-4" />
            <span>Cabaran Penyiasat Maklumat (Isi Tersurat):</span>
          </div>

          <p className="mt-1 text-sm md:text-base font-bold text-white font-['Fredoka']">
            {npc.question.prompt}
          </p>

          <div className="mt-3 flex flex-col gap-2.5">
            {npc.question.options.map((opt) => {
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
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 font-bold text-xs">
                    {opt.id.slice(-1).toUpperCase()}
                  </span>
                  <span className="text-xs md:text-sm font-semibold">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Maklum Balas Pembelajaran */}
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
              onClick={() => {
                handleStopVoice();
                onClose();
              }}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition font-['Fredoka']"
            >
              Teruskan Pengembaraan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
