import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(5000),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
