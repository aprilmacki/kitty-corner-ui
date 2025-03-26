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
import {CommentModel} from '../services/kitty-corner-api/models/comment.model';
import {forkJoin, Observable} from 'rxjs';
import {PageModel} from '../services/kitty-corner-api/models/common.model';
import {CommentPageConfigModel} from '../services/kitty-corner-api/dtos/comments.dto';
import {NgForOf} from '@angular/common';
import {CommentComponent} from './comment/comment.component';
import {PostDto} from '../services/kitty-corner-api/dtos/posts.dto';

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
    NgForOf,
    CommentComponent,
  ],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent implements OnInit {
  private readonly apiService = inject(KittyCornerApiService);

  @ViewChild('textArea') textArea: ElementRef | null = null;

  post?: PostModel;
  initialLoadingStatus: LoadingStatus = 'loading';
  leaveCommentActive: boolean = false;
  draftComment = new FormControl('', []);
  comments: CommentModel[] = [];

  commentCursor = 0;

  @Input()
  postId!: number;

  ngOnInit() {
    const getPostObs: Observable<PostModel> = this.apiService.getPost(this.postId);

    const pageConfig: CommentPageConfigModel = {
      limit: 20,
      cursor: this.commentCursor
    }
    const getCommentsObs: Observable<PageModel<CommentModel>> = this.apiService.getComments(this.postId, pageConfig);

    forkJoin({
      getPost: getPostObs,
      getComments: getCommentsObs
    }).subscribe({
      next: result => {
        this.post = result.getPost;
        this.comments.push(...result.getComments.items);
        this.commentCursor = result.getComments.nextCursor;
        this.initialLoadingStatus = 'success';
      },
      error: (error: Error) => {
        console.log(error);
        this.initialLoadingStatus = 'error';
      }
    });
  }

  postComment() {
    if (this.draftComment.value != null && this.draftComment.value.length > 0) {
      this.apiService.postComment(this.postId, this.draftComment.value!).subscribe({
        next: (comment: CommentModel)=> {
          this.comments.push(comment);
        },
        error: (error: Error) => {
          console.log(error);
        }
      })
    }
    this.draftComment.setValue('');
  }
}
