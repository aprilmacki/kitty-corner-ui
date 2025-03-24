import {Component, ElementRef, inject, Input, OnInit, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {TopBarComponent} from '../common/top-bar/top-bar.component';
import {RouterLink} from '@angular/router';
import {LoadingStatus} from '../common/types';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';
import {PostModel} from '../services/kitty-corner-api/models/post.model';
import {PostComponent} from '../post/post.component';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {ClickStopPropagationDirective} from '../common/directives';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {KittyCornerApiClient} from '../services/kitty-corner-api/kitty-corner-api.client';

@Component({
  selector: 'app-comment-section',
  imports: [
    MatIcon,
    MatIconButton,
    TopBarComponent,
    RouterLink,
    PostComponent,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatProgressSpinner,
    CdkTextareaAutosize,
    ClickStopPropagationDirective,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent {
  private readonly apiService = inject(KittyCornerApiService);
  private apiClient: KittyCornerApiClient = inject(KittyCornerApiClient);

  @ViewChild('textArea') textArea: ElementRef | null = null;

  post?: PostModel;
  initialLoadingStatus: LoadingStatus = 'loading';
  leaveCommentActive: boolean = false;

  draftComment = new FormControl('', []);

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

  postComment() {
    if (this.draftComment.value != null && this.draftComment.value.length > 0) {
      this.apiClient.postComment(this.postId, this.draftComment.value!).subscribe({
        next: (post: PostModel)=> {
          // TODO: render new post
        }
      })
    }
  }
}
