import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, tap} from 'rxjs';
import {TokenPairDto} from './dtos/auth.dto';
import {SignUpModel} from '../../common/models/signup.model';

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

  private setSession(tokenPair: TokenPairDto) {
    localStorage.setItem('accessToken', tokenPair.accessToken);
    localStorage.setItem('refreshToken', tokenPair.refreshToken);
  }
}
