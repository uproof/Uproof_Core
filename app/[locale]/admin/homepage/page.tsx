'use client';

import {useEffect, useState} from 'react';
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
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const res = await fetch(`/api/admin/messages/${locale}`);
      const data = await res.json();
      if (data?.messages) setMessages(data.messages);
      setLoading(false);
    };
    run();
  }, [locale, router]);

  if (loading || !messages) {
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
        {/* Hero Editor */}
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Hero Section</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input className="w-full border rounded-lg px-3 py-2" value={messages.home?.hero?.title || ''} onChange={e => setMessages((m: any) => ({...m, home: {...m.home, hero: {...m.home.hero, title: e.target.value}}}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input className="w-full border rounded-lg px-3 py-2" value={messages.home?.hero?.subtitle || ''} onChange={e => setMessages((m: any) => ({...m, home: {...m.home, hero: {...m.home.hero, subtitle: e.target.value}}}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Label</label>
              <input className="w-full border rounded-lg px-3 py-2" value={messages.home?.hero?.cta || ''} onChange={e => setMessages((m: any) => ({...m, home: {...m.home, hero: {...m.home.hero, cta: e.target.value}}}))} />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={async () => {
                const res = await fetch(`/api/admin/messages/${locale}`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(messages)});
                if (res.ok) alert('Saved!');
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Hero
            </button>
          </div>
        </div>

  {/* Section Cards (placeholders for future feature expansion) */}
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
