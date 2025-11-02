import {redirect} from 'next/navigation';
import Link from 'next/link';
import {
  PencilSquareIcon,
  DocumentTextIcon,
  HomeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {isAdminAuthenticated} from '@/lib/adminAuth';
import AdminLogout from '@/components/AdminLogout';

export default function AdminDashboard({params: {locale}}: {params: {locale: string}}) {
  const ok = isAdminAuthenticated();
  if (!ok) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">UpRoof Admin</h1>
                <p className="text-xs sm:text-sm text-gray-600">Content Management System</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="order-1">
                <LanguageSwitcher />
              </div>
              <Link
                href={`/${locale}`}
                className="order-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="hidden sm:inline">View Website</span>
              </Link>
              <div className="order-3">
                <AdminLogout locale={locale} />
              </div>
            </div>
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

          {/* Projects Manager - Coming Soon */}
          <div className="bg-white rounded-xl shadow-md p-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <PencilSquareIcon className="w-8 h-8 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-orange-600">Coming Soon</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Projects Manager</h3>
            <p className="text-gray-600 mb-4">Manage portfolio projects and gallery</p>
            <div className="flex items-center text-gray-400 font-semibold">
              Coming Soon
            </div>
          </div>

          {/* Services Editor - Coming Soon */}
          <div className="bg-white rounded-xl shadow-md p-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <PencilSquareIcon className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-blue-600">Coming Soon</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Services Editor</h3>
            <p className="text-gray-600 mb-4">Edit service descriptions and offerings</p>
            <div className="flex items-center text-gray-400 font-semibold">
              Coming Soon
            </div>
          </div>

          {/* Pages Editor - Coming Soon */}
          <div className="bg-white rounded-xl shadow-md p-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <PencilSquareIcon className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-purple-600">Coming Soon</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pages Editor</h3>
            <p className="text-gray-600 mb-4">Edit About, Contact, and other pages</p>
            <div className="flex items-center text-gray-400 font-semibold">
              Coming Soon
            </div>
          </div>

          {/* Site Settings - Coming Soon */}
          <div className="bg-white rounded-xl shadow-md p-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <PencilSquareIcon className="w-8 h-8 text-red-600" />
              </div>
              <span className="text-sm font-semibold text-red-600">Coming Soon</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Site Settings</h3>
            <p className="text-gray-600 mb-4">Configure company info and SEO</p>
            <div className="flex items-center text-gray-400 font-semibold">
              Coming Soon
            </div>
          </div>

          {/* Messages - Coming Soon */}
          <div className="bg-white rounded-xl shadow-md p-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <PencilSquareIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-indigo-600">Coming Soon</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600 mb-4">View contact form submissions</p>
            <div className="flex items-center text-gray-400 font-semibold">
              Coming Soon
            </div>
          </div>
        </div>


      </main>
    </div>
  );
}
