const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

export const setAuthToken = (token?: string) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

async function request(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...opts, headers });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const err: any = new Error((data && data.message) || res.statusText || 'Erreur');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
  del: (path: string) => request(path, { method: 'DELETE' }),
};

export default api;
