import { Injectable } from '@angular/core';
import {KittyCornerApiClient} from './kitty-corner-api.client';
import {PageModel, PageConfigModel, PostModel} from './models/post.model';
import {concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {GetPostsDto} from './dtos/posts.dto';
import {UserProfileDto} from './dtos/user.dto';
import * as util from '../../common/util';

@Injectable({
  providedIn: 'root'
})
export class KittyCornerApiService {
  constructor(private apiClient: KittyCornerApiClient) { }

  public getPosts(pageConfig: PageConfigModel): Observable<PageModel<PostModel>> {
    return this.apiClient.getPosts(pageConfig).pipe(
      concatMap((getPostsResults: GetPostsDto) => {

        // This is necessary otherwise we stuck waiting for no observables
        if (getPostsResults.posts.length === 0) {
          return of({
            items: [],
            nextCursor: getPostsResults.nextCursor
          } as PageModel<PostModel>);
        }

        const postsObservables: Observable<PostModel>[] = getPostsResults.posts.map(post => {
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
            })
          );
        });
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
}
