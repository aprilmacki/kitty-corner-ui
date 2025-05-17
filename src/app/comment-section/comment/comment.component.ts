import {Component, inject, input, Input} from '@angular/core';
import {CommentModel} from '../../common/models/comment.model';
import {DatePipe, DecimalPipe, NgOptimizedImage} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ReactionDto} from '../../services/kitty-corner-api/dtos/posts.dto';
import {KittyCornerApiClient} from '../../services/kitty-corner-api/kitty-corner-api.client';
import {computeLikeDislikeChange} from '../../common/util';

@Component({
  selector: 'app-comment',
  imports: [
    DatePipe,
    NgOptimizedImage,
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {
  private kittyCornerClient = inject(KittyCornerApiClient);

  comment = input.required<CommentModel>();

  public toggle(reaction: ReactionDto) {
    const newReaction: ReactionDto = this.comment().myReaction == reaction ? null : reaction;
    this.kittyCornerClient.setCommentReaction(this.comment().postId, this.comment().commentId, newReaction).subscribe({
      next: _ => {
        const changes = computeLikeDislikeChange(this.comment().myReaction, newReaction);
        this.comment().totalLikes += changes.likeChange;
        this.comment().totalDislikes += changes.dislikeChange;
        this.comment().myReaction = newReaction;
      },
      error: error=> {
        console.log(error);
      }
    });
  }
}
