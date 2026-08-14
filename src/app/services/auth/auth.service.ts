import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, tap} from 'rxjs';
import {TokenPairDto} from './dtos/auth.dto';
import {SignUpModel} from '../../common/models/signup.model';
import {fromEpochSeconds} from '../../common/util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) { }

  public signUp(signUpData: SignUpModel): Observable<TokenPairDto> {
    return this.httpClient.post<TokenPairDto>('/api/v1/auth/signup', signUpData).pipe(
      tap(this.setSession)
    );
  }

  public signIn(username: string, password: string): Observable<TokenPairDto> {
    return this.httpClient.post<TokenPairDto>('/api/v1/auth/signin', {
      username: username,
      password: password
    }).pipe(
      tap(this.setSession)
    );
  }

  public signOut(): Observable<void> {
    return this.httpClient.post('/api/v1/auth/signout', {}).pipe(
      map(_ => void 0)
    );
  }

  public refresh(): Observable<TokenPairDto> {
    return this.httpClient.post<TokenPairDto>('/api/v1/auth/refresh', {}).pipe(
      tap(this.setSession)
    );
  }

  public isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return accessToken != null && !isExpired(accessToken);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  public clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private setSession(tokenPair: TokenPairDto) {
    localStorage.setItem('accessToken', tokenPair.accessToken);
    localStorage.setItem('refreshToken', tokenPair.refreshToken);
  }
}

function isExpired(token: string): boolean {
  const expirationSeconds = readExpirationSeconds(token);
  if (expirationSeconds == null) {
    return true;
  }
  return fromEpochSeconds(expirationSeconds) <= new Date();
}

function readExpirationSeconds(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof claims.exp === 'number' ? claims.exp : null;
  } catch (error) {
    return null;
  }
}
