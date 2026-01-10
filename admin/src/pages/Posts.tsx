import { useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  isPinned: boolean;
  author: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts/admin/pending');
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const approvePost = async (id: string) => {
    try {
      await api.put(`/posts/${id}/approve`);
      toast.success('Post approved');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to approve post');
    }
  };

  const rejectPost = async (id: string) => {
    try {
      await api.put(`/posts/${id}/reject`);
      toast.success('Post rejected');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to reject post');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <p className="text-gray-500">Review and moderate community posts</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <NewspaperIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No pending posts to review</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-medium text-gray-600">
                      {post.author.firstName[0]}{post.author.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {post.author.firstName} {post.author.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <span className="badge-warning">Pending Review</span>
              </div>

              {post.title && (
                <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
              )}
              <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => approvePost(post.id)}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckIcon className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => rejectPost(post.id)}
                  className="btn-danger flex items-center gap-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
