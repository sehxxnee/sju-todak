export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(input, { ...init, headers });
} 