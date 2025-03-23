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
  posts: PostModel[] = [];

  loadingStatus: LoadingStatus = 'loading';

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
        next: (next: PageModel<PostModel>) => {
          this.posts = next.items;
          this.loadingStatus = 'success';
        },
        error: (err) => {
          this.loadingStatus = 'error';
        }
      })
  }
}
