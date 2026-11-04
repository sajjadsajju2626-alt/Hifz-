import React, { useState } from 'react';
import { CalendarCheck2, CheckCircle, PlusCircle } from 'lucide-react';
import {
  HifzLogRecord,
  MemorizationScheduleRecord,
  StudentRecord,
} from '../types/hifz';
import { calculateStudentAnalytics } from '../utils/hifzCalculations';

interface SchedulesVaultViewProps {
  students: StudentRecord[];
  schedules: MemorizationScheduleRecord[];
  logs: HifzLogRecord[];
  currentUserName: string;
  onAddSchedule: (schedule: Omit<MemorizationScheduleRecord, 'id' | 'ownerId'>) => void;
  onUpdateScheduleProgress: (
    scheduleId: string,
    newProgress: number,
    newStatus: 'active' | 'completed' | 'archived'
  ) => void;
}

export const SchedulesVaultView: React.FC<SchedulesVaultViewProps> = ({
  students,
  schedules,
  logs,
  currentUserName,
  onAddSchedule,
  onUpdateScheduleProgress,
}) => {
  const [studentId, setStudentId] = useState(students[0]?.studentId || 'STD-101');
  const [targetJuz, setTargetJuz] = useState<number>(17);
  const [targetSurahRange, setTargetSurahRange] = useState('Surah Al-Anbiya (1) to Al-Hajj (78)');
  const [dailySabaqQuota, setDailySabaqQuota] = useState('1 Full Page (15 lines)');
  const [sabqiWindow, setSabqiWindow] = useState('Last 7 Pages of Current Juz');
  const [manzilCycle, setManzilCycle] = useState('1 Full Juz daily (15-day cycle)');
  const [startDate, setStartDate] = useState('2026-11-04');
  const [targetDate, setTargetDate] = useState('2026-11-30');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.studentId === studentId);
    if (!student || !targetSurahRange.trim()) return;

    onAddSchedule({
      studentId: student.studentId,
      studentName: student.name,
      targetJuz: Number(targetJuz),
      targetSurahRange: targetSurahRange.trim(),
      dailySabaqQuota: dailySabaqQuota.trim() || '1 Full Page',
      sabqiWindow: sabqiWindow.trim() || '1/2 Juz',
      manzilCycle: manzilCycle.trim() || '1 Full Juz daily',
      startDate,
      targetDate,
      progressPercent: 10,
      status: 'active',
      assignedBy: currentUserName,
    });

    setFeedbackMsg(`Stored new memorization schedule for ${student.name} (Target Juz ${targetJuz}).`);
    setTargetSurahRange('');
  };

  const visibleSchedules = schedules.filter(
    (s) => statusFilter === 'all' || s.status === statusFilter
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 5 Columns: Create New Memorization Schedule */}
      <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4 mb-5">
          <CalendarCheck2 className="w-5 h-5 text-emerald-900" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assign Memorization Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Store structured Sabaq quotas, Sabqi windows, and Manzil cycles securely
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-950 flex items-center justify-between"
          >
            <span>{feedbackMsg}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="font-semibold underline cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="sch-student"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Student
              </label>
              <select
                id="sch-student"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sch-juz"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Target Juz
              </label>
              <input
                id="sch-juz"
                type="number"
                min={1}
                max={30}
                value={targetJuz}
                onChange={(e) => setTargetJuz(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="sch-surah-range"
              className="block text-xs font-semibold text-slate-800 mb-1"
            >
              Target Surah &amp; Ayah Range
            </label>
            <input
              id="sch-surah-range"
              type="text"
              value={targetSurahRange}
              onChange={(e) => setTargetSurahRange(e.target.value)}
              placeholder="e.g. Surah Al-Anbiya (1) to Al-Hajj (78)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              required
            />
          </div>

          <div>
            <label
              htmlFor="sch-sabaq-quota"
              className="block text-xs font-semibold text-slate-800 mb-1"
            >
              Daily Sabaq Quota
            </label>
            <select
              id="sch-sabaq-quota"
              value={dailySabaqQuota}
              onChange={(e) => setDailySabaqQuota(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="1/2 Page (8 lines) + Tajweed Drill">1/2 Page (8 lines) + Tajweed Drill</option>
              <option value="1 Full Page (15 lines)">1 Full Page (15 lines)</option>
              <option value="1.5 Pages (22 lines)">1.5 Pages (22 lines)</option>
              <option value="2 Pages (30 lines)">2 Pages (30 lines)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sch-sabqi-window"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Sabqi Revision Window
              </label>
              <input
                id="sch-sabqi-window"
                type="text"
                value={sabqiWindow}
                onChange={(e) => setSabqiWindow(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                required
              />
            </div>
            <div>
              <label
                htmlFor="sch-manzil-cycle"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Manzil Cycle
              </label>
              <input
                id="sch-manzil-cycle"
                type="text"
                value={manzilCycle}
                onChange={(e) => setManzilCycle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sch-start-date"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Start Date
              </label>
              <input
                id="sch-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
                required
              />
            </div>
            <div>
              <label
                htmlFor="sch-target-date"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Target Completion Date
              </label>
              <input
                id="sch-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Save Memorization Schedule
          </button>
        </form>
      </div>

      {/* Right 7 Columns: Stored Memorization Schedules Table & Progress Controls */}
      <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Memorization Schedules Vault (<span className="font-mono tabular-nums">{visibleSchedules.length}</span>)
            </h2>
            <p className="text-xs text-slate-500">
              Real-time schedule adherence, daily quotas, and milestone deadlines
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap capitalize ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {visibleSchedules.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No schedules match the selected filter.
            </div>
          ) : (
            visibleSchedules.map((sch) => {
              const student = students.find((s) => s.studentId === sch.studentId);
              const analytics = student
                ? calculateStudentAnalytics(student, logs, schedules)
                : null;
              return (
                <div key={sch.id} className="py-4 first:pt-1 last:pb-1 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {sch.studentName}{' '}
                        <span className="font-mono text-xs font-normal text-slate-500">
                          ({sch.studentId})
                        </span>{' '}
                        · Target Juz <span className="font-mono tabular-nums">{sch.targetJuz}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {sch.targetSurahRange}
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono tabular-nums text-slate-600">
                      <div>
                        Status:{' '}
                        <span className="font-bold uppercase text-emerald-900">
                          {sch.status}
                        </span>
                        {analytics ? ` · ${analytics.paceStatus}` : ''}
                      </div>
                      <div className="text-slate-500">
                        {sch.startDate} → {sch.targetDate}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200/70">
                    <div>
                      <span className="font-semibold text-slate-800">Daily Sabaq:</span>{' '}
                      {sch.dailySabaqQuota}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Sabqi Window:</span>{' '}
                      {sch.sabqiWindow}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Manzil Cycle:</span>{' '}
                      {sch.manzilCycle}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1 min-w-[180px] space-y-1">
                      <div className="flex justify-between text-xs font-mono tabular-nums">
                        <span className="text-slate-500">Completion Progress</span>
                        <span className="font-bold text-slate-900">{sch.progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-800 rounded-full transition-all"
                          style={{ width: `${sch.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {sch.status !== 'completed' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.min(100, sch.progressPercent + 10);
                            onUpdateScheduleProgress(
                              sch.id,
                              next,
                              next >= 100 ? 'completed' : 'active'
                            );
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          +10% Progress
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateScheduleProgress(sch.id, 100, 'completed')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
