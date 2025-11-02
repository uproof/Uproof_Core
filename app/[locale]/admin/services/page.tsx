'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Service = {
  key: string;
  title: string;
  description: string;
};

export default function ServicesEditor({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations();
  const [services, setServices] = useState<Service[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch services from translations
    const serviceKeys = [
      'construction', 'painting', 'maintenance', 'metalProfile',
      'tiledRoof', 'skylights', 'gutterSystem', 'snowRemoval', 'leafCleaning'
    ];
    
    const loadedServices = serviceKeys.map((key) => ({
      key,
      title: t(`home.services.${key}.title`) || '',
      description: t(`home.services.${key}.description`) || '',
    }));
    setServices(loadedServices);
  }, [t]);

  const handleEdit = (service: Service) => {
    setEditingKey(service.key);
    setFormData({ title: service.title, description: service.description });
    setMessage('');
  };

  const handleSave = async () => {
    if (!editingKey || !formData.title || !formData.description) {
      setMessage('Title and description are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/services/${editingKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setServices(
          services.map((s) =>
            s.key === editingKey ? { ...s, ...formData } : s
          )
        );
        setEditingKey(null);
        setMessage('Service saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save service');
      }
    } catch (error) {
      setMessage('Error saving service: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setFormData({ title: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Services Editor</h1>
          <p className="text-gray-600">Edit roofing service descriptions</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-6">
          {services.map((service) => (
            <div key={service.key} className="bg-white rounded-lg shadow p-6">
              {editingKey === service.key ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Service title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Service description"
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
                      <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
                      <p className="text-gray-600 mt-2">{service.description}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(service)}
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
