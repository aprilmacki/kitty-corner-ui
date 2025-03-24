import {Component, Input} from '@angular/core';
import {PostModel} from '../services/kitty-corner-api/models/post.model';
import {DatePipe, DecimalPipe, NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {KittyCornerApiClient} from '../services/kitty-corner-api/kitty-corner-api.client';
import {ReactionDto} from '../services/kitty-corner-api/dtos/posts.dto';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-post',
  imports: [
    NgOptimizedImage,
    DatePipe,
    DecimalPipe,
    MatIcon,
    MatIconButton,
    RouterLink
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  @Input() post!: PostModel;

  constructor(private kittyCornerClient: KittyCornerApiClient) {
  }

  public toggleLike() {
    const newReaction: ReactionDto = this.post.myReaction == 'like' ? null : 'like';
    this.kittyCornerClient.setPostReaction(this.post.postId, newReaction).subscribe({
      next: _ => {
        if (this.post.myReaction == 'like') {
          this.post.totalLikes--;
        } else if (this.post.myReaction == 'dislike') {
          this.post.totalLikes++;
          this.post.totalDislikes--;
        } else if (this.post.myReaction == null) {
          this.post.totalLikes++;
        }
        this.post.myReaction = newReaction;
      },
      error: error=> {
        console.log(error);
      }
    });
  }

  public toggleDislike() {
    const newReaction: ReactionDto = this.post.myReaction == 'dislike' ? null : 'dislike';
    this.kittyCornerClient.setPostReaction(this.post.postId, newReaction).subscribe({
      next: _ => {
        if (this.post.myReaction == 'dislike') {
          this.post.totalDislikes--;
        } else if (this.post.myReaction == 'like') {
          this.post.totalDislikes++;
          this.post.totalLikes--;
        } else if (this.post.myReaction == null) {
          this.post.totalDislikes++;
        }
        this.post.myReaction = newReaction;
      },
      error: error=> {
        console.log(error);
      }
    });
  }

  public getCommentsLink(): string {
    return `/posts/${this.post.postId}/comments`;
  }
}
