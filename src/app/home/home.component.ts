import { Component } from '@angular/core';
import {ProfileBadgeComponent} from '../profile-badge/profile-badge.component';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [
    ProfileBadgeComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
