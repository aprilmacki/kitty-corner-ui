import {Component, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {PageConfigModel, PageModel, PostModel} from '../services/kitty-corner-api/models/post.model';
import {PostComponent} from '../post/post.component';
import {NgForOf} from '@angular/common';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';
import { LoadingStatus } from '../common/types';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-feed',
  imports: [
    MatIcon,
    MatButton,
    MatIconButton,
    PostComponent,
    NgForOf,
    MatProgressSpinner,
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent implements OnInit {
  private nextCursor: number = 0;

  posts: PostModel[] = [];
  initialLoadingStatus: LoadingStatus = 'loading';
  moreLoadingStatus: LoadingStatus = 'success';
  noMorePosts: boolean = false;

  constructor(private kittyCornerApiService: KittyCornerApiService) {
  }

  ngOnInit() {
     const pageConfig = {
      startAge: null,
      endAge: null,
      radiusKm: null,
      limit: 10,
      cursor: 0
    } as PageConfigModel;
    this.kittyCornerApiService.getPosts(pageConfig).subscribe(
      {
        next: (page: PageModel<PostModel>) => {
          this.posts = page.items;
          this.nextCursor = page.nextCursor;
          this.initialLoadingStatus = 'success';
        },
        error: (err) => {
          console.log(err);
          this.initialLoadingStatus = 'error';
        }
      });
  }

  fetchNextPage() {
    this.moreLoadingStatus = 'loading';

    const pageConfig = {
      startAge: null,
      endAge: null,
      radiusKm: null,
      limit: 10,
      cursor: this.nextCursor
    } as PageConfigModel;
    this.kittyCornerApiService.getPosts(pageConfig).subscribe(
      {
        next: (page: PageModel<PostModel>) => {
          if (page.items.length === 0) {
            this.noMorePosts = true;
          }
          this.posts.push(...page.items);
          this.nextCursor = page.nextCursor;
          this.moreLoadingStatus = 'success';
        },
        error: (err) => {
          console.log(err);
          this.moreLoadingStatus = 'error';
        }
      });
  }
}
