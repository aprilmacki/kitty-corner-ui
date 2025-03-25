import {ReactionDto} from '../dtos/posts.dto';

export type CommentModel = {
  author: {
    profileName: string;
    username: string;
    profilePhotoUrl: string;
  }
  commentId: number;
  username: string;
  body: string;
  totalLikes: number;
  totalDislikes: number;
  createdAt: Date;
  updatedAt: Date;
  myReaction: ReactionDto;
}
