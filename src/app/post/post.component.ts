import {Component, Input} from '@angular/core';
import {PostModel} from '../models/post.model';
import {DatePipe, DecimalPipe, NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-post',
  imports: [
    NgOptimizedImage,
    DatePipe,
    DecimalPipe,
    MatIcon
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  @Input() post!: PostModel;
}
