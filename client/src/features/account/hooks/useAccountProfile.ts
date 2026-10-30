'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changePassword,
  updateProfile,
  uploadAvatar,
} from '@/features/account/services/accountService';
import { getErrorMessage } from '@/lib/errors';
import { setCredentials } from '@/store/slices/authSlice';
import { saveUserMetadata } from '@/lib/auth/storage';
import { updateVerifiedUser } from '@/features/auth/services/sessionVerification';

type Feedback = { type: 'success' | 'error'; message: string };

export default function useAccountProfile() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
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
      saveUserMetadata(updatedUser);
      updateVerifiedUser(updatedUser);
      setUsername(updatedUser.username);
      setProfileFeedback({ type: 'success', message: 'Your profile details have been saved.' });
    } catch (error: unknown) {
      setProfileFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Could not update your profile.'),
      });
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
      saveUserMetadata(updatedUser);
      updateVerifiedUser(updatedUser);
      setProfileFeedback({ type: 'success', message: 'Your profile photo has been updated.' });
    } catch (error: unknown) {
      setProfileFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Could not upload your profile photo.'),
      });
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
      setPasswordFeedback({
        type: 'error',
        message: 'Use at least 8 characters for your new password.',
      });
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
      setPasswordFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Could not change your password.'),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return {
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
    isAdmin: user?.role === 'admin',
  };
}
