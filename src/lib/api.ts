import axios from 'axios';

// In dev, Vite proxy forwards /api → localhost:4000
// In prod, Express serves both on the same port
const api = axios.create({
  baseURL: '/',
  withCredentials: true, // send httpOnly cookie
});

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string, phone?: string) =>
    api.post('/api/auth/register', { name, email, password, phone }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};

export const magazineAPI = {
  getAll: (params?: Record<string, any>) => api.get('/api/magazines', { params }),
  getById: (id: number | string) => api.get(`/api/magazines/${id}`),
  download: (id: number | string, data?: any) =>
    api.post(`/api/magazines/${id}/download`, data),
  like: (id: number | string) => api.post(`/api/magazines/${id}/like`),
  comment: (id: number | string, content: string, author_name?: string, parent_id?: number) =>
    api.post(`/api/magazines/${id}/comments`, { content, author_name, parent_id }),
  upvoteComment: (commentId: number | string) =>
    api.post(`/api/comments/${commentId}/upvote`),
};

export const newsAPI = {
  getAll: (params?: Record<string, any>) => api.get('/api/news', { params }),
  getBySlug: (slug: string) => api.get(`/api/news/${slug}`),
  like: (id: number | string) => api.post(`/api/news/${id}/like`),
  comment: (id: number | string, content: string, author_name?: string, parent_id?: number) =>
    api.post(`/api/news/${id}/comments`, { content, author_name, parent_id }),
  upvoteComment: (commentId: number | string) =>
    api.post(`/api/news-comments/${commentId}/upvote`),
};

export const contactAPI = {
  submit: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    api.post('/api/contact', data),
};

export const adminAPI = {
  dashboard: () => api.get('/api/admin/dashboard'),
  getMagazines: () => api.get('/api/admin/magazines'),
  createMagazine: (fd: FormData) =>
    api.post('/api/admin/magazines', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateMagazine: (id: number | string, fd: FormData) =>
    api.put(`/api/admin/magazines/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMagazine: (id: number | string) => api.delete(`/api/admin/magazines/${id}`),
  getUsers: () => api.get('/api/admin/users'),
  updateUserRole: (id: number | string, role: string) =>
    api.patch(`/api/admin/users/${id}/role`, { role }),
  getDownloads: () => api.get('/api/admin/downloads'),
  // News
  getNews: () => api.get('/api/admin/news'),
  createNews: (fd: FormData) =>
    api.post('/api/admin/news', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateNews: (id: number | string, fd: FormData) =>
    api.put(`/api/admin/news/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteNews: (id: number | string) => api.delete(`/api/admin/news/${id}`),
  // Contact
  getContacts: () => api.get('/api/admin/contacts'),
  updateContactStatus: (id: number | string, status: string) =>
    api.patch(`/api/admin/contacts/${id}/status`, { status }),
  deleteContact: (id: number | string) => api.delete(`/api/admin/contacts/${id}`),
};

export default api;

// In this Vite+Express setup, uploads are served from the same origin
// Dev: Vite proxy forwards /uploads → localhost:4000
// Prod: Express serves /uploads directly
export const getFileUrl = (filePath: string) => `/uploads/${filePath}`;
