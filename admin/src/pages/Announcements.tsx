import { useEffect, useState } from 'react';
import { PlusIcon, MegaphoneIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  isPinned: boolean;
  isGlobal: boolean;
  createdAt: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    isGlobal: true,
    isPinned: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/admin/announcements');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    try {
      await api.post('/admin/announcements', form);
      toast.success('Announcement created');
      setShowModal(false);
      setForm({ title: '', content: '', isGlobal: true, isPinned: false });
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">Manage community announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <MegaphoneIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-saffron-100 rounded-lg flex items-center justify-center">
                    <MegaphoneIcon className="w-5 h-5 text-saffron-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {announcement.isPinned && <span className="badge-warning">Pinned</span>}
                  {announcement.isGlobal && <span className="badge-info">Global</span>}
                  {announcement.isActive ? (
                    <span className="badge-success">Active</span>
                  ) : (
                    <span className="badge-danger">Inactive</span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{announcement.content}</p>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm flex items-center gap-1">
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="btn-danger text-sm flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Announcement</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Announcement content"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isGlobal}
                    onChange={(e) => setForm({ ...form, isGlobal: e.target.checked })}
                    className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
                  />
                  <span className="text-sm text-gray-700">Global</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
                  />
                  <span className="text-sm text-gray-700">Pinned</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={createAnnouncement} className="btn-primary flex-1">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
