import express from 'express'
import { verifyToken } from '../middleware/jwt.js'
import { createComment, listCommentsForPost, updateComment, deleteComment } from '../controllers/commentController.js'

const router = express.Router()

// List comments for a post (public)
router.get('/post/:postId', listCommentsForPost)

// Create comment for a post (auth)
router.post('/post/:postId', verifyToken, createComment)

// Update/delete own comment (auth; admin can moderate)
router.patch('/:id', verifyToken, updateComment)
router.delete('/:id', verifyToken, deleteComment)

export default router

