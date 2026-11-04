import React, { useState } from 'react';
import { Award, Calendar, FileText, Megaphone } from 'lucide-react';
import {
  CampusNoticeRecord,
  HifzLogRecord,
  MemorizationScheduleRecord,
  StudentRecord,
} from '../types/hifz';
import { calculateStudentAnalytics } from '../utils/hifzCalculations';

interface ParentPortalViewProps {
  students: StudentRecord[];
  defaultStudentId: string;
  logs: HifzLogRecord[];
  schedules: MemorizationScheduleRecord[];
  notices: CampusNoticeRecord[];
  onOpenReportCard: (student: StudentRecord) => void;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  students,
  defaultStudentId,
  logs,
  schedules,
  notices,
  onOpenReportCard,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(
    defaultStudentId || students[0]?.studentId || 'STD-101'
  );

  const student =
    students.find((s) => s.studentId === selectedStudentId) || students[0];

  if (!student) return null;

  const studentLogs = logs.filter((l) => l.studentId === student.studentId);
  const analytics = calculateStudentAnalytics(student, logs, schedules);
  const activeSchedule = schedules.find(
    (s) => s.studentId === student.studentId && s.status === 'active'
  );
  const parentNotices = notices.filter(
    (n) => n.audience === 'all' || n.audience === 'parents'
  );

  return (
    <div className="space-y-6">
      {/* Top Bar for Child Selection & Report Download */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">Guardian Portal · Viewing Student</div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            {student.name}{' '}
            <span className="font-mono text-sm font-normal text-slate-500">
              ({student.studentId})
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {student.batch} · Assigned Mentor: {student.ustadhName} · Current Surah:{' '}
            {student.currentSurah}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="parent-child-switcher" className="sr-only">
              Select Student Profile
            </label>
            <select
              id="parent-child-switcher"
              value={student.studentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
            >
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  Switch Student: {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onOpenReportCard(student)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4" />
            Official Monthly Report Card
          </button>
        </div>
      </div>

      {/* 30-Juz Visual Progress Grid & Monthly Akhlaq Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-900" />
              <h3 className="text-base font-bold text-slate-900">
                30-Juz Memorization Map:{' '}
                <span className="font-mono tabular-nums text-emerald-900">
                  {student.juzCompleted} / 30 Juz
                </span>
              </h3>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {Math.round((student.juzCompleted / 30) * 100)}% Complete
            </span>
          </div>

          <div
            id="parent-juz-grid"
            className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-1"
          >
            {Array.from({ length: 30 }, (_, idx) => {
              const juzNum = idx + 1;
              const isCompleted = juzNum <= student.juzCompleted;
              const isCurrent = juzNum === student.currentJuz && !isCompleted;
              return (
                <div
                  key={juzNum}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center font-mono tabular-nums text-xs font-bold border transition-colors ${
                    isCompleted
                      ? 'bg-emerald-800 border-emerald-900 text-white'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-400 text-amber-900'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  <span>{juzNum}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500">
            Completed Juz (1–{student.juzCompleted}) are highlighted in emerald. Active Juz ({student.currentJuz}) is highlighted in amber.
          </p>
        </div>

        {/* Monthly Akhlaq & Active Schedule Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5">
            <div className="text-xs text-slate-500">
              Automatic Monthly Akhlaq &amp; Conduct Rating
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-lg font-bold text-emerald-950 font-mono tabular-nums">
                {analytics.akhlaq.gradeLabel}
              </div>
              <div className="font-mono tabular-nums text-sm font-bold text-emerald-900">
                {analytics.akhlaq.score}%
              </div>
            </div>
            <div className="text-xs font-medium text-slate-700">
              {analytics.akhlaq.malayalamSubtitle}
            </div>
            <p className="text-xs text-slate-600 pt-1 border-t border-slate-100">
              {analytics.akhlaq.autoReasonReport}
            </p>
            {analytics.akhlaq.topTags && (
              <p className="text-xs text-slate-500">
                Recorded conduct tags: {analytics.akhlaq.topTags}
              </p>
            )}
          </div>

          {activeSchedule && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  Assigned Memorization Schedule (Juz {activeSchedule.targetJuz})
                </span>
                <span className="font-mono tabular-nums font-semibold text-emerald-900">
                  {activeSchedule.progressPercent}%
                </span>
              </div>
              <p className="text-xs text-slate-600">{activeSchedule.targetSurahRange}</p>
              <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                <div>Daily Sabaq: {activeSchedule.dailySabaqQuota}</div>
                <div>Sabqi Window: {activeSchedule.sabqiWindow}</div>
                <div>Manzil Cycle: {activeSchedule.manzilCycle}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Split: Daily Verification Feed & Campus Circulars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Calendar className="w-4 h-4 text-emerald-900" />
            <h3 className="text-base font-bold text-slate-900">
              Daily Verification Feed ({studentLogs.length})
            </h3>
          </div>

          <div id="parent-feed" className="divide-y divide-slate-200">
            {studentLogs.length === 0 ? (
              <p className="py-6 text-xs text-slate-500">
                No verified logs recorded for {student.name} yet.
              </p>
            ) : (
              studentLogs.map((r) => (
                <div key={r.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {r.studentName} · Verified by {r.verifiedBy}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {r.dateStr} · {r.attendance}
                    </span>
                  </div>
                  {r.attendance === 'Present' && (
                    <div className="text-xs text-slate-700 space-y-0.5">
                      <div>
                        <strong>Sabaq:</strong> {r.sabaqTarget} —{' '}
                        <span className="font-semibold text-emerald-900">{r.sabaqGrade}</span>
                      </div>
                      <div>
                        <strong>Sabqi:</strong> {r.sabqiTarget} — {r.sabqiGrade}
                      </div>
                      <div>
                        <strong>Manzil:</strong> {r.manzilTarget} — {r.manzilGrade}
                      </div>
                    </div>
                  )}
                  {r.note && (
                    <p className="text-xs italic text-slate-600">"{r.note}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Megaphone className="w-4 h-4 text-emerald-900" />
            <h3 className="text-base font-bold text-slate-900">Campus Circulars</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {parentNotices.map((n) => (
              <div key={n.id} className="py-3 first:pt-1 last:pb-1 space-y-1">
                <div className="text-xs font-bold text-slate-900">{n.title}</div>
                <div className="text-xs font-mono text-slate-500">{n.dateStr}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
