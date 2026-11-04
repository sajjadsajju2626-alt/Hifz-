export type UserRole = 'principal' | 'teacher' | 'parent';

export interface AkhlaqChip {
  id: string;
  labelMalayalam: string;
  labelEnglish: string;
  points: number;
  type: 'positive' | 'negative';
}

export interface StudentRecord {
  id: string;
  studentId: string;
  name: string;
  batch: string;
  ustadhName: string;
  juzCompleted: number;
  currentJuz: number;
  currentSurah: string;
  guardianName: string;
  guardianPhone: string;
  pin: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HifzLogRecord {
  id: string;
  studentId: string;
  studentName: string;
  dateStr: string;
  isoDate: string;
  attendance: 'Present' | 'Absent';
  sabaqTarget: string;
  sabaqGrade: string;
  sabqiTarget: string;
  sabqiGrade: string;
  manzilTarget: string;
  manzilGrade: string;
  akhlaqScoreDelta: number;
  akhlaqTags: string[];
  note: string;
  verifiedBy: string;
  ownerId: string;
  createdAtMs: number;
}

export interface MemorizationScheduleRecord {
  id: string;
  studentId: string;
  studentName: string;
  targetJuz: number;
  targetSurahRange: string;
  dailySabaqQuota: string;
  sabqiWindow: string;
  manzilCycle: string;
  startDate: string;
  targetDate: string;
  progressPercent: number;
  status: 'active' | 'completed' | 'archived';
  assignedBy: string;
  ownerId: string;
}

export interface FeedbackAlertRecord {
  id: string;
  studentId: string;
  studentName: string;
  severity: 'critical' | 'warning' | 'positive';
  category: 'sabaq_stall' | 'manzil_weakness' | 'akhlaq_drop' | 'attendance_risk' | 'milestone_excellence';
  title: string;
  message: string;
  recommendedAction: string;
  status: 'open' | 'acknowledged' | 'resolved';
  teacherResponse: string;
  dateStr: string;
  ownerId: string;
  createdAtMs: number;
}

export interface CampusNoticeRecord {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'parents' | 'teachers';
  dateStr: string;
  authorName: string;
  ownerId: string;
  createdAtMs: number;
}

export interface CampusSettingsRecord {
  mode: 'residential' | 'day';
  name: string;
  sub: string;
  academicTerm: string;
  akhlaqAlertThreshold: number;
  ownerId: string;
}

export interface AkhlaqCalculationResult {
  score: number;
  letterGrade: 'A+' | 'A' | 'B' | 'C';
  gradeLabel: string;
  malayalamSubtitle: string;
  statusTone: 'emerald' | 'amber' | 'rose';
  topTags: string;
  positiveTagsCount: number;
  negativeTagsCount: number;
  negativeBreakdown: { tag: string; count: number }[];
  positiveBreakdown: { tag: string; count: number }[];
  autoReasonReport: string;
}

export interface StudentAnalyticsSummary {
  studentId: string;
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  attendanceRate: number;
  sabaqExcellenceRate: number;
  manzilSolidRate: number;
  akhlaq: AkhlaqCalculationResult;
  estimatedPagesLogged: number;
  paceStatus: 'Ahead of Pace' | 'On Track' | 'Needs Support';
}
