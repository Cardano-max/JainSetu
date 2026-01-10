import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreatePostInput, CommentInput } from '../schemas/post.schema.js';

export class PostController {
  // Get Posts
  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '20', category, search } = req.query;

      const where: any = { status: 'PUBLISHED' };

      if (category) where.category = category;

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { content: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
            _count: { select: { comments: true } },
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.post.count({ where }),
      ]);

      res.json({
        success: true,
        posts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Post by ID
  getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
          _count: { select: { comments: true } },
        },
      });

      if (!post) {
        throw new AppError('Post not found', 404);
      }

      // Increment view count
      await prisma.post.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      res.json({ success: true, post });
    } catch (error) {
      next(error);
    }
  };

  // Get Comments
  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: { postId: id, parentId: null },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePhoto: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.comment.count({ where: { postId: id, parentId: null } }),
      ]);

      res.json({
        success: true,
        comments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Create Post
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = req.body as CreatePostInput;

      const post = await prisma.post.create({
        data: {
          authorId: userId,
          ...data,
          status: 'PENDING_REVIEW',
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
      });

      res.status(201).json({ success: true, post });
    } catch (error) {
      next(error);
    }
  };

  // Update Post
  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = req.body as CreatePostInput;

      const existing = await prisma.post.findFirst({
        where: { id, authorId: userId },
      });

      if (!existing) {
        throw new AppError('Post not found', 404);
      }

      const post = await prisma.post.update({
        where: { id },
        data,
      });

      res.json({ success: true, post });
    } catch (error) {
      next(error);
    }
  };

  // Delete Post
  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const existing = await prisma.post.findFirst({
        where: { id, authorId: userId },
      });

      if (!existing) {
        throw new AppError('Post not found', 404);
      }

      await prisma.post.delete({ where: { id } });

      res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Add Comment
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = req.body as CommentInput;

      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        throw new AppError('Post not found', 404);
      }

      const comment = await prisma.comment.create({
        data: {
          postId: id,
          authorId: userId,
          content: data.content,
          parentId: data.parentId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
      });

      // Notify post author
      if (post.authorId !== userId) {
        const commenter = await prisma.user.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true },
        });

        await prisma.notification.create({
          data: {
            userId: post.authorId,
            title: 'New Comment',
            body: `${commenter?.firstName} commented on your post`,
            type: 'post_comment',
            entityType: 'post',
            entityId: id,
          },
        });
      }

      res.status(201).json({ success: true, comment });
    } catch (error) {
      next(error);
    }
  };

  // Delete Comment
  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;

      const comment = await prisma.comment.findFirst({
        where: { id: commentId, authorId: userId },
      });

      if (!comment) {
        throw new AppError('Comment not found', 404);
      }

      await prisma.comment.delete({ where: { id: commentId } });

      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Toggle Like
  toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // For simplicity, just increment/decrement
      // In production, use a separate likes table
      const post = await prisma.post.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });

      res.json({ success: true, likeCount: post.likeCount });
    } catch (error) {
      next(error);
    }
  };

  // Get My Posts
  getMyPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const posts = await prisma.post.findMany({
        where: { authorId: userId },
        include: { _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, posts });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get Pending Posts
  getPendingPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await prisma.post.findMany({
        where: { status: 'PENDING_REVIEW' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, posts });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Approve Post
  approvePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const post = await prisma.post.update({
        where: { id },
        data: { status: 'PUBLISHED' },
      });

      await prisma.notification.create({
        data: {
          userId: post.authorId,
          title: 'Post Approved',
          body: 'Your post has been approved and is now visible.',
          type: 'post_approved',
          entityType: 'post',
          entityId: id,
        },
      });

      res.json({ success: true, post });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Reject Post
  rejectPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const post = await prisma.post.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      await prisma.notification.create({
        data: {
          userId: post.authorId,
          title: 'Post Rejected',
          body: `Your post was not approved. ${reason || ''}`,
          type: 'post_rejected',
          entityType: 'post',
          entityId: id,
        },
      });

      res.json({ success: true, post });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Toggle Pin
  togglePin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        throw new AppError('Post not found', 404);
      }

      const updated = await prisma.post.update({
        where: { id },
        data: { isPinned: !post.isPinned },
      });

      res.json({ success: true, post: updated });
    } catch (error) {
      next(error);
    }
  };
}
