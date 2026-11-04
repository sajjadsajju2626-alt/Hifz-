import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Megaphone,
  Plus,
  Printer,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  CampusNoticeRecord,
  CampusSettingsRecord,
  HifzLogRecord,
  MemorizationScheduleRecord,
  StudentRecord,
} from '../types/hifz';
import { calculateStudentAnalytics } from '../utils/hifzCalculations';

interface PrincipalPortalViewProps {
  students: StudentRecord[];
  logs: HifzLogRecord[];
  schedules: MemorizationScheduleRecord[];
  notices: CampusNoticeRecord[];
  settings: CampusSettingsRecord;
  onAddStudent: (student: Omit<StudentRecord, 'id' | 'ownerId'>) => void;
  onIncrementStudentJuz: (studentId: string) => void;
  onPublishNotice: (notice: {
    title: string;
    content: string;
    audience: 'all' | 'parents' | 'teachers';
  }) => void;
  onSaveSettings: (newSettings: Omit<CampusSettingsRecord, 'ownerId'>) => void;
  onOpenReportCard: (student: StudentRecord) => void;
}

export const PrincipalPortalView: React.FC<PrincipalPortalViewProps> = ({
  students,
  logs,
  schedules,
  notices,
  settings,
  onAddStudent,
  onIncrementStudentJuz,
  onPublishNotice,
  onSaveSettings,
  onOpenReportCard,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'portfolios' | 'enroll' | 'notices' | 'settings'
  >('portfolios');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>('STD-101');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // Enroll form state
  const [newStudentId, setNewStudentId] = useState(`STD-10${students.length + 1}`);
  const [newName, setNewName] = useState('');
  const [newBatch, setNewBatch] = useState('Halqa Al-Fajr (Senior)');
  const [newUstadh, setNewUstadh] = useState('Ustadh Ahmad');
  const [newJuzCompleted, setNewJuzCompleted] = useState(5);
  const [newCurrentSurah, setNewCurrentSurah] = useState('Surah Al-Maidah (1-40)');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newPin, setNewPin] = useState('1234');

  // Notice form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeAudience, setNoticeAudience] = useState<'all' | 'parents' | 'teachers'>('all');

  // Settings form state
  const [cfgMode, setCfgMode] = useState<'residential' | 'day'>(settings.mode);
  const [cfgName, setCfgName] = useState(settings.name);
  const [cfgSub, setCfgSub] = useState(settings.sub);
  const [cfgTerm, setCfgTerm] = useState(settings.academicTerm);
  const [cfgThreshold, setCfgThreshold] = useState(settings.akhlaqAlertThreshold);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newStudentId.trim()) return;
    onAddStudent({
      studentId: newStudentId.trim().toUpperCase(),
      name: newName.trim(),
      batch: newBatch.trim(),
      ustadhName: newUstadh.trim(),
      juzCompleted: Number(newJuzCompleted),
      currentJuz: Math.min(30, Number(newJuzCompleted) + 1),
      currentSurah: newCurrentSurah.trim() || 'Surah Al-Fatihah',
      guardianName: newGuardianName.trim() || 'Guardian',
      guardianPhone: newGuardianPhone.trim() || '+91 98470 00000',
      pin: newPin.trim() || '1234',
    });
    setBannerMsg(`Enrolled student ${newName.trim()} (${newStudentId.trim().toUpperCase()}) into ${newBatch}.`);
    setNewName('');
    setNewGuardianName('');
    setNewGuardianPhone('');
    setNewStudentId(`STD-10${students.length + 2}`);
    setActiveSubTab('portfolios');
  };

  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    onPublishNotice({
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      audience: noticeAudience,
    });
    setBannerMsg(`Published campus circular: "${noticeTitle.trim()}".`);
    setNoticeTitle('');
    setNoticeContent('');
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      mode: cfgMode,
      name: cfgName.trim() || 'Asry Academy',
      sub: cfgSub.trim() || 'Bendichal',
      academicTerm: cfgTerm.trim() || '1448 AH Term',
      akhlaqAlertThreshold: Number(cfgThreshold),
    });
    setBannerMsg('Saved campus configuration and updated header branding.');
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubTab('portfolios')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'portfolios'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Student Portfolios ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('enroll')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'enroll'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Enroll Student
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('notices')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'notices'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Notice Desk ({notices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'settings'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Campus Settings
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-950 flex items-center justify-between"
        >
          <span>{bannerMsg}</span>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. STUDENT PORTFOLIOS & AUTO-AKHLAQ ANALYSIS */}
      {activeSubTab === 'portfolios' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Student Portfolios &amp; Automatic Monthly Akhlaq Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Click any student row to inspect monthly Akhlaq auto-reasons, attendance rate, and print official report cards
            </p>
          </div>

          <div className="space-y-3">
            {students.map((std) => {
              const analytics = calculateStudentAnalytics(std, logs, schedules);
              const isExpanded = expandedStudentId === std.studentId;

              return (
                <div
                  key={std.studentId}
                  className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                >
                  <div className="p-4 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedStudentId(isExpanded ? null : std.studentId)
                      }
                      aria-expanded={isExpanded}
                      className="flex items-center gap-3 text-left cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {std.name}{' '}
                          <span className="font-mono text-xs font-normal text-slate-500">
                            ({std.studentId})
                          </span>
                        </div>
                        <div className="text-xs text-emerald-900 font-medium mt-0.5 font-mono tabular-nums">
                          Juz: {std.juzCompleted} / 30 · {std.batch} · {std.ustadhName}
                        </div>
                      </div>
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-xs font-mono tabular-nums font-bold ${
                          analytics.akhlaq.statusTone === 'rose'
                            ? 'text-rose-700'
                            : analytics.akhlaq.statusTone === 'amber'
                            ? 'text-amber-700'
                            : 'text-emerald-900'
                        }`}
                      >
                        Akhlaq: {analytics.akhlaq.letterGrade} ({analytics.akhlaq.score}%)
                      </span>

                      <button
                        type="button"
                        onClick={() => onIncrementStudentJuz(std.studentId)}
                        disabled={std.juzCompleted >= 30}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        +1 Juz Milestone
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenReportCard(std)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Report
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200 space-y-4 text-xs bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                        <div className="pt-2 md:pt-0 md:pr-4">
                          <div className="text-slate-500">Monthly Akhlaq Breakdown</div>
                          <div className="font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                            {analytics.akhlaq.gradeLabel} ({analytics.akhlaq.score}%)
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            {analytics.akhlaq.malayalamSubtitle}
                          </div>
                        </div>

                        <div className="pt-2 md:pt-0 md:px-4">
                          <div className="text-slate-500">Attendance &amp; Sessions</div>
                          <div className="font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                            Total Sessions: {analytics.totalSessions} | Present:{' '}
                            {analytics.presentSessions} ({analytics.attendanceRate}%)
                          </div>
                          <div className="text-slate-600 mt-0.5 font-mono tabular-nums">
                            Sabaq Mumtaz/Jayyid: {analytics.sabaqExcellenceRate}%
                          </div>
                        </div>

                        <div className="pt-2 md:pt-0 md:pl-4">
                          <div className="text-slate-500">Guardian &amp; Portal Access</div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {std.guardianName} ({std.guardianPhone})
                          </div>
                          <div className="text-slate-600 mt-0.5 font-mono">
                            Parent Login ID: {std.studentId} · PIN: {std.pin}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-1">
                        <div className="font-semibold text-slate-900">
                          Auto-Calculated Conduct Evaluation (ഓട്ടോ-റീസൺസ്):
                        </div>
                        <p className="text-slate-700">{analytics.akhlaq.autoReasonReport}</p>
                        {analytics.akhlaq.topTags && (
                          <p className="text-slate-500">
                            Observed tags: <span className="font-medium text-slate-800">{analytics.akhlaq.topTags}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ENROLL NEW STUDENT */}
      {activeSubTab === 'enroll' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 max-w-2xl">
          <div className="border-b border-slate-200 pb-4 mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Enroll New Hifz Student
            </h2>
            <p className="text-xs text-slate-500">
              Create student portfolio, assign Halqa &amp; Ustadh, and generate Parent Portal credentials
            </p>
          </div>

          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="enroll-id"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Admission / Student ID
                </label>
                <input
                  id="enroll-id"
                  type="text"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enroll-name"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Full Student Name
                </label>
                <input
                  id="enroll-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Anas Rahman"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="enroll-batch"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Halqa / Batch
                </label>
                <input
                  id="enroll-batch"
                  type="text"
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enroll-ustadh"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Assigned Ustadh
                </label>
                <input
                  id="enroll-ustadh"
                  type="text"
                  value={newUstadh}
                  onChange={(e) => setNewUstadh(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="enroll-juz"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Completed Juz (0–30)
                </label>
                <input
                  id="enroll-juz"
                  type="number"
                  min={0}
                  max={30}
                  value={newJuzCompleted}
                  onChange={(e) => setNewJuzCompleted(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enroll-surah"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Current Active Surah
                </label>
                <input
                  id="enroll-surah"
                  type="text"
                  value={newCurrentSurah}
                  onChange={(e) => setNewCurrentSurah(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="enroll-guardian"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Guardian Name
                </label>
                <input
                  id="enroll-guardian"
                  type="text"
                  value={newGuardianName}
                  onChange={(e) => setNewGuardianName(e.target.value)}
                  placeholder="Parent Name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enroll-phone"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Guardian Phone
                </label>
                <input
                  id="enroll-phone"
                  type="text"
                  value={newGuardianPhone}
                  onChange={(e) => setNewGuardianPhone(e.target.value)}
                  placeholder="+91 98470 00000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enroll-pin"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Parent Portal PIN
                </label>
                <input
                  id="enroll-pin"
                  type="text"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Register Student Profile
            </button>
          </form>
        </div>
      )}

      {/* 3. NOTICE DESK */}
      {activeSubTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
              Post Circular / Campus Notice
            </h2>
            <form onSubmit={handleNoticeSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="notice-title"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Circular Heading
                </label>
                <input
                  id="notice-title"
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Monthly Manzil Exam Schedule"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="notice-audience"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Target Audience
                </label>
                <select
                  id="notice-audience"
                  value={noticeAudience}
                  onChange={(e) =>
                    setNoticeAudience(e.target.value as 'all' | 'parents' | 'teachers')
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="all">All (Parents &amp; Asatidhah)</option>
                  <option value="parents">Parents Only</option>
                  <option value="teachers">Ustadhs / Teachers Only</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notice-content"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Message Details
                </label>
                <textarea
                  id="notice-content"
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Write official announcement..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 cursor-pointer"
              >
                Post Notice
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
              Published Campus Circulars ({notices.length})
            </h2>
            <div className="divide-y divide-slate-200">
              {notices.map((n) => (
                <div key={n.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      {n.dateStr} · Audience: {n.audience.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CAMPUS SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 max-w-xl">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
            Campus &amp; Grading Settings
          </h2>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="cfg-campus-mode"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Campus Mode
              </label>
              <select
                id="cfg-campus-mode"
                value={cfgMode}
                onChange={(e) => setCfgMode(e.target.value as 'residential' | 'day')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="residential">Residential Campus</option>
                <option value="day">Day College</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="cfg-college-name"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                College Name
              </label>
              <input
                id="cfg-college-name"
                type="text"
                value={cfgName}
                onChange={(e) => setCfgName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                required
              />
            </div>

            <div>
              <label
                htmlFor="cfg-college-sub"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Location / Sub Title
              </label>
              <input
                id="cfg-college-sub"
                type="text"
                value={cfgSub}
                onChange={(e) => setCfgSub(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="cfg-term"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Academic Term
                </label>
                <input
                  id="cfg-term"
                  type="text"
                  value={cfgTerm}
                  onChange={(e) => setCfgTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="cfg-threshold"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Auto Akhlaq Alert Threshold (%)
                </label>
                <input
                  id="cfg-threshold"
                  type="number"
                  min={50}
                  max={90}
                  value={cfgThreshold}
                  onChange={(e) => setCfgThreshold(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 cursor-pointer"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
