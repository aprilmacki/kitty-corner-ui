import {ReactionDto} from '../dtos/posts.dto';

export type PostModel = {
  postId: number;
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
  myReaction: ReactionDto | null;
}

export interface PageModel<Type> {
  items: Type[];
  nextCursor: number;
}

export interface PageConfigModel {
  startAge: number | null;
  endAge: number | null;
  distanceKm: number | null;
  limit: number;
  cursor: number | null;
}
