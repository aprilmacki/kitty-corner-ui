import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {TopBarComponent} from '../common/top-bar/top-bar.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-comment-section',
  imports: [
    MatIcon,
    MatIconButton,
    TopBarComponent,
    RouterLink,
  ],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent {

}
