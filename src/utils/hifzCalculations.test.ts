import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendPortionChip,
  calculateAkhlaqMetric,
  calculateStudentAnalytics,
  evaluateAutomatedAlerts,
} from './hifzCalculations';
import { HifzLogRecord, StudentRecord } from '../types/hifz';

const mockStudent: StudentRecord = {
  id: 'STD-101',
  studentId: 'STD-101',
  name: 'Zaid Mansoor',
  batch: 'Halqa Al-Fajr (Batch A)',
  ustadhName: 'Ustadh Ahmad',
  juzCompleted: 15,
  currentJuz: 16,
  currentSurah: 'Surah Al-Kahf',
  guardianName: 'Mansoor Ali',
  guardianPhone: '+91 98470 11223',
  pin: '1234',
  ownerId: 'demo-owner',
};

function makeLog(overrides: Partial<HifzLogRecord>): HifzLogRecord {
  return {
    id: 'log-1',
    studentId: 'STD-101',
    studentName: 'Zaid Mansoor',
    dateStr: '04/11/2026',
    isoDate: '2026-11-04',
    attendance: 'Present',
    sabaqTarget: 'Al-Kahf 1-15 (1 Full Page)',
    sabaqGrade: 'Mumtaz (ممتاز - Excellent)',
    sabqiTarget: '1/2 Juz',
    sabqiGrade: 'Mumtaz (ممتاز - Excellent)',
    manzilTarget: 'Juz 14 (1 Full Juz)',
    manzilGrade: 'Mumtaz (Solid / ممتاز - Excellent)',
    akhlaqScoreDelta: 0,
    akhlaqTags: [],
    note: '',
    verifiedBy: 'Ustadh Ahmad',
    ownerId: 'demo-owner',
    createdAtMs: 1762240000000,
    ...overrides,
  };
}

test('appendPortionChip appends portion cleanly without duplication', () => {
  assert.equal(appendPortionChip('', '1 Full Page'), '1 Full Page');
  assert.equal(appendPortionChip('Al-Baqarah 1-10', '1/2 Page'), 'Al-Baqarah 1-10 (1/2 Page)');
  assert.equal(appendPortionChip('Al-Baqarah 1-10 (1/2 Page)', '1/2 Page'), 'Al-Baqarah 1-10 (1/2 Page)');
});

test('calculateAkhlaqMetric computes A+, A, B, and C grades and auto-reasons accurately', () => {
  // 1. Default 100% -> A+
  const logsAPlus = [makeLog({ akhlaqScoreDelta: 2, akhlaqTags: ['അദബ് / മര്യാദ'] })];
  const resAPlus = calculateAkhlaqMetric(logsAPlus);
  assert.equal(resAPlus.score, 100);
  assert.equal(resAPlus.letterGrade, 'A+');
  assert.ok(resAPlus.topTags.includes('അദബ് / മര്യാദ (1)'));

  // 2. 85% -> A (Jayyid Jiddan)
  const logsA = [
    makeLog({
      akhlaqScoreDelta: -15,
      akhlaqTags: ['ശ്രദ്ധക്കുറവ്', 'അനാവശ്യ സംസാരം', 'ശ്രദ്ധക്കുറവ്'],
    }),
  ];
  const resA = calculateAkhlaqMetric(logsA);
  assert.equal(resA.score, 85);
  assert.equal(resA.letterGrade, 'A');
  assert.ok(resA.autoReasonReport.includes('ശ്രദ്ധക്കുറവ് (2x)'));
  assert.ok(resA.autoReasonReport.includes('അനാവശ്യ സംസാരം (1x)'));

  // 3. 70% -> B (Jayyid)
  const logsB = [makeLog({ akhlaqScoreDelta: -30, akhlaqTags: ['അലസത'] })];
  const resB = calculateAkhlaqMetric(logsB);
  assert.equal(resB.score, 70);
  assert.equal(resB.letterGrade, 'B');

  // 4. 55% -> C (Needs Focus)
  const logsC = [
    makeLog({ akhlaqScoreDelta: -25, akhlaqTags: ['തർക്കം/വഴക്ക്'] }),
    makeLog({ id: 'log-2', akhlaqScoreDelta: -20, akhlaqTags: ['ശ്രദ്ധക്കുറവ്'] }),
  ];
  const resC = calculateAkhlaqMetric(logsC);
  assert.equal(resC.score, 55);
  assert.equal(resC.letterGrade, 'C');
});

test('calculateStudentAnalytics computes attendance, Sabaq excellence, and pages', () => {
  const logs = [
    makeLog({ sabaqTarget: '1 Full Page', attendance: 'Present' }),
    makeLog({ id: 'log-2', sabaqTarget: '1/2 Page', sabaqGrade: 'Needs Repeat (ഇനിയും ഓതണം)', attendance: 'Present' }),
    makeLog({ id: 'log-3', attendance: 'Absent', sabaqTarget: 'Not Recited' }),
  ];
  const summary = calculateStudentAnalytics(mockStudent, logs);
  assert.equal(summary.totalSessions, 3);
  assert.equal(summary.presentSessions, 2);
  assert.equal(summary.absentSessions, 1);
  assert.equal(summary.attendanceRate, 67);
  assert.equal(summary.sabaqExcellenceRate, 50);
  assert.equal(summary.estimatedPagesLogged, 1.5);
  assert.equal(summary.paceStatus, 'Needs Support');
});

test('evaluateAutomatedAlerts triggers targeted teacher feedback alerts', () => {
  const weakLog = makeLog({
    sabaqGrade: 'Needs Repeat (ഇനിയും ഓതണം)',
    manzilGrade: 'Needs Revision (വീണ്ടും ഓതണം)',
    akhlaqScoreDelta: -6,
    akhlaqTags: ['ശ്രദ്ധക്കുറവ്', 'അനാവശ്യ സംസാരം'],
  });
  const alerts = evaluateAutomatedAlerts(weakLog, [weakLog], 75);
  const categories = alerts.map((a) => a.category);
  assert.ok(categories.includes('akhlaq_drop'));
  assert.ok(categories.includes('sabaq_stall'));
  assert.ok(categories.includes('manzil_weakness'));
});
