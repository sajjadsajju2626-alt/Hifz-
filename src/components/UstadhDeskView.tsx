import React, { useState } from 'react';
import { BookOpen, CheckCircle2, RotateCcw, Search, Trash2 } from 'lucide-react';
import {
  HifzLogRecord,
  MemorizationScheduleRecord,
  StudentRecord,
} from '../types/hifz';
import {
  appendPortionChip,
  calculateStudentAnalytics,
  MANZIL_GRADES,
  MANZIL_PORTION_CHIPS,
  NEGATIVE_AKHLAQ_CHIPS,
  POSITIVE_AKHLAQ_CHIPS,
  SABAQ_GRADES,
  SABAQ_PORTION_CHIPS,
  SABQI_GRADES,
  SABQI_PORTION_CHIPS,
} from '../utils/hifzCalculations';

interface UstadhDeskViewProps {
  students: StudentRecord[];
  logs: HifzLogRecord[];
  schedules: MemorizationScheduleRecord[];
  verifiedByName: string;
  onAddLog: (newLogData: {
    studentId: string;
    studentName: string;
    dateStr: string;
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
  }) => Promise<void>;
  onDeleteLog: (logId: string) => Promise<void> | void;
}

export const UstadhDeskView: React.FC<UstadhDeskViewProps> = ({
  students,
  logs,
  schedules,
  verifiedByName,
  onAddLog,
  onDeleteLog,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.studentId || 'STD-101'
  );
  const [attendance, setAttendance] = useState<'Present' | 'Absent'>('Present');
  const [sabaqTarget, setSabaqTarget] = useState('');
  const [sabaqGrade, setSabaqGrade] = useState(SABAQ_GRADES[0]);
  const [sabqiTarget, setSabqiTarget] = useState('');
  const [sabqiGrade, setSabqiGrade] = useState(SABQI_GRADES[0]);
  const [manzilTarget, setManzilTarget] = useState('');
  const [manzilGrade, setManzilGrade] = useState(MANZIL_GRADES[0]);
  const [dailyAkhlaqDelta, setDailyAkhlaqDelta] = useState<number>(0);
  const [dailyAkhlaqTags, setDailyAkhlaqTags] = useState<string[]>([]);
  const [teacherNote, setTeacherNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [filterStudentId, setFilterStudentId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentStudent =
    students.find((s) => s.studentId === selectedStudentId) || students[0];
  const studentAnalytics = currentStudent
    ? calculateStudentAnalytics(currentStudent, logs, schedules)
    : null;
  const activeSchedule = schedules.find(
    (s) => s.studentId === selectedStudentId && s.status === 'active'
  );

  const handleAddAkhlaqChip = (labelMalayalam: string, points: number) => {
    if (dailyAkhlaqTags.length >= 10) return;
    setDailyAkhlaqDelta((prev) => Math.max(-30, Math.min(30, prev + points)));
    setDailyAkhlaqTags((prev) => [...prev, labelMalayalam]);
    setTeacherNote((prev) => (prev.trim() ? `${prev.trim()}, ${labelMalayalam}` : labelMalayalam));
  };

  const handleResetAkhlaq = () => {
    setDailyAkhlaqDelta(0);
    setDailyAkhlaqTags([]);
    setTeacherNote('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatusBanner(null);

    const safeStudentId = selectedStudentId || currentStudent?.studentId || 'STD-101';
    const safeStudentName = currentStudent?.name || 'Zaid Mansoor';
    const safeVerifiedBy = verifiedByName || 'Ustadh Ahmad';
    const currentAttendance: 'Present' | 'Absent' =
      attendance === 'Absent' ? 'Absent' : 'Present';
    const isAbsent = currentAttendance === 'Absent';
    const dateStr = new Date().toLocaleDateString('en-GB');

    const safeSabaqGrade = isAbsent ? 'Not Recited' : sabaqGrade || SABAQ_GRADES[0];
    const safeSabqiGrade = isAbsent ? 'Not Recited' : sabqiGrade || SABQI_GRADES[0];
    const safeManzilGrade = isAbsent ? 'Not Recited' : manzilGrade || MANZIL_GRADES[0];

    const safeSabaqTarget = isAbsent
      ? 'Not Recited'
      : safeSabaqGrade === 'Not Recited'
      ? 'Not Recited'
      : sabaqTarget.trim() || `${currentStudent?.currentSurah || 'Al-Baqarah 1-10'} (1 Full Page)`;

    const safeSabqiTarget = isAbsent
      ? 'Not Recited'
      : safeSabqiGrade === 'Not Recited'
      ? 'Not Recited'
      : sabqiTarget.trim() || `Juz ${currentStudent?.currentJuz || 1} (1/2 Juz)`;

    const safeManzilTarget = isAbsent
      ? 'Not Recited'
      : safeManzilGrade === 'Not Recited'
      ? 'Not Recited'
      : manzilTarget.trim() || `Juz ${Math.max(1, currentStudent?.juzCompleted || 1)} (1 Full Juz)`;

    const safeNote =
      teacherNote.trim() || (isAbsent ? 'Marked Absent' : '');

    try {
      await onAddLog({
        studentId: safeStudentId,
        studentName: safeStudentName,
        dateStr,
        attendance: currentAttendance,
        sabaqTarget: safeSabaqTarget,
        sabaqGrade: safeSabaqGrade,
        sabqiTarget: safeSabqiTarget,
        sabqiGrade: safeSabqiGrade,
        manzilTarget: safeManzilTarget,
        manzilGrade: safeManzilGrade,
        akhlaqScoreDelta: Number(dailyAkhlaqDelta) || 0,
        akhlaqTags: Array.isArray(dailyAkhlaqTags) ? dailyAkhlaqTags : [],
        note: safeNote,
        verifiedBy: safeVerifiedBy,
      });

      setSabaqTarget('');
      setSabqiTarget('');
      setManzilTarget('');
      setDailyAkhlaqDelta(0);
      setDailyAkhlaqTags([]);
      setTeacherNote('');
      setAttendance('Present');

      setStatusBanner({
        type: 'success',
        message: isAbsent
          ? `Synced successfully! Marked ${safeStudentName} Absent (${dateStr}).`
          : `Synced successfully! Verified daily Hifz & Akhlaq log for ${safeStudentName} (${
              dailyAkhlaqDelta >= 0 ? `+${dailyAkhlaqDelta}` : dailyAkhlaqDelta
            } Akhlaq pts).`,
      });

      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Synced successfully!');
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      setStatusBanner({
        type: 'error',
        message: `Sync Error: ${errMsg}`,
      });
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Sync Error: ' + errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesStudent = filterStudentId === 'ALL' || log.studentId === filterStudentId;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      log.studentName.toLowerCase().includes(q) ||
      log.studentId.toLowerCase().includes(q) ||
      log.sabaqTarget.toLowerCase().includes(q) ||
      log.note.toLowerCase().includes(q);
    return matchesStudent && matchesQuery;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 Columns: Daily Hifz & Akhlaq Verification Desk Form */}
      <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-900" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daily Hifz &amp; Akhlaq Verification Desk
              </h2>
              <p className="text-xs text-slate-500">
                Record Sabaq, Sabqi, Manzil &amp; Automatic Monthly Akhlaq conduct points
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Verifier: {verifiedByName || 'Ustadh Ahmad'}
          </span>
        </div>

        {statusBanner && (
          <div
            role="status"
            className={`mb-5 rounded-lg border px-4 py-3 text-xs font-medium flex items-center justify-between gap-3 ${
              statusBanner.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-950'
                : 'border-emerald-200 bg-emerald-50/80 text-emerald-950'
            }`}
          >
            <span>{statusBanner.message}</span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="hover:underline font-semibold cursor-pointer whitespace-nowrap shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Student Selector */}
          <div>
            <label
              htmlFor="t-student-select"
              className="block text-xs font-semibold text-slate-800 mb-1.5"
            >
              Select Student
            </label>
            <select
              id="t-student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-800 focus:outline-none"
            >
              {students.map((st) => (
                <option key={st.studentId} value={st.studentId}>
                  {st.name} ({st.studentId}) — Juz {st.juzCompleted}/30 · {st.batch}
                </option>
              ))}
            </select>
          </div>

          {/* Attendance Toggle */}
          <div>
            <span className="block text-xs font-semibold text-slate-800 mb-1.5">
              Attendance Status
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-att-present"
                onClick={() => setAttendance('Present')}
                className={`py-2.5 px-4 rounded-lg border text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  attendance === 'Present'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ✓ Present
              </button>
              <button
                type="button"
                id="btn-att-absent"
                onClick={() => setAttendance('Absent')}
                className={`py-2.5 px-4 rounded-lg border text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  attendance === 'Absent'
                    ? 'bg-rose-50 border-rose-500 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ✗ Absent
              </button>
            </div>
          </div>

          {/* 1. Sabaq, 2. Sabqi, 3. Manzil (Hidden when Absent) */}
          {attendance === 'Present' && (
            <div className="space-y-5 pt-1">
              {/* 1. Sabaq */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <label
                  htmlFor="sabaq-target"
                  className="block text-xs font-bold text-slate-900"
                >
                  1. Sabaq (New Lesson · പുതിയ പാഠം)
                </label>
                <input
                  id="sabaq-target"
                  type="text"
                  value={sabaqTarget}
                  onChange={(e) => setSabaqTarget(e.target.value)}
                  placeholder={`Surah & Ayahs (e.g. ${currentStudent?.currentSurah || 'Al-Baqarah 1-10'})`}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {SABAQ_PORTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setSabaqTarget((prev) => appendPortionChip(prev, chip))
                      }
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="sabaq-grade" className="sr-only">
                    Sabaq Grade
                  </label>
                  <select
                    id="sabaq-grade"
                    value={sabaqGrade}
                    onChange={(e) => setSabaqGrade(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                  >
                    {SABAQ_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Sabqi */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <label
                  htmlFor="sabqi-target"
                  className="block text-xs font-bold text-slate-900"
                >
                  2. Sabqi (Recent Juz Revision · സമീപകാല പാഠം)
                </label>
                <input
                  id="sabqi-target"
                  type="text"
                  value={sabqiTarget}
                  onChange={(e) => setSabqiTarget(e.target.value)}
                  placeholder="Portion (e.g. Last 5 pages)"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {SABQI_PORTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setSabqiTarget((prev) => appendPortionChip(prev, chip))
                      }
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="sabqi-grade" className="sr-only">
                    Sabqi Grade
                  </label>
                  <select
                    id="sabqi-grade"
                    value={sabqiGrade}
                    onChange={(e) => setSabqiGrade(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                  >
                    {SABQI_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Manzil */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <label
                  htmlFor="manzil-target"
                  className="block text-xs font-bold text-slate-900"
                >
                  3. Manzil (Old Juz Revision · പഴയ ജുസ്ഉകൾ)
                </label>
                <input
                  id="manzil-target"
                  type="text"
                  value={manzilTarget}
                  onChange={(e) => setManzilTarget(e.target.value)}
                  placeholder="Juz / Portion (e.g. Juz 3)"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {MANZIL_PORTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setManzilTarget((prev) => appendPortionChip(prev, chip))
                      }
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="manzil-grade" className="sr-only">
                    Manzil Grade
                  </label>
                  <select
                    id="manzil-grade"
                    value={manzilGrade}
                    onChange={(e) => setManzilGrade(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                  >
                    {MANZIL_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Akhlaq & Conduct Assessment (സ്വഭാവം & അച്ചടക്കം) */}
          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="teacher-note"
                className="text-xs font-bold text-slate-900"
              >
                Akhlaq &amp; Conduct Assessment (സ്വഭാവം &amp; അച്ചടക്കം)
              </label>
              <div className="flex items-center gap-3">
                <span className="font-mono tabular-nums text-xs font-bold text-slate-700">
                  Session Akhlaq Δ:{' '}
                  <span
                    className={
                      dailyAkhlaqDelta > 0
                        ? 'text-emerald-800'
                        : dailyAkhlaqDelta < 0
                        ? 'text-rose-700'
                        : 'text-slate-600'
                    }
                  >
                    {dailyAkhlaqDelta > 0 ? `+${dailyAkhlaqDelta}` : dailyAkhlaqDelta} pts
                  </span>
                </span>
                {(dailyAkhlaqTags.length > 0 || teacherNote) && (
                  <button
                    type="button"
                    onClick={handleResetAkhlaq}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5">
                നല്ല സ്വഭാവങ്ങൾ (+2 pts):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POSITIVE_AKHLAQ_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleAddAkhlaqChip(chip.labelMalayalam, chip.points)}
                    className="rounded-md border border-emerald-300 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    + {chip.labelMalayalam}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5">
                ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ (-3 pts):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {NEGATIVE_AKHLAQ_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleAddAkhlaqChip(chip.labelMalayalam, chip.points)}
                    className="rounded-md border border-rose-300 bg-rose-50/70 px-2.5 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    - {chip.labelMalayalam}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <input
                id="teacher-note"
                type="text"
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="Selected remarks will appear here or type custom notes..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-save-log"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Syncing to Firestore...' : 'Submit & Sync Verification'}
          </button>
        </form>
      </div>

      {/* Right 5 Columns: Selected Student Snapshot + Live Verification Feed */}
      <div className="lg:col-span-5 space-y-6">
        {/* Selected Student Live Standing */}
        {currentStudent && studentAnalytics && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentStudent.name} ({currentStudent.studentId})
                </h3>
                <p className="text-xs text-slate-500">
                  {currentStudent.batch} · {currentStudent.ustadhName}
                </p>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-xs font-bold text-emerald-900">
                  Akhlaq: {studentAnalytics.akhlaq.letterGrade} ({studentAnalytics.akhlaq.score}%)
                </div>
                <div className="text-xs text-slate-500">
                  Juz {currentStudent.juzCompleted} / 30
                </div>
              </div>
            </div>

            {activeSchedule ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Active Schedule: Juz {activeSchedule.targetJuz}</span>
                  <span className="font-mono tabular-nums text-emerald-900">
                    {activeSchedule.progressPercent}% Complete
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-800 rounded-full"
                    style={{ width: `${activeSchedule.progressPercent}%` }}
                  />
                </div>
                <div className="text-slate-600 pt-1">
                  Quota: {activeSchedule.dailySabaqQuota} · Sabqi: {activeSchedule.sabqiWindow} · Manzil: {activeSchedule.manzilCycle}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No active memorization schedule assigned yet.
              </p>
            )}
          </div>
        )}

        {/* Recent Verification Feed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Recent Verification Feed (<span className="font-mono tabular-nums">{filteredLogs.length}</span>)
            </h3>
            <select
              aria-label="Filter verification feed by student"
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <option value="ALL">All Students</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search verification logs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, surah, or conduct remark..."
              className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-800 focus:outline-none"
            />
          </div>

          <div className="divide-y divide-slate-200 max-h-[500px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No matching verification logs found.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-900">
                      {log.studentName}{' '}
                      <span className="font-mono font-normal text-slate-500">
                        ({log.studentId})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
                      <span>{log.dateStr}</span>
                      <span>·</span>
                      <span
                        className={
                          log.attendance === 'Absent'
                            ? 'text-rose-700 font-semibold'
                            : 'text-emerald-800 font-semibold'
                        }
                      >
                        {log.attendance}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteLog(log.id)}
                        aria-label={`Delete log for ${log.studentName} on ${log.dateStr}`}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {log.attendance === 'Present' && (
                    <div className="text-xs text-slate-700 space-y-0.5">
                      <div>
                        <span className="font-semibold text-slate-900">Sabaq:</span>{' '}
                        {log.sabaqTarget} ·{' '}
                        <span className="text-emerald-900 font-medium">{log.sabaqGrade}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Sabqi:</span>{' '}
                        {log.sabqiTarget} · <span className="text-slate-600">{log.sabqiGrade}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Manzil:</span>{' '}
                        {log.manzilTarget} · <span className="text-slate-600">{log.manzilGrade}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-0.5">
                    <span className="italic text-slate-600">
                      {log.note ? `"${log.note}"` : 'No additional notes'}
                    </span>
                    <span className="font-mono tabular-nums font-semibold">
                      Akhlaq Δ:{' '}
                      <span
                        className={
                          log.akhlaqScoreDelta > 0
                            ? 'text-emerald-800'
                            : log.akhlaqScoreDelta < 0
                            ? 'text-rose-700'
                            : 'text-slate-600'
                        }
                      >
                        {log.akhlaqScoreDelta > 0
                          ? `+${log.akhlaqScoreDelta}`
                          : log.akhlaqScoreDelta}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
