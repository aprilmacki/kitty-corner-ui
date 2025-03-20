import {Component, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {PostModel} from '../models/post.model';
import {PostComponent} from '../post/post.component';
import {NgForOf} from '@angular/common';

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
export class FeedComponent {
  posts: PostModel[] = [];

  constructor() {
    this.posts = [
      {
        authorProfileName: 'Mina',
        authorUsername: 'minathecat',
        authorProfilePhotoUrl: '/assets/mina.png',
        body: 'meow.',
        distanceKm: 0.4,
        totalThumbsUp: 102,
        totalThumbsDown: 3,
        totalComments: 3,
        createdAt: new Date('2025-02-28T14:12-06:00'),
        updatedAt: null,
        myReaction: 'like'
      },
      {
        authorProfileName: 'April',
        authorUsername: 'aprilmack',
        authorProfilePhotoUrl: '/assets/april.png',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat. Duis aute irure dolor in reprehenderit in voluptate  velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint  occaecat cupidatat non proident, sunt in culpa qui officia deserunt  mollit anim id est laborum.',
        distanceKm: 0,
        totalThumbsUp: 2,
        totalThumbsDown: 0,
        totalComments: 0,
        createdAt: new Date('2025-02-28T13:33-06:00'),
        updatedAt: null,
        myReaction: null
      }
    ]
  }
}
