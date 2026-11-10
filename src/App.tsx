/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Komponen Induk Permainan (Main Application Coordinator)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameState,
  CharacterGender,
  GraphicQuality,
  ZoneId,
  WeatherType,
  MissionState,
  AudioSettings,
  PbdResult,
  NpcData,
  ReadingBoardData,
  InferencePuzzleData,
  FloraFaunaCollectible,
} from './types/game.ts';
import {
  TamanLestari3DEngine,
  InteractionTarget,
} from './game/threeEngine.ts';
import {
  READING_BOARDS,
  NPCS,
  INFERENCE_PUZZLES,
  FLORA_FAUNA_COLLECTIBLES,
  INITIAL_TRASH_ITEMS,
  INITIAL_PLANTING_SPOTS,
  INITIAL_RIVER_SPOTS,
} from './game/curriculumData.ts';
import { getZoneForCoordinates } from './game/rules.ts';
import { audioManager } from './audio/audioManager.ts';
import { ttsEngine } from './audio/ttsService.ts';

// Komponen Antara Muka Pengguna (UI Overlays)
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameHUD } from './components/GameHUD.tsx';
import { DialogueModal } from './components/DialogueModal.tsx';
import { ReadingBoardModal } from './components/ReadingBoardModal.tsx';
import { InferencePuzzleModal } from './components/InferencePuzzleModal.tsx';
import { RecyclingMiniGame } from './components/RecyclingMiniGame.tsx';
import { BirdCallMiniGame } from './components/BirdCallMiniGame.tsx';
import { CollectibleDiscoveryModal } from './components/CollectibleDiscoveryModal.tsx';
import { QuestJournalModal } from './components/QuestJournalModal.tsx';
import { PbdAssessmentModal } from './components/PbdAssessmentModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { MapModal } from './components/MapModal.tsx';

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TamanLestari3DEngine | null>(null);

  // Status Utama Permainan
  const [gameState, setGameState] = useState<GameState>('title');
  const [gender, setGender] = useState<CharacterGender>('lelaki');
  const [quality, setQuality] = useState<GraphicQuality>('tinggi');
  const [currentZone, setCurrentZone] = useState<ZoneId>('PINTU_MASUK');
  const [weather, setWeather] = useState<WeatherType>('cerah');
  const [playerPosition, setPlayerPosition] = useState({ x: -35, z: -35 });
  const [interactionTarget, setInteractionTarget] = useState<InteractionTarget | null>(null);

  // Sasaran Modal Aktif
  const [activeNpc, setActiveNpc] = useState<NpcData | null>(null);
  const [activeBoard, setActiveBoard] = useState<ReadingBoardData | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<InferencePuzzleData | null>(null);
  const [activeCollectible, setActiveCollectible] = useState<FloraFaunaCollectible | null>(null);

  // Pengesanan Kemajuan Misi & Kosa Kata
  const [collectedWordIds, setCollectedWordIds] = useState<string[]>([]);
  const [foundCollectibleIds, setFoundCollectibleIds] = useState<string[]>([]);
  const [pbdResult, setPbdResult] = useState<PbdResult | null>(null);

  const [missionState, setMissionState] = useState<MissionState>({
    misi1_kosaKata: {
      completed: false,
      collectedWordIds: [],
      readBoardIds: [],
      totalWords: 8,
    },
    misi2_penyiasatMaklumat: {
      completed: false,
      interactedNpcIds: [],
      correctNpcIds: [],
      totalNpcs: 3,
    },
    misi3_detektifTersirat: {
      completed: false,
      completedPuzzleIds: [],
      totalPuzzles: 3,
    },
    misi4_penyelamatTaman: {
      completed: false,
      trashCollectedCount: 0,
      trashSortedCount: 0,
      riverCleanedCount: 0,
      treesPlantedCount: 0,
      totalTrash: INITIAL_TRASH_ITEMS.length,
      totalRiverSpots: INITIAL_RIVER_SPOTS.length,
      totalTrees: INITIAL_PLANTING_SPOTS.length,
    },
  });

  // Segerakkan dataset state untuk Ultra Mode dan mod kamera enjin 3D
  useEffect(() => {
    document.body.dataset.state = gameState === 'title' ? 'title' : 'playing';
    engineRef.current?.setTitleMode(gameState === 'title');
  }, [gameState]);

  // Semak Autostart Query Parameter (?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      handleStartGame('lelaki', 'tinggi');
    }
  }, []);

  // 1. Inisialisasi Enjin 3D Three.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new TamanLestari3DEngine(canvasRef.current, gender, quality, gameState === 'title');
    engineRef.current = engine;

    // Sambungkan callbacks dari enjin 3D ke React
    engine.onInteractionChange = (target) => {
      setInteractionTarget(target);
    };

    engine.onStepSound = (surface) => {
      audioManager.playFootstep(surface);
    };

    // Gelung penyelarasan koordinat zon & kedudukan (10Hz)
    const interval = setInterval(() => {
      if (!engine) return;
      const pos = engine.playerPosition;
      setPlayerPosition({ x: pos.x, z: pos.z });

      const zone = getZoneForCoordinates(pos.x, pos.z);
      setCurrentZone((prev) => {
        if (prev !== zone) {
          audioManager.setZone(zone);
          return zone;
        }
        return prev;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      engine.dispose();
      engineRef.current = null;
    };
  }, [gender, quality]);

  // 2. Pengendali Input Papan Kekunci
  useEffect(() => {
    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika sedang menaip dalam borang
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      keysPressed.add(e.code);

      // Mulakan permainan jika menekan Enter/Space pada Title Screen
      if (gameState === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        handleStartGame(gender, quality);
        return;
      }

      // Butang Interaksi [E]
      if (e.code === 'KeyE' && gameState === 'playing') {
        handleInteract();
      }

      // Pintasan Papan Kekunci
      if (e.code === 'KeyJ') {
        setGameState((prev) => (prev === 'journal' ? 'playing' : 'journal'));
      }
      if (e.code === 'KeyK') {
        setGameState((prev) => (prev === 'vocabulary' ? 'playing' : 'vocabulary'));
      }
      if (e.code === 'KeyM') {
        setGameState((prev) => (prev === 'map' ? 'playing' : 'map'));
      }
      if (e.code === 'KeyT') {
        setGameState((prev) => (prev === 'pbd_quiz' ? 'playing' : 'pbd_quiz'));
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        setGameState((prev) => (prev === 'settings' ? 'playing' : 'settings'));
      }

      if (e.code === 'Space' && gameState === 'playing') {
        engineRef.current?.jump();
        audioManager.playJump();
      }

      updateMoveInputs();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.code);
      updateMoveInputs();
    };

    const updateMoveInputs = () => {
      if (!engineRef.current || gameState !== 'playing') return;

      let x = 0;
      let z = 0;

      if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) z -= 1;
      if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) z += 1;
      if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) x -= 1;
      if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) x += 1;

      const running = keysPressed.has('ShiftLeft') || keysPressed.has('ShiftRight');
      engineRef.current.setMoveInput(x, z, running);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', () => {
      keysPressed.clear();
      updateMoveInputs();
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, gender, quality, interactionTarget]);

  // 3. Kawalan Kamera Menggunakan Tetikus (Mouse Drag Orbit)
  useEffect(() => {
    let isMouseDown = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (gameState !== 'playing') return;
      isMouseDown = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || gameState !== 'playing') return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      engineRef.current?.rotateCamera(dx, dy);
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gameState]);

  // 4. Mula Permainan & Pengaktifan Web Audio
  const handleStartGame = (selectedGender: CharacterGender, selectedQuality: GraphicQuality) => {
    setGender(selectedGender);
    setQuality(selectedQuality);
    audioManager.init();
    audioManager.playVocabularyCollected();
    setGameState('playing');
  };

  // 5. Pengendali Interaksi [E]
  const handleInteract = () => {
    if (!interactionTarget) return;

    if (interactionTarget.type === 'npc') {
      const npc = NPCS.find((n) => n.id === interactionTarget.id);
      if (npc) {
        setActiveNpc(npc);
        setGameState('dialogue');
      }
    } else if (interactionTarget.type === 'board') {
      const board = READING_BOARDS.find((b) => b.id === interactionTarget.id);
      if (board) {
        setActiveBoard(board);
        setGameState('reading_board');
      }
    } else if (interactionTarget.type === 'trash') {
      // Kutip sampah langsung
      handleCollectTrash(interactionTarget.id);
    } else if (interactionTarget.type === 'planting') {
      // Tanam anak pokok langsung
      handlePlantTree(interactionTarget.id);
    } else if (interactionTarget.type === 'collectible') {
      const col = FLORA_FAUNA_COLLECTIBLES.find((c) => c.id === interactionTarget.id);
      if (col) {
        setActiveCollectible(col);
        setGameState('collectible_card');
        handleCollectDiscovery(col.id);
      }
    } else if (interactionTarget.type === 'mini_game_sorting') {
      setGameState('sorting_game');
    } else if (interactionTarget.type === 'mini_game_bird') {
      setGameState('bird_call_game');
    }
  };

  // Kumpul Kosa Kata (Misi 1)
  const handleCollectWord = (wordId: string) => {
    setCollectedWordIds((prev) => {
      if (prev.includes(wordId)) return prev;
      const updated = [...prev, wordId];
      // Kemas kini Misi 1
      setMissionState((mPrev) => {
        const isComplete = updated.length >= 6;
        return {
          ...mPrev,
          misi1_kosaKata: {
            ...mPrev.misi1_kosaKata,
            collectedWordIds: updated,
            completed: isComplete,
          },
        };
      });
      return updated;
    });
  };

  const handleFinishBoard = (boardId: string) => {
    setMissionState((prev) => {
      const reads = prev.misi1_kosaKata.readBoardIds.includes(boardId)
        ? prev.misi1_kosaKata.readBoardIds
        : [...prev.misi1_kosaKata.readBoardIds, boardId];
      return {
        ...prev,
        misi1_kosaKata: {
          ...prev.misi1_kosaKata,
          readBoardIds: reads,
          completed: reads.length >= 3 || prev.misi1_kosaKata.collectedWordIds.length >= 6,
        },
      };
    });
    setGameState('playing');
  };

  // Selesai Jawab NPC (Misi 2)
  const handleAnswerNpcCorrect = (npcId: string) => {
    setMissionState((prev) => {
      const correctList = prev.misi2_penyiasatMaklumat.correctNpcIds.includes(npcId)
        ? prev.misi2_penyiasatMaklumat.correctNpcIds
        : [...prev.misi2_penyiasatMaklumat.correctNpcIds, npcId];
      return {
        ...prev,
        misi2_penyiasatMaklumat: {
          ...prev.misi2_penyiasatMaklumat,
          correctNpcIds: correctList,
          completed: correctList.length >= 3,
        },
      };
    });
  };

  // Selesai Teka-teki Inferens (Misi 3)
  const handleCompleteInference = (puzzleId: string) => {
    setMissionState((prev) => {
      const puzzles = prev.misi3_detektifTersirat.completedPuzzleIds.includes(puzzleId)
        ? prev.misi3_detektifTersirat.completedPuzzleIds
        : [...prev.misi3_detektifTersirat.completedPuzzleIds, puzzleId];
      return {
        ...prev,
        misi3_detektifTersirat: {
          ...prev.misi3_detektifTersirat,
          completedPuzzleIds: puzzles,
          completed: puzzles.length >= 3,
        },
      };
    });
  };

  // Kutip Sampah (Misi 4)
  const handleCollectTrash = (trashId: string) => {
    audioManager.playTrashPickup();
    engineRef.current?.updateRestorationVisuals(trashId, false, '', false, '');
    setMissionState((prev) => {
      const count = prev.misi4_penyelamatTaman.trashCollectedCount + 1;
      const sorted = prev.misi4_penyelamatTaman.trashSortedCount + 1;
      return {
        ...prev,
        misi4_penyelamatTaman: {
          ...prev.misi4_penyelamatTaman,
          trashCollectedCount: count,
          trashSortedCount: sorted,
          completed: count >= 4,
        },
      };
    });
  };

  // Tanam Pokok (Misi 4)
  const handlePlantTree = (spotId: string) => {
    audioManager.playTreePlanted();
    engineRef.current?.updateRestorationVisuals('', true, spotId, false, '');
    setMissionState((prev) => {
      const count = prev.misi4_penyelamatTaman.treesPlantedCount + 1;
      return {
        ...prev,
        misi4_penyelamatTaman: {
          ...prev.misi4_penyelamatTaman,
          treesPlantedCount: count,
        },
      };
    });
  };

  // Temui Khazanah Flora & Fauna
  const handleCollectDiscovery = (colId: string) => {
    audioManager.playVocabularyCollected();
    engineRef.current?.updateCollectibleVisual(colId);
    setFoundCollectibleIds((prev) => (prev.includes(colId) ? prev : [...prev, colId]));
  };

  // Tukar Cuaca
  const handleToggleWeather = () => {
    const weathers: WeatherType[] = ['cerah', 'hujan', 'berangin', 'senja'];
    const nextIdx = (weathers.indexOf(weather) + 1) % weathers.length;
    const nextWeather = weathers[nextIdx];
    setWeather(nextWeather);
    engineRef.current?.setWeather(nextWeather);
    audioManager.setWeather(nextWeather);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950">
      {/* 1. KONTENA 3D THREE.JS WEBGL RENDERER */}
      <div ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 2. SKRIN UTAMA / MENU TITLE */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenSettings={() => setGameState('settings')}
        />
      )}

      {/* 3. PAPARAN GAME HUD (KOMPAS, MINIMAP, PROFIL, BUTANG) */}
      {gameState !== 'title' && (
        <GameHUD
          gender={gender}
          currentZone={currentZone}
          weather={weather}
          missionState={missionState}
          interactionTarget={interactionTarget}
          playerPosition={playerPosition}
          onInteract={handleInteract}
          onOpenJournal={() => setGameState('journal')}
          onOpenVocabulary={() => setGameState('vocabulary')}
          onOpenMap={() => setGameState('map')}
          onOpenPbd={() => setGameState('pbd_quiz')}
          onOpenSettings={() => setGameState('settings')}
          onToggleWeather={handleToggleWeather}
          onTouchMove={(x, z, run) => engineRef.current?.setMoveInput(x, z, run)}
          onTouchJump={() => {
            engineRef.current?.jump();
            audioManager.playJump();
          }}
        />
      )}

      {/* 4. MODAL DIALOG NPC (MISI 2: PENYIASAT MAKLUMAT) */}
      {gameState === 'dialogue' && activeNpc && (
        <DialogueModal
          npc={activeNpc}
          onClose={() => setGameState('playing')}
          onAnswerCorrect={handleAnswerNpcCorrect}
        />
      )}

      {/* 5. MODAL PAPAN MAKLUMAT (MISI 1: PEMBURU KOSA KATA) */}
      {gameState === 'reading_board' && activeBoard && (
        <ReadingBoardModal
          board={activeBoard}
          collectedWordIds={collectedWordIds}
          onClose={() => setGameState('playing')}
          onCollectWord={handleCollectWord}
          onFinishBoard={handleFinishBoard}
        />
      )}

      {/* 6. MODAL DETEKTIF ISI TERSIRAT (MISI 3) */}
      {gameState === 'inference_puzzle' && activePuzzle && (
        <InferencePuzzleModal
          puzzle={activePuzzle}
          onClose={() => setGameState('playing')}
          onComplete={handleCompleteInference}
        />
      )}

      {/* 7. MINI-GAME: STESEN KITAR SEMULA PANTAS */}
      {gameState === 'sorting_game' && (
        <RecyclingMiniGame
          onClose={() => setGameState('playing')}
          onFinish={(score) => {
            audioManager.playMissionFanfare();
            setGameState('playing');
          }}
        />
      )}

      {/* 8. MINI-GAME: TEKA KICAUAN BURUNG RIMBA */}
      {gameState === 'bird_call_game' && (
        <BirdCallMiniGame
          onClose={() => setGameState('playing')}
          onFinish={(score) => {
            audioManager.playMissionFanfare();
            setGameState('playing');
          }}
        />
      )}

      {/* 9. MODAL PENEMUAN KHAZANAH FLORA & FAUNA */}
      {gameState === 'collectible_card' && activeCollectible && (
        <CollectibleDiscoveryModal
          collectible={activeCollectible}
          onClose={() => setGameState('playing')}
        />
      )}

      {/* 10. JURNAL MISI & KAMUS KOSA KATA */}
      {(gameState === 'journal' || gameState === 'vocabulary') && (
        <QuestJournalModal
          missionState={missionState}
          collectedWordIds={collectedWordIds}
          foundCollectibleIds={foundCollectibleIds}
          onClose={() => setGameState('playing')}
        />
      )}

      {/* 11. PENTAKSIRAN FORMATIF (PBD) & SIJIL BM TAHUN 3 */}
      {gameState === 'pbd_quiz' && (
        <PbdAssessmentModal
          studentName={gender === 'lelaki' ? 'Wira Amir' : 'Wira Aina'}
          onClose={() => setGameState('playing')}
          onCompletePbd={(result) => setPbdResult(result)}
        />
      )}

      {/* 12. TETAPAN AUDIO & SUARA */}
      {gameState === 'settings' && (
        <SettingsModal
          settings={audioManager.settings}
          weather={weather}
          quality={quality}
          onUpdateSettings={(newSet) => audioManager.updateSettings(newSet)}
          onUpdateWeather={(newW) => {
            setWeather(newW);
            engineRef.current?.setWeather(newW);
            audioManager.setWeather(newW);
          }}
          onUpdateQuality={(newQ) => setQuality(newQ)}
          onClose={() => setGameState('playing')}
        />
      )}

      {/* 13. PETA PENUH TAMAN */}
      {gameState === 'map' && (
        <MapModal
          currentZone={currentZone}
          playerPosition={playerPosition}
          onClose={() => setGameState('playing')}
        />
      )}
    </div>
  );
}
