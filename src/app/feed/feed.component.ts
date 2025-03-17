import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-feed',
  imports: [
    MatIcon,
    MatButton,
    MatIconButton
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {

}
