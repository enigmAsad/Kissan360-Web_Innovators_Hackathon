import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import './PostCard.scss';

const PostCard = ({ post, onClick, showActions = false, onEdit, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="post-card" onClick={onClick}>
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
      </div>

      <div className="post-content">
        <h2>{post.title}</h2>
        <p>{truncateContent(post.content)}</p>
      </div>

      <div className="post-footer">
        <div className="comment-count">
          <CommentIcon />
          <span>View Discussion</span>
        </div>
      </div>

      {showActions && (
        <div className="post-actions" onClick={(e) => e.stopPropagation()}>
          <button className="edit-btn" onClick={onEdit}>
            Edit
          </button>
          <button className="delete-btn" onClick={onDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PostCard;

