import React, { useState } from 'react';
import { User, Mail, Lock, Save, ShieldCheck, GraduationCap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Alert from '../components/Alert';
import { formatDate } from '../utils/constants';

export const Settings = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await userAPI.updateProfile({ name: name.trim() });
      if (res.data?.success) {
        updateUser({ name: name.trim() });
        setProfileSuccess('Profile name updated successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile name.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setError('Current password is required to change password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await userAPI.updateProfile({
        currentPassword,
        newPassword
      });

      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500">
          Manage your personal information and student account credentials
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {profileSuccess && <Alert type="success" message={profileSuccess} onClose={() => setProfileSuccess(null)} />}
      {passwordSuccess && <Alert type="success" message={passwordSuccess} onClose={() => setPasswordSuccess(null)} />}

      {/* Profile Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Student Profile</h2>
            <p className="text-xs text-slate-400">Update your display name</p>
          </div>
        </div>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Email address is permanently bound to your account and cannot be modified.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Joined on {formatDate(user?.createdAt)}
            </span>
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : 'Update Name'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Security & Password</h2>
            <p className="text-xs text-slate-400">Ensure your account uses a secure password</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{savingPassword ? 'Updating...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Project & Internship Details */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
          <GraduationCap className="w-4 h-4" />
          <span>ICT Academy of Kerala (ICTAK) Internship</span>
        </div>
        <h3 className="text-base font-bold text-white">SpendSmart — Student Expense Tracker</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Developed as part of the MERN Stack Full-Stack Web Development internship. Architecture includes React 19, Vite, Tailwind CSS, Express.js REST API, JWT authentication, and MongoDB Mongoose persistence.
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-300">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono">React 19</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono">Node / Express</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono">MongoDB / Mongoose</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono">Recharts</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono">JWT & bcrypt</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;
