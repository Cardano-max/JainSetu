import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface User {
  id: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isProfileVerified: boolean;
  city?: { name: string };
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId: string, status: string) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      toast.success('Status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const verifyUser = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      toast.success('User verified');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to verify user');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge-success">Active</span>;
      case 'PENDING':
        return <span className="badge-warning">Pending</span>;
      case 'SUSPENDED':
        return <span className="badge-danger">Suspended</span>;
      default:
        return <span className="badge-info">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500">Manage community members</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">User</th>
                <th className="table-header">Phone</th>
                <th className="table-header">City</th>
                <th className="table-header">Role</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-600">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{user.phone}</td>
                    <td className="table-cell">{user.city?.name || '-'}</td>
                    <td className="table-cell">
                      <span className="badge-info">{user.role}</span>
                    </td>
                    <td className="table-cell">{getStatusBadge(user.status)}</td>
                    <td className="table-cell">
                      {user.isProfileVerified ? (
                        <span className="badge-success">Verified</span>
                      ) : (
                        <button
                          onClick={() => verifyUser(user.id)}
                          className="text-sm text-saffron-600 hover:underline"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                    <td className="table-cell">
                      <select
                        value={user.status}
                        onChange={(e) => updateStatus(user.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * 20 + 1} to {Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-secondary text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
