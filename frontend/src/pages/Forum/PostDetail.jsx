import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CommentCard from '../../components/CommentCard/CommentCard';
import AddCommentForm from '../../components/AddCommentForm/AddCommentForm';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './PostDetail.scss';
import { toast } from 'react-toastify';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      toast.error('Failed to load post');
      navigate('/farmer-dashboard/forum');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/post/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted successfully');
      navigate('/farmer-dashboard/forum');
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post');
    }
  };

  const handleCommentAdded = () => {
    fetchComments();
    toast.success('Comment added successfully!');
  };

  const handleCommentDeleted = () => {
    fetchComments();
    toast.success('Comment deleted successfully!');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading post..." />;
  }

  if (!post) {
    return null;
  }

  const isAuthor = user && post.author && (post.author._id === user.id || post.author === user.id);

  return (
    <div className="post-detail">
      <button className="back-btn" onClick={() => navigate('/farmer-dashboard/forum')}>
        <ArrowBackIcon />
        Back to Forum
      </button>

      <div className="post-content-wrapper">
        <div className="post-header">
          <div className="author-info">
            <div className="author-avatar">
              <PersonIcon />
            </div>
            <div>
              <h3>{post.author?.name || post.author?.username || 'Unknown User'}</h3>
              <div className="post-meta">
                <AccessTimeIcon />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {isAuthor && (
            <div className="post-actions">
              <button className="delete-btn" onClick={handleDeletePost}>
                <DeleteIcon />
                Delete
              </button>
            </div>
          )}
        </div>

        <h1 className="post-title">{post.title}</h1>
        <p className="post-content">{post.content}</p>
      </div>

      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>

        <AddCommentForm postId={id} onSuccess={handleCommentAdded} />

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                currentUserId={user?.id}
                onDelete={handleCommentDeleted}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

