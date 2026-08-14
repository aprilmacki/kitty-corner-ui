import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {AuthService} from './auth.service';
import {RETURN_URL_PARAM} from './return-url';

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // An expired access token alongside a live refresh token is recoverable, so try before
  // giving up. Tokens are left in place either way; only a failed refresh clears them.
  if (!authService.hasLiveRefreshToken()) {
    return unauthenticatedUrl(router, state.url);
  }

  return authService.refreshOnce().pipe(
    map(() => true as boolean | UrlTree),
    catchError(() => of(unauthenticatedUrl(router, state.url)))
  ) as Observable<boolean | UrlTree>;
};

// The inverse of authGuard: keeps signed-in users off the signed-out pages.
export const signedOutGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/posts']);
};

// Authentication says who you are; this says what you may edit. Hiding the Edit button is
// not access control on its own — the URL is still typeable.
export const ownProfileGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const username = route.paramMap.get('username');
  if (username != null && username === authService.getCurrentUsername()) {
    return true;
  }

  return username != null
    ? router.createUrlTree(['/users', username, 'profile'])
    : router.createUrlTree(['/posts']);
};

function unauthenticatedUrl(router: Router, attemptedUrl: string | undefined): UrlTree {
  return router.createUrlTree(['/unauthenticated'], {
    queryParams: {[RETURN_URL_PARAM]: attemptedUrl}
  });
}
