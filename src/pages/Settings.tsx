import React, { useState } from 'react';
import { LogOut, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useResearch } from '../context/ResearchContext';
import { WildlifeImage } from '../components/WildlifeImage';
import { ConfirmModal } from '../components/ConfirmModal';

export function Settings() {
  const { profile, updateProfile, logout, showToast } = useResearch();
  const navigate = useNavigate();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [organization, setOrganization] = useState(profile.organization);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [lowConfidenceAlerts, setLowConfidenceAlerts] = useState(
    profile.notifications.lowConfidenceAlerts
  );
  const [batchCompleted, setBatchCompleted] = useState(
    profile.notifications.batchCompleted
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    profile.notifications.weeklyDigest
  );

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || profile.name,
      email: email.trim() || profile.email,
      role: role.trim() || profile.role,
      organization: organization.trim() || profile.organization,
      notifications: {
        lowConfidenceAlerts,
        batchCompleted,
        weeklyDigest,
      },
    });
    showToast({
      type: 'success',
      title: 'Profile & preferences saved',
      description: 'Your researcher account settings have been updated.',
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || newPassword.length < 6) {
      showToast({
        type: 'warning',
        title: 'Invalid password',
        description: 'Enter your current password and a new password (min 6 characters).',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({
        type: 'error',
        title: 'Passwords do not match',
        description: 'Confirm password must match the new password.',
      });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast({
      type: 'success',
      title: 'Password updated',
      description: 'Your session credentials were refreshed.',
    });
  };

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <DashboardLayout pageTitle="Profile & Settings">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
            Profile &amp; Settings
          </h2>
          <p className="mt-1 text-sm text-[#788078]">
            Manage your researcher profile, password security, and notification preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSaveProfile}
            className="space-y-5 rounded-xl border border-[#E2E5DA] bg-white p-6 lg:col-span-7"
          >
            <div className="flex items-center gap-4 border-b border-[#EFF1E8] pb-5">
              <WildlifeImage
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-display text-base font-semibold text-[#202B24]">
                  {profile.name}
                </h3>
                <p className="text-xs text-[#788078]">
                  {profile.role} · {profile.organization}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Researcher Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] px-3 py-2 text-sm text-[#202B24] focus:border-[#244B35] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] px-3 py-2 text-sm text-[#202B24] focus:border-[#244B35] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-role"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Account Role
                </label>
                <input
                  id="profile-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] px-3 py-2 text-sm text-[#202B24] focus:border-[#244B35] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-org"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Research Organization
                </label>
                <input
                  id="profile-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] px-3 py-2 text-sm text-[#202B24] focus:border-[#244B35] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-[#EFF1E8] pt-4">
              <p className="text-xs font-semibold text-[#202B24]">
                Notification Preferences
              </p>

              <label className="flex items-center justify-between gap-3 text-xs text-[#4F574F]">
                <span>Flag low-confidence species predictions (&lt; 85%)</span>
                <input
                  type="checkbox"
                  checked={lowConfidenceAlerts}
                  onChange={(e) => setLowConfidenceAlerts(e.target.checked)}
                  className="h-4 w-4 accent-[#244B35]"
                />
              </label>

              <label className="flex items-center justify-between gap-3 text-xs text-[#4F574F]">
                <span>Notify when batch AI analysis completes</span>
                <input
                  type="checkbox"
                  checked={batchCompleted}
                  onChange={(e) => setBatchCompleted(e.target.checked)}
                  className="h-4 w-4 accent-[#244B35]"
                />
              </label>

              <label className="flex items-center justify-between gap-3 text-xs text-[#4F574F]">
                <span>Receive weekly monitoring digest</span>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="h-4 w-4 accent-[#244B35]"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#244B35] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1C3B2A]"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>Save Profile &amp; Preferences</span>
              </button>
            </div>
          </form>

          <div className="space-y-6 lg:col-span-5">
            <form
              onSubmit={handleChangePassword}
              className="space-y-4 rounded-xl border border-[#E2E5DA] bg-white p-6"
            >
              <h3 className="font-display text-base font-semibold text-[#202B24]">
                Change Password
              </h3>
              <div>
                <label
                  htmlFor="current-pw"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Current Password
                </label>
                <input
                  id="current-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] px-3 py-2 text-sm focus:border-[#244B35] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="new-pw"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  New Password
                </label>
                <input
                  id="new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] px-3 py-2 text-sm focus:border-[#244B35] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-pw"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] px-3 py-2 text-sm focus:border-[#244B35] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg border border-[#244B35] bg-white px-4 py-2 text-xs font-semibold text-[#244B35] hover:bg-[#244B35]/6"
              >
                Update Password
              </button>
            </form>

            <div className="rounded-xl border border-[#E2E5DA] bg-white p-6">
              <h3 className="font-display text-base font-semibold text-[#202B24]">
                Session
              </h3>
              <p className="mt-1 text-xs text-[#788078]">
                Sign out of your active Wildlife Monitoring and Research Assistant session.
              </p>
              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C65B4B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A9493B]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={logoutModalOpen}
        title="Sign out of research workspace?"
        description="You will be returned to the login screen. Any unsaved upload queues will be cleared."
        confirmLabel="Log Out"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </DashboardLayout>
  );
}
