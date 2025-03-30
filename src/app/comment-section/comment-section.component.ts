import {Component, ElementRef, inject, input, Input, OnInit, signal, ViewChild} from '@angular/core';
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
  private nextCursor = 0;
  private commentsById: Map<number, CommentModel> = new Map();

  postId = input.required<number>();

  @ViewChild('textArea') textArea: ElementRef | null = null;

  post = signal<PostModel | null>(null);
  initialLoadingStatus = signal<LoadingStatus>('loading');
  moreLoadingStatus = signal<LoadingStatus>('success');
  leaveCommentActive = signal<boolean>(false);
  noMoreComments = signal<boolean>(false);
  sortedComments = signal<CommentModel[]>([]);
  draftComment = new FormControl('', []); // This should probably be a signal too?

  ngOnInit() {
    const getPostObs: Observable<PostModel> = this.apiService.getPost(this.postId());

    const pageConfig: CommentPageConfigModel = {
      limit: this.COMMENT_LIMIT,
      cursor: this.nextCursor
    }
    const getCommentsObs: Observable<PageModel<CommentModel>> = this.apiService.getComments(this.postId(), pageConfig);

    forkJoin({
      getPost: getPostObs,
      getComments: getCommentsObs
    }).subscribe({
      next: result => {
        this.post.set(result.getPost);
        this.updateComments(result.getComments.items);
        this.nextCursor = result.getComments.nextCursor;
        if (result.getComments.items.length < this.COMMENT_LIMIT) {
          this.noMoreComments.set(true);
        }
        this.initialLoadingStatus.set('success');
      },
      error: (error: Error) => {
        console.log(error);
        this.initialLoadingStatus.set('error');
      }
    });
  }

  postComment() {
    if (this.draftComment.value != null && this.draftComment.value.length > 0) {
      this.apiService.postComment(this.postId(), this.draftComment.value!).subscribe({
        next: (comment: CommentModel) => {
          this.updateComments([comment]);
        },
        error: (error: Error) => {
          console.log(error);
        }
      })
    }
    this.draftComment.setValue('');
    this.post.update(post => {
      const newPost = {
        ...post!
      };
      newPost.totalComments++;
      return newPost;
    })
    this.leaveCommentActive.set(false);
  }

  fetchNextPageOfComments() {
    this.moreLoadingStatus.set('loading');
    const pageConfig = {
      limit: this.COMMENT_LIMIT,
      cursor: this.nextCursor
    } as CommentPageConfigModel;
    this.apiService.getComments(this.postId(), pageConfig).subscribe({
      next: (page: PageModel<CommentModel>) => {
        if (page.items.length < this.COMMENT_LIMIT) {
          this.noMoreComments.set(true);
        }
        this.updateComments(page.items);
        this.nextCursor = page.nextCursor;
        this.moreLoadingStatus.set('success');
      },
      error: (err) => {
        console.log(err);
        this.moreLoadingStatus.set('error');
      }
    });
  }

  private updateComments(newComments: CommentModel[]) {
    newComments.forEach(newComment => this.commentsById.set(newComment.commentId, newComment));
    this.sortedComments.set(Array.from(this.commentsById.values()).sort((a, b) => a.commentId - b.commentId));
  }
}
