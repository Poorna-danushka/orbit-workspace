import adminApi from '../adminAxios';

export const getAdminStats = () => adminApi.get('/admin/stats');
export const getAdminActivity = () => adminApi.get('/admin/activity');
export const getAdminUsers = () => adminApi.get('/admin/users');
export const deleteAdminUser = (id: string) => adminApi.delete(`/admin/users/${id}`);
export const changeAdminRole = (id: string, role: string) => adminApi.patch(`/admin/users/${id}/role`, { role });
export const getAdminProjects = () => adminApi.get('/admin/projects');
export const deleteAdminProject = (id: string) => adminApi.delete(`/admin/projects/${id}`);
export const broadcastMessage = (message: string) => adminApi.post('/admin/broadcast', { message });
export const getAdminProfile = () => adminApi.get('/admin/profile');
export const updateAdminProfile = (payload: { username: string }) => adminApi.patch('/admin/profile', payload);
export const changeAdminPassword = (payload: { currentPassword: string; newPassword: string }) => adminApi.patch('/admin/change-password', payload);
export const uploadAdminAvatar = (formData: FormData) => adminApi.post('/admin/avatar', formData);

