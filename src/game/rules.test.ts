import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePbdLevel,
  validateRecyclingSort,
  calculateSortingScore,
  checkBirdCallGuess,
  getZoneForCoordinates,
  calculateWeatherMovementModifiers,
  checkOverallProgress,
} from './rules.ts';
import { MissionState } from '../types/game.ts';

test('calculatePbdLevel returns TP6 for full score and correct Malay description', () => {
  const result = calculatePbdLevel(2, 1, 1, 2);
  assert.equal(result.tahapPenguasaan, 6);
  assert.equal(result.tahapTitle, 'Tahap 6: Cemerlang');
  assert.equal(result.totalScore, 6);
  assert.ok(result.ulasanGuru.includes('Tahniah'));
});

test('calculatePbdLevel handles intermediate levels appropriately', () => {
  const tp4 = calculatePbdLevel(2, 1, 0, 1);
  assert.equal(tp4.tahapPenguasaan, 4);

  const tp2 = calculatePbdLevel(1, 0, 0, 1);
  assert.equal(tp2.tahapPenguasaan, 2);
});

test('validateRecyclingSort verifies correct bins with educational feedback', () => {
  const paperCheck = validateRecyclingSort('kertas', 'kertas');
  assert.equal(paperCheck.isCorrect, true);
  assert.ok(paperCheck.feedback.includes('Tong Biru'));

  const plasticCheck = validateRecyclingSort('plastik_aluminium', 'plastik_aluminium');
  assert.equal(plasticCheck.isCorrect, true);
  assert.ok(plasticCheck.feedback.includes('Tong Jingga'));

  const wrongCheck = validateRecyclingSort('kertas', 'kaca_logam');
  assert.equal(wrongCheck.isCorrect, false);
});

test('calculateSortingScore computes combo and time bonuses', () => {
  const score = calculateSortingScore(5, 3, 20);
  // 5 * 100 + 3 * 25 + 20 * 5 = 500 + 75 + 100 = 675
  assert.equal(score, 675);
});

test('checkBirdCallGuess matches bird call ids', () => {
  const correct = checkBirdCallGuess('bird_enggang', 'bird_enggang');
  assert.equal(correct.isCorrect, true);

  const incorrect = checkBirdCallGuess('bird_enggang', 'bird_murai');
  assert.equal(incorrect.isCorrect, false);
});

test('getZoneForCoordinates locates the nearest zone accurately', () => {
  // Pintu Masuk is at (-35, -35)
  const zoneEntrance = getZoneForCoordinates(-34, -36);
  assert.equal(zoneEntrance, 'PINTU_MASUK');

  // Hutan Hijau is at (-45, 25)
  const zoneForest = getZoneForCoordinates(-42, 28);
  assert.equal(zoneForest, 'HUTAN_HIJAU');
});

test('calculateWeatherMovementModifiers sets realistic physics parameters', () => {
  const rain = calculateWeatherMovementModifiers('hujan');
  assert.ok(rain.frictionMultiplier < 1.0); // Slippery
  assert.ok(rain.riverVelocityMultiplier > 1.0); // Faster current

  const sunny = calculateWeatherMovementModifiers('cerah');
  assert.equal(sunny.frictionMultiplier, 1.0);
});

test('checkOverallProgress evaluates 100% completion correctly', () => {
  const completedState: MissionState = {
    misi1_kosaKata: { completed: true, collectedWordIds: ['1','2','3','4','5','6','7','8'], readBoardIds: ['a','b','c'], totalWords: 8 },
    misi2_penyiasatMaklumat: { completed: true, interactedNpcIds: ['1','2','3'], correctNpcIds: ['1','2','3'], totalNpcs: 3 },
    misi3_detektifTersirat: { completed: true, completedPuzzleIds: ['1','2','3'], totalPuzzles: 3 },
    misi4_penyelamatTaman: { completed: true, trashCollectedCount: 6, trashSortedCount: 6, riverCleanedCount: 3, treesPlantedCount: 3, totalTrash: 6, totalRiverSpots: 3, totalTrees: 3 },
  };

  const progress = checkOverallProgress(completedState);
  assert.equal(progress.totalPercentage, 100);
  assert.equal(progress.isAllCompleted, true);
  assert.equal(progress.unlockedTitle, 'Wira Alam Berilmu (Agung)');
});
