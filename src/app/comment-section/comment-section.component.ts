import {Component, ElementRef, inject, Input, OnInit, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {TopBarComponent} from '../common/top-bar/top-bar.component';
import {RouterLink} from '@angular/router';
import {LoadingStatus} from '../common/types';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';
import {PostModel, PostPageConfigModel} from '../services/kitty-corner-api/models/post.model';
import {PostComponent} from '../post/post.component';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {ClickStopPropagationDirective} from '../common/directives';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommentModel} from '../services/kitty-corner-api/models/comment.model';
import {forkJoin, Observable} from 'rxjs';
import {PageModel} from '../services/kitty-corner-api/models/common.model';
import {CommentPageConfigModel} from '../services/kitty-corner-api/dtos/comments.dto';
import {NgForOf} from '@angular/common';
import {CommentComponent} from './comment/comment.component';

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
  private readonly COMMENT_LIMIT = 20;

  private readonly apiService = inject(KittyCornerApiService);

  @ViewChild('textArea') textArea: ElementRef | null = null;

  post?: PostModel;
  initialLoadingStatus: LoadingStatus = 'loading';
  moreLoadingStatus: LoadingStatus = 'success';
  leaveCommentActive: boolean = false;
  draftComment = new FormControl('', []);
  sortedComments: CommentModel[] = [];
  commentsById: Map<number, CommentModel> = new Map();
  noMoreComments: boolean = false;
  nextCursor = 0;

  @Input()
  postId!: number;

  ngOnInit() {
    const getPostObs: Observable<PostModel> = this.apiService.getPost(this.postId);

    const pageConfig: CommentPageConfigModel = {
      limit: this.COMMENT_LIMIT,
      cursor: this.nextCursor
    }
    const getCommentsObs: Observable<PageModel<CommentModel>> = this.apiService.getComments(this.postId, pageConfig);

    forkJoin({
      getPost: getPostObs,
      getComments: getCommentsObs
    }).subscribe({
      next: result => {
        this.post = result.getPost;
        this.updateComments(result.getComments.items);
        this.nextCursor = result.getComments.nextCursor;
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
        next: (comment: CommentModel) => {
          this.updateComments([comment]);
        },
        error: (error: Error) => {
          console.log(error);
        }
      })
    }
    this.draftComment.setValue('');
    this.post!.totalComments++;
    this.leaveCommentActive = false;
  }

  fetchNextPageOfComments() {
    this.moreLoadingStatus = 'loading';
    const pageConfig = {
      limit: this.COMMENT_LIMIT,
      cursor: this.nextCursor
    } as CommentPageConfigModel;
    this.apiService.getComments(this.postId, pageConfig).subscribe({
      next: (page: PageModel<CommentModel>) => {
        if (page.items.length == 0) {
          this.noMoreComments = true;
        }
        this.updateComments(page.items);
        this.nextCursor = page.nextCursor;
        this.moreLoadingStatus = 'success';
      },
      error: (err) => {
        console.log(err);
        this.moreLoadingStatus = 'error';
      }
    });
  }

  updateComments(newComments: CommentModel[]) {
    newComments.forEach(newComment => this.commentsById.set(newComment.commentId, newComment));
    this.sortedComments = Array.from(this.commentsById.values())
      .sort((a, b) => a.commentId - b.commentId);
  }
}
