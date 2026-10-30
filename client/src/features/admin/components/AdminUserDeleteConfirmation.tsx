import type { AdminUser } from '@/features/admin/types';

type Props = {
  user: AdminUser;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function AdminUserDeleteConfirmation({ user, onCancel, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11131b] p-5">
        <h3 className="text-lg font-semibold text-white">Delete user</h3>
        <p className="mt-2 text-sm text-gray-400">
          This action will permanently remove{' '}
          <span className="font-medium text-white">{user.username}</span> and their account data.
          Continue?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
