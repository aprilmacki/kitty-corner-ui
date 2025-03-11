import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive
  ],
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Kitty Corner';
}
