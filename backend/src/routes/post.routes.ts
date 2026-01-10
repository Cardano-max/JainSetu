import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createPostSchema, commentSchema } from '../schemas/post.schema.js';

const router = Router();
const postController = new PostController();

// Public routes
router.get('/', optionalAuth, postController.getPosts);
router.get('/:id', optionalAuth, postController.getPostById);
router.get('/:id/comments', optionalAuth, postController.getComments);

// Authenticated routes
router.post('/', authenticate, validateBody(createPostSchema), postController.createPost);
router.put('/:id', authenticate, validateBody(createPostSchema), postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

// Comments
router.post('/:id/comments', authenticate, validateBody(commentSchema), postController.addComment);
router.delete('/comments/:commentId', authenticate, postController.deleteComment);

// Reactions
router.post('/:id/like', authenticate, postController.toggleLike);

// My posts
router.get('/my/posts', authenticate, postController.getMyPosts);

// Admin routes
router.get('/admin/pending', authenticate, requireAdmin, postController.getPendingPosts);
router.put('/:id/approve', authenticate, requireAdmin, postController.approvePost);
router.put('/:id/reject', authenticate, requireAdmin, postController.rejectPost);
router.put('/:id/pin', authenticate, requireAdmin, postController.togglePin);

export default router;
