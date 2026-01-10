import { useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Profile {
  id: string;
  status: string;
  isVerified: boolean;
  isPhotoVerified: boolean;
  education: string;
  profession: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    city?: { name: string };
  };
}

export default function Matrimony() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending'>('pending');

  useEffect(() => {
    fetchProfiles();
  }, [tab]);

  const fetchProfiles = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (tab === 'pending') params.set('status', 'PENDING_APPROVAL');

      const response = await api.get(`/matrimony/admin/profiles?${params}`);
      setProfiles(response.data.profiles);
    } catch (error) {
      toast.error('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const approveProfile = async (id: string) => {
    try {
      await api.put(`/matrimony/admin/profiles/${id}/approve`);
      toast.success('Profile approved');
      fetchProfiles();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const rejectProfile = async (id: string) => {
    try {
      await api.put(`/matrimony/admin/profiles/${id}/reject`);
      toast.success('Profile rejected');
      fetchProfiles();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const verifyProfile = async (id: string) => {
    try {
      await api.put(`/matrimony/admin/profiles/${id}/verify`);
      toast.success('Profile verified');
      fetchProfiles();
    } catch (error) {
      toast.error('Failed to verify');
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
        <h1 className="text-2xl font-bold text-gray-900">Matrimony</h1>
        <p className="text-gray-500">Manage matrimony profiles</p>
      </div>

      <div className="flex gap-4 border-b">
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
        <button
          onClick={() => setTab('all')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            tab === 'all'
              ? 'border-saffron-600 text-saffron-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Profiles
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Profile</th>
                <th className="table-header">Education</th>
                <th className="table-header">Profession</th>
                <th className="table-header">City</th>
                <th className="table-header">Status</th>
                <th className="table-header">Verified</th>
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
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No profiles found
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-600">
                            {profile.user.firstName[0]}{profile.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {profile.user.firstName} {profile.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {profile.user.gender} • {profile.user.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{profile.education || '-'}</td>
                    <td className="table-cell">{profile.profession || '-'}</td>
                    <td className="table-cell">{profile.user.city?.name || '-'}</td>
                    <td className="table-cell">{getStatusBadge(profile.status)}</td>
                    <td className="table-cell">
                      {profile.isVerified ? (
                        <span className="badge-success">Verified</span>
                      ) : (
                        <button
                          onClick={() => verifyProfile(profile.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Verify Profile"
                        >
                          <ShieldCheckIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                    <td className="table-cell">
                      {profile.status === 'PENDING_APPROVAL' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveProfile(profile.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => rejectProfile(profile.id)}
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
