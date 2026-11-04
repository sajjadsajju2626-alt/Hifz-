import React, { useState } from 'react';
import { Cloud, Lock, LogIn, ShieldCheck, X } from 'lucide-react';
import { StudentRecord, UserRole } from '../types/hifz';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  onLoginSuccess: (session: {
    role: UserRole;
    name: string;
    studentId?: string;
  }) => void;
  firebaseUserEmail: string | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
}

export const PortalLoginModal: React.FC<PortalLoginModalProps> = ({
  isOpen,
  onClose,
  students,
  onLoginSuccess,
  firebaseUserEmail,
  onGoogleSignIn,
  onGoogleSignOut,
}) => {
  const [role, setRole] = useState<UserRole>('parent');
  const [username, setUsername] = useState('STD-101');
  const [password, setPassword] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMsg('');
    if (newRole === 'parent') {
      setUsername('STD-101');
      setPassword('1234');
    } else if (newRole === 'teacher') {
      setUsername('ustadh1');
      setPassword('1234');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setErrorMsg('Please enter both ID/Username and Password/PIN.');
      return;
    }

    if (role === 'principal') {
      if (u === 'admin' && p === 'admin123') {
        onLoginSuccess({ role: 'principal', name: 'Principal Admin' });
        onClose();
      } else {
        setErrorMsg('Invalid Principal credentials. Try admin / admin123.');
      }
      return;
    }

    if (role === 'teacher') {
      if ((u === 'ustadh1' || u === 'ustadh2') && p === '1234') {
        onLoginSuccess({
          role: 'teacher',
          name: u === 'ustadh2' ? 'Ustadh Ibrahim' : 'Ustadh Ahmad',
        });
        onClose();
      } else {
        setErrorMsg('Invalid Ustadh credentials. Try ustadh1 / 1234.');
      }
      return;
    }

    if (role === 'parent') {
      const matched = students.find(
        (s) => s.studentId.toLowerCase() === u.toLowerCase() && s.pin === p
      );
      if (matched) {
        onLoginSuccess({
          role: 'parent',
          name: `${matched.name} (Parent)`,
          studentId: matched.studentId,
        });
        onClose();
      } else if (u.toUpperCase() === 'STD-101' && p === '1234') {
        onLoginSuccess({
          role: 'parent',
          name: 'Zaid Mansoor (Parent)',
          studentId: 'STD-101',
        });
        onClose();
      } else {
        setErrorMsg('Invalid Student ID or PIN. Try STD-101 / 1234.');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-login-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-900" />
            <h2 id="portal-login-title" className="text-base font-bold text-slate-900">
              Portal Role Sign In &amp; Cloud Sync
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sign In Modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-login-role" className="block text-xs font-semibold text-slate-700 mb-1">
              Select Portal Role
            </label>
            <select
              id="modal-login-role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
            >
              <option value="parent">Parent (രക്ഷിതാവ്)</option>
              <option value="teacher">Ustadh / Teacher (അധ്യാപകൻ)</option>
              <option value="principal">Principal / Admin (പ്രിൻസിപ്പൽ)</option>
            </select>
          </div>

          <div>
            <label htmlFor="modal-login-username" className="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'parent'
                ? 'Student ID (അഡ്മിഷൻ നമ്പർ)'
                : role === 'teacher'
                ? 'Ustadh Username'
                : 'Principal Username'}
            </label>
            <input
              id="modal-login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={
                role === 'parent' ? 'e.g. STD-101' : role === 'teacher' ? 'ustadh1' : 'admin'
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="modal-login-password" className="block text-xs font-semibold text-slate-700 mb-1">
              Password / PIN
            </label>
            <input
              id="modal-login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password or PIN"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Portal
          </button>
        </form>

        {/* Quick Demo Credentials Note */}
        <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800">Quick Reference Credentials:</div>
          <div>Parent: <span className="font-mono">STD-101</span> / PIN <span className="font-mono">1234</span></div>
          <div>Ustadh: <span className="font-mono">ustadh1</span> / PIN <span className="font-mono">1234</span></div>
          <div>Principal: <span className="font-mono">admin</span> / Pass <span className="font-mono">admin123</span></div>
        </div>

        {/* Cloud Firestore Google Auth Section */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-600">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-emerald-800" />
                Firebase Cloud Database Sync
              </div>
              <div className="text-slate-500 mt-0.5">
                {firebaseUserEmail
                  ? `Connected as ${firebaseUserEmail}`
                  : 'Sign in with Google to sync records to cloud Firestore'}
              </div>
            </div>
            {firebaseUserEmail ? (
              <button
                type="button"
                onClick={onGoogleSignOut}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap shrink-0"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-100 cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Google Sync
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
