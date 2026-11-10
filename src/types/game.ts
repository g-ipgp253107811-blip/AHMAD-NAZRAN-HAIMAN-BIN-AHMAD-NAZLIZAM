/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Definisi Jenis Data & Kurikulum Bahasa Melayu Tahun 3
 */

export type GameState =
  | 'title'
  | 'character_select'
  | 'playing'
  | 'paused'
  | 'dialogue'
  | 'reading_board'
  | 'inference_puzzle'
  | 'sorting_game'
  | 'bird_call_game'
  | 'collectible_card'
  | 'journal'
  | 'vocabulary'
  | 'pbd_quiz'
  | 'pbd_certificate'
  | 'settings'
  | 'map';

export type CharacterGender = 'lelaki' | 'perempuan';

export type GraphicQuality = 'rendah' | 'sederhana' | 'tinggi';

export type WeatherType = 'cerah' | 'hujan' | 'berangin' | 'senja';

export interface WeatherState {
  current: WeatherType;
  temperature: number; // in Celsius
  windSpeed: number; // in km/h
  rainIntensity: number; // 0 to 1
  wetness: number; // 0 to 1
  label: string;
  effectDescription: string;
}

export interface FloraFaunaCollectible {
  id: string;
  name: string;
  type: 'flora' | 'fauna';
  scientificName: string;
  malayStatus: string; // cth: 'Spesies Dilindungi Sepenuhnya'
  zoneId: ZoneId;
  description: string;
  funFact: string;
  newVocabulary: {
    word: string;
    definition: string;
  };
  coordinates: { x: number; y: number; z: number };
  found: boolean;
}

export interface BirdCallData {
  id: string;
  name: string;
  localName: string;
  soundType: 'flute_trill' | 'deep_resonant' | 'whoop_call' | 'croak_rhythm';
  description: string;
  habitat: string;
  hint: string;
}

export type ZoneId =
  | 'PINTU_MASUK'
  | 'HUTAN_HIJAU'
  | 'SUNGAI_LESTARI'
  | 'PUSAT_KITAR_SEMULA'
  | 'TAMAN_REKREASI'
  | 'KAWASAN_PEMULIHARAAN';

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  description: string;
  landmark: string;
  coordinates: { x: number; z: number };
  color: string;
  ambience: 'forest' | 'river' | 'playground' | 'recycling' | 'entrance';
}

export interface KosaKataItem {
  id: string;
  word: string;
  rootWord?: string;
  definition: string;
  exampleSentence: string;
  category: 'alam' | 'amalan' | 'tindakan';
  sourceBoardId: string;
  collected: boolean;
}

export interface ReadingBoardData {
  id: string;
  title: string;
  subtitle: string;
  zoneId: ZoneId;
  passage: string;
  targetWords: string[];
  coordinates: { x: number; z: number };
  hasRead: boolean;
}

export interface NpcData {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  zoneId: ZoneId;
  dialogueText: string;
  voiceName: string;
  pitch: number;
  question: {
    prompt: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
    explanation: string;
  };
  coordinates: { x: number; z: number };
  hasAnswered: boolean;
}

export interface InferencePuzzleData {
  id: string;
  title: string;
  zoneId: ZoneId;
  clue: string;
  question: string;
  hint: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  coordinates: { x: number; z: number };
  completed: boolean;
}

export type TrashCategory = 'kertas' | 'plastik_aluminium' | 'kaca_logam';

export interface TrashItem {
  id: string;
  name: string;
  category: TrashCategory;
  coordinates: { x: number; y: number; z: number };
  collected: boolean;
  sorted: boolean;
}

export interface PlantingSpot {
  id: string;
  name: string;
  coordinates: { x: number; y: number; z: number };
  planted: boolean;
}

export interface RiverPollutionSpot {
  id: string;
  coordinates: { x: number; y: number; z: number };
  cleaned: boolean;
}

export interface MissionState {
  misi1_kosaKata: {
    completed: boolean;
    collectedWordIds: string[];
    readBoardIds: string[];
    totalWords: number;
  };
  misi2_penyiasatMaklumat: {
    completed: boolean;
    interactedNpcIds: string[];
    correctNpcIds: string[];
    totalNpcs: number;
  };
  misi3_detektifTersirat: {
    completed: boolean;
    completedPuzzleIds: string[];
    totalPuzzles: number;
  };
  misi4_penyelamatTaman: {
    completed: boolean;
    trashCollectedCount: number;
    trashSortedCount: number;
    riverCleanedCount: number;
    treesPlantedCount: number;
    totalTrash: number;
    totalRiverSpots: number;
    totalTrees: number;
  };
}

export interface PbdQuizQuestion {
  id: string;
  type: 'kosa_kata' | 'isi_tersurat' | 'isi_tersirat' | 'kbat';
  title: string;
  prompt: string;
  stimulus?: string;
  options?: { id: string; text: string }[];
  correctOptionId?: string;
  rubricNotes?: string;
}

export interface PbdResult {
  score: number;
  maxScore: number;
  tahapPenguasaan: number; // 1 to 6
  tahapTitle: string;
  deskripsi: string;
  ulasanGuru: string;
  kbatJawapan: string;
  kbatSkor: number;
  tarikhSelesai: string;
}

export interface AudioSettings {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  isMuted: boolean;
  subtitlesEnabled: boolean;
  preferredVoice: 'ms-MY-YasminNeural' | 'ms-MY-OsmanNeural' | 'pelayar';
}
