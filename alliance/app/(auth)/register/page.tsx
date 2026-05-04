'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { registerUser } from '@/services/auth.service';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('Debes aceptar los términos y condiciones.'); return; }
    setLoading(true);
    setError('');
    try {
      await registerUser(form.name, form.email, form.password);
      await signIn('credentials', {
        email:       form.email,
        password:    form.password,
        callbackUrl: '/',
      });
    } catch {
      setError('No se pudo crear la cuenta. Intenta con otro correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-card-lg px-10 py-10 w-full max-w-md shadow-xl">
      <h1 className="text-center text-lg font-bold text-violet-600 mb-6">
        Registrate a Traves de
      </h1>

      <div className="flex gap-3 mb-5">
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
            <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.3-17.7 11.7z" fill="#FF3D00"/>
            <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.6C29.7 35.9 27 37 24 37c-6 0-10.6-3.1-11.8-7.4l-7 5.4C8.1 40.8 15.5 45 24 45z" fill="#4CAF50"/>
            <path d="M44.5 20H24v8.5h11.8c-.6 2.9-2.4 5.4-4.8 7l6.6 5.6C41.5 37.8 45 31.5 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
          </svg>
          Google
        </button>

        <button
          onClick={() => signIn('microsoft-entra-id', { callbackUrl: '/' })}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          Microsoft
        </button>

        <button
          onClick={() => signIn('facebook', { callbackUrl: '/' })}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      <p className="text-center text-violet-600 font-semibold text-sm mb-5">
        ó Registrate con Tus Datos
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full bg-gray-900 text-white placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full bg-gray-900 text-white placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full bg-gray-900 text-white placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />

        <label className="flex items-start gap-2 text-xs text-gray-600 mt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-violet-600"
          />
          <span>
            Acepto los{' '}
            <Link href="#" className="text-violet-600 underline">Términos y Condiciones</Link>
            {' '}y la{' '}
            <Link href="#" className="text-violet-600 underline">Política de Privacidad</Link>
          </span>
        </label>

        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-lime text-gray-900 font-black py-3 rounded-xl text-sm tracking-widest hover:brightness-95 transition-all disabled:opacity-60 mt-2"
        >
          {loading ? '...' : 'CONTINUAR'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-5">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-violet-600 font-semibold underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
