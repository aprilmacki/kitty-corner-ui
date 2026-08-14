import {Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, Params, RouterLink} from '@angular/router';
import {RETURN_URL_PARAM, sanitizeReturnUrl} from '../services/auth/return-url';

@Component({
  selector: 'app-unauthenticated',
  imports: [
    MatButton,
    MatIcon,
    RouterLink
  ],
  templateUrl: './unauthenticated.component.html',
  styleUrl: './unauthenticated.component.scss'
})
export class UnauthenticatedComponent {
  private readonly route = inject(ActivatedRoute);

  // Carried through to the sign-in form so the user lands back on the page they asked for.
  private readonly returnUrl = signal<string | null>(
    sanitizeReturnUrl(this.route.snapshot.queryParamMap.get(RETURN_URL_PARAM)));

  readonly welcomeQueryParams = computed<Params>(() => {
    const returnUrl = this.returnUrl();
    return returnUrl != null ? {[RETURN_URL_PARAM]: returnUrl} : {};
  });
}
