import {Component, inject, OnInit, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {PostPageConfigModel, PostModel} from '../common/models/post.model';
import {PostComponent} from '../post/post.component';
import {NgForOf} from '@angular/common';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';
import {FeedFilterModel, LoadingStatus} from '../common/types';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {FiltersDialogComponent} from './filters-dialog/filters-dialog.component';
import {TopBarComponent} from '../common/top-bar/top-bar.component';
import {PageModel} from '../common/models/common.model';
import {PostDialogComponent} from './post-dialog/post-dialog.component';
import {Observable} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-feed',
  imports: [
    MatIcon,
    MatButton,
    MatIconButton,
    PostComponent,
    NgForOf,
    MatProgressSpinner,
    TopBarComponent,
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent implements OnInit {
  private readonly POST_LIMIT = 10;
  private nextCursor: number = 0;
  private dialogService = inject(MatDialog);
  private apiService = inject(KittyCornerApiService);

  posts = signal<PostModel[]>([]);
  initialLoadingStatus = signal<LoadingStatus>('loading');
  moreLoadingStatus = signal<LoadingStatus>('success');
  noMorePosts = signal<boolean>(false);

  currentFilter: FeedFilterModel = {
    startAge: 18,
    endAge: 80,
    distanceKm: 5
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

  openPostModal() {
    const dialogRef = this.dialogService.open(PostDialogComponent, {
      width: '50vw'
    });

    dialogRef.afterClosed().subscribe((result: Observable<PostModel>) => {
      if (result == null) {
        return;
      }
      result.subscribe({
        next: (post: PostModel) => {
          this.posts.update(posts => {
            return [post, ...posts];
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    });
  }

  refreshPosts() {
    this.initialLoadingStatus.set('loading');
    this.noMorePosts.set(false);
    this.moreLoadingStatus.set('success');
    const pageConfig = {
      startAge: this.currentFilter.startAge,
      endAge: this.currentFilter.endAge,
      distanceKm: this.currentFilter.distanceKm,
      limit: this.POST_LIMIT,
      cursor: 0
    } as PostPageConfigModel;
    this.apiService.getPosts(pageConfig).subscribe(
      {
        next: (page: PageModel<PostModel>) => {
          this.posts.set(page.items);
          this.nextCursor = page.nextCursor;
          this.initialLoadingStatus.set('success');
        },
        error: (err) => {
          console.log(err);
          this.initialLoadingStatus.set('error');
        }
      });
  }

  fetchNextPage() {
    this.moreLoadingStatus.set('loading');
    const pageConfig = {
      startAge: this.currentFilter.startAge,
      endAge: this.currentFilter.endAge,
      distanceKm: this.currentFilter.distanceKm,
      limit: this.POST_LIMIT,
      cursor: this.nextCursor
    } as PostPageConfigModel;
    this.apiService.getPosts(pageConfig).subscribe(
      {
        next: (page: PageModel<PostModel>) => {
          if (page.items.length == 0) {
            this.noMorePosts.set(true);
          }
          this.posts.update(posts => {
            return [...posts, ...page.items];
          });
          this.nextCursor = page.nextCursor;
          this.moreLoadingStatus.set('success');
        },
        error: (err) => {
          console.log(err);
          this.moreLoadingStatus.set('error');
        }
      });
  }
}
