'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {
  PencilSquareIcon,
  DocumentTextIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard({params: {locale}}: {params: {locale: string}}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper authentication)
    if (password === 'UpRoof2025Admin') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">UpRoof Admin</h1>
            <p className="text-gray-600">Enter password to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Login
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">UpRoof Admin</h1>
              <p className="text-sm text-gray-600">Content Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <HomeIcon className="w-5 h-5" />
              View Website
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your website content</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blog Management */}
          <Link href={`/${locale}/admin/blog`}>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
                  <DocumentTextIcon className="w-8 h-8 text-primary-600" />
                </div>
                <span className="text-sm font-semibold text-primary-600">Coming Soon</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Blog Posts</h3>
              <p className="text-gray-600 mb-4">Create, edit, and manage blog articles</p>
              <div className="flex items-center text-primary-600 font-semibold">
                Manage Blog
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Homepage Editor */}
          <Link href={`/${locale}/admin/homepage`}>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <HomeIcon className="w-8 h-8 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-green-600">Coming Soon</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Homepage</h3>
              <p className="text-gray-600 mb-4">Edit hero, services, stats, and FAQ content</p>
              <div className="flex items-center text-green-600 font-semibold">
                Edit Homepage
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Content Editor */}
          <div className="bg-white rounded-xl shadow-md p-6 opacity-75">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <PencilSquareIcon className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-purple-600">Coming Soon</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pages Editor</h3>
            <p className="text-gray-600 mb-4">Edit About, Services, and other pages</p>
            <div className="flex items-center text-gray-400 font-semibold">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Admin Features In Development</h3>
              <p className="text-blue-700">
                The blog editor and homepage content manager are currently being developed. 
                These features will allow you to create and edit content directly from this dashboard.
                For now, you can navigate through the dashboard to see the planned structure.
              </p>
              <p className="text-blue-700 mt-2 font-semibold">
                Default Password: UpRoof2025Admin
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
