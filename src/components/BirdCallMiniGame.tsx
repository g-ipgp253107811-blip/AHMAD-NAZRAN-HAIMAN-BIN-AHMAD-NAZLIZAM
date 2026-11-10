/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Mini-Permainan 2: Teka Kicauan Burung & Suara Rimba
 */

import React, { useState } from 'react';
import { BirdCallData } from '../types/game.ts';
import { BIRD_CALLS_GAME } from '../game/curriculumData.ts';
import { checkBirdCallGuess } from '../game/rules.ts';
import { audioManager } from '../audio/audioManager.ts';
import { Volume2, Music, CheckCircle2, Award, Sparkles, X, Lightbulb } from 'lucide-react';

interface BirdCallMiniGameProps {
  onClose: () => void;
  onFinish: (score: number) => void;
}

export const BirdCallMiniGame: React.FC<BirdCallMiniGameProps> = ({
  onClose,
  onFinish,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentBird = BIRD_CALLS_GAME[currentIdx];

  const handlePlaySound = () => {
    setIsPlayingAudio(true);
    audioManager.playSpecificBirdCall(currentBird.soundType);
    setTimeout(() => setIsPlayingAudio(false), 900);
  };

  const handleGuess = (guessedId: string) => {
    if (feedback?.isCorrect) return;
    setSelectedGuessId(guessedId);

    const result = checkBirdCallGuess(guessedId, currentBird.id);
    if (result.isCorrect) {
      audioManager.playCorrectAnswer();
      setFeedback({
        isCorrect: true,
        text: `${result.message} ${currentBird.description}`,
      });
      setScore((prev) => prev + 150);
    } else {
      audioManager.playWrongAnswer();
      setFeedback({
        isCorrect: false,
        text: result.message,
      });
    }
  };

  const handleNextBird = () => {
    if (currentIdx + 1 < BIRD_CALLS_GAME.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedGuessId(null);
      setFeedback(null);
      setShowHint(false);
    } else {
      setIsCompleted(true);
      onFinish(score);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4 text-white overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Permainan"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Lencana Mini-Game */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-300">
          <Music className="h-4 w-4 text-emerald-400" />
          <span>Mini-Permainan: Teka Kicauan Burung & Suara Rimba</span>
        </div>

        <h3 className="mt-2 text-2xl md:text-3xl font-black text-white font-['Fredoka']">
          Dengarkan Suara Haiwan Rimba
        </h3>

        {!isCompleted ? (
          <>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
              <span>Soalan {currentIdx + 1} daripada {BIRD_CALLS_GAME.length}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">Skor: {score}</span>
            </div>

            {/* Butang Pemain Audio Kicauan */}
            <div className="mt-6 flex flex-col items-center">
              <button
                type="button"
                onClick={handlePlaySound}
                className={`flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-emerald-400 shadow-xl transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-emerald-500 text-slate-950 scale-110 shadow-emerald-400/50'
                    : 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900'
                }`}
              >
                <Volume2 className="h-10 w-10 animate-pulse" />
              </button>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-400">
                {isPlayingAudio ? 'Sedang Memainkan Kicauan...' : 'Tekan Butang di Atas untuk Dengar Bunyi'}
              </p>
            </div>

            {/* Petua Bantuan */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>{showHint ? 'Sembunyikan Petua' : 'Lihat Petua Habitat'}</span>
              </button>
              {showHint && (
                <p className="mt-1.5 rounded-xl border border-amber-500/30 bg-amber-950/30 p-2.5 text-xs text-amber-200 animate-in fade-in">
                  <strong>Petua:</strong> {currentBird.hint} (Habitat: {currentBird.habitat})
                </p>
              )}
            </div>

            {/* Pilihan Tekaan 4 Haiwan */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {BIRD_CALLS_GAME.map((b) => {
                const isSelected = selectedGuessId === b.id;
                let btnStyle = 'border-slate-800 bg-slate-900/70 hover:border-emerald-500/50 text-slate-200';

                if (isSelected) {
                  btnStyle = feedback?.isCorrect
                    ? 'border-emerald-500 bg-emerald-950 text-emerald-200 shadow-md shadow-emerald-500/30'
                    : 'border-rose-500 bg-rose-950 text-rose-200';
                }

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleGuess(b.id)}
                    className={`rounded-2xl border-2 p-3 text-center transition-all cursor-pointer ${btnStyle}`}
                  >
                    <p className="text-sm font-bold font-['Fredoka']">{b.name}</p>
                    <p className="text-[10px] text-slate-400">{b.localName}</p>
                  </button>
                );
              })}
            </div>

            {/* Maklum Balas Pembetulan */}
            {feedback && (
              <div
                className={`mt-4 rounded-xl border p-3 text-xs md:text-sm font-medium ${
                  feedback.isCorrect
                    ? 'border-emerald-500/50 bg-emerald-950/70 text-emerald-200'
                    : 'border-rose-500/50 bg-rose-950/70 text-rose-200'
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Butang Seterusnya */}
            {feedback?.isCorrect && (
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextBird}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition font-['Fredoka'] cursor-pointer"
                >
                  {currentIdx + 1 < BIRD_CALLS_GAME.length ? 'Haiwan Seterusnya ➔' : 'Lihat Keputusan Akhir'}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Keputusan Tamat */
          <div className="mt-6 rounded-2xl bg-slate-950/90 p-6 border border-emerald-500/40 animate-in fade-in">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h4 className="mt-2 text-2xl font-black text-white font-['Fredoka']">
              Tahniah! Pendengaran Wira Rimba Hebat!
            </h4>
            <p className="mt-1 text-sm text-emerald-300">
              Kamu berjaya mengenal pasti bunyi kicauan flora dan fauna Malaysia.
            </p>
            <p className="mt-2 text-3xl font-black text-amber-400 font-['Fredoka']">
              Jumlah Skor: {score}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition font-['Fredoka'] cursor-pointer"
            >
              Simpan & Teruskan Penerokaan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
