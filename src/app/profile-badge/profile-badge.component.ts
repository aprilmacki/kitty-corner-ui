import {Component, input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-profile-badge',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './profile-badge.component.html',
  styleUrl: './profile-badge.component.scss'
})
export class ProfileBadgeComponent {
  username = input.required<string>();
  name = input.required<string>();
  photoUrl = input.required<string>();
}
