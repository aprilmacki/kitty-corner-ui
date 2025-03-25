import {Component, Input} from '@angular/core';
import {CommentModel} from '../../services/kitty-corner-api/models/comment.model';

@Component({
  selector: 'app-comment',
  imports: [],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input() comment!: CommentModel;

  constructor() {}
}
