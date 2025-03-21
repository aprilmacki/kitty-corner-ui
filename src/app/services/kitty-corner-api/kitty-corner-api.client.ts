import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {GetPostsDto, PostDto} from './dtos/posts.dto';
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
    if (username === 'aprilmack') {
      return of({
        username: 'aprilmack',
        name: 'April',
        pronouns: 'she/her',
        age: 27,
        location: 'Chicago, IL',
        joinedAtEpochSeconds: new Date('2025-02-01T08:30-06:00').getSeconds(),
        totalPosts: 1
      } as UserProfileDto)
    } else if (username === 'minathecat') {
      return of({
        username: 'minathecat',
        name: 'Mina',
        pronouns: 'she/her',
        age: 4,
        location: 'Chicago, IL',
        joinedAtEpochSeconds: new Date('2025-01-23T09:32-06:00').getSeconds(),
        totalPosts: 154
      } as UserProfileDto);
    } else if (username === 'tequila_sunset') {
      return of({
        username: 'tequila_sunset',
        name: 'Harry',
        pronouns: 'he/him',
        age: 42,
        location: 'Revachol, Le Caillou',
        joinedAtEpochSeconds: new Date('2025-01-25T14:02-06:00').getSeconds(),
        totalPosts: 2
      } as UserProfileDto);
    } else if (username === 'misato') {
      return of({
        username: 'misato',
        name: 'Misato',
        pronouns: 'she/her',
        age: 29,
        location: 'Tokyo 3',
        joinedAtEpochSeconds: new Date('2025-01-04T18:24-06:00').getSeconds(),
        totalPosts: 1
      })
    } else if (username === 'vincent_van_dough') {
      return of({
        username: 'vincent_van_dough',
        name: 'Kenny',
        pronouns: 'they/them',
        age: 32,
        location: 'Chicago, IL',
        joinedAtEpochSeconds: new Date('2025-01-06T14:54-06:00').getSeconds(),
        totalPosts: 3
      })
    } else {
      return of();
    }
  }
}
