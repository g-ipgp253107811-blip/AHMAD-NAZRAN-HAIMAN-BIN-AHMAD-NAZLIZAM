/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Papan Maklumat Interaktif (Misi 1: Pemburu Kosa Kata)
 */

import React, { useState, useEffect } from 'react';
import { ReadingBoardData, KosaKataItem } from '../types/game.ts';
import { INITIAL_KOSA_KATA } from '../game/curriculumData.ts';
import { ttsEngine } from '../audio/ttsService.ts';
import { audioManager } from '../audio/audioManager.ts';
import { BookOpen, Sparkles, Volume2, RotateCcw, Check, X } from 'lucide-react';

interface ReadingBoardModalProps {
  board: ReadingBoardData;
  collectedWordIds: string[];
  onClose: () => void;
  onCollectWord: (wordId: string) => void;
  onFinishBoard: (boardId: string) => void;
}

export const ReadingBoardModal: React.FC<ReadingBoardModalProps> = ({
  board,
  collectedWordIds,
  onClose,
  onCollectWord,
  onFinishBoard,
}) => {
  const [selectedWord, setSelectedWord] = useState<KosaKataItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Kosa kata sasaran bagi papan ini
  const boardVocabList = INITIAL_KOSA_KATA.filter((k) =>
    board.targetWords.some((tw) => tw.toLowerCase() === k.word.toLowerCase())
  );

  useEffect(() => {
    playBoardVoice();
    return () => {
      ttsEngine.stop();
    };
  }, [board]);

  const playBoardVoice = () => {
    setIsSpeaking(true);
    ttsEngine.speak({
      text: `${board.title}. ${board.passage}`,
      voiceName: 'ms-MY-YasminNeural',
      pitch: 1.0,
      rate: 0.92,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleWordClick = (wordText: string) => {
    const item = INITIAL_KOSA_KATA.find(
      (k) => k.word.toLowerCase() === wordText.toLowerCase()
    );
    if (item) {
      setSelectedWord(item);
      if (!collectedWordIds.includes(item.id)) {
        onCollectWord(item.id);
        audioManager.playVocabularyCollected();
      }
    }
  };

  const handleCollectAll = () => {
    boardVocabList.forEach((item) => {
      if (!collectedWordIds.includes(item.id)) {
        onCollectWord(item.id);
      }
    });
    audioManager.playVocabularyCollected();
    onFinishBoard(board.id);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 text-white overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl shadow-emerald-950/80">
        <button
          type="button"
          onClick={() => {
            ttsEngine.stop();
            onClose();
          }}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Papan"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tajuk Papan Maklumat */}
        <div className="border-b border-emerald-500/30 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
            <span>Misi 1: Pemburu Kosa Kata · Standard 2.2.1</span>
          </div>
          <h3 className="mt-2 text-2xl font-black text-white font-['Fredoka']">
            {board.title}
          </h3>
          <p className="text-xs text-emerald-400 font-medium">{board.subtitle}</p>
        </div>

        {/* Petikan Bacaan dengan Kata Kunci Interaktif */}
        <div className="mt-4 rounded-2xl bg-slate-950/90 p-5 border border-emerald-500/20">
          <p className="text-base md:text-lg leading-relaxed text-slate-100 font-medium">
            {board.passage.split(' ').map((word, i) => {
              const cleanWord = word.replace(/[.,]/g, '').toLowerCase();
              const isTarget = board.targetWords.some((tw) =>
                tw.toLowerCase().includes(cleanWord) && cleanWord.length > 3
              );

              if (isTarget) {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleWordClick(cleanWord)}
                    className="inline-block mx-1 rounded-lg bg-emerald-500/30 px-2 py-0.5 font-bold text-emerald-300 underline decoration-emerald-400 decoration-2 underline-offset-4 hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer"
                  >
                    {word}{' '}
                  </button>
                );
              }
              return <span key={i}>{word} </span>;
            })}
          </p>

          {/* Kawalan Pembacaan Suara */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
            <span className="text-xs text-slate-400">
              *Tekan mana-mana perkataan bergaris untuk melihat maksud kamus.
            </span>
            <button
              type="button"
              onClick={playBoardVoice}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/70 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-900 transition"
            >
              <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
              <span>Dengar Bacaan</span>
            </button>
          </div>
        </div>

        {/* Kad Maksud Kosa Kata Terpilih */}
        {selectedWord && (
          <div className="mt-4 rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-cyan-200 uppercase font-['Fredoka'] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>{selectedWord.word}</span>
                {selectedWord.rootWord && (
                  <span className="text-xs font-normal text-slate-400">
                    (Kata dasar: {selectedWord.rootWord})
                  </span>
                )}
              </h4>
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                Disimpan ke Kamus
              </span>
            </div>
            <p className="mt-1.5 text-xs md:text-sm text-slate-200">
              <strong>Maksud:</strong> {selectedWord.definition}
            </p>
            <p className="mt-1 text-xs text-cyan-200/90 italic">
              <strong>Contoh Ayat:</strong> "{selectedWord.exampleSentence}"
            </p>
          </div>
        )}

        {/* Senarai Kosa Kata untuk Dikumpul */}
        <div className="mt-4 flex flex-wrap gap-2">
          {boardVocabList.map((vocab) => {
            const isCollected = collectedWordIds.includes(vocab.id);
            return (
              <button
                key={vocab.id}
                type="button"
                onClick={() => handleWordClick(vocab.word)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  isCollected
                    ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-emerald-500'
                }`}
              >
                {isCollected ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                )}
                <span>{vocab.word}</span>
              </button>
            );
          })}
        </div>

        {/* Butang Tindakan Kumpul & Selesai */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            onClick={handleCollectAll}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg hover:scale-102 transition font-['Fredoka'] cursor-pointer"
          >
            Kumpul Semua & Selesai Papan Ini
          </button>
        </div>
      </div>
    </div>
  );
};
