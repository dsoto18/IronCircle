import type { FeedPost } from '@/types';

export const mockFeedPosts: FeedPost[] = [
  {
    post: {
      PK: 'POST#post_001',
      SK: 'META',
      entity: 'POST',
      userId: 'user_001',
      postId: 'post_001',
      createdAt: '2026-03-18T07:15:00.000Z',
      updatedAt: '2026-03-18T07:15:00.000Z',
      type: 'Run',
      calories: 420,
      distance: 4.2,
      duration: 38,
      imageUrl:
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
      caption: 'Easy morning miles before class. Legs felt good today.',
      visibility: 'friends',
    },
    author: {
      userId: 'user_001',
      username: 'diegoruns',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      isVerified: false,
    },
    isLiked: false,
    likeCount: 12,
  },
  {
    post: {
      PK: 'POST#post_002',
      SK: 'META',
      entity: 'POST',
      userId: 'user_002',
      postId: 'post_002',
      createdAt: '2026-03-18T11:40:00.000Z',
      updatedAt: '2026-03-18T11:40:00.000Z',
      type: 'Lift',
      calories: 310,
      duration: 55,
      caption: 'Upper body day. Kept it simple and heavy.',
      visibility: 'public',
      planId: 'plan_101',
    },
    author: {
      userId: 'user_002',
      username: 'maya.fit',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
    },
    isLiked: true,
    likeCount: 48,
  },
  {
    post: {
      PK: 'POST#post_003',
      SK: 'META',
      entity: 'POST',
      userId: 'user_003',
      postId: 'post_003',
      createdAt: '2026-03-18T14:05:00.000Z',
      updatedAt: '2026-03-18T14:05:00.000Z',
      type: 'Yoga',
      duration: 30,
      imageUrl:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
      visibility: 'friends',
    },
    author: {
      userId: 'user_003',
      username: 'zenbyalina',
      isVerified: false,
    },
    isLiked: false,
    likeCount: 5,
  },
];
