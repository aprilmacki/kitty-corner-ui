import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';

const publicEndpoints: string[] = [
  '/api/v1/auth/signin',
  '/api/v1/auth/signup',
  '/users/%s/available',
];

const refreshTokenEndpoints: string[] = [
  '/api/v1/auth/refresh',
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

function withToken(request: HttpRequest<unknown>, next: HttpHandlerFn, token: string): Observable<HttpEvent<unknown>> {
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

  const authService = inject(AuthService);
  const router = inject(Router);

  // TODO: Refresh tokens if necessary

  const token = isRefreshTokenEndpoint(request.url) ? authService.getRefreshToken() : authService.getAccessToken();
  const response = token ? withToken(request, next, token) : next(request);

  if (isSelfHandledEndpoint(request.url)) {
    return response;
  }

  return response.pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.clearSession();
        router.navigate(['/unauthenticated']).then(_ => {});
      }
      return throwError(() => error);
    })
  );
};
