import { useEffect, useState } from 'react';
import { PlusIcon, CalendarIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Event {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  venue: string;
  address: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  organizerName: string;
  isRegistrationRequired: boolean;
  registrationFee: number;
  maxAttendees?: number;
  status: string;
  isPublic: boolean;
  city?: { name: string };
  _count?: { registrations: number };
}

interface EventForm {
  title: string;
  description: string;
  shortDescription: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  organizerName: string;
  isRegistrationRequired: boolean;
  registrationFee: number;
  maxAttendees: number;
  status: string;
  isPublic: boolean;
}

const initialFormState: EventForm = {
  title: '',
  description: '',
  shortDescription: '',
  venue: '',
  address: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  organizerName: '',
  isRegistrationRequired: false,
  registrationFee: 0,
  maxAttendees: 0,
  status: 'DRAFT',
  isPublic: true,
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      let url = '/events?limit=100';
      if (filter !== 'all') url += `&status=${filter}`;
      const response = await api.get(url);
      setEvents(response.data.events || []);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      ...initialFormState,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });
    setShowModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      shortDescription: event.shortDescription || '',
      venue: event.venue,
      address: event.address,
      startDate: event.startDate ? format(new Date(event.startDate), 'yyyy-MM-dd') : '',
      endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      organizerName: event.organizerName,
      isRegistrationRequired: event.isRegistrationRequired,
      registrationFee: event.registrationFee,
      maxAttendees: event.maxAttendees || 0,
      status: event.status,
      isPublic: event.isPublic,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.venue || !formData.startDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        maxAttendees: formData.maxAttendees || null,
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload);
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', payload);
        toast.success('Event created successfully');
      }
      closeModal();
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const updateStatus = async (event: Event, newStatus: string) => {
    try {
      await api.put(`/events/${event.id}`, { status: newStatus });
      toast.success(`Event ${newStatus.toLowerCase()}`);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'badge-success';
      case 'DRAFT':
        return 'badge-warning';
      case 'CANCELLED':
        return 'badge-danger';
      case 'COMPLETED':
        return 'badge-info';
      default:
        return 'badge';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500">Manage community events and registrations</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Events</option>
            <option value="DRAFT">Drafts</option>
            <option value="PUBLISHED">Published</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Create Event
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="card text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-saffron-600 mx-auto"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No events found. Click "Create Event" to add one.
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-saffron-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-7 h-7 text-saffron-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <span className={getStatusBadge(event.status)}>{event.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {event.venue} • {event.city?.name || event.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                        {event.startTime && ` at ${event.startTime}`}
                      </span>
                      {event._count?.registrations !== undefined && (
                        <span>{event._count.registrations} registrations</span>
                      )}
                      {event.registrationFee > 0 && (
                        <span>₹{event.registrationFee} fee</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.status === 'DRAFT' && (
                    <button
                      onClick={() => updateStatus(event, 'PUBLISHED')}
                      className="btn-primary text-sm py-1.5"
                    >
                      Publish
                    </button>
                  )}
                  {event.status === 'PUBLISHED' && (
                    <button
                      onClick={() => updateStatus(event, 'COMPLETED')}
                      className="btn-secondary text-sm py-1.5"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(event)}
                    className="p-2 text-gray-500 hover:text-saffron-600 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
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
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Event Title *</label>
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
                  <label className="label">Full Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Venue *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Time</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., 10:00 AM"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">End Time</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., 2:00 PM"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Registration Fee (₹)</label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      value={formData.registrationFee}
                      onChange={(e) => setFormData({ ...formData, registrationFee: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label">Max Attendees</label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({ ...formData, maxAttendees: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isRegistrationRequired}
                      onChange={(e) => setFormData({ ...formData, isRegistrationRequired: e.target.checked })}
                      className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
                    />
                    <span className="text-sm">Registration Required</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
                    />
                    <span className="text-sm">Public Event</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
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
