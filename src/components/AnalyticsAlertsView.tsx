import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  BellRing,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  FeedbackAlertRecord,
  HifzLogRecord,
  MemorizationScheduleRecord,
  StudentRecord,
} from '../types/hifz';
import { calculateStudentAnalytics } from '../utils/hifzCalculations';

interface AnalyticsAlertsViewProps {
  students: StudentRecord[];
  logs: HifzLogRecord[];
  schedules: MemorizationScheduleRecord[];
  alerts: FeedbackAlertRecord[];
  onUpdateAlert: (
    alertId: string,
    status: 'open' | 'acknowledged' | 'resolved',
    teacherResponse: string
  ) => void;
  onOpenReportCard: (student: StudentRecord) => void;
}

export const AnalyticsAlertsView: React.FC<AnalyticsAlertsViewProps> = ({
  students,
  logs,
  schedules,
  alerts,
  onUpdateAlert,
  onOpenReportCard,
}) => {
  const [alertFilter, setAlertFilter] = useState<
    'all' | 'open' | 'critical' | 'akhlaq_drop' | 'revision'
  >('all');
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const studentSummaries = students.map((student) => ({
    student,
    summary: calculateStudentAnalytics(student, logs, schedules),
  }));

  const avgAttendance =
    studentSummaries.length > 0
      ? Math.round(
          studentSummaries.reduce((acc, s) => acc + s.summary.attendanceRate, 0) /
            studentSummaries.length
        )
      : 100;

  const avgSabaqExcellence =
    studentSummaries.length > 0
      ? Math.round(
          studentSummaries.reduce((acc, s) => acc + s.summary.sabaqExcellenceRate, 0) /
            studentSummaries.length
        )
      : 100;

  const avgAkhlaqScore =
    studentSummaries.length > 0
      ? Math.round(
          studentSummaries.reduce((acc, s) => acc + s.summary.akhlaq.score, 0) /
            studentSummaries.length
        )
      : 100;

  const totalJuzCompleted = students.reduce((acc, s) => acc + s.juzCompleted, 0);
  const openAlertsCount = alerts.filter((a) => a.status === 'open').length;

  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'open') return a.status !== 'resolved';
    if (alertFilter === 'critical') return a.severity === 'critical';
    if (alertFilter === 'akhlaq_drop') return a.category === 'akhlaq_drop';
    if (alertFilter === 'revision')
      return a.category === 'sabaq_stall' || a.category === 'manzil_weakness';
    return true;
  });

  const handleCopyParentMessage = (alert: FeedbackAlertRecord) => {
    const text = `Assalamu Alaikum. Hifz & Akhlaq Update for ${alert.studentName} (${alert.studentId}): ${alert.title}. ${alert.message} Ustadh Plan: ${alert.recommendedAction}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(alert.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top 5 KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Cohort Avg Attendance</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {avgAttendance}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across <span className="font-mono tabular-nums">{logs.length}</span> verified sessions
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Sabaq Mumtaz / Jayyid</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-900 mt-1">
            {avgSabaqExcellence}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Daily new lesson accuracy</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Avg Monthly Akhlaq</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-900 mt-1">
            {avgAkhlaqScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Auto-graded conduct score</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Cumulative Juz Memorized</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {totalJuzCompleted} <span className="text-sm font-normal text-slate-500">Juz</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across <span className="font-mono tabular-nums">{students.length}</span> enrolled Huffaz
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500">Open Feedback Alerts</div>
          <div
            className={`font-mono tabular-nums text-2xl font-bold mt-1 ${
              openAlertsCount > 0 ? 'text-amber-700' : 'text-emerald-800'
            }`}
          >
            {openAlertsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Automated teacher triggers</div>
        </div>
      </div>

      {/* Automated Teacher Feedback Alerts Center */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-emerald-900" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Automated Teacher Feedback &amp; Early-Intervention Alerts
              </h2>
              <p className="text-xs text-slate-500">
                Automatically triggered by Sabaq stalls, Manzil retention drops, absences, or Akhlaq conduct deductions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: 'All Alerts' },
                { id: 'open', label: 'Active' },
                { id: 'critical', label: 'Critical' },
                { id: 'akhlaq_drop', label: 'Akhlaq Conduct' },
                { id: 'revision', label: 'Sabaq & Manzil' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAlertFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  alertFilter === f.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No automated feedback alerts in this view.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const draft =
                responseDrafts[alert.id] !== undefined
                  ? responseDrafts[alert.id]
                  : alert.teacherResponse;

              return (
                <div key={alert.id} className="py-4 first:pt-1 last:pb-1 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {alert.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                      ) : alert.severity === 'positive' ? (
                        <Award className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {alert.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                          Student: {alert.studentName} ({alert.studentId}) · Date: {alert.dateStr} · Status:{' '}
                          <span className="uppercase font-bold text-slate-800">
                            {alert.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyParentMessage(alert)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {copiedId === alert.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          Copied Guardian Note
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Guardian Note
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 pl-6">
                    <p>{alert.message}</p>
                    <p className="text-slate-900 font-medium">
                      <strong>Recommended Intervention:</strong> {alert.recommendedAction}
                    </p>
                  </div>

                  <div className="pl-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      aria-label={`Teacher intervention note for ${alert.studentName}`}
                      value={draft}
                      onChange={(e) =>
                        setResponseDrafts((prev) => ({
                          ...prev,
                          [alert.id]: e.target.value,
                        }))
                      }
                      placeholder="Add teacher follow-up note or parent feedback summary..."
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-800 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      {alert.status === 'open' && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAlert(
                              alert.id,
                              'acknowledged',
                              draft || 'Acknowledged by Ustadh for halqa follow-up.'
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAlert(
                              alert.id,
                              'resolved',
                              draft || 'Intervention completed & guardian updated.'
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 cursor-pointer whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Student Performance & Akhlaq Analytics Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Student Performance &amp; Automatic Monthly Akhlaq Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Comprehensive breakdown of Juz completion, Sabaq/Manzil quality, and conduct auto-grading
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-3 px-3 font-semibold">Student</th>
                <th className="py-3 px-3 font-semibold">Batch &amp; Ustadh</th>
                <th className="py-3 px-3 font-semibold text-right">Juz Completed</th>
                <th className="py-3 px-3 font-semibold text-right">Attendance</th>
                <th className="py-3 px-3 font-semibold text-right">Sabaq Mumtaz%</th>
                <th className="py-3 px-3 font-semibold">Auto Monthly Akhlaq</th>
                <th className="py-3 px-3 font-semibold">Recorded Conduct Reasons</th>
                <th className="py-3 px-3 font-semibold text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {studentSummaries.map(({ student, summary }) => (
                <tr key={student.studentId} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="font-mono text-slate-500">{student.studentId}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{student.batch}</div>
                    <div className="text-slate-500">{student.ustadhName}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    <div className="font-bold text-slate-900">{student.juzCompleted} / 30</div>
                    <div className="text-slate-500">{Math.round((student.juzCompleted / 30) * 100)}%</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {summary.attendanceRate}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-emerald-900">
                    {summary.sabaqExcellenceRate}%
                  </td>
                  <td className="py-3 px-3">
                    <div
                      className={`font-mono tabular-nums font-bold ${
                        summary.akhlaq.statusTone === 'rose'
                          ? 'text-rose-700'
                          : summary.akhlaq.statusTone === 'amber'
                          ? 'text-amber-700'
                          : 'text-emerald-900'
                      }`}
                    >
                      {summary.akhlaq.letterGrade} ({summary.akhlaq.score}%)
                    </div>
                    <div className="text-slate-500">{summary.akhlaq.malayalamSubtitle}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs">
                    {summary.akhlaq.topTags || 'Exemplary baseline (No deductions)'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenReportCard(student)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-900" />
                      Report Card
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
