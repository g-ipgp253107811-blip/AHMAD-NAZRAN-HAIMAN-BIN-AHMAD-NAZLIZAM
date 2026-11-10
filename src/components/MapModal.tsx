/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Peta Penuh Kawasan Terbuka Taman (Full Open-World Map)
 */

import React from 'react';
import { ZONES } from '../game/curriculumData.ts';
import { ZoneId } from '../types/game.ts';
import { MapPin, Compass, Navigation, X } from 'lucide-react';

interface MapModalProps {
  currentZone: ZoneId;
  playerPosition: { x: number; z: number };
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  currentZone,
  playerPosition,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 text-white overflow-y-auto font-['Plus_Jakarta_Sans']">
      <div className="relative w-full max-w-3xl rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl flex flex-col max-h-[92vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition"
          aria-label="Tutup Peta"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tajuk Peta */}
        <div className="border-b border-emerald-500/30 pb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
            <Compass className="h-4 w-4" />
            <span>Peta Navigasi Terbuka Taman Lestari</span>
          </div>
          <h3 className="mt-2 text-2xl font-black text-white font-['Fredoka']">
            Enam Kawasan Utama Taman Lestari
          </h3>
        </div>

        {/* Kanvas Paparan Peta Interaktif 2D */}
        <div className="mt-4 relative h-80 md:h-96 w-full rounded-2xl border-2 border-emerald-500/30 bg-emerald-950/40 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Aliran Sungai Lestari (Laluan Biru) */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pointer-events-none opacity-60">
            <path
              d="M 52 0 Q 58 30 50 60 T 54 100"
              stroke="#0284c7"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Jambatan Kayu Hub Tengah */}
            <rect x="46" y="47" width="14" height="6" fill="#8d6e63" stroke="#4e342e" strokeWidth="1" />
          </svg>

          {/* Penunjuk 6 Zon Utama */}
          {Object.values(ZONES).map((z) => {
            const mx = ((z.coordinates.x + 75) / 150) * 100;
            const my = ((z.coordinates.z + 75) / 150) * 100;
            const isCurrent = currentZone === z.id;

            return (
              <div
                key={z.id}
                style={{ left: `${mx}%`, top: `${my}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
              >
                <div
                  style={{ backgroundColor: z.color }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform ${
                    isCurrent ? 'scale-125 ring-4 ring-emerald-400' : 'group-hover:scale-110'
                  }`}
                >
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="mt-1 rounded-lg bg-slate-950/90 px-2 py-0.5 text-[10px] md:text-xs font-bold text-white shadow border border-slate-700 whitespace-nowrap">
                  {z.name}
                </span>
              </div>
            );
          })}

          {/* Kedudukan Pemain Semasa */}
          <div
            style={{
              left: `${((playerPosition.x + 75) / 150) * 100}%`,
              top: `${((playerPosition.z + 75) / 150) * 100}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          >
            <div className="h-4 w-4 rounded-full bg-white border-2 border-emerald-500 shadow-xl animate-ping" />
            <div className="absolute h-4 w-4 rounded-full bg-emerald-400 border border-white flex items-center justify-center shadow">
              <Navigation className="h-2.5 w-2.5 text-slate-950 fill-current" />
            </div>
            <span className="mt-3 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-slate-950 shadow">
              KAU DI SINI
            </span>
          </div>
        </div>

        {/* Ringkasan 6 Zon */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.values(ZONES).map((z) => (
            <div key={z.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span style={{ backgroundColor: z.color }} className="h-2 w-2 rounded-full" />
                <span>{z.name}</span>
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400 truncate">{z.landmark}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition font-['Fredoka'] cursor-pointer"
          >
            Tutup Peta
          </button>
        </div>
      </div>
    </div>
  );
};
