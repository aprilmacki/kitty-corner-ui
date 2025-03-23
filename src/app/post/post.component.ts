import {Component, Input} from '@angular/core';
import {PostModel} from '../services/kitty-corner-api/models/post.model';
import {DatePipe, DecimalPipe, NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {KittyCornerApiClient} from '../services/kitty-corner-api/kitty-corner-api.client';
import {ReactionDto} from '../services/kitty-corner-api/dtos/posts.dto';

@Component({
  selector: 'app-post',
  imports: [
    NgOptimizedImage,
    DatePipe,
    DecimalPipe,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  @Input() post!: PostModel;

  constructor(private kittyCornerClient: KittyCornerApiClient) {
  }

  public handleLike() {
    const newReaction: ReactionDto = this.post.myReaction == 'like' ? null : 'like';
    this.kittyCornerClient.setPostReaction(this.post.postId, newReaction).subscribe({
      next: _ => {
        this.post.myReaction = newReaction;
        if (newReaction == 'like') {
          this.post.totalLikes++;
        } else {
          this.post.totalLikes--;
        }
      },
      error: error=> {
        console.log(error);
      }
    });
  }

  public handleDislike() {
    const newReaction: ReactionDto = this.post.myReaction == 'dislike' ? null : 'dislike';
    this.kittyCornerClient.setPostReaction(this.post.postId, newReaction).subscribe({
      next: _ => {
        this.post.myReaction = newReaction;
        if (newReaction == 'dislike') {
          this.post.totalDislikes++;
        } else {
          this.post.totalDislikes--;
        }
      },
      error: error=> {
        console.log(error);
      }
    });
  }
}
