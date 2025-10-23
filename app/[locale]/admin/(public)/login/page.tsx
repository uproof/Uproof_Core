'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin({params: {locale}}: {params: {locale: string}}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password})
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Login failed');
      router.replace(`/${locale}/admin`);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 px-4 sm:px-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">UpRoof Admin</h1>
          <p className="text-sm sm:text-base text-gray-600">Enter password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-600">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-colors min-h-[48px] ${
              loading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href={`/${locale}`} className="text-sm text-primary-600 hover:text-primary-700">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
