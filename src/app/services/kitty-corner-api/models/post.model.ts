
export type Reaction = 'like' | 'dislike';

export type PostModel = {
  author: {
    profileName: string;
    username: string;
    profilePhotoUrl: string;
  }
  body: string;
  distanceKm: number;
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  myReaction: Reaction | null;
}

export interface PageModel<Type> {
  items: Type[];
  nextCursor: number;
}

export interface PageConfigModel {
  startAge: number | null;
  endAge: number | null;
  radiusKm: number | null;
  limit: number;
  cursor: number;
}
