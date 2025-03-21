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
          postId: 0,
          username: 'vincent_van_dough',
          body: 'does anyone want some of my sourdough starter?',
          distanceKm: 2.2,
          totalLikes: 15,
          totalDislikes: 2,
          totalComments: 45,
          createdAtEpochSeconds: new Date('2025-02-28T14:11-06:00').getSeconds(),
          updatedAtEpochSeconds: null,
          myReaction: 'like'

        } as PostDto,
        {
          postId: 0,
          username: 'misato',
          body: 'The FitnessGram™ Pacer Test is a multistage aerobic capacity test that  progressively gets more difficult as it continues. The 20 meter pacer  test will begin in 30 seconds. Line up at the start. The running speed  starts slowly, but gets faster each minute after you hear this signal.',
          distanceKm: 1,
          totalLikes: 5,
          totalDislikes: 1,
          totalComments: 1,
          createdAtEpochSeconds: new Date('2025-02-28T13:45-06:00').getSeconds(),
          myReaction: 'dislike'
        } as PostDto,
        {
          postId: 0,
          username: 'tequila_sunset',
          body: 'has anyone seen my necktie, gun, motor carriage, or badge? i know i know.',
          distanceKm: 0.1,
          totalLikes: 45,
          totalDislikes: 0,
          totalComments: 2,
          createdAtEpochSeconds: new Date('2025-02-28T13:38-06:00').getSeconds(),
          updatedAtEpochSeconds: null,
          myReaction: null
        } as PostDto,
        {
          postId: 0,
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
