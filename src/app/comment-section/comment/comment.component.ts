import {Component, Input} from '@angular/core';
import {CommentModel} from '../../services/kitty-corner-api/models/comment.model';
import {DatePipe, DecimalPipe, NgOptimizedImage} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

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
  @Input() comment!: CommentModel;

  constructor() {}

  public toggleLike() {

  }

  public toggleDislike() {

  }
}
