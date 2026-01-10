import { useEffect, useState } from 'react';
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Event {
  id: string;
  title: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: string;
  city: { name: string };
  _count: { registrations: number };
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events?limit=50');
      setEvents(response.data.events);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="badge-success">Published</span>;
      case 'DRAFT':
        return <span className="badge-warning">Draft</span>;
      case 'COMPLETED':
        return <span className="badge-info">Completed</span>;
      case 'CANCELLED':
        return <span className="badge-danger">Cancelled</span>;
      default:
        return <span className="badge-info">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500">Manage community events</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No events found
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-saffron-100 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-saffron-600" />
                </div>
                {getStatusBadge(event.status)}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{event.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{event.venue}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {format(new Date(event.startDate), 'MMM d, yyyy')}
                </span>
                <span className="text-saffron-600 font-medium">
                  {event._count.registrations} registered
                </span>
              </div>
              <div className="mt-4 pt-4 border-t flex gap-2">
                <button className="btn-secondary flex-1 text-sm">View</button>
                <button className="btn-primary flex-1 text-sm">Edit</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
