import { Injectable } from '@angular/core';
import {KittyCornerApiClient} from './kitty-corner-api.client';
import {PostPageConfigModel, PostModel} from './models/post.model';
import {concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {GetPostsDto, PostDto, ReactionDto} from './dtos/posts.dto';
import {UserProfileDto} from './dtos/user.dto';
import * as util from '../../common/util';
import {CommentDto, CommentPageConfigModel, GetCommentsDto} from './dtos/comments.dto';
import {CommentModel} from './models/comment.model';
import {PageModel} from './models/common.model';

@Injectable({
  providedIn: 'root'
})
export class KittyCornerApiService {
  constructor(private apiClient: KittyCornerApiClient) { }

  public getPost(postId: number): Observable<PostModel> {
    return this.apiClient.getPost(postId).pipe(
      concatMap((post: PostDto) => {
        return this.buildPostModel(post);
      })
    );
  }

  public getComments(postId: number, pageConfig: CommentPageConfigModel): Observable<PageModel<CommentModel>> {
    return this.apiClient.getComments(postId, pageConfig).pipe(
      concatMap((getCommentsResults: GetCommentsDto) => {

        if (getCommentsResults.comments.length === 0) {
          return of({
            items: [],
            nextCursor: getCommentsResults.nextCursor
          } as PageModel<CommentModel>);
        }

        const commentObservables: Observable<CommentModel>[] = getCommentsResults.comments.map(comment => this.buildCommentModel(comment))
        return forkJoin(commentObservables).pipe(
          map((comments: CommentModel[]) => {
            return {
              items: comments,
              nextCursor: getCommentsResults.nextCursor
            } as PageModel<CommentModel>;
          })
        );
      })
    )
  }

  public getPosts(pageConfig: PostPageConfigModel): Observable<PageModel<PostModel>> {
    return this.apiClient.getPosts(pageConfig).pipe(
      concatMap((getPostsResults: GetPostsDto) => {

        // This is necessary otherwise we stuck waiting for no observables
        if (getPostsResults.posts.length === 0) {
          return of({
            items: [],
            nextCursor: getPostsResults.nextCursor
          } as PageModel<PostModel>);
        }

        const postsObservables: Observable<PostModel>[] = getPostsResults.posts.map(post => this.buildPostModel(post));
        return forkJoin(postsObservables).pipe(
          map((posts: PostModel[]) => {
            return {
              items: posts,
              nextCursor: getPostsResults.nextCursor
            } as PageModel<PostModel>;
          })
        );
      })
    );
  }

  private buildPostModel(post: PostDto): Observable<PostModel> {
    return this.apiClient.getUserProfileCached(post.username).pipe(
      map((profile: UserProfileDto) => {
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
      }));
  }

  private buildCommentModel(comment: CommentDto): Observable<CommentModel> {
    return this.apiClient.getUserProfileCached(comment.username).pipe(
      map((profile: UserProfileDto) => {
        return {
          author: {
            profileName: profile.name,
            username: profile.username,
            profilePhotoUrl: `/assets/${profile.username}.png`
          },
          commentId: comment.commentId,
          username: comment.username,
          body: comment.body,
          totalLikes: comment.totalLikes,
          totalDislikes: comment.totalDislikes,
          createdAt: util.fromEpochSeconds(comment.createdAtEpochSeconds),
          updatedAt: comment.updatedAtEpochSeconds != null ? util.fromEpochSeconds(comment.updatedAtEpochSeconds) : null,
          myReaction: comment.myReaction
        } as CommentModel;
      })
    )
  }
}
