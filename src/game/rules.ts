/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Modul Logik Tulen (Pure Logic & Rules Engine)
 * Standard Pembelajaran Bahasa Melayu Tahun 3 (2.2.1)
 */

import {
  ZoneId,
  TrashCategory,
  WeatherType,
  MissionState,
} from '../types/game.ts';
import { ZONES } from './curriculumData.ts';

/**
 * Pengiraan Tahap Penguasaan Pentaksiran Bilik Darjah (PBD)
 * Berdasarkan DSKP KSSR Semakan Bahasa Melayu Tahun 3
 */
export function calculatePbdLevel(
  kosaKataScore: number, // 0 to 2
  tersuratScore: number, // 0 to 1
  tersiratScore: number, // 0 to 1
  kbatScore: number // 0 to 2
): {
  tahapPenguasaan: number;
  totalScore: number;
  maxScore: number;
  tahapTitle: string;
  deskripsi: string;
  ulasanGuru: string;
} {
  const totalScore = kosaKataScore + tersuratScore + tersiratScore + kbatScore;
  const maxScore = 6;

  let tahapPenguasaan = 1;
  let tahapTitle = 'Tahap 1: Sangat Terhad';
  let deskripsi = 'Murid berupaya membaca perkataan asas dengan bimbingan berterusan daripada guru.';
  let ulasanGuru = 'Perlu bimbingan intensif untuk mengecam makna kosa kata dan petikan mudah.';

  if (totalScore >= 6) {
    tahapPenguasaan = 6;
    tahapTitle = 'Tahap 6: Cemerlang';
    deskripsi =
      'Murid berupaya mengecam kosa kata, memahami isi tersurat dan menginferens isi tersirat dengan sangat tepat, serta memberikan cadangan KBAT yang kreatif dan berwawasan.';
    ulasanGuru =
      'Tahniah! Murid mempamerkan penguasaan Bahasa Melayu bertaraf cemerlang dan layak diiktiraf sebagai Wira Alam Berilmu teladan.';
  } else if (totalScore >= 5) {
    tahapPenguasaan = 5;
    tahapTitle = 'Tahap 5: Sangat Baik';
    deskripsi =
      'Murid berupaya mengecam kosa kata dan menghubungkaitkan isi tersurat serta tersirat dengan baik dan meyakinkan.';
    ulasanGuru =
      'Syabas! Kefahaman membaca dan membuat inferens yang sangat membanggakan.';
  } else if (totalScore >= 4) {
    tahapPenguasaan = 4;
    tahapTitle = 'Tahap 4: Baik';
    deskripsi =
      'Murid berupaya membaca, mengecam kosa kata dan memahami maksud isi tersurat serta membuat inferens mudah secara berkesan.';
    ulasanGuru =
      'Pencapaian yang baik. Teruskan usaha memperkaya kosa kata alam sekitar.';
  } else if (totalScore >= 3) {
    tahapPenguasaan = 3;
    tahapTitle = 'Tahap 3: Memuaskan';
    deskripsi =
      'Murid berupaya membaca dan memahami maklumat tersurat serta mengecam kosa kata pada tahap memuaskan.';
    ulasanGuru =
      'Capai tahap asas. Boleh dipertingkatkan lagi dalam bahagian isi tersirat.';
  } else if (totalScore >= 2) {
    tahapPenguasaan = 2;
    tahapTitle = 'Tahap 2: Terhad';
    deskripsi =
      'Murid berupaya mengecam sebahagian kosa kata dan maklumat tersurat dengan sedikit bimbingan.';
    ulasanGuru =
      'Galakkan membaca lebih banyak bahan cerita dan teks alam sekitar.';
  }

  return {
    tahapPenguasaan,
    totalScore,
    maxScore,
    tahapTitle,
    deskripsi,
    ulasanGuru,
  };
}

/**
 * Semakan Pengasingan Sisa Kitar Semula
 */
export function validateRecyclingSort(
  itemCategory: TrashCategory,
  binCategory: TrashCategory
): {
  isCorrect: boolean;
  feedback: string;
} {
  const isCorrect = itemCategory === binCategory;
  if (isCorrect) {
    if (binCategory === 'kertas') {
      return {
        isCorrect: true,
        feedback: 'Tepat sekali! Tong Biru dikhaskan untuk kertas, kotak dan surat khabar lama.',
      };
    }
    if (binCategory === 'plastik_aluminium') {
      return {
        isCorrect: true,
        feedback: 'Hebat! Tong Jingga dikhaskan untuk sisa plastik dan tin minuman aluminium.',
      };
    }
    return {
      isCorrect: true,
      feedback: 'Cemerlang! Tong Coklat dikhaskan untuk bahan kaca dan sisa logam.',
    };
  }

  return {
    isCorrect: false,
    feedback: 'Kurang tepat. Sila pastikan bahan dimasukkan ke dalam tong warna yang bersesuaian.',
  };
}

/**
 * Pengiraan Skor Permainan Kitar Semula Pantas
 */
export function calculateSortingScore(
  correctCount: number,
  comboCount: number,
  timeBonus: number
): number {
  const baseScore = correctCount * 100;
  const comboBonus = comboCount * 25;
  const timeScore = Math.max(0, Math.floor(timeBonus * 5));
  return baseScore + comboBonus + timeScore;
}

/**
 * Semakan Tekaan Suara Kicauan Burung
 */
export function checkBirdCallGuess(
  guessedId: string,
  actualId: string
): {
  isCorrect: boolean;
  message: string;
} {
  const isCorrect = guessedId === actualId;
  if (isCorrect) {
    return {
      isCorrect: true,
      message: 'Tepat sekali! Pendengaran wira alam sungguh peka terhadap penghuni rimba.',
    };
  }
  return {
    isCorrect: false,
    message: 'Bukan itu bunyinya. Dengarkan corak alunan dan nadanya sekali lagi.',
  };
}

/**
 * Mengesan Zon Semasa Berdasarkan Koordinat Pemain (x, z)
 */
export function getZoneForCoordinates(x: number, z: number): ZoneId {
  let closestZone: ZoneId = 'PINTU_MASUK';
  let minDistanceSq = Infinity;

  for (const zone of Object.values(ZONES)) {
    const dx = x - zone.coordinates.x;
    const dz = z - zone.coordinates.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closestZone = zone.id;
    }
  }

  return closestZone;
}

/**
 * Kesan Cuaca terhadap Pergerakan & Fizik Pemain
 */
export function calculateWeatherMovementModifiers(weather: WeatherType): {
  speedMultiplier: number;
  frictionMultiplier: number;
  riverVelocityMultiplier: number;
  visibilityDistance: number;
} {
  switch (weather) {
    case 'hujan':
      return {
        speedMultiplier: 0.92,
        frictionMultiplier: 0.72, // Licin di atas permukaan batu
        riverVelocityMultiplier: 1.8, // Arus sungai lebih deras
        visibilityDistance: 85, // Kabus hujan
      };
    case 'berangin':
      return {
        speedMultiplier: 0.98,
        frictionMultiplier: 1.0,
        riverVelocityMultiplier: 1.2,
        visibilityDistance: 130,
      };
    case 'senja':
      return {
        speedMultiplier: 1.0,
        frictionMultiplier: 1.0,
        riverVelocityMultiplier: 1.0,
        visibilityDistance: 110,
      };
    case 'cerah':
    default:
      return {
        speedMultiplier: 1.0,
        frictionMultiplier: 1.0,
        riverVelocityMultiplier: 1.0,
        visibilityDistance: 160,
      };
  }
}

/**
 * Semakan Status Keseluruhan Misi
 */
export function checkOverallProgress(missionState: MissionState): {
  totalPercentage: number;
  isAllCompleted: boolean;
  unlockedTitle: string;
} {
  const m1 = missionState.misi1_kosaKata.completed ? 25 : (missionState.misi1_kosaKata.collectedWordIds.length / missionState.misi1_kosaKata.totalWords) * 25;
  const m2 = missionState.misi2_penyiasatMaklumat.completed ? 25 : (missionState.misi2_penyiasatMaklumat.correctNpcIds.length / missionState.misi2_penyiasatMaklumat.totalNpcs) * 25;
  const m3 = missionState.misi3_detektifTersirat.completed ? 25 : (missionState.misi3_detektifTersirat.completedPuzzleIds.length / missionState.misi3_detektifTersirat.totalPuzzles) * 25;
  
  const m4TotalTasks = missionState.misi4_penyelamatTaman.totalTrash + missionState.misi4_penyelamatTaman.totalRiverSpots + missionState.misi4_penyelamatTaman.totalTrees;
  const m4DoneTasks = missionState.misi4_penyelamatTaman.trashSortedCount + missionState.misi4_penyelamatTaman.riverCleanedCount + missionState.misi4_penyelamatTaman.treesPlantedCount;
  const m4 = missionState.misi4_penyelamatTaman.completed ? 25 : Math.min(25, (m4DoneTasks / Math.max(1, m4TotalTasks)) * 25);

  const totalPercentage = Math.round(m1 + m2 + m3 + m4);
  const isAllCompleted = totalPercentage >= 100;

  let unlockedTitle = 'Wira Permulaan';
  if (totalPercentage >= 100) {
    unlockedTitle = 'Wira Alam Berilmu (Agung)';
  } else if (totalPercentage >= 75) {
    unlockedTitle = 'Penyelamat Ekosistem';
  } else if (totalPercentage >= 50) {
    unlockedTitle = 'Penyiasat Rimba';
  } else if (totalPercentage >= 25) {
    unlockedTitle = 'Pencinta Alam';
  }

  return {
    totalPercentage,
    isAllCompleted,
    unlockedTitle,
  };
}
