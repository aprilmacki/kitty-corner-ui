import {booleanAttribute, Component, computed, input, Input} from '@angular/core';
import {PostModel} from '../common/models/post.model';
import {DatePipe, DecimalPipe, NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {KittyCornerApiClient} from '../services/kitty-corner-api/kitty-corner-api.client';
import {ReactionDto} from '../services/kitty-corner-api/dtos/posts.dto';
import {RouterLink} from '@angular/router';
import {computeLikeDislikeChange} from '../common/util';

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
  post = input.required<PostModel>();
  showCommentButton = input<boolean>(true);
  showPhoto = input<boolean>(true);

  profileRouterLink = computed<string>(() => `/users/${this.post().author.username}/profile`);
  commentsRouterLink = computed<string>(() => `/posts/${this.post().postId}/comments`);

  constructor(private kittyCornerClient: KittyCornerApiClient) {
  }

  public toggle(reaction: ReactionDto) {
    const newReaction: ReactionDto = this.post().myReaction == reaction ? null : reaction;
    this.kittyCornerClient.setPostReaction(this.post().postId, newReaction).subscribe({
      next: _ => {
        const changes = computeLikeDislikeChange(this.post().myReaction, newReaction);
        this.post().totalLikes += changes.likeChange;
        this.post().totalDislikes += changes.dislikeChange;
        this.post().myReaction = newReaction;
      },
      error: error=> {
        console.log(error);
      }
    });
  }
}
