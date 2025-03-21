import {Component, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {PageConfigModel, PageModel, PostModel} from '../services/kitty-corner-api/models/post.model';
import {PostComponent} from '../post/post.component';
import {NgForOf} from '@angular/common';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';

@Component({
  selector: 'app-feed',
  imports: [
    MatIcon,
    MatButton,
    MatIconButton,
    PostComponent,
    NgForOf
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent implements OnInit {
  posts: PostModel[] = [];

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
      (next: PageModel<PostModel>) => {
        this.posts = next.items;
      }
    )
  }
}
