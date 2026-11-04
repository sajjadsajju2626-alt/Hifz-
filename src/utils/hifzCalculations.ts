import {
  AkhlaqCalculationResult,
  AkhlaqChip,
  FeedbackAlertRecord,
  HifzLogRecord,
  MemorizationScheduleRecord,
  StudentAnalyticsSummary,
  StudentRecord,
} from '../types/hifz';

export const POSITIVE_AKHLAQ_CHIPS: AkhlaqChip[] = [
  {
    id: 'adab',
    labelMalayalam: 'അദബ് / മര്യാദ',
    labelEnglish: 'Adab & Respect',
    points: 2,
    type: 'positive',
  },
  {
    id: 'cleanliness',
    labelMalayalam: 'വൃത്തി',
    labelEnglish: 'Cleanliness',
    points: 2,
    type: 'positive',
  },
  {
    id: 'focus',
    labelMalayalam: 'ഏകാഗ്രത',
    labelEnglish: 'Concentration',
    points: 2,
    type: 'positive',
  },
  {
    id: 'helpfulness',
    labelMalayalam: 'സഹായമനസ്സ്',
    labelEnglish: 'Helpfulness',
    points: 2,
    type: 'positive',
  },
];

export const NEGATIVE_AKHLAQ_CHIPS: AkhlaqChip[] = [
  {
    id: 'inattention',
    labelMalayalam: 'ശ്രദ്ധക്കുറവ്',
    labelEnglish: 'Lack of Focus',
    points: -3,
    type: 'negative',
  },
  {
    id: 'dispute',
    labelMalayalam: 'തർക്കം/വഴക്ക്',
    labelEnglish: 'Argument / Dispute',
    points: -3,
    type: 'negative',
  },
  {
    id: 'laziness',
    labelMalayalam: 'അലസത',
    labelEnglish: 'Laziness',
    points: -3,
    type: 'negative',
  },
  {
    id: 'talking',
    labelMalayalam: 'അനാവശ്യ സംസാരം',
    labelEnglish: 'Unnecessary Talk',
    points: -3,
    type: 'negative',
  },
];

export const SABAQ_PORTION_CHIPS = ['1/4 Page', '1/2 Page', '1 Full Page', '2 Pages'];
export const SABQI_PORTION_CHIPS = ['1/4 Juz', '1/2 Juz', '1 Full Juz', '5 Pages'];
export const MANZIL_PORTION_CHIPS = ['1/2 Juz', '1 Full Juz', '2 Juz', '3 Juz'];

export const SABAQ_GRADES = [
  'Mumtaz (ممتاز - Excellent)',
  'Jayyid Jiddan (جيد جداً - Very Good)',
  'Jayyid (جيد - Good)',
  'Needs Repeat (ഇനിയും ഓതണം)',
  'Not Recited',
];

export const SABQI_GRADES = [
  'Mumtaz (ممتاز - Excellent)',
  'Jayyid Jiddan (جيد جداً - Very Good)',
  'Jayyid (جيد - Good)',
  'Weak / Needs Repeat (ശ്രദ്ധ കുറവുണ്ട്)',
  'Not Recited',
];

export const MANZIL_GRADES = [
  'Mumtaz (Solid / ممتاز - Excellent)',
  'Jayyid Jiddan (جيد جداً - Very Good)',
  'Acceptable (جيد - Satisfactory)',
  'Needs Revision (വീണ്ടും ഓതണം)',
  'Not Recited',
];

const NEGATIVE_LABELS_SET = new Set([
  'ശ്രദ്ധക്കുറവ്',
  'തർക്കം/വഴക്ക്',
  'അലസത',
  'അനാവശ്യ സംസാരം',
  'സംസാരിക്കുന്നു',
]);

/**
 * Appends a portion chip cleanly to an existing target input value.
 */
export function appendPortionChip(currentValue: string, chipText: string): string {
  const trimmed = currentValue.trim();
  if (!trimmed) {
    return chipText;
  }
  if (trimmed.includes(chipText)) {
    return trimmed;
  }
  return `${trimmed} (${chipText})`;
}

/**
 * Calculates the Automatic Monthly Akhlaq Grade, score, and auto-reasons breakdown
 * from a student's verification logs.
 */
export function calculateAkhlaqMetric(studentLogs: HifzLogRecord[]): AkhlaqCalculationResult {
  let rawScore = 100;
  const reasonsMap: Record<string, number> = {};
  const positiveMap: Record<string, number> = {};
  const negativeMap: Record<string, number> = {};
  let positiveTagsCount = 0;
  let negativeTagsCount = 0;

  for (const log of studentLogs) {
    if (typeof log.akhlaqScoreDelta === 'number') {
      rawScore += log.akhlaqScoreDelta;
    }
    if (Array.isArray(log.akhlaqTags)) {
      for (const rawTag of log.akhlaqTags) {
        const tag = rawTag === 'സംസാരിക്കുന്നു' ? 'അനാവശ്യ സംസാരം' : rawTag;
        reasonsMap[tag] = (reasonsMap[tag] || 0) + 1;
        if (NEGATIVE_LABELS_SET.has(rawTag) || NEGATIVE_LABELS_SET.has(tag)) {
          negativeMap[tag] = (negativeMap[tag] || 0) + 1;
          negativeTagsCount += 1;
        } else {
          positiveMap[tag] = (positiveMap[tag] || 0) + 1;
          positiveTagsCount += 1;
        }
      }
    }
  }

  const score = Math.max(0, Math.min(100, rawScore));

  let letterGrade: 'A+' | 'A' | 'B' | 'C' = 'A+';
  let gradeLabel = 'A+ (Mumtaz - ممتاز)';
  let malayalamSubtitle = 'മാതൃകാ സ്വഭാവം (Exemplary Conduct)';
  let statusTone: 'emerald' | 'amber' | 'rose' = 'emerald';

  if (score < 60) {
    letterGrade = 'C';
    gradeLabel = 'C (Needs Focus / പ്രത്യേക ശ്രദ്ധ ആവശ്യമാണ്)';
    malayalamSubtitle = 'പ്രത്യേക ശ്രദ്ധ ആവശ്യമാണ് (Requires Mentoring)';
    statusTone = 'rose';
  } else if (score < 75) {
    letterGrade = 'B';
    gradeLabel = 'B (Jayyid - جيد)';
    malayalamSubtitle = 'തൃപ്തികരം (Satisfactory Conduct)';
    statusTone = 'amber';
  } else if (score < 90) {
    letterGrade = 'A';
    gradeLabel = 'A (Jayyid Jiddan - جيد جداً)';
    malayalamSubtitle = 'നല്ല അച്ചടക്കം (Very Good Discipline)';
    statusTone = 'emerald';
  }

  const topTags = Object.keys(reasonsMap)
    .map((k) => `${k} (${reasonsMap[k]})`)
    .join(', ');

  const negativeBreakdown = Object.entries(negativeMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  const positiveBreakdown = Object.entries(positiveMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  let autoReasonReport = 'Consistent exemplary conduct maintained across daily Hifz sessions.';
  if (negativeBreakdown.length > 0) {
    const reasonsStr = negativeBreakdown.map((item) => `${item.tag} (${item.count}x)`).join(', ');
    if (score < 90) {
      autoReasonReport = `Grade impacted by recorded conduct observations: ${reasonsStr}. Tarbiyah follow-up advised.`;
    } else {
      autoReasonReport = `Overall strong conduct (${score}%), with minor observations noted: ${reasonsStr}.`;
    }
  } else if (positiveBreakdown.length > 0) {
    const posStr = positiveBreakdown.map((item) => `${item.tag} (${item.count}x)`).join(', ');
    autoReasonReport = `Commended for positive Akhlaq traits: ${posStr}.`;
  }

  return {
    score,
    letterGrade,
    gradeLabel,
    malayalamSubtitle,
    statusTone,
    topTags,
    positiveTagsCount,
    negativeTagsCount,
    negativeBreakdown,
    positiveBreakdown,
    autoReasonReport,
  };
}

/**
 * Estimates pages recited from a Sabaq target text.
 */
export function estimatePagesFromTarget(targetText: string): number {
  const lower = targetText.toLowerCase();
  if (!lower || lower === 'not recited' || lower === '—') return 0;
  if (lower.includes('2 pages')) return 2;
  if (lower.includes('1 full page') || lower.includes('1 page')) return 1;
  if (lower.includes('1/2 page')) return 0.5;
  if (lower.includes('1/4 page')) return 0.25;
  return 0.75;
}

/**
 * Computes comprehensive analytics for a single student.
 */
export function calculateStudentAnalytics(
  student: StudentRecord,
  allLogs: HifzLogRecord[],
  schedules: MemorizationScheduleRecord[] = []
): StudentAnalyticsSummary {
  const logs = allLogs.filter((l) => l.studentId === student.studentId);
  const totalSessions = logs.length;
  const presentLogs = logs.filter((l) => l.attendance !== 'Absent');
  const presentSessions = presentLogs.length;
  const absentSessions = totalSessions - presentSessions;
  const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  const sabaqExcellentCount = presentLogs.filter(
    (l) => l.sabaqGrade.includes('Mumtaz') || l.sabaqGrade.includes('Jayyid Jiddan')
  ).length;
  const sabaqExcellenceRate =
    presentSessions > 0 ? Math.round((sabaqExcellentCount / presentSessions) * 100) : 100;

  const manzilSolidCount = presentLogs.filter(
    (l) =>
      l.manzilGrade.includes('Mumtaz') ||
      l.manzilGrade.includes('Jayyid Jiddan') ||
      l.manzilGrade.includes('Acceptable')
  ).length;
  const manzilSolidRate =
    presentSessions > 0 ? Math.round((manzilSolidCount / presentSessions) * 100) : 100;

  const estimatedPagesLogged = Number(
    presentLogs.reduce((acc, l) => acc + estimatePagesFromTarget(l.sabaqTarget), 0).toFixed(2)
  );

  const akhlaq = calculateAkhlaqMetric(logs);

  const activeSchedule = schedules.find(
    (s) => s.studentId === student.studentId && s.status === 'active'
  );

  let paceStatus: 'Ahead of Pace' | 'On Track' | 'Needs Support' = 'On Track';
  if (attendanceRate < 80 || sabaqExcellenceRate < 60 || akhlaq.score < 70) {
    paceStatus = 'Needs Support';
  } else if (
    (activeSchedule && activeSchedule.progressPercent >= 80 && sabaqExcellenceRate >= 85) ||
    (sabaqExcellenceRate >= 90 && akhlaq.score >= 95)
  ) {
    paceStatus = 'Ahead of Pace';
  }

  return {
    studentId: student.studentId,
    totalSessions,
    presentSessions,
    absentSessions,
    attendanceRate,
    sabaqExcellenceRate,
    manzilSolidRate,
    akhlaq,
    estimatedPagesLogged,
    paceStatus,
  };
}

/**
 * Generates automated teacher feedback alerts when a new daily Hifz log is recorded.
 */
export function evaluateAutomatedAlerts(
  newLog: HifzLogRecord,
  studentLogsAfterInsert: HifzLogRecord[],
  akhlaqThreshold = 75
): Omit<FeedbackAlertRecord, 'id' | 'ownerId' | 'createdAtMs'>[] {
  const generated: Omit<FeedbackAlertRecord, 'id' | 'ownerId' | 'createdAtMs'>[] = [];
  const akhlaqMetric = calculateAkhlaqMetric(studentLogsAfterInsert);

  // 1. Check Akhlaq Conduct Drop
  if (newLog.akhlaqScoreDelta <= -3 || akhlaqMetric.score < akhlaqThreshold) {
    const negReasons =
      akhlaqMetric.negativeBreakdown.map((n) => n.tag).join(', ') ||
      newLog.akhlaqTags.join(', ') ||
      'Behavioral deduction';
    generated.push({
      studentId: newLog.studentId,
      studentName: newLog.studentName,
      severity: akhlaqMetric.score < 60 || newLog.akhlaqScoreDelta <= -6 ? 'critical' : 'warning',
      category: 'akhlaq_drop',
      title: `Akhlaq Conduct Alert: ${newLog.studentName} (${akhlaqMetric.score}%)`,
      message: `Monthly Akhlaq rating is ${akhlaqMetric.gradeLabel} (${akhlaqMetric.score}%). Triggered by: ${negReasons}.`,
      recommendedAction: `Schedule a 5-minute 1-on-1 Tarbiyah counsel with ${newLog.studentName} regarding ${negReasons} and share positive reinforcement goals with parent.`,
      status: 'open',
      teacherResponse: '',
      dateStr: newLog.dateStr,
    });
  }

  // 2. Check Attendance Risk
  if (newLog.attendance === 'Absent') {
    const total = studentLogsAfterInsert.length;
    const absentCount = studentLogsAfterInsert.filter((l) => l.attendance === 'Absent').length;
    const attRate = total > 0 ? Math.round(((total - absentCount) / total) * 100) : 100;
    generated.push({
      studentId: newLog.studentId,
      studentName: newLog.studentName,
      severity: attRate < 80 ? 'critical' : 'warning',
      category: 'attendance_risk',
      title: `Absence Logged: ${newLog.studentName} (${attRate}% Attendance)`,
      message: `${newLog.studentName} was marked Absent on ${newLog.dateStr}. Total recorded absences: ${absentCount}.`,
      recommendedAction: `Contact guardian to verify reason for absence and assign a home Manzil audio check so revision continuity is not broken.`,
      status: 'open',
      teacherResponse: '',
      dateStr: newLog.dateStr,
    });
    return generated;
  }

  // 3. Check Sabaq Stall
  if (
    newLog.sabaqGrade.includes('Needs Repeat') ||
    newLog.sabaqGrade === 'Not Recited'
  ) {
    generated.push({
      studentId: newLog.studentId,
      studentName: newLog.studentName,
      severity: 'warning',
      category: 'sabaq_stall',
      title: `Sabaq Repetition Required: ${newLog.studentName}`,
      message: `Sabaq portion (${newLog.sabaqTarget}) graded "${newLog.sabaqGrade}" on ${newLog.dateStr}.`,
      recommendedAction: `Pause new Sabaq lines tomorrow morning; pair ${newLog.studentName} with a senior Rafeeq (peer partner) for 15-minute Tajweed & Makharij drill.`,
      status: 'open',
      teacherResponse: '',
      dateStr: newLog.dateStr,
    });
  }

  // 4. Check Sabqi / Manzil Revision Weakness
  if (
    newLog.sabqiGrade.includes('Weak') ||
    newLog.manzilGrade.includes('Needs Revision')
  ) {
    generated.push({
      studentId: newLog.studentId,
      studentName: newLog.studentName,
      severity: 'critical',
      category: 'manzil_weakness',
      title: `Revision Retention Alert: ${newLog.studentName}`,
      message: `Revision check flagged Sabqi (${newLog.sabqiGrade}) / Manzil (${newLog.manzilGrade}) on ${newLog.dateStr}.`,
      recommendedAction: `Reduce new Sabaq quota by 50% for 2 days and re-verify ${newLog.manzilTarget || newLog.sabqiTarget} before Maghrib halqa.`,
      status: 'open',
      teacherResponse: '',
      dateStr: newLog.dateStr,
    });
  }

  // 5. Check Milestone Excellence
  if (
    newLog.sabaqGrade.includes('Mumtaz') &&
    newLog.sabqiGrade.includes('Mumtaz') &&
    newLog.manzilGrade.includes('Mumtaz') &&
    newLog.akhlaqScoreDelta >= 2
  ) {
    generated.push({
      studentId: newLog.studentId,
      studentName: newLog.studentName,
      severity: 'positive',
      category: 'milestone_excellence',
      title: `Triple Mumtaz & Exemplary Akhlaq: ${newLog.studentName}`,
      message: `Achieved Mumtaz in Sabaq (${newLog.sabaqTarget}), Sabqi, and Manzil with +${newLog.akhlaqScoreDelta} Akhlaq points.`,
      recommendedAction: `Send commendation badge to guardian portal and recognize ${newLog.studentName} during post-Fajr assembly.`,
      status: 'open',
      teacherResponse: '',
      dateStr: newLog.dateStr,
    });
  }

  return generated;
}
