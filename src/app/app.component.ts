import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    MatIcon
  ],
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Kitty Corner';
}
