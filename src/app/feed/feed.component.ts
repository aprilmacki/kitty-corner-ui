import {Component, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {PageConfigModel, PageModel, PostModel} from '../services/kitty-corner-api/models/post.model';
import {PostComponent} from '../post/post.component';
import {NgForOf} from '@angular/common';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';
import {FeedFilterModel, LoadingStatus} from '../common/types';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {FiltersDialogComponent} from './filters-modal/filters-dialog.component';

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
  private readonly POST_LIMIT = 10;
  private nextCursor: number = 0;

  posts: PostModel[] = [];
  initialLoadingStatus: LoadingStatus = 'loading';
  moreLoadingStatus: LoadingStatus = 'success';
  noMorePosts: boolean = false;

  currentFilter: FeedFilterModel = {
    startAge: 18,
    endAge: 80,
    distanceKm: 5
  }

  constructor(
    private kittyCornerApiService: KittyCornerApiService,
    private dialogService: MatDialog,
  ) {
  }

  ngOnInit() {
    this.refreshPosts();
  }

  openFilterModal() {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      width: '50vw',
      data: this.currentFilter
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.currentFilter = result;
        this.refreshPosts();
      }
    });
  }

  refreshPosts() {
    this.initialLoadingStatus = 'loading';
    this.noMorePosts = false;
    this.moreLoadingStatus = 'success';
    const pageConfig = {
      startAge: this.currentFilter.startAge,
      endAge: this.currentFilter.endAge,
      radiusKm: this.currentFilter.distanceKm,
      limit: this.POST_LIMIT,
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
      startAge: this.currentFilter.startAge,
      endAge: this.currentFilter.endAge,
      radiusKm: this.currentFilter.distanceKm,
      limit: this.POST_LIMIT,
      cursor: this.nextCursor
    } as PageConfigModel;
    this.kittyCornerApiService.getPosts(pageConfig).subscribe(
      {
        next: (page: PageModel<PostModel>) => {
          if (page.items.length == 0) {
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
