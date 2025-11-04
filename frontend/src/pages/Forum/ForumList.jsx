import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import PostCard from '../../components/PostCard/PostCard';
import CreatePostModal from '../../components/CreatePostModal/CreatePostModal';
import ForumIcon from '@mui/icons-material/Forum';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import './ForumList.scss';
import { toast } from 'react-toastify';

const ForumList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/getPost');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setIsModalOpen(false);
    fetchPosts();
    toast.success('Post created successfully!');
  };

  return (
    <div className="forum-list">
      <div className="page-header">
        <div>
          <h1>Community Forum</h1>
          <p>Connect and share knowledge with fellow farmers</p>
        </div>
        <button className="create-btn" onClick={() => setIsModalOpen(true)}>
          <AddCircleIcon />
          Create Post
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading forum posts..." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<ForumIcon />}
          message="No posts yet. Be the first to start a discussion!"
          action={
            <button className="create-btn" onClick={() => setIsModalOpen(true)}>
              <AddCircleIcon />
              Create Post
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

export default ForumList;

