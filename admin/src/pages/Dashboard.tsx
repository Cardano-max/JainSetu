import { useEffect, useState } from 'react';
import {
  UsersIcon,
  CalendarIcon,
  HeartIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

interface DashboardData {
  stats: {
    totalUsers: number;
    newUsersToday: number;
    totalEvents: number;
    upcomingEvents: number;
    totalDonations: number;
    donationsThisMonth: number;
    totalBusinesses: number;
    pendingApprovals: number;
  };
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }>;
  recentDonations: Array<{
    id: string;
    donorName: string;
    amount: number;
    createdAt: string;
    cause: { title: string };
  }>;
}

const chartData = [
  { name: 'Mon', users: 40, donations: 2400 },
  { name: 'Tue', users: 30, donations: 1398 },
  { name: 'Wed', users: 20, donations: 9800 },
  { name: 'Thu', users: 27, donations: 3908 },
  { name: 'Fri', users: 18, donations: 4800 },
  { name: 'Sat', users: 23, donations: 3800 },
  { name: 'Sun', users: 34, donations: 4300 },
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setData(response.data.dashboard);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    newUsersToday: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalDonations: 0,
    donationsThisMonth: 0,
    totalBusinesses: 0,
    pendingApprovals: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with JainSetu.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-green-600">+{stats.newUsersToday} today</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(stats.totalDonations / 100000).toFixed(1)}L
              </p>
              <p className="text-sm text-green-600">
                ₹{(stats.donationsThisMonth / 1000).toFixed(0)}K this month
              </p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-sm text-saffron-600">{stats.upcomingEvents} upcoming</p>
            </div>
            <div className="w-12 h-12 bg-saffron-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-saffron-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Businesses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</p>
              <p className="text-sm text-yellow-600">{stats.pendingApprovals} pending</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BuildingStorefrontIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#f97316"
                fill="#fed7aa"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donations</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="donations"
                stroke="#ec4899"
                fill="#fce7f3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-4">
            {data?.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-medium text-gray-600">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!data?.recentUsers || data.recentUsers.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h3>
          <div className="space-y-4">
            {data?.recentDonations.map((donation) => (
              <div key={donation.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{donation.donorName}</p>
                  <p className="text-sm text-gray-500">{donation.cause.title}</p>
                </div>
                <p className="font-semibold text-green-600">₹{donation.amount}</p>
              </div>
            ))}
            {(!data?.recentDonations || data.recentDonations.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent donations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
