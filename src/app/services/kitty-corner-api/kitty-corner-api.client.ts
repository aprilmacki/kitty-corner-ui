import { Injectable } from '@angular/core';
import {firstValueFrom, Observable, of,} from 'rxjs';
import {GetPostsDto, PostDto, ReactionDto} from './dtos/posts.dto';
import {UserProfileDto} from './dtos/user.dto';
import {PostPageConfigModel} from './models/post.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataCache} from '../../common/data-cache';
import {CommentPageConfigModel, GetCommentsDto} from './dtos/comments.dto';

@Injectable({
  providedIn: 'root'
})
export class KittyCornerApiClient {
  private readonly userProfileCache: DataCache<string, UserProfileDto> = new DataCache((username: string) => {
    return firstValueFrom(this.getUserProfile(username));
  });

  constructor(private httpClient: HttpClient) {
  }

  getPost(postId: number): Observable<PostDto> {
    return this.httpClient.get<PostDto>(`/api/v1/posts/${postId}`);
  }

  getPosts(pageConfig: PostPageConfigModel): Observable<GetPostsDto> {
    let params: HttpParams = new HttpParams();
    if (pageConfig.startAge != null) {
      params = params.set('startAge', pageConfig.startAge);
    }
    if (pageConfig.endAge != null) {
      params = params.set('endAge', pageConfig.endAge);
    }
    if (pageConfig.distanceKm != null) {
      params = params.set('distanceKm', pageConfig.distanceKm);
    }
    if (pageConfig.cursor != null) {
      params = params.set('cursor', pageConfig.cursor);
    }
    params = params.set('limit', pageConfig.limit);

    return this.httpClient.get<GetPostsDto>('/api/v1/posts', {params: params});
  }

  getUserProfileCached(username: string): Observable<UserProfileDto> {
    return this.userProfileCache.get(username);
  }

  getUserProfile(username: string): Observable<UserProfileDto> {
    return this.httpClient.get<UserProfileDto>(`/api/v1/users/${username}/profile`);
  }

  setPostReaction(postId: number, reaction: ReactionDto): Observable<any> {
    return this.httpClient.put(`/api/v1/posts/${postId}/my-reactions`, {
      type: reaction
    });
  }

  setCommentReaction(postId: number, commentId: number, reaction: ReactionDto): Observable<any> {
    return this.httpClient.put(`/api/v1/posts/${postId}/comments/${commentId}/my-reactions`, {
      type: reaction
    });
  }

  getComments(postId: number, pageConfig: CommentPageConfigModel): Observable<GetCommentsDto> {
    // TODO: Make comments API docs paginated

    let params: HttpParams = new HttpParams();
    if (pageConfig.cursor != null) {
      params = params.set('cursor', pageConfig.cursor);
    }
    params = params.set('limit', pageConfig.limit);

    return this.httpClient.get<GetCommentsDto>(`/api/v1/posts/${postId}/comments`, {params: params});
  }

  postComment(postId: number, comment: string): Observable<any> {
    return this.httpClient.post(`/api/v1/posts/${postId}/comments`, {
      body: comment
    });
  }
}
