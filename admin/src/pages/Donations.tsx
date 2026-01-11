import { useEffect, useState } from 'react';
import { PlusIcon, HeartIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface DonationCause {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  targetAmount: number;
  raisedAmount: number;
  organizerName: string;
  organizerPhone?: string;
  is80GEligible: boolean;
  isActive: boolean;
  isVerified: boolean;
  startDate?: string;
  endDate?: string;
}

interface CauseForm {
  title: string;
  description: string;
  shortDescription: string;
  targetAmount: number;
  organizerName: string;
  organizerPhone: string;
  is80GEligible: boolean;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const initialFormState: CauseForm = {
  title: '',
  description: '',
  shortDescription: '',
  targetAmount: 0,
  organizerName: '',
  organizerPhone: '',
  is80GEligible: false,
  isActive: true,
  startDate: '',
  endDate: '',
};

export default function Donations() {
  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCause, setEditingCause] = useState<DonationCause | null>(null);
  const [formData, setFormData] = useState<CauseForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCauses();
  }, [filter]);

  const fetchCauses = async () => {
    try {
      let url = '/donations/admin/causes?limit=100';
      if (filter === 'active') url += '&isActive=true';
      if (filter === 'inactive') url += '&isActive=false';
      const response = await api.get(url);
      setCauses(response.data.causes || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch causes');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCause(null);
    setFormData({
      ...initialFormState,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });
    setShowModal(true);
  };

  const openEditModal = (cause: DonationCause) => {
    setEditingCause(cause);
    setFormData({
      title: cause.title,
      description: cause.description,
      shortDescription: cause.shortDescription || '',
      targetAmount: cause.targetAmount,
      organizerName: cause.organizerName || '',
      organizerPhone: cause.organizerPhone || '',
      is80GEligible: cause.is80GEligible,
      isActive: cause.isActive,
      startDate: cause.startDate ? format(new Date(cause.startDate), 'yyyy-MM-dd') : '',
      endDate: cause.endDate ? format(new Date(cause.endDate), 'yyyy-MM-dd') : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCause(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.organizerName) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (editingCause) {
        await api.put(`/donations/causes/${editingCause.id}`, payload);
        toast.success('Cause updated successfully');
      } else {
        await api.post('/donations/causes', payload);
        toast.success('Cause created successfully');
      }
      closeModal();
      fetchCauses();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cause?')) return;

    try {
      await api.delete(`/donations/causes/${id}`);
      toast.success('Cause deleted successfully');
      fetchCauses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete cause');
    }
  };

  const toggleStatus = async (cause: DonationCause) => {
    try {
      await api.put(`/donations/causes/${cause.id}`, { isActive: !cause.isActive });
      toast.success(`Cause ${cause.isActive ? 'deactivated' : 'activated'}`);
      fetchCauses();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getProgress = (raised: number, target: number) => {
    if (!target) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <p className="text-gray-500">Manage donation causes and track contributions</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Causes</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Add Cause
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
          </div>
        ) : causes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No donation causes found. Click "Add Cause" to create one.
          </div>
        ) : (
          causes.map((cause) => (
            <div key={cause.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex gap-2">
                  {cause.is80GEligible && <span className="badge-info text-xs">80G</span>}
                  <button
                    onClick={() => toggleStatus(cause)}
                    className={cause.isActive ? 'badge-success cursor-pointer' : 'badge-danger cursor-pointer'}
                  >
                    {cause.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{cause.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cause.description}</p>

              {cause.targetAmount > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">
                      {getProgress(cause.raisedAmount || 0, cause.targetAmount).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-saffron-500 rounded-full"
                      style={{ width: `${getProgress(cause.raisedAmount || 0, cause.targetAmount)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">₹{(cause.raisedAmount || 0).toLocaleString()}</span>
                    <span className="text-gray-500">₹{cause.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex gap-2">
                <button
                  onClick={() => openEditModal(cause)}
                  className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cause.id)}
                  className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1 text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingCause ? 'Edit Cause' : 'Create New Cause'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Cause Title *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Short Description</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Full Description *</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Organizer Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.organizerName}
                      onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Organizer Phone</label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.organizerPhone}
                      onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Target Amount (₹)</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is80GEligible}
                      onChange={(e) => setFormData({ ...formData, is80GEligible: e.target.checked })}
                      className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
                    />
                    <span className="text-sm">80G Tax Benefit Eligible</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingCause ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
