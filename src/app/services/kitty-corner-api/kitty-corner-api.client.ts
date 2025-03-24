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

  getUserProfile(username: string): Observable<UserProfileDto> {
    // TODO: Cache these
    return this.httpClient.get<UserProfileDto>(`/api/v1/users/${username}/profile`);
  }

  setPostReaction(postId: number, reaction: ReactionDto): Observable<any> {
    return this.httpClient.put(`/api/v1/posts/${postId}/my-reactions`, {
      type: reaction
    });
  }
}
