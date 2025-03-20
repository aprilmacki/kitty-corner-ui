
export type Reaction = 'like' | 'dislike';

export type PostModel = {
  authorProfileName: string;
  authorUsername: string;
  authorProfilePhotoUrl: string;
  body: string;
  distanceKm: number;
  totalThumbsUp: number;
  totalThumbsDown: number;
  totalComments: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  myReaction: Reaction | null;
}
