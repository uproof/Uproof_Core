'use client';

import {useEffect, useMemo, useState} from 'react';
import {useParams} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon} from '@heroicons/react/24/outline';
import {getCareerJobPath} from '@/lib/careerSeo';

type CareerJob = {
  id: string;
  slug: string;
  title: string;
  location: string;
  type: string;
  summary: string;
  description: string;
  active?: boolean;
  order?: number;
};

type FormState = {
  id: string;
  title: string;
  location: string;
  type: string;
  summary: string;
  description: string;
  active: boolean;
  order: string;
};

const emptyForm: FormState = {
  id: '',
  title: '',
  location: '',
  type: 'Pilna slodze',
  summary: '',
  description: '',
  active: true,
  order: '1',
};

export default function CareerManagerPage() {
  const params = useParams<{locale?: string}>();
  const locale = typeof params?.locale === 'string' ? params.locale : 'lv';
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/career');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      setMessage('Error loading career jobs');
    } finally {
      setLoading(false);
    }
  };

  const sortedJobs = useMemo(() => [...jobs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [jobs]);

  const handleSave = async () => {
    if (!formData.title || !formData.location || !formData.type || !formData.summary || !formData.description) {
      setMessage('All fields are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: formData.id || undefined,
        title: formData.title,
        location: formData.location,
        type: formData.type,
        summary: formData.summary,
        description: formData.description,
        active: formData.active,
        order: Number(formData.order || 0),
      };

      const response = await fetch(
        editingId ? `/api/admin/career/${editingId}` : '/api/admin/career',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const job = result.job as CareerJob;
        if (editingId) {
          setJobs(jobs.map((item) => item.id === editingId ? job : item));
        } else {
          setJobs([...jobs, job]);
        }
        setShowForm(false);
        setEditingId(null);
        setFormData(emptyForm);
        setMessage('Career position saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save career position');
      }
    } catch (error) {
      setMessage('Error saving career position');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job position?')) return;
    try {
      const response = await fetch(`/api/admin/career/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== id));
        setMessage('Career position deleted!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error deleting career position');
    }
  };

  const handleEdit = (job: CareerJob) => {
    setEditingId(job.id);
    setFormData({
      id: job.id,
      title: job.title,
      location: job.location,
      type: job.type,
      summary: job.summary,
      description: job.description,
      active: job.active !== false,
      order: String(job.order ?? 1),
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, order: String(sortedJobs.length + 1) });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Admin
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Career Positions Manager</h1>
              <p className="text-gray-600">Add and manage open jobs without touching code</p>
            </div>
            {!showForm && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <PlusIcon className="w-5 h-5" />
                Add Position
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${message.toLowerCase().includes('success') || message.toLowerCase().includes('deleted') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Position' : 'Add New Position'}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Position Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Professional roofer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Riga, Latvia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Employment Type *</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Full time"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Display Order</label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">Summary *</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="Short role summary shown on the public page"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="Longer role description"
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                id="active"
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-900">Publish on the public career page</label>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Position'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading career positions...</p>
        ) : sortedJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No job positions yet. Add your first position!</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {sortedJobs.map((job) => (
              <article key={job.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${job.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {job.active !== false ? 'Published' : 'Hidden'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2"><strong>Type:</strong> {job.type}</p>
                <p className="text-gray-700 mb-3">{job.summary}</p>
                <p className="text-sm text-gray-500 whitespace-pre-wrap">{job.description}</p>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => handleEdit(job)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">
                    <PencilIcon className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition">
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                  <Link href={getCareerJobPath(locale, job)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                    <EyeIcon className="w-4 h-4" /> View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
