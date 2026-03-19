export type WorkoutType =
  | 'run'
  | 'lift'
  | 'swim'
  | 'yoga'
  | 'hiit'
  | 'cycle'
  | 'walk'
  | 'other';

export type PostVisibility = 'private' | 'friends' | 'public';

export type Post = {
  PK: string;
  SK: string;
  entity: 'POST';
  userId: string;
  createdAt: string;
  updatedAt: string;
  type?: WorkoutType;
  calories?: number;
  distanceMiles?: number; // I can translate to other units based off settings later
  durationMinutes?: number;
  imageUrl?: string;
  caption?: string;
  visibility: PostVisibility; // friends is default
  planId?: string;
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
