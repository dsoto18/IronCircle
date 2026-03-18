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
  distanceMiles?: number;
  durationMinutes?: number;
  imageUrl?: string;
  caption?: string;
  visibility: PostVisibility;
  planId?: string;
};
