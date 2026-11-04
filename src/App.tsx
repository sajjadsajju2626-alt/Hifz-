/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  clampString,
  collection,
  db,
  deleteDoc,
  doc,
  googleProvider,
  handleFirestoreError,
  onSnapshot,
  OperationType,
  query,
  sanitizeId,
  serverTimestamp,
  setDoc,
  signInWithPopup,
  signOut,
  updateDoc,
  where,
} from './lib/firebase';
import {
  CampusNoticeRecord,
  CampusSettingsRecord,
  FeedbackAlertRecord,
  HifzLogRecord,
  MemorizationScheduleRecord,
  StudentRecord,
  UserRole,
} from './types/hifz';
import {
  INITIAL_ALERTS,
  INITIAL_LOGS,
  INITIAL_NOTICES,
  INITIAL_SCHEDULES,
  INITIAL_SETTINGS,
  INITIAL_STUDENTS,
} from './data/seedData';
import { evaluateAutomatedAlerts } from './utils/hifzCalculations';
import { UstadhDeskView } from './components/UstadhDeskView';
import { SchedulesVaultView } from './components/SchedulesVaultView';
import { AnalyticsAlertsView } from './components/AnalyticsAlertsView';
import { PrincipalPortalView } from './components/PrincipalPortalView';
import { ParentPortalView } from './components/ParentPortalView';
import { ReportCardModal } from './components/ReportCardModal';
import { PortalLoginModal } from './components/PortalLoginModal';

type ActiveWorkspaceTab =
  | 'ustadh'
  | 'schedules'
  | 'analytics'
  | 'principal'
  | 'parent';

const STORAGE_KEYS = {
  students: 'hifz_tracker_students_v2',
  logs: 'hifz_tracker_logs_v2',
  schedules: 'hifz_tracker_schedules_v2',
  alerts: 'hifz_tracker_alerts_v2',
  notices: 'hifz_tracker_notices_v2',
  settings: 'hifz_tracker_settings_v2',
};

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mergeById<T extends { id: string }>(firestoreItems: T[], localItems: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of firestoreItems) {
    map.set(item.id, item);
  }
  for (const item of localItems) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('ustadh');
  const [currentSession, setCurrentSession] = useState<{
    role: UserRole;
    name: string;
    studentId?: string;
  }>({
    role: 'teacher',
    name: 'Ustadh Ahmad',
  });

  const [students, setStudents] = useState<StudentRecord[]>(() =>
    loadLocal(STORAGE_KEYS.students, INITIAL_STUDENTS)
  );
  const [logs, setLogs] = useState<HifzLogRecord[]>(() =>
    loadLocal(STORAGE_KEYS.logs, INITIAL_LOGS)
  );
  const [schedules, setSchedules] = useState<MemorizationScheduleRecord[]>(() =>
    loadLocal(STORAGE_KEYS.schedules, INITIAL_SCHEDULES)
  );
  const [alerts, setAlerts] = useState<FeedbackAlertRecord[]>(() =>
    loadLocal(STORAGE_KEYS.alerts, INITIAL_ALERTS)
  );
  const [notices, setNotices] = useState<CampusNoticeRecord[]>(() =>
    loadLocal(STORAGE_KEYS.notices, INITIAL_NOTICES)
  );
  const [settings, setSettings] = useState<CampusSettingsRecord>(() =>
    loadLocal(STORAGE_KEYS.settings, INITIAL_SETTINGS)
  );

  const [reportCardStudent, setReportCardStudent] = useState<StudentRecord | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Persist local state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
    } catch {}
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
    } catch {}
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(notices));
    } catch {}
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Track Firebase Auth readiness
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Attach real-time Firestore listeners for hifz_logs, students, schedules, and alerts
  useEffect(() => {
    if (!isAuthReady) return;

    const ownerScopes = ['portal-session', 'local-seed'];
    if (firebaseUser && firebaseUser.emailVerified && firebaseUser.uid) {
      ownerScopes.push(firebaseUser.uid);
    }

    const studentsQuery = query(
      collection(db, 'students'),
      where('ownerId', 'in', ownerScopes)
    );
    const logsQuery = query(
      collection(db, 'hifz_logs'),
      where('ownerId', 'in', ownerScopes)
    );
    const schedulesQuery = query(
      collection(db, 'schedules'),
      where('ownerId', 'in', ownerScopes)
    );
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('ownerId', 'in', ownerScopes)
    );

    const unsubStudents = onSnapshot(
      studentsQuery,
      (snap) => {
        if (!snap.empty) {
          const remoteStudents: StudentRecord[] = [];
          snap.forEach((d) => {
            const data = d.data();
            remoteStudents.push({
              id: d.id,
              studentId: data.studentId || d.id,
              name: data.name || 'Student',
              batch: data.batch || 'Halqa Al-Fajr',
              ustadhName: data.ustadhName || 'Ustadh Ahmad',
              juzCompleted: Number(data.juzCompleted) || 0,
              currentJuz: Number(data.currentJuz) || 1,
              currentSurah: data.currentSurah || 'Al-Baqarah',
              guardianName: data.guardianName || 'Guardian',
              guardianPhone: data.guardianPhone || '+91 9847000000',
              pin: data.pin || '1234',
              ownerId: data.ownerId || 'portal-session',
            });
          });
          setStudents((prev) => mergeById(remoteStudents, prev));
        }
      },
      (err) => {
        console.warn('Firestore students listener warning:', err);
      }
    );

    const unsubLogs = onSnapshot(
      logsQuery,
      (snap) => {
        if (!snap.empty) {
          const remoteLogs: HifzLogRecord[] = [];
          snap.forEach((d) => {
            const data = d.data();
            remoteLogs.push({
              id: d.id,
              studentId: data.studentId || 'STD-101',
              studentName: data.studentName || 'Student',
              dateStr: data.dateStr || new Date().toLocaleDateString('en-GB'),
              isoDate: data.isoDate || new Date().toISOString().slice(0, 10),
              attendance: data.attendance === 'Absent' ? 'Absent' : 'Present',
              sabaqTarget: data.sabaqTarget || 'Not Recited',
              sabaqGrade: data.sabaqGrade || 'Not Recited',
              sabqiTarget: data.sabqiTarget || 'Not Recited',
              sabqiGrade: data.sabqiGrade || 'Not Recited',
              manzilTarget: data.manzilTarget || 'Not Recited',
              manzilGrade: data.manzilGrade || 'Not Recited',
              akhlaqScoreDelta: Number(data.akhlaqScoreDelta) || 0,
              akhlaqTags: Array.isArray(data.akhlaqTags) ? data.akhlaqTags : [],
              note: data.note || '',
              verifiedBy: data.verifiedBy || 'Ustadh Ahmad',
              ownerId: data.ownerId || 'portal-session',
              createdAtMs: data.createdAt?.toMillis?.() || Date.now(),
            });
          });
          setLogs((prev) => {
            const merged = mergeById(remoteLogs, prev);
            return merged.sort((a, b) => b.createdAtMs - a.createdAtMs);
          });
        }
      },
      (err) => {
        console.warn('Firestore hifz_logs listener warning:', err);
      }
    );

    const unsubSchedules = onSnapshot(
      schedulesQuery,
      (snap) => {
        if (!snap.empty) {
          const remoteSchedules: MemorizationScheduleRecord[] = [];
          snap.forEach((d) => {
            const data = d.data();
            remoteSchedules.push({
              id: d.id,
              studentId: data.studentId || 'STD-101',
              studentName: data.studentName || 'Student',
              targetJuz: Number(data.targetJuz) || 1,
              targetSurahRange: data.targetSurahRange || 'Al-Baqarah',
              dailySabaqQuota: data.dailySabaqQuota || '1 Full Page',
              sabqiWindow: data.sabqiWindow || '1/2 Juz',
              manzilCycle: data.manzilCycle || '1 Full Juz daily',
              startDate: data.startDate || '2026-11-01',
              targetDate: data.targetDate || '2026-11-30',
              progressPercent: Number(data.progressPercent) || 0,
              status: data.status || 'active',
              assignedBy: data.assignedBy || 'Ustadh Ahmad',
              ownerId: data.ownerId || 'portal-session',
            });
          });
          setSchedules((prev) => mergeById(remoteSchedules, prev));
        }
      },
      (err) => {
        console.warn('Firestore schedules listener warning:', err);
      }
    );

    const unsubAlerts = onSnapshot(
      alertsQuery,
      (snap) => {
        if (!snap.empty) {
          const remoteAlerts: FeedbackAlertRecord[] = [];
          snap.forEach((d) => {
            const data = d.data();
            remoteAlerts.push({
              id: d.id,
              studentId: data.studentId || 'STD-101',
              studentName: data.studentName || 'Student',
              severity: data.severity || 'warning',
              category: data.category || 'sabaq_stall',
              title: data.title || 'Feedback Alert',
              message: data.message || 'Review student progress.',
              recommendedAction: data.recommendedAction || 'Follow up in halqa.',
              status: data.status || 'open',
              teacherResponse: data.teacherResponse || '',
              dateStr: data.dateStr || new Date().toLocaleDateString('en-GB'),
              ownerId: data.ownerId || 'portal-session',
              createdAtMs: data.createdAt?.toMillis?.() || Date.now(),
            });
          });
          setAlerts((prev) => {
            const merged = mergeById(remoteAlerts, prev);
            return merged.sort((a, b) => b.createdAtMs - a.createdAtMs);
          });
        }
      },
      (err) => {
        console.warn('Firestore alerts listener warning:', err);
      }
    );

    return () => {
      unsubStudents();
      unsubLogs();
      unsubSchedules();
      unsubAlerts();
    };
  }, [isAuthReady, firebaseUser]);

  const getActiveOwnerId = (): string => {
    if (firebaseUser && firebaseUser.emailVerified && firebaseUser.uid) {
      return firebaseUser.uid;
    }
    return 'portal-session';
  };

  const handleGoogleSignIn = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user && cred.user.emailVerified) {
        const uid = cred.user.uid;
        for (const st of students) {
          const docId = sanitizeId(st.studentId);
          try {
            await setDoc(doc(db, 'students', docId), {
              studentId: sanitizeId(st.studentId).slice(0, 32),
              name: clampString(st.name, 2, 100, 'Student'),
              batch: clampString(st.batch, 1, 60, 'Batch A'),
              ustadhName: clampString(st.ustadhName, 2, 80, 'Ustadh Ahmad'),
              juzCompleted: Math.max(0, Math.min(30, Number(st.juzCompleted))),
              currentJuz: Math.max(1, Math.min(30, Number(st.currentJuz))),
              currentSurah: clampString(st.currentSurah, 1, 80, 'Al-Baqarah'),
              guardianName: clampString(st.guardianName, 1, 100, 'Guardian'),
              guardianPhone: clampString(st.guardianPhone, 3, 30, '+91 9847000000'),
              pin: clampString(st.pin, 4, 16, '1234'),
              ownerId: uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `students/${docId}`);
          }
        }
      }
    } catch (error) {
      console.warn('Google sign-in popup closed or cancelled:', error);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOut(auth);
  };

  // Handler for Ustadh Desk: Writes directly to Firestore collection(db, 'hifz_logs') and updates state
  const handleAddLog = async (newLogData: {
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
  }): Promise<void> => {
    const now = new Date();
    const safeDateStr = clampString(
      newLogData.dateStr || now.toLocaleDateString('en-GB'),
      6,
      20,
      '04/11/2026'
    );
    const isoDate = clampString(now.toISOString().slice(0, 10), 8, 16, '2026-11-04');
    const newId = `LOG-${Date.now()}`;
    const ownerId = getActiveOwnerId();
    const isAbsent = newLogData.attendance === 'Absent';

    const safeStudentId = sanitizeId(newLogData.studentId || 'STD-101').slice(0, 32);
    const safeStudentName = clampString(
      newLogData.studentName || 'Zaid Mansoor',
      2,
      100,
      'Zaid Mansoor'
    );
    const safeVerifiedBy = clampString(
      newLogData.verifiedBy || 'Ustadh Ahmad',
      2,
      80,
      'Ustadh Ahmad'
    );
    const safeAttendance: 'Present' | 'Absent' = isAbsent ? 'Absent' : 'Present';

    const safeSabaqTarget = isAbsent
      ? 'Not Recited'
      : clampString(newLogData.sabaqTarget || 'Unspecified', 1, 120, 'Unspecified');
    const safeSabaqGrade = isAbsent
      ? 'Not Recited'
      : clampString(newLogData.sabaqGrade || 'Mumtaz (ممتاز - Excellent)', 1, 60, 'Not Recited');

    const safeSabqiTarget = isAbsent
      ? 'Not Recited'
      : clampString(newLogData.sabqiTarget || 'Unspecified', 1, 120, 'Unspecified');
    const safeSabqiGrade = isAbsent
      ? 'Not Recited'
      : clampString(newLogData.sabqiGrade || 'Mumtaz (ممتاز - Excellent)', 1, 60, 'Not Recited');

    const safeManzilTarget = isAbsent
      ? 'Not Recited'
      : clampString(newLogData.manzilTarget || 'Unspecified', 1, 120, 'Unspecified');
    const safeManzilGrade = isAbsent
      ? 'Not Recited'
      : clampString(
          newLogData.manzilGrade || 'Mumtaz (Solid / ممتاز - Excellent)',
          1,
          60,
          'Not Recited'
        );

    const safeDelta = Math.max(-30, Math.min(30, Number(newLogData.akhlaqScoreDelta) || 0));
    const safeTags = Array.isArray(newLogData.akhlaqTags)
      ? newLogData.akhlaqTags
          .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
          .slice(0, 10)
          .map((t) => t.trim().slice(0, 60))
      : [];
    const safeNote = String(
      newLogData.note ?? (isAbsent ? 'Marked Absent' : '')
    ).slice(0, 400);

    const newLog: HifzLogRecord = {
      id: newId,
      studentId: safeStudentId,
      studentName: safeStudentName,
      dateStr: safeDateStr,
      isoDate,
      attendance: safeAttendance,
      sabaqTarget: safeSabaqTarget,
      sabaqGrade: safeSabaqGrade,
      sabqiTarget: safeSabqiTarget,
      sabqiGrade: safeSabqiGrade,
      manzilTarget: safeManzilTarget,
      manzilGrade: safeManzilGrade,
      akhlaqScoreDelta: safeDelta,
      akhlaqTags: safeTags,
      note: safeNote,
      verifiedBy: safeVerifiedBy,
      ownerId,
      createdAtMs: Date.now(),
    };

    // 1. Write to Firestore hifz_logs collection first so any network/permission error is caught by caller
    const logRef = doc(collection(db, 'hifz_logs'), newId);
    await setDoc(logRef, {
      studentId: newLog.studentId,
      studentName: newLog.studentName,
      dateStr: newLog.dateStr,
      isoDate: newLog.isoDate,
      attendance: newLog.attendance,
      sabaqTarget: newLog.sabaqTarget,
      sabaqGrade: newLog.sabaqGrade,
      sabqiTarget: newLog.sabqiTarget,
      sabqiGrade: newLog.sabqiGrade,
      manzilTarget: newLog.manzilTarget,
      manzilGrade: newLog.manzilGrade,
      akhlaqScoreDelta: newLog.akhlaqScoreDelta,
      akhlaqTags: newLog.akhlaqTags,
      note: newLog.note,
      verifiedBy: newLog.verifiedBy,
      ownerId: newLog.ownerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 2. Immediately update local state so the Recent Verification Feed refreshes without delay
    const updatedLogs = [newLog, ...logs.filter((l) => l.id !== newId)];
    setLogs(updatedLogs);

    // 3. Evaluate Automated Teacher Feedback Alerts
    const studentLogsAfterInsert = updatedLogs.filter(
      (l) => l.studentId === newLog.studentId
    );
    const triggeredAlerts = evaluateAutomatedAlerts(
      newLog,
      studentLogsAfterInsert,
      settings.akhlaqAlertThreshold
    );

    if (triggeredAlerts.length > 0) {
      const createdAlerts: FeedbackAlertRecord[] = triggeredAlerts.map((a, idx) => ({
        ...a,
        id: `ALT-${Date.now()}-${idx}`,
        ownerId,
        createdAtMs: Date.now() + idx,
      }));
      setAlerts((prev) => [...createdAlerts, ...prev]);

      for (const al of createdAlerts) {
        try {
          await setDoc(doc(collection(db, 'alerts'), al.id), {
            studentId: al.studentId,
            studentName: al.studentName,
            severity: al.severity,
            category: al.category,
            title: clampString(al.title, 3, 140),
            message: clampString(al.message, 5, 500),
            recommendedAction: clampString(al.recommendedAction, 5, 300),
            status: al.status,
            teacherResponse: al.teacherResponse.slice(0, 300),
            dateStr: al.dateStr,
            ownerId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.warn('Alert sync warning:', err);
        }
      }
    }
  };

  const handleDeleteLog = async (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    try {
      await deleteDoc(doc(db, 'hifz_logs', logId));
    } catch (err) {
      console.warn('Delete log warning:', err);
    }
  };

  // Handlers for Schedules Vault
  const handleAddSchedule = async (
    scheduleData: Omit<MemorizationScheduleRecord, 'id' | 'ownerId'>
  ) => {
    const newId = `SCH-${Date.now()}`;
    const ownerId = getActiveOwnerId();
    const newSchedule: MemorizationScheduleRecord = {
      ...scheduleData,
      id: newId,
      ownerId,
    };
    setSchedules((prev) => [newSchedule, ...prev]);

    try {
      await setDoc(doc(collection(db, 'schedules'), newId), {
        studentId: sanitizeId(newSchedule.studentId || 'STD-101').slice(0, 32),
        studentName: clampString(newSchedule.studentName || 'Zaid Mansoor', 2, 100),
        targetJuz: Math.max(1, Math.min(30, Number(newSchedule.targetJuz) || 1)),
        targetSurahRange: clampString(newSchedule.targetSurahRange || 'Al-Baqarah', 2, 120),
        dailySabaqQuota: clampString(newSchedule.dailySabaqQuota || '1 Full Page', 2, 60),
        sabqiWindow: clampString(newSchedule.sabqiWindow || '1/2 Juz', 2, 60),
        manzilCycle: clampString(newSchedule.manzilCycle || '1 Full Juz daily', 2, 80),
        startDate: clampString(newSchedule.startDate || '2026-11-04', 8, 16),
        targetDate: clampString(newSchedule.targetDate || '2026-11-30', 8, 16),
        progressPercent: Math.max(0, Math.min(100, Number(newSchedule.progressPercent) || 0)),
        status: newSchedule.status || 'active',
        assignedBy: clampString(newSchedule.assignedBy || 'Ustadh Ahmad', 2, 80),
        ownerId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Schedule sync warning:', err);
    }
  };

  const handleUpdateScheduleProgress = async (
    scheduleId: string,
    newProgress: number,
    newStatus: 'active' | 'completed' | 'archived'
  ) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? { ...s, progressPercent: newProgress, status: newStatus }
          : s
      )
    );

    try {
      await updateDoc(doc(db, 'schedules', scheduleId), {
        progressPercent: newProgress,
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Schedule update warning:', err);
    }
  };

  // Handlers for Alerts
  const handleUpdateAlert = async (
    alertId: string,
    status: 'open' | 'acknowledged' | 'resolved',
    teacherResponse: string
  ) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status, teacherResponse: teacherResponse.slice(0, 300) }
          : a
      )
    );

    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        status,
        teacherResponse: teacherResponse.slice(0, 300),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Alert update warning:', err);
    }
  };

  // Handlers for Principal Portal
  const handleAddStudent = async (
    studentData: Omit<StudentRecord, 'id' | 'ownerId'>
  ) => {
    const cleanId = sanitizeId(studentData.studentId || `STD-${Date.now()}`).slice(0, 32);
    const ownerId = getActiveOwnerId();
    const newStudent: StudentRecord = {
      ...studentData,
      id: cleanId,
      studentId: cleanId,
      ownerId,
    };
    setStudents((prev) => [...prev, newStudent]);

    try {
      await setDoc(doc(collection(db, 'students'), cleanId), {
        studentId: cleanId,
        name: clampString(newStudent.name, 2, 100),
        batch: clampString(newStudent.batch, 1, 60),
        ustadhName: clampString(newStudent.ustadhName, 2, 80),
        juzCompleted: Math.max(0, Math.min(30, Number(newStudent.juzCompleted) || 0)),
        currentJuz: Math.max(1, Math.min(30, Number(newStudent.currentJuz) || 1)),
        currentSurah: clampString(newStudent.currentSurah, 1, 80),
        guardianName: clampString(newStudent.guardianName, 1, 100),
        guardianPhone: clampString(newStudent.guardianPhone, 3, 30),
        pin: clampString(newStudent.pin, 4, 16),
        ownerId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Student sync warning:', err);
    }
  };

  const handleIncrementStudentJuz = async (studentId: string) => {
    const target = students.find((s) => s.studentId === studentId);
    if (!target || target.juzCompleted >= 30) return;

    const nextJuzCompleted = Math.min(30, target.juzCompleted + 1);
    const nextCurrentJuz = Math.min(30, nextJuzCompleted + 1);

    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              juzCompleted: nextJuzCompleted,
              currentJuz: nextCurrentJuz,
            }
          : s
      )
    );

    try {
      await updateDoc(doc(db, 'students', sanitizeId(studentId)), {
        juzCompleted: nextJuzCompleted,
        currentJuz: nextCurrentJuz,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Student Juz increment warning:', err);
    }
  };

  const handlePublishNotice = async (noticeData: {
    title: string;
    content: string;
    audience: 'all' | 'parents' | 'teachers';
  }) => {
    const newId = `NOT-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('en-GB');
    const ownerId = getActiveOwnerId();

    const newNotice: CampusNoticeRecord = {
      id: newId,
      title: clampString(noticeData.title, 2, 140),
      content: clampString(noticeData.content, 2, 1000),
      audience: noticeData.audience,
      dateStr,
      authorName: currentSession.name || 'Principal Admin',
      ownerId,
      createdAtMs: Date.now(),
    };

    setNotices((prev) => [newNotice, ...prev]);

    try {
      await setDoc(doc(collection(db, 'notices'), newId), {
        title: newNotice.title,
        content: newNotice.content,
        audience: newNotice.audience,
        dateStr: newNotice.dateStr,
        authorName: clampString(newNotice.authorName, 2, 80),
        ownerId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Notice sync warning:', err);
    }
  };

  const handleSaveSettings = async (
    newSettingsData: Omit<CampusSettingsRecord, 'ownerId'>
  ) => {
    const ownerId = getActiveOwnerId();
    const updated: CampusSettingsRecord = {
      ...newSettingsData,
      ownerId,
    };
    setSettings(updated);

    try {
      await setDoc(doc(db, 'settings', 'general'), {
        mode: updated.mode,
        name: clampString(updated.name, 2, 100),
        sub: clampString(updated.sub, 2, 100),
        academicTerm: clampString(updated.academicTerm, 2, 60),
        akhlaqAlertThreshold: Math.max(50, Math.min(90, updated.akhlaqAlertThreshold)),
        ownerId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Settings sync warning:', err);
    }
  };

  const handleRoleLoginSuccess = (session: {
    role: UserRole;
    name: string;
    studentId?: string;
  }) => {
    setCurrentSession(session);
    if (session.role === 'principal') setActiveTab('principal');
    if (session.role === 'teacher') setActiveTab('ustadh');
    if (session.role === 'parent') setActiveTab('parent');
  };

  const openAlertsCount = alerts.filter((a) => a.status === 'open').length;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 1-row, 3-zone header */}
      <header className="bg-emerald-950 text-white border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('ustadh');
            }}
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            {settings.name}
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav
            aria-label="Primary Workspace Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-emerald-100/80"
          >
            <button
              type="button"
              onClick={() => setActiveTab('ustadh')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'ustadh'
                  ? 'text-white font-semibold border-b-2 border-amber-400'
                  : ''
              }`}
            >
              Verification Desk
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedules')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'schedules'
                  ? 'text-white font-semibold border-b-2 border-amber-400'
                  : ''
              }`}
            >
              Schedules Vault
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'analytics'
                  ? 'text-white font-semibold border-b-2 border-amber-400'
                  : ''
              }`}
            >
              Analytics &amp; Alerts ({openAlertsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('principal')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'principal'
                  ? 'text-white font-semibold border-b-2 border-amber-400'
                  : ''
              }`}
            >
              Principal Portfolios
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parent')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'parent'
                  ? 'text-white font-semibold border-b-2 border-amber-400'
                  : ''
              }`}
            >
              Parent Portal
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Portal Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Contextual Workspace Sub-Banner & Mobile Navigation Switcher */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{settings.sub}</span>
            <span aria-hidden="true">·</span>
            <span>
              {settings.mode === 'residential' ? 'Residential Campus' : 'Day College'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{settings.academicTerm}</span>
            <span aria-hidden="true">·</span>
            <span>
              Active Session: <strong className="text-emerald-900">{currentSession.name}</strong> ({currentSession.role.toUpperCase()})
            </span>
          </div>

          {/* Mobile / Quick Workspace Tab Bar */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto w-full pt-1">
            {(
              [
                { id: 'ustadh', label: 'Desk' },
                { id: 'schedules', label: 'Schedules' },
                { id: 'analytics', label: `Alerts (${openAlertsCount})` },
                { id: 'principal', label: 'Principal' },
                { id: 'parent', label: 'Parent' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
                  activeTab === t.id
                    ? 'bg-emerald-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'ustadh' && (
          <UstadhDeskView
            students={students}
            logs={logs}
            schedules={schedules}
            verifiedByName={
              currentSession.role === 'teacher' ? currentSession.name : 'Ustadh Ahmad'
            }
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {activeTab === 'schedules' && (
          <SchedulesVaultView
            students={students}
            schedules={schedules}
            logs={logs}
            currentUserName={currentSession.name}
            onAddSchedule={handleAddSchedule}
            onUpdateScheduleProgress={handleUpdateScheduleProgress}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsAlertsView
            students={students}
            logs={logs}
            schedules={schedules}
            alerts={alerts}
            onUpdateAlert={handleUpdateAlert}
            onOpenReportCard={(st) => setReportCardStudent(st)}
          />
        )}

        {activeTab === 'principal' && (
          <PrincipalPortalView
            students={students}
            logs={logs}
            schedules={schedules}
            notices={notices}
            settings={settings}
            onAddStudent={handleAddStudent}
            onIncrementStudentJuz={handleIncrementStudentJuz}
            onPublishNotice={handlePublishNotice}
            onSaveSettings={handleSaveSettings}
            onOpenReportCard={(st) => setReportCardStudent(st)}
          />
        )}

        {activeTab === 'parent' && (
          <ParentPortalView
            students={students}
            defaultStudentId={currentSession.studentId || 'STD-101'}
            logs={logs}
            schedules={schedules}
            notices={notices}
            onOpenReportCard={(st) => setReportCardStudent(st)}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            {settings.name} · {settings.sub} · Automatic Monthly Akhlaq Grading &amp; Hifz Verification System
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('ustadh')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Ustadh Desk
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Analytics &amp; Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('principal')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Principal Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Printable Official Monthly Report Card Modal */}
      <ReportCardModal
        student={reportCardStudent}
        logs={logs}
        schedules={schedules}
        settings={settings}
        onClose={() => setReportCardStudent(null)}
      />

      {/* Portal Sign In & Cloud Sync Modal */}
      <PortalLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        students={students}
        onLoginSuccess={handleRoleLoginSuccess}
        firebaseUserEmail={firebaseUser?.email || null}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />
    </div>
  );
}
