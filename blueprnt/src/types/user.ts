export type EntityType = 'USER' | 'POST' | 'PLAN';

export type User = {
  PK: string;
  SK: string;
  entity: 'USER';
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  bio?: string;
  profilePictureUrl?: string;
};
