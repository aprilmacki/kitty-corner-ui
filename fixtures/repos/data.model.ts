import {PostDto, ReactionDto} from '../../src/app/services/kitty-corner-api/dtos/posts.dto';
import {UserProfileDto} from '../../src/app/services/kitty-corner-api/dtos/user.dto';
import {CommentDto} from '../../src/app/services/kitty-corner-api/dtos/comments.dto';

export type TokenChainModel = {
  username: string;
  chainId: number;
  refreshTokenId: string;
}

export interface CommentJson {
  commentId: number;
  username: string;
  body: string;
  totalLikes: number;
  totalDislikes: number;
  createdAt: string;
  updatedAt: string | null;
  myReaction: ReactionDto | null;
}

export function toCommentDto(json: CommentJson): CommentDto {
  return {
    commentId: json.commentId,
    username: json.username,
    body: json.body,
    totalLikes: json.totalLikes,
    totalDislikes: json.totalDislikes,
    createdAtEpochSeconds: new Date(json.createdAt).getTime() / 1000,
    updatedAtEpochSeconds: json.updatedAt == null ? null : new Date(json.updatedAt).getTime() / 1000,
    myReaction: json.myReaction
  } as CommentDto;
}

export interface PostJson {
  postId: number;
  username: string;
  body: string;
  distanceKm: number;
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
  createdAt: string;
  updatedAt: string | null;
  myReaction: ReactionDto | null;
}

export function toPostDto(json: PostJson): PostDto {
  return {
    postId: json.postId,
    username: json.username,
    body: json.body,
    distanceKm: json.distanceKm,
    totalLikes: json.totalLikes,
    totalDislikes: json.totalDislikes,
    totalComments: json.totalComments,
    createdAtEpochSeconds: new Date(json.createdAt).getTime() / 1000,
    updatedAtEpochSeconds: null,
    myReaction: json.myReaction
  } as PostDto;
}

export interface UserProfileJson {
  email: string,
  username: string;
  name: string;
  pronouns: string;
  age: number;
  birthday?: string
  joinedAt: string;
  totalPosts: number;
  password: string;
}

export function toUserProfileDto(json: UserProfileJson): UserProfileDto {
  return {
    username: json.username,
    name: json.name,
    pronouns: json.pronouns,
    age: json.age,
    joinedAtEpochSeconds: new Date(json.joinedAt).getTime() / 1000,
    totalPosts: json.totalPosts,
    birthday: json.birthday
  } as UserProfileDto;
}
