'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

type Page = {
  slug: string;
  title: string;
  content: string;
};

const PAGES: Page[] = [
  {
    slug: 'about',
    title: 'About Page',
    content: 'About page content here...',
  },
  {
    slug: 'contact',
    title: 'Contact Page',
    content: 'Contact page content here...',
  },
];

export default function PagesEditor({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations();
  const [pages, setPages] = useState<Page[]>(PAGES);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      const data = await response.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingSlug(page.slug);
    setFormData({ title: page.title, content: page.content });
    setMessage('');
  };

  const handleSave = async () => {
    if (!editingSlug || !formData.title || !formData.content) {
      setMessage('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/pages/${editingSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setPages(
          pages.map((p) =>
            p.slug === editingSlug ? { ...p, ...formData } : p
          )
        );
        setEditingSlug(null);
        setMessage('Page saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save page');
      }
    } catch (error) {
      setMessage('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingSlug(null);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Pages Editor</h1>
          <p className="text-gray-600">Edit static page content</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-6">
          {pages.map((page) => (
            <div key={page.slug} className="bg-white rounded-lg shadow p-6">
              {editingSlug === page.slug ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Page title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Content</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent font-mono text-sm"
                      placeholder="Page content (supports HTML)"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition flex items-center gap-2"
                    >
                      {saving ? 'Saving...' : 'Save'} <CheckIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{page.title}</h3>
                      <p className="text-gray-600 mt-2 whitespace-pre-wrap">{page.content.substring(0, 150)}...</p>
                    </div>
                    <button
                      onClick={() => handleEdit(page)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
