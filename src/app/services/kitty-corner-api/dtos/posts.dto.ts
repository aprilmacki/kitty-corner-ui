
export type Reaction = 'like' | 'dislike';

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
  myReaction: Reaction | null;
}

export interface GetPostsDto {
  posts: PostDto[];
  nextCursor: number;
}
