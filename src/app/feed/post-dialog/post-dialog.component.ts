import {Component, inject, model, ModelSignal} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';
import {KittyCornerApiService} from '../../services/kitty-corner-api/kitty-corner-api.service';
import {PostModel} from '../../common/models/post.model';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-post-dialog',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatButton,
    CdkTextareaAutosize,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatHint,
    MatError
  ],
  templateUrl: './post-dialog.component.html',
  styleUrl: './post-dialog.component.scss'
})
export class PostDialogComponent {
  private apiService = inject(KittyCornerApiService);
  readonly dialogRef = inject(MatDialogRef<PostDialogComponent>);

  draftPost = new FormControl('', [Validators.maxLength(512)]);

  closeDialog(): void {
    this.dialogRef.close();
  }

  createPost(): void {
    const createObs: Observable<PostModel> = this.apiService.createPost(this.draftPost.value!);
    this.dialogRef.close(createObs);
  }
}
