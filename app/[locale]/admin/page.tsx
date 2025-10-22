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
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminDashboard({params: {locale}}: {params: {locale: string}}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Check for existing lockout
    const lockedUntil = localStorage.getItem('adminLockout');
    if (lockedUntil) {
      const lockTime = parseInt(lockedUntil);
      if (Date.now() < lockTime) {
        setIsLocked(true);
        setLockoutTime(lockTime);
      } else {
        localStorage.removeItem('adminLockout');
        localStorage.removeItem('adminAttempts');
      }
    }
    
    // Get previous attempts
    const attempts = localStorage.getItem('adminAttempts');
    if (attempts) {
      setLoginAttempts(parseInt(attempts));
    }
    
    setLoading(false);
  }, []);

  // Auto-unlock after timeout
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const timer = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(null);
          setLoginAttempts(0);
          localStorage.removeItem('adminLockout');
          localStorage.removeItem('adminAttempts');
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      return;
    }
    
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'UpRoof2025Admin';
    
    // Simple password check (in production, use proper authentication)
    if (password === adminPassword) {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      setError('');
      setLoginAttempts(0);
      localStorage.removeItem('adminAttempts');
      localStorage.removeItem('adminLockout');
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('adminAttempts', newAttempts.toString());
      
      if (newAttempts >= 5) {
        // Lock for 15 minutes after 5 failed attempts
        const lockUntil = Date.now() + 15 * 60 * 1000;
        localStorage.setItem('adminLockout', lockUntil.toString());
        setIsLocked(true);
        setLockoutTime(lockUntil);
        setError('Too many failed attempts. Locked for 15 minutes.');
      } else {
        setError(`Incorrect password (${newAttempts}/5 attempts)`);
      }
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
              <div className={`px-4 py-3 rounded-lg text-sm ${isLocked ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-600'}`}>
                <strong>{error}</strong>
                {isLocked && lockoutTime && (
                  <p className="mt-2 text-xs">
                    Time remaining: {Math.ceil((lockoutTime - Date.now()) / 60000)} minutes
                  </p>
                )}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLocked}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isLocked 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isLocked ? 'Account Locked' : 'Login'}
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
            <LanguageSwitcher />
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
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active
                </span>
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
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active
                </span>
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
        <div className="mt-12 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900 mb-2">Admin Dashboard Active</h3>
              <p className="text-green-700 mb-3">
                Welcome to your admin dashboard! You can now manage your website content:
              </p>
              <ul className="text-green-700 space-y-2 mb-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Blog Management:</strong> Create, edit, and delete blog posts with multilingual support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Homepage Editor:</strong> Customize hero section, services, stats, and FAQ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">⏳</span>
                  <span><strong>Pages Editor:</strong> Edit About, Services pages (Coming Soon)</span>
                </li>
              </ul>
              <p className="text-green-700 font-semibold border-t border-green-200 pt-3 mt-3">
                🔐 Current Password: UpRoof2025Admin
              </p>
              <p className="text-green-600 text-sm mt-1">
                Change password in environment variables for production deployment
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
