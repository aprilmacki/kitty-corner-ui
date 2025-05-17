import {PostDto, ReactionDto} from '../../services/kitty-corner-api/dtos/posts.dto';
import * as util from '../util';
import {UserProfileDto} from '../../services/kitty-corner-api/dtos/user.dto';

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

export function toPostModel(post: PostDto, profile: UserProfileDto): PostModel {
  return {
    postId: post.postId,
    author: {
      profileName: profile.name,
      username: profile.username,
      profilePhotoUrl: `/assets/${profile.username}.png`
    },
    body: post.body,
    distanceKm: post.distanceKm,
    totalLikes: post.totalLikes,
    totalDislikes: post.totalDislikes,
    totalComments: post.totalComments,
    createdAt: util.fromEpochSeconds(post.createdAtEpochSeconds),
    updatedAt: post.updatedAtEpochSeconds != null ? util.fromEpochSeconds(post.updatedAtEpochSeconds) : null,
    myReaction: post.myReaction
  } as PostModel;
}

export interface PostPageConfigModel {
  startAge: number | null;
  endAge: number | null;
  distanceKm: number | null;
  limit: number;
  cursor: number | null;
  username: string | null;
}
