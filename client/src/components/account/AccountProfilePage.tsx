'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import Avatar from '@/components/common/Avatar';
import { changePassword, updateProfile, uploadAvatar } from '@/lib/api/user';
import { getAuthErrorMessage } from '@/lib/authError';
import { setCredentials } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { saveAuthTokens } from '@/lib/tokenStorage';
import { updateVerifiedAdminUser } from '@/lib/adminSessionCache';

type Feedback = { type: 'success' | 'error'; message: string };

export default function AccountProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const fileInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextUsername = username.trim();
    if (!user || nextUsername.length < 2) return;

    setSaving(true);
    setProfileFeedback(null);
    try {
      const response = await updateProfile({ username: nextUsername });
      const updatedUser = { ...user, ...response.data.user, avatar: user.avatar };
      dispatch(setCredentials({ user: updatedUser }));
      saveAuthTokens(updatedUser);
      updateVerifiedAdminUser(updatedUser);
      setUsername(updatedUser.username);
      setProfileFeedback({ type: 'success', message: 'Your profile details have been saved.' });
    } catch (error: unknown) {
      setProfileFeedback({ type: 'error', message: getAuthErrorMessage(error, 'Could not update your profile.') });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      setProfileFeedback({ type: 'error', message: 'Choose an image file to upload.' });
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    setProfileFeedback(null);
    try {
      const response = await uploadAvatar(formData);
      const updatedUser = { ...user, ...response.data.user };
      dispatch(setCredentials({ user: updatedUser }));
      saveAuthTokens(updatedUser);
      updateVerifiedAdminUser(updatedUser);
      setProfileFeedback({ type: 'success', message: 'Your profile photo has been updated.' });
    } catch (error: unknown) {
      setProfileFeedback({ type: 'error', message: getAuthErrorMessage(error, 'Could not upload your profile photo.') });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordFeedback(null);
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'The new passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'Use at least 8 characters for your new password.' });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await changePassword({ currentPassword, newPassword });
      setPasswordFeedback({ type: 'success', message: response.data.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      setPasswordFeedback({ type: 'error', message: getAuthErrorMessage(error, 'Could not change your password.') });
    } finally {
      setChangingPassword(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="account-page">
      <header className="account-page-heading">
        <div>
          <span className="account-kicker">Your account</span>
          <h1>Profile & security</h1>
          <p>Manage your identity and keep your Orbit account protected.</p>
        </div>
        <Link href={isAdmin ? '/admin-dashboard' : '/dashboard'} className="account-back-link">
          Back to workspace <ArrowRight size={16} />
        </Link>
      </header>

      <section className="account-identity-card">
        <div className="account-identity-orbit account-orbit-one" aria-hidden="true" />
        <div className="account-identity-orbit account-orbit-two" aria-hidden="true" />
        <div className="account-identity-content">
          <div className="account-avatar-wrap">
            <Avatar user={user} size="xl" className="!h-24 !w-24 !text-3xl" />
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleAvatarChange} />
            <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className="account-avatar-button" aria-label="Change profile photo">
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
        <div className={`account-feedback ${profileFeedback.type}`} role={profileFeedback.type === 'error' ? 'alert' : 'status'}>
          {profileFeedback.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
          {profileFeedback.message}
        </div>
      )}

      <div className="account-settings-grid">
        <section className="account-settings-card">
          <div className="account-card-heading">
            <span className="account-card-icon"><UserRound size={18} /></span>
            <div>
              <h2>Personal details</h2>
              <p>Your public workspace identity.</p>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="account-form">
            <label className="account-field">
              <span>Display name</span>
              <span className="account-input-wrap"><UserRound size={16} /><input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="nickname" minLength={2} maxLength={40} required /></span>
            </label>
            <label className="account-field">
              <span>Email address</span>
              <span className="account-input-wrap is-disabled"><Mail size={16} /><input value={user?.email ?? ''} readOnly disabled /></span>
              <small>Email changes aren’t available from account settings.</small>
            </label>
            <button className="account-primary-button" type="submit" disabled={saving || username.trim() === user?.username || username.trim().length < 2}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {saving ? 'Saving changes…' : 'Save profile'}
            </button>
          </form>
        </section>

        <section className="account-settings-card">
          <div className="account-card-heading">
            <span className="account-card-icon security"><KeyRound size={18} /></span>
            <div>
              <h2>Change password</h2>
              <p>Choose a password you don’t use elsewhere.</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="account-form">
            <label className="account-field">
              <span>Current password</span>
              <span className="account-input-wrap"><KeyRound size={16} /><input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></span>
            </label>
            <label className="account-field">
              <span>New password</span>
              <span className="account-input-wrap"><KeyRound size={16} /><input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} required /><button type="button" className="account-password-toggle" onClick={() => setShowPasswords((visible) => !visible)} aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}>{showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>
            </label>
            <label className="account-field">
              <span>Confirm new password</span>
              <span className="account-input-wrap"><KeyRound size={16} /><input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></span>
            </label>
            {passwordFeedback && (
              <div className={`account-feedback ${passwordFeedback.type}`} role={passwordFeedback.type === 'error' ? 'alert' : 'status'}>
                {passwordFeedback.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
                {passwordFeedback.message}
              </div>
            )}
            <button className="account-primary-button secondary" type="submit" disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}>
              {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {changingPassword ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
