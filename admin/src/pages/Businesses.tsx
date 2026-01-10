import { useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Business {
  id: string;
  name: string;
  shortDescription: string;
  phone: string;
  status: string;
  isVerified: boolean;
  isFeatured: boolean;
  category: { name: string };
  city: { name: string };
  createdAt: string;
}

export default function Businesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    fetchBusinesses();
  }, [tab]);

  const fetchBusinesses = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (tab === 'pending') params.set('status', 'PENDING_APPROVAL');

      const response = await api.get(`/businesses?${params}`);
      setBusinesses(response.data.businesses);
    } catch (error) {
      toast.error('Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  };

  const approveBusiness = async (id: string) => {
    try {
      await api.put(`/businesses/${id}/approve`);
      toast.success('Business approved');
      fetchBusinesses();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const rejectBusiness = async (id: string) => {
    try {
      await api.put(`/businesses/${id}/reject`);
      toast.success('Business rejected');
      fetchBusinesses();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      await api.put(`/businesses/${id}/feature`);
      toast.success('Featured status updated');
      fetchBusinesses();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge-success">Active</span>;
      case 'PENDING_APPROVAL':
        return <span className="badge-warning">Pending</span>;
      case 'REJECTED':
        return <span className="badge-danger">Rejected</span>;
      default:
        return <span className="badge-info">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
        <p className="text-gray-500">Manage business listings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab('all')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            tab === 'all'
              ? 'border-saffron-600 text-saffron-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Businesses
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            tab === 'pending'
              ? 'border-saffron-600 text-saffron-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Approval
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Business</th>
                <th className="table-header">Category</th>
                <th className="table-header">City</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Status</th>
                <th className="table-header">Featured</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-saffron-600 mx-auto"></div>
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No businesses found
                  </td>
                </tr>
              ) : (
                businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">{business.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {business.shortDescription || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">{business.category?.name || '-'}</td>
                    <td className="table-cell">{business.city?.name || '-'}</td>
                    <td className="table-cell">{business.phone}</td>
                    <td className="table-cell">{getStatusBadge(business.status)}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => toggleFeatured(business.id)}
                        className={`p-1 rounded ${
                          business.isFeatured
                            ? 'text-yellow-500 bg-yellow-50'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <StarIcon className="w-5 h-5" fill={business.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="table-cell">
                      {business.status === 'PENDING_APPROVAL' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveBusiness(business.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => rejectBusiness(business.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button className="text-sm text-saffron-600 hover:underline">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
