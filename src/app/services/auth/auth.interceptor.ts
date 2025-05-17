import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly publicEndpoints: string[] = [
    '/api/v1/auth/signin',
    '/api/v1/auth/signup',
    '/users/%s/available',
  ];

  private readonly refreshTokenEndpoints: string[] = [
    '/api/v1/auth/refresh',
  ];

  constructor(private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.startsWith('/api/v1')) {
      return next.handle(request);
    }
    if (this.isPublicEndpoint(request.url)) {
      return next.handle(request);
    }
    if (this.isRefreshTokenEndpoint(request.url)) {
      return this.addRefreshToken(request, next);
    }

    // TODO: Refresh tokens if necessary

    return this.addAccessToken(request, next);
  }

  private addAccessToken(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return next.handle(request);
    }

    const clonedRequest = request.clone({
      headers: request.headers.set('Authorization', 'Bearer ' + accessToken),
    });
    return next.handle(clonedRequest);
  }

  private addRefreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return next.handle(request);
    }
    const clonedRequest = request.clone({
      headers: request.headers.set('Authorization', 'Bearer ' + refreshToken),
    });
    return next.handle(clonedRequest);
  }

  private isPublicEndpoint(url: string): boolean {
    for (let regex of this.publicEndpoints) {
      if (url.match(regex)) {
        return true;
      }
    }
    return false;
  }

  private isRefreshTokenEndpoint(url: string): boolean {
    for (let regex of this.refreshTokenEndpoints) {
      if (url.match(regex)) {
        return true;
      }
    }
    return false;
  }
}

