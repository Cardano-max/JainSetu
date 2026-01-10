import { useEffect, useState } from 'react';
import { BriefcaseIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  status: string;
  _count: { applications: number };
  createdAt: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/admin/all?limit=50');
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const approveJob = async (id: string) => {
    try {
      await api.put(`/jobs/${id}/approve`);
      toast.success('Job approved');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to approve job');
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return <span className="badge-success">Full Time</span>;
      case 'PART_TIME':
        return <span className="badge-info">Part Time</span>;
      case 'CONTRACT':
        return <span className="badge-warning">Contract</span>;
      case 'INTERNSHIP':
        return <span className="badge bg-purple-100 text-purple-800">Internship</span>;
      default:
        return <span className="badge-info">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <p className="text-gray-500">Manage job listings</p>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Job</th>
                <th className="table-header">Company</th>
                <th className="table-header">Location</th>
                <th className="table-header">Type</th>
                <th className="table-header">Applications</th>
                <th className="table-header">Status</th>
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
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(job.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{job.companyName}</td>
                    <td className="table-cell">{job.location}</td>
                    <td className="table-cell">{getTypeBadge(job.jobType)}</td>
                    <td className="table-cell">
                      <span className="font-medium text-saffron-600">
                        {job._count.applications}
                      </span>
                    </td>
                    <td className="table-cell">
                      {job.status === 'ACTIVE' ? (
                        <span className="badge-success">Active</span>
                      ) : job.status === 'PENDING_APPROVAL' ? (
                        <span className="badge-warning">Pending</span>
                      ) : (
                        <span className="badge-danger">{job.status}</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {job.status === 'PENDING_APPROVAL' ? (
                        <button
                          onClick={() => approveJob(job.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
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
