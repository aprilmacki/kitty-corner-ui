import {HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

const publicEndpoints: string[] = [
  '/api/v1/auth/signin',
  '/api/v1/auth/signup',
  '/users/%s/available',
];

const refreshTokenEndpoints: string[] = [
  '/api/v1/auth/refresh',
];

function isPublicEndpoint(url: string): boolean {
  return publicEndpoints.some(pattern => url.match(pattern));
}

function isRefreshTokenEndpoint(url: string): boolean {
  return refreshTokenEndpoints.some(pattern => url.match(pattern));
}

function withToken(request: HttpRequest<unknown>, next: HttpHandlerFn, token: string): Observable<HttpEvent<unknown>> {
  return next(request.clone({
    headers: request.headers.set('Authorization', 'Bearer ' + token),
  }));
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  console.log(`auth interceptor called`);
  if (!request.url.startsWith('/api/v1')) {
    return next(request);
  }
  if (isPublicEndpoint(request.url)) {
    return next(request);
  }
  if (isRefreshTokenEndpoint(request.url)) {
    const refreshToken = localStorage.getItem('refreshToken');
    return refreshToken ? withToken(request, next, refreshToken) : next(request);
  }

  // TODO: Refresh tokens if necessary

  const accessToken = localStorage.getItem('accessToken');
  console.log(`access token: ${accessToken}`);
  return accessToken ? withToken(request, next, accessToken) : next(request);
};

