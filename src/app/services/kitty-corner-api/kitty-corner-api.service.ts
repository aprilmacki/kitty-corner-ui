import { Injectable } from '@angular/core';
import {KittyCornerApiClient} from './kitty-corner-api.client';
import {PostPageConfigModel, PostModel, toPostModel} from './models/post.model';
import {concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {GetPostsDto, PostDto} from './dtos/posts.dto';
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

  public createPost(body: string): Observable<PostModel> {
    return this.apiClient.createPost(body).pipe(
     concatMap((post: PostDto) => this.buildPostModel(post))
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

        const commentObservables: Observable<CommentModel>[] = getCommentsResults.comments.map(comment => this.buildCommentModel(postId, comment))
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

  postComment(postId: number, comment: string): Observable<CommentModel> {
    return this.apiClient.postComment(postId, comment).pipe(
      concatMap((commentDto: CommentDto) => {
        return this.buildCommentModel(postId, commentDto);
      })
    );
  }

  private buildPostModel(post: PostDto): Observable<PostModel> {
    return this.apiClient.getUserProfileCached(post.username).pipe(
      map((profile: UserProfileDto) => toPostModel(post, profile)));
  }

  private buildCommentModel(postId: number, comment: CommentDto): Observable<CommentModel> {
    return this.apiClient.getUserProfileCached(comment.username).pipe(
      map((profile: UserProfileDto) => {
        return {
          postId: postId,
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
    );
  }
}
