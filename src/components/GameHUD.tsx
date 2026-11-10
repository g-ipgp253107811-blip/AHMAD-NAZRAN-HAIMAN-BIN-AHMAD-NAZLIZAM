/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Paparan Antara Muka Utama Permainan (Game HUD)
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  CharacterGender,
  ZoneId,
  WeatherType,
  MissionState,
} from '../types/game.ts';
import { ZONES, WEATHER_PRESETS } from '../game/curriculumData.ts';
import { InteractionTarget } from '../game/threeEngine.ts';
import {
  Compass,
  Map as MapIcon,
  BookOpen,
  Award,
  Settings,
  CloudRain,
  Sun,
  Wind,
  Sunrise,
  Volume2,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface GameHUDProps {
  gender: CharacterGender;
  currentZone: ZoneId;
  weather: WeatherType;
  missionState: MissionState;
  interactionTarget: InteractionTarget | null;
  playerPosition: { x: number; z: number };
  onInteract: () => void;
  onOpenJournal: () => void;
  onOpenVocabulary: () => void;
  onOpenMap: () => void;
  onOpenPbd: () => void;
  onOpenSettings: () => void;
  onToggleWeather: () => void;
  onTouchMove?: (x: number, z: number, run: boolean) => void;
  onTouchJump?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gender,
  currentZone,
  weather,
  missionState,
  interactionTarget,
  playerPosition,
  onInteract,
  onOpenJournal,
  onOpenVocabulary,
  onOpenMap,
  onOpenPbd,
  onOpenSettings,
  onToggleWeather,
  onTouchMove,
  onTouchJump,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);
  const zoneInfo = ZONES[currentZone] || ZONES.PINTU_MASUK;
  const weatherInfo = WEATHER_PRESETS[weather];

  // Virtual Joystick Logic
  const joystickRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isDraggingStick, setIsDraggingStick] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDraggingStick(true);
    updateJoystick(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingStick) return;
    updateJoystick(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setIsDraggingStick(false);
    setStickPos({ x: 0, y: 0 });
    if (onTouchMove) onTouchMove(0, 0, false);
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;
    setStickPos({ x: stickX, y: stickY });

    const normX = stickX / maxRadius;
    const normY = stickY / maxRadius;
    const isRunning = clampedDist > maxRadius * 0.75;

    if (onTouchMove) {
      onTouchMove(normX, normY, isRunning);
    }
  };

  // Ikon Cuaca
  const renderWeatherIcon = () => {
    switch (weather) {
      case 'hujan':
        return <CloudRain className="h-4 w-4 text-cyan-300" />;
      case 'berangin':
        return <Wind className="h-4 w-4 text-teal-300" />;
      case 'senja':
        return <Sunrise className="h-4 w-4 text-amber-400" />;
      case 'cerah':
      default:
        return <Sun className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 font-['Plus_Jakarta_Sans']">
      {/* ========================================================= */}
      {/* BAHAGIAN ATAS KIRI: PROFIL WIRA & STATUS ZON ALAM */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/90 px-4 py-2.5 shadow-xl shadow-black/40">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800/80 text-2xl border border-emerald-400/50">
            {gender === 'lelaki' ? '👦' : '👧'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-['Fredoka']">
                {gender === 'lelaki' ? 'Wira Amir' : 'Wira Aina'}
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Tahun 3
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{zoneInfo.name}</span>
            </div>
          </div>
        </div>

        {/* Lencana Cuaca Dinamik (Boleh ditekan untuk bertukar) */}
        <button
          type="button"
          onClick={onToggleWeather}
          title="Tekan untuk ubah cuaca taman"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 transition"
        >
          {renderWeatherIcon()}
          <span>{weatherInfo.label}</span>
          <span className="text-[10px] text-slate-400">({weatherInfo.temperature}°C)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* BAHAGIAN ATAS KANAN: MINI-PETA GPS & BUTANG PINTAS */}
      {/* ========================================================= */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Mini-Peta 2D Kompak */}
        <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-2xl border-2 border-emerald-500/50 bg-slate-950/90 shadow-xl overflow-hidden">
          {/* Kompas Penunjuk Arah */}
          <div className="absolute top-1 left-2 text-[10px] font-extrabold text-emerald-400">
            U (N)
          </div>

          {/* Garisan grid minimap */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />

          {/* Penunjuk 6 Zon pada Mini-Peta */}
          {Object.values(ZONES).map((z) => {
            // Skala koordinat (-75..75) ke (0..100)%
            const mx = ((z.coordinates.x + 75) / 150) * 100;
            const my = ((z.coordinates.z + 75) / 150) * 100;
            return (
              <div
                key={z.id}
                style={{ left: `${mx}%`, top: `${my}%`, backgroundColor: z.color }}
                className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 shadow"
                title={z.name}
              />
            );
          })}

          {/* Pemain pada Mini-Peta */}
          <div
            style={{
              left: `${((playerPosition.x + 75) / 150) * 100}%`,
              top: `${((playerPosition.z + 75) / 150) * 100}%`,
            }}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-emerald-500 shadow-md animate-ping"
          />
          <div
            style={{
              left: `${((playerPosition.x + 75) / 150) * 100}%`,
              top: `${((playerPosition.z + 75) / 150) * 100}%`,
            }}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 border border-white"
          />
        </div>

        {/* Butang Pintas Bar Alat Navigasi */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onOpenJournal}
            className="flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-slate-900/90 px-2.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-900/50 transition shadow"
            title="Jurnal Misi & Pencapaian [J]"
          >
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span className="hidden md:inline">Jurnal [J]</span>
          </button>

          <button
            type="button"
            onClick={onOpenVocabulary}
            className="flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-slate-900/90 px-2.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-900/50 transition shadow"
            title="Kamus Kosa Kata [K]"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="hidden md:inline">Kosa Kata [K]</span>
          </button>

          <button
            type="button"
            onClick={onOpenMap}
            className="flex items-center gap-1 rounded-xl border border-blue-500/40 bg-slate-900/90 px-2.5 py-1.5 text-xs font-bold text-blue-200 hover:bg-blue-900/50 transition shadow"
            title="Peta Taman [M]"
          >
            <MapIcon className="h-4 w-4 text-blue-400" />
            <span className="hidden md:inline">Peta [M]</span>
          </button>

          <button
            type="button"
            onClick={onOpenPbd}
            className="flex items-center gap-1 rounded-xl border border-amber-500/40 bg-slate-900/90 px-2.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-900/50 transition shadow"
            title="Ujian PBD & Sijil [T]"
          >
            <Award className="h-4 w-4 text-amber-400" />
            <span className="hidden md:inline">PBD [T]</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-xl border border-slate-700 bg-slate-900/90 p-2 text-slate-300 hover:text-white transition shadow"
            title="Tetapan [P / Esc]"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BAHAGIAN BAWAH TENGAH: PROMPT INTERAKSI KONTEKSTUAL [E] */}
      {/* ========================================================= */}
      {interactionTarget && (
        <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            type="button"
            onClick={onInteract}
            className="flex items-center gap-3 rounded-2xl border-2 border-emerald-400 bg-slate-900/95 px-6 py-3.5 shadow-2xl shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 font-black text-slate-950 text-sm font-['Fredoka']">
              E
            </span>
            <span className="text-sm md:text-base font-bold text-white font-['Fredoka']">
              {interactionTarget.prompt}
            </span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* KAWALAN SENTUH VIRTUAL JOYSTICK (UNTUK TABLET / SKRIN SENTUH) */}
      {/* ========================================================= */}
      {isTouchDevice && (
        <>
          {/* Virtual Joystick (Bawah Kiri) */}
          <div
            ref={joystickRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute bottom-6 left-6 h-32 w-32 rounded-full border-2 border-emerald-500/40 bg-slate-950/70 shadow-2xl pointer-events-auto flex items-center justify-center touch-none"
          >
            <div
              style={{
                transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
              }}
              className="h-12 w-12 rounded-full bg-emerald-500 border-2 border-white shadow-lg"
            />
          </div>

          {/* Butang Tindakan Sentuh (Bawah Kanan: Lompat & Interaksi) */}
          <div className="absolute bottom-8 right-6 flex flex-col gap-3 pointer-events-auto">
            {interactionTarget && (
              <button
                type="button"
                onClick={onInteract}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-600 font-black text-white shadow-xl active:scale-90 transition font-['Fredoka']"
              >
                E
              </button>
            )}

            <button
              type="button"
              onClick={onTouchJump}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-teal-400 bg-slate-900/90 font-black text-teal-300 shadow-xl active:scale-90 transition font-['Fredoka'] text-xs uppercase"
            >
              Lompat
            </button>
          </div>
        </>
      )}
    </div>
  );
};
