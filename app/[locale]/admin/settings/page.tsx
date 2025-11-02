'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

type SiteSettings = {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialLinkedIn?: string;
  socialTwitter?: string;
};

export default function SiteSettings({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();
  const [settings, setSettings] = useState<SiteSettings>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyDescription: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    // Validation
    if (!settings.companyName || !settings.companyEmail || !settings.companyPhone) {
      setMessage('Company name, email, and phone are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600">Manage company information and SEO settings</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Company Information Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email *</label>
                <input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleChange('companyEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="company@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={settings.companyPhone}
                  onChange={(e) => handleChange('companyPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                <input
                  type="text"
                  value={settings.companyAddress}
                  onChange={(e) => handleChange('companyAddress', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
              <textarea
                value={settings.companyDescription}
                onChange={(e) => handleChange('companyDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="Brief description of your company"
              />
            </div>
          </div>

          {/* SEO Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">SEO Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Meta Title</label>
              <input
                type="text"
                value={settings.seoTitle}
                onChange={(e) => handleChange('seoTitle', e.target.value)}
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="Page title (60 chars max)"
              />
              <p className="text-xs text-gray-500 mt-1">{settings.seoTitle.length}/60</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">Meta Description</label>
              <textarea
                value={settings.seoDescription}
                onChange={(e) => handleChange('seoDescription', e.target.value)}
                maxLength={160}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="Page description (160 chars max)"
              />
              <p className="text-xs text-gray-500 mt-1">{settings.seoDescription.length}/160</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">Keywords (comma separated)</label>
              <input
                type="text"
                value={settings.seoKeywords}
                onChange={(e) => handleChange('seoKeywords', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="roofing, repair, installation"
              />
            </div>
          </div>

          {/* Social Media Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Social Media</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={settings.socialFacebook || ''}
                  onChange={(e) => handleChange('socialFacebook', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={settings.socialInstagram || ''}
                  onChange={(e) => handleChange('socialInstagram', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={settings.socialLinkedIn || ''}
                  onChange={(e) => handleChange('socialLinkedIn', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Twitter URL</label>
                <input
                  type="url"
                  value={settings.socialTwitter || ''}
                  onChange={(e) => handleChange('socialTwitter', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t pt-6 flex justify-end gap-3">
            <Link
              href={`/${locale}/admin`}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Save Settings'} <CheckIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
