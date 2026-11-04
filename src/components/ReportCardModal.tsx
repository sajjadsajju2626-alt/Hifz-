import React from 'react';
import { Printer, X } from 'lucide-react';
import {
  CampusSettingsRecord,
  HifzLogRecord,
  MemorizationScheduleRecord,
  StudentRecord,
} from '../types/hifz';
import { calculateStudentAnalytics } from '../utils/hifzCalculations';

interface ReportCardModalProps {
  student: StudentRecord | null;
  logs: HifzLogRecord[];
  schedules: MemorizationScheduleRecord[];
  settings: CampusSettingsRecord;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  logs,
  schedules,
  settings,
  onClose,
}) => {
  if (!student) return null;

  const studentLogs = logs.filter((l) => l.studentId === student.studentId);
  const analytics = calculateStudentAnalytics(student, logs, schedules);
  const activeSchedule = schedules.find(
    (s) => s.studentId === student.studentId && s.status === 'active'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-card-title"
    >
      <div className="relative w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div>
            <h2 id="report-card-title" className="text-lg font-bold text-slate-900">
              Official Monthly Hifz &amp; Akhlaq Report Card
            </h2>
            <p className="text-xs text-slate-500">
              Auto-calculated Monthly Akhlaq Grading &amp; Daily Verification Transcript
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              Print Official Report
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Report Card Modal"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div id="printable-report-area" className="space-y-6 text-slate-900">
          <div className="text-center border-b-2 border-emerald-900 pb-4">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-emerald-950">
              {settings.name}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              {settings.sub} · {settings.mode === 'residential' ? 'Residential Campus' : 'Day College'}
            </p>
            <p className="text-xs font-semibold text-emerald-900 mt-1">
              Official Monthly Hifz &amp; Akhlaq Progress Report · {settings.academicTerm}
            </p>
          </div>

          {/* Student Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-slate-200 rounded-lg p-4 bg-slate-50/70">
            <div>
              <div className="text-xs text-slate-500">Student Name &amp; ID</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {student.name} <span className="font-mono text-xs text-slate-600">({student.studentId})</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {student.batch} · {student.ustadhName}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Hifz Completion</div>
              <div className="font-mono tabular-nums text-sm font-bold text-emerald-900 mt-0.5">
                {student.juzCompleted} / 30 Juz
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Current: {student.currentSurah}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Attendance &amp; Sabaq</div>
              <div className="font-mono tabular-nums text-sm font-bold text-slate-900 mt-0.5">
                {analytics.attendanceRate}% Attendance
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                {analytics.sabaqExcellenceRate}% Mumtaz/Jayyid
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Monthly Akhlaq Grade</div>
              <div className="font-mono tabular-nums text-sm font-bold text-emerald-900 mt-0.5">
                {analytics.akhlaq.gradeLabel} ({analytics.akhlaq.score}%)
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {analytics.akhlaq.malayalamSubtitle}
              </div>
            </div>
          </div>

          {/* Auto-Reasons & Akhlaq Analysis Box */}
          <div className="rounded-lg border border-slate-200 p-4 bg-white space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-900">
                Automatic Monthly Akhlaq Analysis &amp; Recorded Behavior Reasons
              </h3>
              <span className="font-mono tabular-nums text-xs text-slate-600">
                Positive Traits: +{analytics.akhlaq.positiveTagsCount} · Conduct Deductions: -{analytics.akhlaq.negativeTagsCount}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Auto-Evaluation Summary:</strong> {analytics.akhlaq.autoReasonReport}
            </p>
            {analytics.akhlaq.topTags && (
              <p className="text-xs text-slate-600">
                <strong>Recorded Behavior Points:</strong> {analytics.akhlaq.topTags}
              </p>
            )}
            {activeSchedule && (
              <p className="text-xs text-slate-600 pt-1 border-t border-slate-100">
                <strong>Active Memorization Schedule:</strong> Target Juz {activeSchedule.targetJuz} ({activeSchedule.targetSurahRange}) · Daily Quota: {activeSchedule.dailySabaqQuota} · Progress: <span className="font-mono tabular-nums">{activeSchedule.progressPercent}%</span>
              </p>
            )}
          </div>

          {/* Daily Verification Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Attendance</th>
                  <th className="py-2.5 px-3 font-semibold">Sabaq (New)</th>
                  <th className="py-2.5 px-3 font-semibold">Sabqi (Recent)</th>
                  <th className="py-2.5 px-3 font-semibold">Manzil (Revision)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Akhlaq Δ</th>
                  <th className="py-2.5 px-3 font-semibold">Ustadh Notes &amp; Conduct</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No daily verification logs recorded for this student yet.
                    </td>
                  </tr>
                ) : (
                  studentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                        {log.dateStr}
                      </td>
                      <td className="py-2.5 px-3 font-medium">
                        {log.attendance}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900">{log.sabaqTarget}</div>
                        <div className="text-slate-500">{log.sabaqGrade}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900">{log.sabqiTarget}</div>
                        <div className="text-slate-500">{log.sabqiGrade}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900">{log.manzilTarget}</div>
                        <div className="text-slate-500">{log.manzilGrade}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right font-semibold">
                        {log.akhlaqScoreDelta > 0
                          ? `+${log.akhlaqScoreDelta}`
                          : log.akhlaqScoreDelta}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs">
                        {log.note || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-slate-600">
            <div>
              Ustadh Signature ({student.ustadhName}): ___________________________
            </div>
            <div>
              Principal Signature ({settings.name}): ___________________________
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
