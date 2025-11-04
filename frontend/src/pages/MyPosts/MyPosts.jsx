import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import PostCard from '../../components/PostCard/PostCard';
import ArticleIcon from '@mui/icons-material/Article';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CreatePostModal from '../../components/CreatePostModal/CreatePostModal';
import './MyPosts.scss';
import { toast } from 'react-toastify';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/user');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch my posts:', err);
      if (err.response?.status === 404) {
        setPosts([]);
      } else {
        toast.error('Failed to load your posts');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post deleted successfully');
      fetchMyPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post');
    }
  };

  const handlePostCreated = () => {
    setIsModalOpen(false);
    fetchMyPosts();
    toast.success('Post created successfully!');
  };

  return (
    <div className="my-posts">
      <div className="page-header">
        <div>
          <h1>My Posts</h1>
          <p>Manage your forum contributions</p>
        </div>
        <button className="create-btn" onClick={() => setIsModalOpen(true)}>
          <AddCircleIcon />
          Create Post
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{posts.length}</span>
          <span className="stat-label">Total Posts</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your posts..." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<ArticleIcon />}
          message="You haven't created any posts yet. Start sharing with the community!"
          action={
            <button className="create-btn" onClick={() => setIsModalOpen(true)}>
              <AddCircleIcon />
              Create Your First Post
            </button>
          }
        />
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onClick={() => navigate(`/farmer-dashboard/forum/${post._id}`)}
              showActions={true}
              onDelete={() => handleDeletePost(post._id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
};

export default MyPosts;

