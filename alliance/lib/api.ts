import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function createAuthClient(accessToken: string): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Error de conexión con el servidor';
      return Promise.reject(new Error(msg));
    }
  );

  return client;
}
