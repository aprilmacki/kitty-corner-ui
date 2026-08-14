import {Injectable, signal, Signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {finalize, map, Observable, shareReplay, tap} from 'rxjs';
import {TokenPairDto} from './dtos/auth.dto';
import {SignUpModel} from '../../common/models/signup.model';
import {fromEpochSeconds} from '../../common/util';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Treat a token that is about to expire as already expired, so a request isn't sent with a
// token that lapses in flight.
const EXPIRY_SKEW_SECONDS = 30;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private refreshInFlight: Observable<TokenPairDto> | null = null;
  private readonly signedInState = signal<boolean>(this.getAccessToken() != null);

  constructor(private httpClient: HttpClient) {
    // Fires only in the *other* tabs, which is exactly who needs to know.
    window.addEventListener('storage', event => {
      if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
        this.signedInState.set(this.getAccessToken() != null);
      }
    });
  }

  /**
   * Whether a session exists locally. Reflects sign-in, sign-out and cross-tab changes, so
   * the UI can react without a navigation. Use isAuthenticated() to decide access — this
   * signal deliberately doesn't track expiry, which would need a timer to stay honest.
   */
  public get signedIn(): Signal<boolean> {
    return this.signedInState.asReadonly();
  }

  public signUp(signUpData: SignUpModel): Observable<TokenPairDto> {
    return this.httpClient.post<TokenPairDto>('/api/v1/auth/signup', signUpData).pipe(
      tap(tokenPair => this.setSession(tokenPair))
    );
  }

  public signIn(username: string, password: string): Observable<TokenPairDto> {
    return this.httpClient.post<TokenPairDto>('/api/v1/auth/signin', {
      username: username,
      password: password
    }).pipe(
      tap(tokenPair => this.setSession(tokenPair))
    );
  }

  public signOut(): Observable<void> {
    return this.httpClient.post('/api/v1/auth/signout', {}).pipe(
      map(_ => void 0)
    );
  }

  public refresh(): Observable<TokenPairDto> {
    return this.httpClient.post<TokenPairDto>('/api/v1/auth/refresh', {}).pipe(
      tap(tokenPair => this.setSession(tokenPair))
    );
  }

  /**
   * Refresh, collapsing concurrent callers onto a single request. Several 401s can land at
   * once (the feed and the profile badge load together); refreshing once per 401 would
   * rotate the token chain repeatedly and trip the server's replay detection.
   */
  public refreshOnce(): Observable<TokenPairDto> {
    if (this.refreshInFlight == null) {
      this.refreshInFlight = this.refresh().pipe(
        finalize(() => this.refreshInFlight = null),
        shareReplay({bufferSize: 1, refCount: false})
      );
    }
    return this.refreshInFlight;
  }

  public isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return accessToken != null && !isExpired(accessToken);
  }

  public hasLiveRefreshToken(): boolean {
    const refreshToken = this.getRefreshToken();
    return refreshToken != null && !isExpired(refreshToken);
  }

  public getCurrentUsername(): string | null {
    const accessToken = this.getAccessToken();
    if (accessToken == null) {
      return null;
    }
    const subject = readClaims(accessToken)?.['sub'];
    return typeof subject === 'string' ? subject : null;
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  public clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.signedInState.set(false);
  }

  private setSession(tokenPair: TokenPairDto) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokenPair.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenPair.refreshToken);
    this.signedInState.set(true);
  }
}

// A token that can't be decoded, or that has no `exp` claim, is treated as expired.
function isExpired(token: string): boolean {
  const expirationSeconds = readClaims(token)?.['exp'];
  if (typeof expirationSeconds !== 'number') {
    return true;
  }
  return fromEpochSeconds(expirationSeconds - EXPIRY_SKEW_SECONDS) <= new Date();
}

function readClaims(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (error) {
    return null;
  }
}
