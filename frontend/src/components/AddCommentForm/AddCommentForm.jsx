import React, { useState } from 'react';
import api from '../../utils/api';
import SendIcon from '@mui/icons-material/Send';
import './AddCommentForm.scss';
import { toast } from 'react-toastify';

const AddCommentForm = ({ postId, onSuccess }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.warning('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/comments/post/${postId}`, { content });
      setContent('');
      onSuccess();
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-comment-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
        required
      />
      <button type="submit" disabled={loading}>
        <SendIcon />
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
};

export default AddCommentForm;

