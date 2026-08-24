'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import api from '@/lib/axios';
import { RootState } from '@/store';

export default function ProjectInvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const token = params?.token as string;

  const fetchInvitation = async () => {
    try {
      const response = await api.get(`/projects/invitations/${token}`);
      setInvitation(response.data.invitation);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'This invitation is invalid or no longer available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/projects/invitations/${token}/accept`);
      router.push('/user_features/projects');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to accept the invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/projects/invitations/${token}/reject`);
      setInvitation((prev: any) => ({ ...prev, status: 'rejected' }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to reject the invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const loginHref = `/login?next=${encodeURIComponent(`/project-invitations/${token}`)}`;
  const registerHref = `/register?next=${encodeURIComponent(`/project-invitations/${token}`)}`;

  return (
    <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#11131b] shadow-2xl shadow-purple-900/20 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7" />
            <h1 className="text-2xl font-bold">Orbit</h1>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-300 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" /> Loading invitation...
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Invitation unavailable</h2>
              </div>
              <p className="text-gray-300">{error}</p>
              <Link href="/homepage" className="inline-flex items-center px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium">Back to Orbit</Link>
            </div>
          ) : invitation ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-purple-300">Project invitation</p>
                <h2 className="mt-2 text-3xl font-bold">You&apos;ve been invited to join {invitation.project?.title}</h2>
              </div>

              {invitation.status === 'expired' ? (
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-200">
                  This invitation has expired.
                </div>
              ) : invitation.status === 'accepted' ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" /> This invitation has already been accepted.
                </div>
              ) : invitation.status === 'rejected' ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
                  This invitation was declined.
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 text-sm text-gray-300">
                <p><span className="text-gray-500">Invited email:</span> {invitation.invitedEmail}</p>
                <p><span className="text-gray-500">Invited by:</span> {invitation.inviter?.username || 'Project owner'}</p>
                <p><span className="text-gray-500">Project:</span> {invitation.project?.title}</p>
                {invitation.project?.description && <p><span className="text-gray-500">Description:</span> {invitation.project.description}</p>}
              </div>

              {!user ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Please sign in or create an account to continue.</p>
                  <div className="flex gap-3">
                    <Link href={loginHref} className="flex-1 inline-flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-3 font-medium">Sign in</Link>
                    <Link href={registerHref} className="flex-1 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 font-medium">Create account</Link>
                  </div>
                </div>
              ) : user.email.toLowerCase() !== invitation.invitedEmail.toLowerCase() ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
                  This invitation belongs to a different email address. Please sign in with the invited account to continue.
                </div>
              ) : invitation.status === 'pending' ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleAccept}
                    className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-3 font-medium disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Accept Invitation'}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleReject}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 font-medium disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              ) : null}

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}