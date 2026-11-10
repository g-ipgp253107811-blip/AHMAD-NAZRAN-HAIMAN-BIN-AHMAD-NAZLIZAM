/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Kad Penemuan Khazanah Flora & Fauna Malaysia
 */

import React from 'react';
import { FloraFaunaCollectible } from '../types/game.ts';
import { Sparkles, BookOpen, Compass, X } from 'lucide-react';

interface CollectibleDiscoveryModalProps {
  collectible: FloraFaunaCollectible;
  onClose: () => void;
}

export const CollectibleDiscoveryModal: React.FC<CollectibleDiscoveryModalProps> = ({
  collectible,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4 text-white overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 p-6 md:p-8 shadow-2xl shadow-amber-500/20 text-center animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Kad"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Lencana Emas */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/20 px-4 py-1.5 text-xs font-black text-amber-300">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>KHAZANAH TERSEMBUNYI DITEMUI!</span>
        </div>

        {/* Nama Khazanah */}
        <h3 className="mt-3 text-2xl md:text-3xl font-black text-white font-['Fredoka']">
          {collectible.name}
        </h3>
        <p className="text-xs text-amber-300 italic font-mono">
          {collectible.scientificName} · {collectible.malayStatus}
        </p>

        {/* Penerangan Ringkas */}
        <div className="mt-4 rounded-2xl bg-slate-950/80 p-4 border border-emerald-500/30 text-left">
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
            {collectible.description}
          </p>

          {/* Fakta Menarik */}
          <div className="mt-3 rounded-xl bg-amber-950/40 border border-amber-500/30 p-3">
            <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>💡 Tahukah Anda?</span>
            </p>
            <p className="mt-1 text-xs text-amber-100/90 leading-normal">
              {collectible.funFact}
            </p>
          </div>
        </div>

        {/* Kosa Kata Baharu yang Dibuka */}
        <div className="mt-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 p-4 text-left">
          <div className="flex items-center gap-2 text-xs font-black text-cyan-300 uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Kosa Kata Baharu Dimasukkan ke Jurnal:</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-black text-cyan-200 uppercase font-['Fredoka']">
              "{collectible.newVocabulary.word}"
            </span>
          </div>
          <p className="mt-1 text-xs text-cyan-100/90">
            <strong>Maksud:</strong> {collectible.newVocabulary.definition}
          </p>
        </div>

        {/* Butang Teruskan */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-3 text-sm font-black text-slate-950 shadow-lg hover:scale-102 transition font-['Fredoka'] cursor-pointer"
          >
            Simpan ke Jurnal & Teruskan Pengembaraan
          </button>
        </div>
      </div>
    </div>
  );
};
