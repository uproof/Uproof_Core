'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

type Post = {id: number; title: string; excerpt: string; category: string; date: string; readTime?: string; author?: string; content?: string; status?: 'published' | 'draft'};

export default function BlogManagement({params: {locale}}: {params: {locale: string}}) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<Partial<Post>>({ title: '', excerpt: '', category: 'General', content: '' });
  const router = useRouter();

  useEffect(() => {
    // Fetch posts
    const run = async () => {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data?.posts) setPosts(data.posts);
      setLoading(false);
    };
    run();
  }, [locale, router]);

  if (loading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/admin`}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Blog Management</h1>
                <p className="text-xs sm:text-sm text-gray-600">Create and manage blog posts</p>
              </div>
            </div>
            <button 
              onClick={() => { setEditing(null); setForm({ title: '', excerpt: '', category: 'General', content: '' }); setShowForm(true); }} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              New Post
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-8 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Edit Post' : 'New Post'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input className="w-full border rounded-lg px-3 py-3 text-base" value={form.title || ''} onChange={e=>setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input className="w-full border rounded-lg px-3 py-3 text-base" value={form.category || ''} onChange={e=>setForm({...form, category: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea className="w-full border rounded-lg px-3 py-3 text-base" rows={3} value={form.excerpt || ''} onChange={e=>setForm({...form, excerpt: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
                <textarea className="w-full border rounded-lg px-3 py-3 text-base" rows={6} value={form.content || ''} onChange={e=>setForm({...form, content: e.target.value})} />
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={async () => {
                  if (!form.title || !form.excerpt) return alert('Title and Excerpt are required');
                  if (editing) {
                    const res = await fetch(`/api/admin/blog/${editing.id}`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form)});
                    if (res.ok) {
                      const data = await res.json();
                      setPosts(prev => prev.map(p => p.id === data.post.id ? data.post : p));
                      setShowForm(false); setEditing(null);
                    }
                  } else {
                    const res = await fetch('/api/admin/blog', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form)});
                    if (res.ok) {
                      const data = await res.json();
                      setPosts(prev => [data.post, ...prev]);
                      setShowForm(false);
                    }
                  }
                }}
                className="px-4 py-3 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm min-h-[44px] sm:min-h-0"
              >
                {editing ? 'Save Changes' : 'Create Post'}
              </button>
              <button 
                onClick={() => { setShowForm(false); setEditing(null); }} 
                className="px-4 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm min-h-[44px] sm:min-h-0"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Posts</div>
            <div className="text-3xl font-bold text-gray-900">{posts.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Published</div>
            <div className="text-3xl font-bold text-green-600">
              {posts.filter(p => (p.status ?? 'published') === 'published').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Drafts</div>
            <div className="text-3xl font-bold text-yellow-600">0</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Categories</div>
            <div className="text-3xl font-bold text-primary-600">6</div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">All Blog Posts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.excerpt}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        {((post.status ?? 'published') === 'published') ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            published
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            draft
                          </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/blog/${post.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <button onClick={() => { setEditing(post); setForm(post); setShowForm(true); }} className="text-primary-600 hover:text-primary-900" title="Edit">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={async () => {
                          if (!confirm('Delete this post?')) return;
                          const res = await fetch(`/api/admin/blog/${post.id}`, {method: 'DELETE'});
                          if (res.ok) setPosts(prev => prev.filter(p => p.id !== post.id));
                        }} className="text-red-600 hover:text-red-900" title="Delete">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
