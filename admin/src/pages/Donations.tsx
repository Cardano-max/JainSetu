import { useEffect, useState } from 'react';
import { PlusIcon, HeartIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface DonationCause {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  isActive: boolean;
  isVerified: boolean;
}

export default function Donations() {
  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCauses();
  }, []);

  const fetchCauses = async () => {
    try {
      const response = await api.get('/donations/causes?limit=50');
      setCauses(response.data.causes);
    } catch (error) {
      toast.error('Failed to fetch causes');
    } finally {
      setLoading(false);
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
          <p className="text-gray-500">Manage donation causes</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Cause
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
          </div>
        ) : causes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No donation causes found
          </div>
        ) : (
          causes.map((cause) => (
            <div key={cause.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex gap-2">
                  {cause.isVerified && <span className="badge-success">Verified</span>}
                  {cause.isActive ? (
                    <span className="badge-success">Active</span>
                  ) : (
                    <span className="badge-danger">Inactive</span>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{cause.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cause.description}</p>

              {cause.targetAmount > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">
                      {getProgress(cause.raisedAmount, cause.targetAmount).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-saffron-500 rounded-full"
                      style={{ width: `${getProgress(cause.raisedAmount, cause.targetAmount)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">₹{cause.raisedAmount.toLocaleString()}</span>
                    <span className="text-gray-500">₹{cause.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex gap-2">
                <button className="btn-secondary flex-1 text-sm">View Donations</button>
                <button className="btn-primary flex-1 text-sm">Edit</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
