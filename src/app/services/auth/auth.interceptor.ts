import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {catchError, concatMap, Observable, throwError} from 'rxjs';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {RETURN_URL_PARAM} from './return-url';

const publicEndpoints: string[] = [
  '/api/v1/auth/signin',
  '/api/v1/auth/signup',
];

const refreshTokenEndpoints: string[] = [
  '/api/v1/auth/refresh',
  // The server identifies the session by the refresh token's chain, so signout needs it too.
  '/api/v1/auth/signout',
];

const selfHandledEndpoints: string[] = [
  '/api/v1/auth/signout',
];

function isPublicEndpoint(url: string): boolean {
  return publicEndpoints.some(pattern => url.match(pattern));
}

function isRefreshTokenEndpoint(url: string): boolean {
  return refreshTokenEndpoints.some(pattern => url.match(pattern));
}

function isSelfHandledEndpoint(url: string): boolean {
  return selfHandledEndpoints.some(pattern => url.match(pattern));
}

function withToken(request: HttpRequest<unknown>, next: HttpHandlerFn, token: string | null): Observable<HttpEvent<unknown>> {
  if (token == null) {
    return next(request);
  }
  return next(request.clone({
    headers: request.headers.set('Authorization', 'Bearer ' + token),
  }));
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/v1')) {
    return next(request);
  }
  if (isPublicEndpoint(request.url)) {
    return next(request);
  }

  // inject() must run synchronously here: the injection context is gone by the time catchError fires.
  const authService = inject(AuthService);
  const router = inject(Router);

  const usesRefreshToken = isRefreshTokenEndpoint(request.url);
  const response = withToken(request, next,
    usesRefreshToken ? authService.getRefreshToken() : authService.getAccessToken());

  if (isSelfHandledEndpoint(request.url)) {
    return response;
  }

  return response.pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      // A 401 from the refresh endpoint itself means the refresh token is dead too, so
      // retrying would recurse. The session ends here instead.
      if (usesRefreshToken) {
        return endSession(authService, router, error);
      }

      return authService.refreshOnce().pipe(
        concatMap(() => withToken(request, next, authService.getAccessToken())),
        catchError(() => endSession(authService, router, error))
      );
    })
  );
};

function endSession(authService: AuthService, router: Router, error: unknown): Observable<never> {
  // Clearing keeps the route guard from disagreeing with the server on the next navigation.
  authService.clearSession();
  router.navigate(['/unauthenticated'], {
    queryParams: {[RETURN_URL_PARAM]: router.url}
  }).then(_ => {});
  return throwError(() => error);
}
