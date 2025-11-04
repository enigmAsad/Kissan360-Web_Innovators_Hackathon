import React from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import './CommentCard.scss';

const CommentCard = ({ comment, currentUserId, onDelete }) => {
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/api/comments/${comment._id}`);
      onDelete();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAuthor = user && comment.author && (comment.author._id === user.id || comment.author === user.id);

  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="author-info">
          <div className="author-avatar">
            <PersonIcon />
          </div>
          <div>
            <h4>{comment.author?.name || comment.author?.username || 'Unknown User'}</h4>
            <div className="comment-meta">
              <AccessTimeIcon />
              <span>{formatDate(comment.createdAt)}</span>
            </div>
          </div>
        </div>

        {isAuthor && (
          <button className="delete-btn" onClick={handleDelete}>
            <DeleteIcon />
          </button>
        )}
      </div>

      <p className="comment-content">{comment.content}</p>
    </div>
  );
};

export default CommentCard;

