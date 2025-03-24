import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-comment-section',
  imports: [
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent {

}
