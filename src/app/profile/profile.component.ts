import {Component, inject, input, OnInit, signal} from '@angular/core';
import {RouterLink} from "@angular/router";
import {TopBarComponent} from "../common/top-bar/top-bar.component";
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DatePipe, DecimalPipe, NgForOf, NgOptimizedImage} from '@angular/common';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';
import {UserProfileModel} from '../services/kitty-corner-api/models/user.model';
import {forkJoin} from 'rxjs';
import {PostModel, PostPageConfigModel} from '../services/kitty-corner-api/models/post.model';
import {LoadingStatus} from '../common/types';
import {CommentComponent} from '../comment-section/comment/comment.component';
import {PostComponent} from '../post/post.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile',
  imports: [
    MatIcon,
    RouterLink,
    TopBarComponent,
    MatIconButton,
    MatButton,
    NgOptimizedImage,
    NgForOf,
    PostComponent,
    MatProgressSpinner,
    DatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly POST_LIMIT: number = 10;
  private apiService = inject(KittyCornerApiService);
  private nextCursor = 0;

  username = input.required<string>();
  profile = signal<UserProfileModel | null>(null);
  posts = signal<PostModel[]>([]);

  initialLoadingStatus = signal<LoadingStatus>('loading');
  moreLoadingStatus = signal<LoadingStatus>('success');
  noMorePosts = signal<boolean>(false);

  ngOnInit() {
    forkJoin({
      userProfile: this.apiService.getUserProfile(this.username()),
      posts: this.apiService.getUserPosts(this.username(), this.POST_LIMIT, this.nextCursor)
    }).subscribe({
      next: results => {
        this.profile.set(results.userProfile);
        this.nextCursor = results.posts.nextCursor;
        this.posts.set(results.posts.items);
        if (results.posts.items.length < this.POST_LIMIT) {
          this.noMorePosts.set(true);
        }
        this.initialLoadingStatus.set('success');

      },
      error: err => {
        console.log(err);
        this.initialLoadingStatus.set('error');
      }
    });
  }

  fetchNextPageOfPosts() {
    this.moreLoadingStatus.set('loading');
    this.apiService.getUserPosts(this.username(), this.POST_LIMIT, this.nextCursor).subscribe({
      next: results => {
        this.posts.update(posts => {
          return [...posts, ...results.items];
        });
        this.nextCursor = results.nextCursor;
        if (results.items.length < this.POST_LIMIT) {
          this.noMorePosts.set(true);
        }
        this.moreLoadingStatus.set('success');
      },
      error: err => {
        console.log(err);
        this.moreLoadingStatus.set('error');
      }
    });
  }
}
