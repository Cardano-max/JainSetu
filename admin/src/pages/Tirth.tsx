import { useEffect, useState } from 'react';
import { PlusIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Tirth {
  id: string;
  name: string;
  address: string;
  state: string;
  hasDharamshala: boolean;
  isVerified: boolean;
  isActive: boolean;
  city: { name: string };
  _count: { rooms: number };
}

export default function TirthPage() {
  const [tirths, setTirths] = useState<Tirth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTirths();
  }, []);

  const fetchTirths = async () => {
    try {
      const response = await api.get('/tirth?limit=50');
      setTirths(response.data.tirths);
    } catch (error) {
      toast.error('Failed to fetch tirths');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tirth & Dharamshala</h1>
          <p className="text-gray-500">Manage pilgrimage sites and accommodations</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Tirth
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
          </div>
        ) : tirths.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No tirths found
          </div>
        ) : (
          tirths.map((tirth) => (
            <div key={tirth.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex gap-2">
                  {tirth.isVerified && <span className="badge-success">Verified</span>}
                  {tirth.hasDharamshala && <span className="badge-info">Dharamshala</span>}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{tirth.name}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {tirth.city?.name}, {tirth.state}
              </p>
              {tirth.hasDharamshala && (
                <p className="text-sm text-amber-600 font-medium mb-3">
                  {tirth._count.rooms} room types available
                </p>
              )}
              <div className="pt-4 border-t flex gap-2">
                <button className="btn-secondary flex-1 text-sm">View Bookings</button>
                <button className="btn-primary flex-1 text-sm">Edit</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
