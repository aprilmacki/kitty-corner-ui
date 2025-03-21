import { Injectable } from '@angular/core';
import {KittyCornerApiClient} from './kitty-corner-api.client';
import {PageModel, PageConfigModel, PostModel} from './models/post.model';
import {concatMap, forkJoin, map, Observable} from 'rxjs';
import {GetPostsDto} from './dtos/posts.dto';
import {UserProfileDto} from './dtos/user.dto';

@Injectable({
  providedIn: 'root'

})
export class KittyCornerApiService {

  constructor(private apiClient: KittyCornerApiClient) { }

  public getPosts(pageConfig: PageConfigModel): Observable<PageModel<PostModel>> {
    return this.apiClient.getPosts(pageConfig).pipe(
      concatMap((getPostsResults: GetPostsDto) => {
        const postsObservables: Observable<PostModel>[] = getPostsResults.posts.map(post => {
          return this.apiClient.getUserProfile(post.username).pipe(
            map((profile: UserProfileDto) => {
              return {
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
                createdAt: new Date(post.createdAtEpochSeconds),
                updatedAt: post.updatedAtEpochSeconds != null ? new Date(post.updatedAtEpochSeconds) : null,
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
