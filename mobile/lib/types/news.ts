export type ReactionCode = 'LIKE' | 'NAMASTE' | 'THANKYOU' | 'CRYING' | 'HAPPY';

export interface NewsReaction {
  code: ReactionCode;
  emoji: string;
  label: string;
  count: number;
}

export interface NewsComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  parentCommentId?: string;
  replies?: NewsComment[];
  likesCount: number;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleGu?: string;
  summary: string;
  content: string;
  imageUrl?: string;
  category: 'spiritual' | 'community' | 'events' | 'education' | 'national' | 'breaking';
  author: string;
  publishedAt: string;
  isVerified: boolean;
  isBreaking?: boolean;
  reactions: NewsReaction[];
  commentsCount: number;
  sharesCount: number;
  userReaction?: ReactionCode;
}
