import { Injectable } from '@angular/core';
import {Observable, } from 'rxjs';
import {GetPostsDto, ReactionDto} from './dtos/posts.dto';
import {UserProfileDto} from './dtos/user.dto';
import {PageConfigModel} from './models/post.model';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KittyCornerApiClient {

  constructor(private httpClient: HttpClient) { }

  public getPosts(pageConfig: PageConfigModel): Observable<GetPostsDto> {
    const params: HttpParams = new HttpParams();
    if (pageConfig.startAge != null) {
      params.set('startAge', pageConfig.startAge);
    }
    if (pageConfig.endAge != null) {
      params.set('endAge', pageConfig.endAge);
    }
    if (pageConfig.radiusKm != null) {
      params.set('radiusKm', pageConfig.radiusKm);
    }
    if (pageConfig.cursor != null) {
      params.set('cursor', pageConfig.cursor);
    }
    params.set('limit', pageConfig.limit);

    return this.httpClient.get<GetPostsDto>('/api/posts', {params});
  }

  getUserProfile(username: string): Observable<UserProfileDto> {
    return this.httpClient.get<UserProfileDto>(`/api/users/${username}/profile`);
  }

  setPostReaction(postId: number, reaction: ReactionDto): Observable<any> {
    return this.httpClient.put(`/api/posts/${postId}/my-reactions`, {
      type: reaction
    });
  }
}
