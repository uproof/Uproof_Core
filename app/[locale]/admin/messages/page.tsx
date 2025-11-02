'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeftIcon, TrashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function Messages({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact-messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (message: Message) => {
    if (message.read) return;

    try {
      await fetch(`/api/admin/contact-messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      setMessages(
        messages.map((m) =>
          m.id === message.id ? { ...m, read: true } : m
        )
      );
      setSelectedMessage({ ...message, read: true });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;

    setDeleting(id);
    try {
      await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
      });

      setMessages(messages.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setDeleting(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

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
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Contact form submissions</p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <p className="p-4 text-gray-600">Loading messages...</p>
              ) : messages.length === 0 ? (
                <div className="p-6 text-center">
                  <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No messages yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <li
                      key={message.id}
                      onClick={() => markAsRead(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                        selectedMessage?.id === message.id
                          ? 'bg-primary-50 border-l-4 border-primary-600'
                          : message.read
                          ? 'bg-white'
                          : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {message.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {message.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {message.subject}
                          </p>
                        </div>
                        {!message.read && (
                          <div className="ml-2 flex-shrink-0">
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(message.createdAt), 'MMM d, yyyy')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="md:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      From: {selectedMessage.name} ({selectedMessage.email})
                    </p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-gray-600">Phone: {selectedMessage.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    disabled={deleting === selectedMessage.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">
                    Received: {format(new Date(selectedMessage.createdAt), 'PPp')}
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {!selectedMessage.read && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    Mark as read when you view this message.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <EnvelopeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
