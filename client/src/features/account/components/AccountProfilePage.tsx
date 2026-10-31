'use client';

import { ROUTES } from '@/lib/constants/routes';
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import useAccountProfile from '../hooks/useAccountProfile';

export default function AccountProfilePage() {
  const {
    user,
    fileInput,
    username,
    setUsername,
    saving,
    uploading,
    profileFeedback,
    passwordFeedback,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPasswords,
    setShowPasswords,
    changingPassword,
    handleSaveProfile,
    handleAvatarChange,
    handleChangePassword,
    isAdmin,
  } = useAccountProfile();

  return (
    <div className="account-page">
      <header className="account-page-heading">
        <div>
          <span className="account-kicker">Your account</span>
          <h1>Profile & security</h1>
          <p>Manage your identity and keep your Orbit account protected.</p>
        </div>
        <Link
          href={isAdmin ? ROUTES.adminDashboard : ROUTES.dashboard}
          className="account-back-link"
        >
          Back to workspace <ArrowRight size={16} />
        </Link>
      </header>

      <section className="account-identity-card">
        <div className="account-identity-orbit account-orbit-one" aria-hidden="true" />
        <div className="account-identity-orbit account-orbit-two" aria-hidden="true" />
        <div className="account-identity-content">
          <div className="account-avatar-wrap">
            <Avatar user={user} size="xl" className="!h-24 !w-24 !text-3xl" />
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="account-avatar-button"
              aria-label="Change profile photo"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
          </div>
          <div className="account-identity-copy">
            <span className={`account-role-badge ${isAdmin ? 'is-admin' : ''}`}>
              {isAdmin ? <ShieldCheck size={14} /> : <UserRound size={14} />}
              {user?.role ?? 'Member'}
            </span>
            <h2>{user?.username || 'Orbit member'}</h2>
            <p>{user?.email || 'Email address unavailable'}</p>
          </div>
          <div className="account-identity-side">
            <span>ACCOUNT ID</span>
            <code>{user?.id ?? 'Unavailable'}</code>
          </div>
        </div>
      </section>

      {profileFeedback && (
        <div
          className={`account-feedback ${profileFeedback.type}`}
          role={profileFeedback.type === 'error' ? 'alert' : 'status'}
        >
          {profileFeedback.type === 'error' ? (
            <AlertCircle size={17} />
          ) : (
            <CheckCircle2 size={17} />
          )}
          {profileFeedback.message}
        </div>
      )}

      <div className="account-settings-grid">
        <section className="account-settings-card">
          <div className="account-card-heading">
            <span className="account-card-icon">
              <UserRound size={18} />
            </span>
            <div>
              <h2>Personal details</h2>
              <p>Your public workspace identity.</p>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="account-form">
            <label className="account-field">
              <span>Display name</span>
              <span className="account-input-wrap">
                <UserRound size={16} />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="nickname"
                  minLength={2}
                  maxLength={40}
                  required
                />
              </span>
            </label>
            <label className="account-field">
              <span>Email address</span>
              <span className="account-input-wrap is-disabled">
                <Mail size={16} />
                <input value={user?.email ?? ''} readOnly disabled />
              </span>
              <small>Email changes aren’t available from account settings.</small>
            </label>
            <button
              className="account-primary-button"
              type="submit"
              disabled={saving || username.trim() === user?.username || username.trim().length < 2}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {saving ? 'Saving changes…' : 'Save profile'}
            </button>
          </form>
        </section>

        <section className="account-settings-card">
          <div className="account-card-heading">
            <span className="account-card-icon security">
              <KeyRound size={18} />
            </span>
            <div>
              <h2>Change password</h2>
              <p>Choose a password you don’t use elsewhere.</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="account-form">
            <label className="account-field">
              <span>Current password</span>
              <span className="account-input-wrap">
                <KeyRound size={16} />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </span>
            </label>
            <label className="account-field">
              <span>New password</span>
              <span className="account-input-wrap">
                <KeyRound size={16} />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="account-password-toggle"
                  onClick={() => setShowPasswords((visible) => !visible)}
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            <label className="account-field">
              <span>Confirm new password</span>
              <span className="account-input-wrap">
                <KeyRound size={16} />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </span>
            </label>
            {passwordFeedback && (
              <div
                className={`account-feedback ${passwordFeedback.type}`}
                role={passwordFeedback.type === 'error' ? 'alert' : 'status'}
              >
                {passwordFeedback.type === 'error' ? (
                  <AlertCircle size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {passwordFeedback.message}
              </div>
            )}
            <button
              className="account-primary-button secondary"
              type="submit"
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {changingPassword ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              {changingPassword ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
