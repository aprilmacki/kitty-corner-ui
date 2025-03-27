import {Component, inject} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';

@Component({
  selector: 'app-post-modal',
  imports: [
    MatDialogTitle,
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
  readonly dialogRef = inject(MatDialogRef<PostDialogComponent>);

  draftPost = new FormControl('', [Validators.maxLength(512)]);

  closeDialog(): void {
    this.dialogRef.close();
  }

  protected readonly JSON = JSON;
}
