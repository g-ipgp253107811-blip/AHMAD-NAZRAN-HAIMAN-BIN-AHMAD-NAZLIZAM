/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Mini-Permainan 1: Stesen Pengasingan Kitar Semula Pantas
 */

import React, { useState, useEffect } from 'react';
import { TrashCategory } from '../types/game.ts';
import { validateRecyclingSort, calculateSortingScore } from '../game/rules.ts';
import { audioManager } from '../audio/audioManager.ts';
import { Trash2, Award, Clock, Flame, CheckCircle2, RotateCcw, X } from 'lucide-react';

interface RecyclingMiniGameProps {
  onClose: () => void;
  onFinish: (score: number) => void;
}

interface ItemToClean {
  name: string;
  category: TrashCategory;
  icon: string;
}

const ITEMS_POOL: ItemToClean[] = [
  { name: 'Surat Khabar Lama', category: 'kertas', icon: '📰' },
  { name: 'Botol Plastik Air Mineral', category: 'plastik_aluminium', icon: '🧴' },
  { name: 'Tin Minuman Isotonik', category: 'plastik_aluminium', icon: '🥫' },
  { name: 'Balang Kaca Madu', category: 'kaca_logam', icon: '🫙' },
  { name: 'Kotak Kasut Kadbod', category: 'kertas', icon: '📦' },
  { name: 'Beg Plastik Terpakai', category: 'plastik_aluminium', icon: '🛍️' },
  { name: 'Tin Biskut Logam', category: 'kaca_logam', icon: '🥮' },
  { name: 'Buku Latihan Lama', category: 'kertas', icon: '📚' },
  { name: 'Cawan Kaca Retak', category: 'kaca_logam', icon: '🥛' },
];

export const RecyclingMiniGame: React.FC<RecyclingMiniGameProps> = ({
  onClose,
  onFinish,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string>('');

  const currentItem = ITEMS_POOL[currentIndex % ITEMS_POOL.length];

  // Pemasa Undur 30 saat
  useEffect(() => {
    if (timeLeft <= 0 || isGameOver) {
      handleGameOver();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameOver]);

  const handleGameOver = () => {
    setIsGameOver(true);
    const finalScore = calculateSortingScore(correctCount, combo, timeLeft);
    onFinish(finalScore);
  };

  const handleSort = (binCategory: TrashCategory) => {
    if (isGameOver) return;

    const result = validateRecyclingSort(currentItem.category, binCategory);
    setLastFeedback(result.feedback);

    if (result.isCorrect) {
      audioManager.playTrashPickup();
      const newCombo = combo + 1;
      setCombo(newCombo);
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + 100 + newCombo * 25);
    } else {
      audioManager.playWrongAnswer();
      setCombo(0);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4 text-white overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Permainan"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Lencana Mini-Game */}
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1 text-xs font-bold text-amber-300">
          <Trash2 className="h-4 w-4 text-amber-400" />
          <span>Mini-Permainan: Stesen Kitar Semula Pantas</span>
        </div>

        <h3 className="mt-2 text-2xl md:text-3xl font-black text-white font-['Fredoka']">
          Asingkan Sisa Mengikut Tong
        </h3>

        {/* Bar Status: Masa, Skor & Kombo */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-950/80 p-3 border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3 text-cyan-400" /> Masa
            </span>
            <span className={`text-xl font-black font-['Fredoka'] ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Award className="h-3 w-3 text-amber-400" /> Skor
            </span>
            <span className="text-xl font-black text-amber-300 font-['Fredoka']">
              {score}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" /> Kombo
            </span>
            <span className="text-xl font-black text-orange-400 font-['Fredoka']">
              x{combo}
            </span>
          </div>
        </div>

        {/* Paparan Barangan Semasa */}
        {!isGameOver ? (
          <div className="mt-6 flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 border-2 border-emerald-400/50 text-5xl shadow-inner animate-bounce">
              {currentItem.icon}
            </div>
            <h4 className="mt-3 text-lg md:text-xl font-black text-white font-['Fredoka']">
              {currentItem.name}
            </h4>
            <p className="text-xs text-slate-400">Pilih warna tong yang tepat di bawah:</p>

            {/* 3 Tong Kitar Semula Standard Malaysia */}
            <div className="mt-5 grid grid-cols-3 gap-3 w-full">
              {/* Tong Biru */}
              <button
                type="button"
                onClick={() => handleSort('kertas')}
                className="flex flex-col items-center rounded-2xl border-2 border-blue-400 bg-blue-950/70 p-3 hover:bg-blue-900/90 hover:scale-105 active:scale-95 transition cursor-pointer shadow-lg shadow-blue-950/50"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow">
                  🗑️
                </div>
                <span className="mt-2 text-xs font-bold text-blue-200">TONG BIRU</span>
                <span className="text-[10px] text-blue-300">Kertas & Kotak</span>
              </button>

              {/* Tong Jingga */}
              <button
                type="button"
                onClick={() => handleSort('plastik_aluminium')}
                className="flex flex-col items-center rounded-2xl border-2 border-orange-400 bg-orange-950/70 p-3 hover:bg-orange-900/90 hover:scale-105 active:scale-95 transition cursor-pointer shadow-lg shadow-orange-950/50"
              >
                <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-xl shadow">
                  🗑️
                </div>
                <span className="mt-2 text-xs font-bold text-orange-200">TONG JINGGA</span>
                <span className="text-[10px] text-orange-300">Plastik & Tin</span>
              </button>

              {/* Tong Coklat */}
              <button
                type="button"
                onClick={() => handleSort('kaca_logam')}
                className="flex flex-col items-center rounded-2xl border-2 border-amber-600 bg-amber-950/70 p-3 hover:bg-amber-900/90 hover:scale-105 active:scale-95 transition cursor-pointer shadow-lg shadow-amber-950/50"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-700 flex items-center justify-center text-xl shadow">
                  🗑️
                </div>
                <span className="mt-2 text-xs font-bold text-amber-200">TONG COKLAT</span>
                <span className="text-[10px] text-amber-300">Kaca & Logam</span>
              </button>
            </div>

            {/* Maklum Balas Semasa */}
            {lastFeedback && (
              <p className="mt-3 text-xs text-emerald-300 font-semibold">{lastFeedback}</p>
            )}
          </div>
        ) : (
          /* Keputusan Tamat Permainan */
          <div className="mt-6 rounded-2xl bg-slate-950/90 p-6 border border-emerald-500/40 animate-in fade-in">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h4 className="mt-2 text-2xl font-black text-white font-['Fredoka']">
              Masa Tamat! Syabas Wira Alam!
            </h4>
            <p className="mt-1 text-sm text-emerald-300">
              Kamu berjaya mengasingkan {correctCount} bahan sisa dengan tepat.
            </p>
            <p className="mt-2 text-3xl font-black text-amber-400 font-['Fredoka']">
              Skor Akhir: {score}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition font-['Fredoka'] cursor-pointer"
            >
              Simpan & Kembali ke Taman
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
