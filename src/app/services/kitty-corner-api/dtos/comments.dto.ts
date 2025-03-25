import {ReactionDto} from './posts.dto';

export interface GetCommentsDto {
  comments: CommentDto[];
  nextCursor: number;
}

export interface CommentDto {
  commentId: number;
  username: string;
  body: string;
  totalLikes: number;
  totalDislikes: number;
  createdAtEpochSeconds: number;
  updatedAtEpochSeconds: number;
  myReaction: ReactionDto | null;
}

export interface CommentPageConfigModel {
  limit: number;
  cursor: number | null;
}
