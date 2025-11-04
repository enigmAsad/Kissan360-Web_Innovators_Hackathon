import Comment from '../models/comment.model.js'
import Post from '../models/post.model.js'

export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'content is required' });
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const comment = await Comment.create({ post: postId, content, author: req.userId });
        res.status(201).json({ message: 'Comment added', comment });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add comment', error: err.message });
    }
}

export const listCommentsForPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId).select('_id');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const comments = await Comment.find({ post: postId }).populate('author', 'name').sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
    }
}

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'content is required' });
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.author.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        comment.content = content;
        await comment.save();
        res.json({ message: 'Comment updated', comment });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update comment', error: err.message });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.author.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Comment.findByIdAndDelete(id);
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete comment', error: err.message });
    }
}

