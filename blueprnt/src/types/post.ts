export type WorkoutType =
  | 'Run'
  | 'Lift'
  | 'Swim'
  | 'Yoga'
  | 'HIIT'
  | 'Cycle'
  | 'Walk'
  | 'Mobility'
  | 'Other';

export type PostVisibility = 'private' | 'friends' | 'public';

export type Post = {
  PK: string;
  SK: string;
  entity: 'POST';
  userId: string;
  createdAt: string;
  updatedAt?: string;
  type?: WorkoutType;
  calories?: string | number;
  distance?: string | number; // I can translate to other units based off settings later, for now Miles
  duration?: string | number; // in Minutes
  imageUrl?: string;
  caption?: string;
  visibility: PostVisibility; // friends is default
  planId?: string;
  postId: string;
};

export type FeedPostAuthor = {
  userId: string;
  username: string;
  profilePictureUrl?: string;
  isVerified: boolean;
};

export type FeedPost = {
  post: Post;
  author: FeedPostAuthor;
  isLiked?: boolean;
  likeCount?: number;
};
