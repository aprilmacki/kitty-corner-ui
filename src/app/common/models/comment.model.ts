import {ReactionDto} from '../../services/kitty-corner-api/dtos/posts.dto';

export type CommentModel = {
  postId: number,
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
