
export type ReactionDto = 'like' | 'dislike' | null;

export interface PostDto {
  postId: number;
  username: string;
  body: string;
  distanceKm: number;
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
  createdAtEpochSeconds: number;
  updatedAtEpochSeconds: number | null;
  myReaction: ReactionDto | null;
}

export interface GetPostsDto {
  posts: PostDto[];
  nextCursor: number;
}
