import {Component, Input} from '@angular/core';
import {PostModel} from '../models/post.model';
import {DatePipe, DecimalPipe, NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-post',
  imports: [
    NgOptimizedImage,
    DatePipe,
    DecimalPipe,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  @Input() post!: PostModel;
}
