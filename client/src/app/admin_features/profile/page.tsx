'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Shield, Mail, Camera, Check, Loader2,
  Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Calendar, User, Activity, Users, FolderKanban
} from 'lucide-react';
import { RootState } from '@/store';
import { setAdminCredentials } from '@/store/slices/adminAuthSlice';
import adminApi from '@/lib/adminAxios';
import { saveAuthTokens } from '@/lib/tokenStorage';
import { getAvatarUrl } from '@/lib/config';

export default function AdminProfile() {
  const { admin } = useSelector((state: RootState) => state.adminAuth);
  const dispatch = useDispatch();

  // Profile state
  const [username, setUsername] = useState(admin?.username || '');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwStatus, setPwStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(admin?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Admin stats
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          adminApi.get('/admin/stats').catch(() => null),
          adminApi.get('/admin/profile').catch(() => null),
        ]);
        if (statsRes?.data) setStats(statsRes.data);
        if (profileRes?.data) {
          setUsername(profileRes.data.username);
          if (profileRes.data.avatar) setAvatarUrl(profileRes.data.avatar);
          dispatch(setAdminCredentials({ admin: profileRes.data }));
          saveAuthTokens(profileRes.data, true);
        }
      } catch {}
    };
    fetchAdminData();
  }, [dispatch]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');
    setSaveError('');
    try {
      const res = await adminApi.patch('/admin/profile', { username });
      if (admin) {
        const updatedAdmin = { ...admin, username: res.data.user.username, avatar: res.data.user.avatar ?? admin.avatar };
        dispatch(setAdminCredentials({ admin: updatedAdmin }));
        saveAuthTokens(updatedAdmin, true);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to update profile';
      setSaveStatus('error');
      setSaveError((error as any)?.response?.data?.message || message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await adminApi.post('/admin/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = res.data.user.avatar;
      setAvatarUrl(newUrl);
      if (admin) {
        const updatedAdmin = { ...admin, avatar: newUrl };
        dispatch(setAdminCredentials({ admin: updatedAdmin }));
        saveAuthTokens(updatedAdmin, true);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus('idle');
    setPwError('');

    if (newPw !== confirmPw) {
      setPwStatus('error');
      setPwError('New passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      setPwStatus('error');
      setPwError('Password must be at least 8 characters');
      return;
    }

    setChangingPw(true);
    try {
      await adminApi.patch('/admin/change-password', { currentPassword: currentPw, newPassword: newPw });
      setPwStatus('success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwStatus('idle'), 3000);
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to change password';
      setPwStatus('error');
      setPwError((error as any)?.response?.data?.message || message);
    } finally {
      setChangingPw(false);
    }
  };

  const pwStrength = () => {
    if (newPw.length === 0) return null;
    if (newPw.length < 6) return { label: 'Too short', color: 'bg-red-500', width: '25%' };
    if (newPw.length < 8) return { label: 'Weak', color: 'bg-orange-500', width: '50%' };
    if (!/[A-Z]/.test(newPw) || !/[0-9]/.test(newPw)) return { label: 'Medium', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = pwStrength();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Banner & Profile Header */}
      <div className="relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.05] shadow-2xl">
        {/* Admin Gradient Banner */}
        <div className="h-32 md:h-44 w-full bg-gradient-to-r from-red-950/60 via-orange-950/40 to-stone-900/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-15"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-red-600/20 rounded-full blur-[70px]"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/20 rounded-full blur-[70px]"></div>
        </div>
        
        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-gradient-to-tr from-red-600 to-orange-500 p-1 shadow-[0_0_35px_rgba(239,68,68,0.35)] flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getAvatarUrl(avatarUrl)}
                    alt="Admin avatar"
                    className="w-full h-full rounded-[22px] object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-[22px] bg-[#0c0e13] flex items-center justify-center text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-red-400 to-orange-300">
                    {admin?.username?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              
              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Upload Display Picture to Cloudinary"
                className="absolute bottom-2 right-2 p-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition-all shadow-xl hover:scale-110 active:scale-95 z-10 disabled:opacity-60"
              >
                {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{admin?.username}</h1>
                    <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <Shield className="w-3.5 h-3.5" /> Super Admin
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1 flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" /> {admin?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Platform Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Platform Users', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-400' },
                { label: 'Active Projects', value: stats.totalProjects || 0, icon: FolderKanban, color: 'text-purple-400' },
                { label: 'Total Tasks', value: stats.totalTasks || 0, icon: Activity, color: 'text-orange-400' },
                { label: 'System Health', value: '100%', icon: Shield, color: 'text-green-400' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Details & Password */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Form */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-400" /> Admin Profile Details
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Display Name / Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email Address (Read-only)</label>
                  <div className="relative opacity-60">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="email"
                      value={admin?.email || ''}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white cursor-not-allowed text-sm"
                    />
                  </div>
                </div>
              </div>

              {saveStatus === 'error' && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}
              {saveStatus === 'success' && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Admin profile updated successfully!</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || username === admin?.username}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveStatus === 'success' ? <Check className="w-4 h-4" /> : null}
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400" /> Security & Password
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-5 relative z-10 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                    placeholder="Min 8 characters"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} rounded-full transition-all duration-500`} style={{ width: strength.width }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 bg-black/50 border rounded-xl text-white focus:outline-none transition-all text-sm ${confirmPw && confirmPw !== newPw ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-red-500'}`}
                    placeholder="Confirm new password"
                  />
                </div>
                {confirmPw && confirmPw !== newPw && <p className="text-xs text-red-400 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3"/> Passwords do not match</p>}
              </div>

              {pwStatus === 'error' && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}
              {pwStatus === 'success' && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPw || !currentPw || !newPw || !confirmPw}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                >
                  {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {changingPw ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Admin Privileges & System */}
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
            <h3 className="text-base font-bold mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" /> Admin Privileges
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role Access</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" /> Full System Administrator
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col gap-1">
                <span className="text-xs font-semibold text-red-500/70 uppercase tracking-wider">Account Status</span>
                <span className="text-red-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></span>
                  Active & Protected
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cloud Storage</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> Cloudinary CDN Active
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
