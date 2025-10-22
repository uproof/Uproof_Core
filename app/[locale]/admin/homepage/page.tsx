'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export default function HomepageEditor({params: {locale}}: {params: {locale: string}}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth !== 'true') {
      router.push(`/${locale}/admin`);
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [locale, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
              <p className="text-sm text-gray-600">Edit homepage content and sections</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Coming Soon Message */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Homepage Editor Coming Soon</h3>
              <p className="text-yellow-700">
                The homepage content editor is currently in development. This will allow you to edit hero text, stats, 
                services descriptions, FAQ content, and more directly from this interface.
              </p>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hero Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <VideoCameraIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hero Section</h3>
                <p className="text-sm text-gray-600">Main banner with video background</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Edit title and subtitle text</li>
              <li>• Change CTA button labels</li>
              <li>• Upload new background video</li>
            </ul>
            <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Hero Section
            </button>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Stats Bar</h3>
                <p className="text-sm text-gray-600">Achievement numbers display</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Update completed projects count</li>
              <li>• Edit years of experience</li>
              <li>• Change satisfied customers number</li>
            </ul>
            <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Stats
            </button>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Services</h3>
                <p className="text-sm text-gray-600">Service descriptions and images</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Edit service titles and descriptions</li>
              <li>• Upload service images</li>
              <li>• Reorder services display</li>
            </ul>
            <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Services
            </button>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <QuestionMarkCircleIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">FAQ</h3>
                <p className="text-sm text-gray-600">Questions and answers</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Add new FAQ items</li>
              <li>• Edit existing questions/answers</li>
              <li>• Reorder or delete items</li>
            </ul>
            <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Edit FAQ
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">How it will work</h3>
          <p className="text-blue-700">
            When complete, each section will have its own editor with forms for text content, 
            file uploads for images/videos, and real-time preview of changes. All content will be 
            stored in a database and can be edited for each language separately.
          </p>
        </div>
      </main>
    </div>
  );
}
