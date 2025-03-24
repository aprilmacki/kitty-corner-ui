import {Component, inject, Input, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {TopBarComponent} from '../common/top-bar/top-bar.component';
import {RouterLink} from '@angular/router';
import {LoadingStatus} from '../common/types';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';
import {PostModel} from '../services/kitty-corner-api/models/post.model';
import {PostComponent} from '../post/post.component';

@Component({
  selector: 'app-comment-section',
  imports: [
    MatIcon,
    MatIconButton,
    TopBarComponent,
    RouterLink,
    PostComponent,
  ],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent {
  private readonly apiService = inject(KittyCornerApiService);

  post?: PostModel;
  initialLoadingStatus: LoadingStatus = 'loading';

  @Input()
  set postId(postId: number) {
    this.apiService.getPost(postId).subscribe({
      next: (post: PostModel)=> {
        this.post = post;
        this.initialLoadingStatus = 'success';
      },
      error: (error: Error) => {
        console.log(error);
        this.initialLoadingStatus = 'error';
      }
    })
  }
}
