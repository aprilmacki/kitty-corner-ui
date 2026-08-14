import {Component, inject} from '@angular/core';
import {ProfileBadgeComponent} from '../profile-badge/profile-badge.component';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../services/auth/auth.service';

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
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

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
