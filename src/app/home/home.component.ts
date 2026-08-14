import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {ProfileBadgeComponent} from '../profile-badge/profile-badge.component';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../services/auth/auth.service';
import {KittyCornerApiService} from '../services/kitty-corner-api/kitty-corner-api.service';
import {UserProfileModel} from '../common/models/user.model';

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
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(KittyCornerApiService);

  private wasSignedIn: boolean = this.authService.signedIn();

  username = signal<string | null>(this.authService.getCurrentUsername());
  profile = signal<UserProfileModel | null>(null);

  constructor() {
    // Signing out in another tab shouldn't leave this one sitting on a page it can no longer
    // load. Only the true -> false transition navigates; the initial state is the guard's job.
    effect(() => {
      const signedIn = this.authService.signedIn();
      if (this.wasSignedIn && !signedIn) {
        this.router.navigate(['/welcome']).then(_ => {});
      }
      this.wasSignedIn = signedIn;
    });
  }

  ngOnInit() {
    const username = this.username();
    if (username == null) {
      return;
    }

    this.apiService.getUserProfile(username).subscribe({
      next: profile => this.profile.set(profile),
      error: error => console.error(JSON.stringify(error))
    });
  }

  public signOut() {
    this.authService.signOut().subscribe({
      next: _ => this.completeSignOut(),
      error: error => {
        console.error(JSON.stringify(error));
        this.completeSignOut();
      }
    });
  }

  private completeSignOut() {
    this.authService.clearSession();
    this.router.navigate(['/welcome']).then(_ => {});
  }
}
