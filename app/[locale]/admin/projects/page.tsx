'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';

type Project = {
  id: string;
  title: string;
  location: string;
  description: string;
  image?: string;
};

export default function ProjectsManager({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', location: '', description: '', image: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      setMessage('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      setFormData({ ...formData, image: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.location || !formData.description) {
      setMessage('All fields are required');
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('location', formData.location);
      form.append('description', formData.description);
      if (imageFile) form.append('image', imageFile);

      const response = await fetch(
        editingId
          ? `/api/admin/projects/${editingId}`
          : '/api/admin/projects',
        {
          method: editingId ? 'PATCH' : 'POST',
          body: form,
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (editingId) {
          setProjects(projects.map(p => p.id === editingId ? result.project : p));
        } else {
          setProjects([...projects, result.project]);
        }
        setShowForm(false);
        setEditingId(null);
        setFormData({ title: '', location: '', description: '', image: '' });
        setImageFile(null);
        setMessage('Project saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save project');
      }
    } catch (error) {
      setMessage('Error saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id));
        setMessage('Project deleted!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error deleting project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      location: project.location,
      description: project.description,
      image: project.image || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', location: '', description: '', image: '' });
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Admin
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects Manager</h1>
              <p className="text-gray-600">Manage your portfolio projects</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <PlusIcon className="w-5 h-5" />
                Add Project
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Project title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Project location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Project description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Image</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {formData.image && (
                    <Image
                      src={formData.image}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                </div>
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
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <p className="text-gray-600">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No projects yet. Create your first project!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={400}
                    height={240}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.location}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
