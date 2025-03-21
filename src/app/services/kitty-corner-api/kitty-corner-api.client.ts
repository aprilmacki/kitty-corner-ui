import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {GetPostsDto, PostDto} from './dtos/posts.dto';
import {UserProfileDto} from './dtos/user.dto';
import {PageConfigModel} from './models/post.model';

@Injectable({
  providedIn: 'root'
})
export class KittyCornerApiClient {

  constructor() { }

  public getPosts(pageConfig: PageConfigModel): Observable<GetPostsDto> {
    return of({
      posts: [
        {
          postId: 12,
          username: 'minathecat',
          body: 'meow.',
          distanceKm: 0.4,
          totalLikes: 102,
          totalDislikes: 3,
          totalComments: 3,
          createdAtEpochSeconds: new Date('2025-02-28T14:12-06:00').getSeconds(),
          updatedAtEpochSeconds: null,
          myReaction: 'like'
        } as PostDto,
        {
          username: 'aprilmack',
          body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat. Duis aute irure dolor in reprehenderit in voluptate  velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint  occaecat cupidatat non proident, sunt in culpa qui officia deserunt  mollit anim id est laborum.',
          distanceKm: 0,
          totalLikes: 2,
          totalDislikes: 0,
          totalComments: 0,
          createdAtEpochSeconds: new Date('2025-02-28T13:33-06:00').getSeconds(),
          updatedAtEpochSeconds: null,
          myReaction: null
        } as PostDto
      ],
      nextCursor: 0,
    } as GetPostsDto);
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
    } else {
      return of();
    }
  }
}
