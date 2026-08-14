import { TestBed } from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import {TokenPairDto} from './dtos/auth.dto';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function buildToken(expirationSeconds: number, subject?: string): string {
  return `header.${btoa(JSON.stringify({exp: expirationSeconds, sub: subject}))}.signature`;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function liveToken(subject?: string): string {
  return buildToken(nowSeconds() + 3600, subject);
}

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let store: Record<string, string>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    store = {};
    spyOn(localStorage, 'getItem').and.callFake(key => store[key] ?? null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => { store[key] = value; });
    spyOn(localStorage, 'removeItem').and.callFake(key => { delete store[key]; });

    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should collapse concurrent refreshOnce callers onto a single request', () => {
    const results: TokenPairDto[] = [];
    service.refreshOnce().subscribe(pair => results.push(pair));
    service.refreshOnce().subscribe(pair => results.push(pair));

    // expectOne throws if the interceptor-free client issued a second rotation.
    httpTesting.expectOne('/api/v1/auth/refresh').flush({
      accessToken: liveToken('aprilmack'),
      refreshToken: liveToken('aprilmack')
    });

    expect(results.length).toBe(2);
    expect(service.getCurrentUsername()).toBe('aprilmack');
  });

  it('should start a new request once the previous refresh has settled', () => {
    const firstToken = liveToken('first');
    service.refreshOnce().subscribe();
    httpTesting.expectOne('/api/v1/auth/refresh').flush({
      accessToken: firstToken,
      refreshToken: firstToken
    });
    expect(service.getAccessToken()).toBe(firstToken);

    const secondToken = liveToken('second');
    service.refreshOnce().subscribe();
    httpTesting.expectOne('/api/v1/auth/refresh').flush({
      accessToken: secondToken,
      refreshToken: secondToken
    });
    expect(service.getAccessToken()).toBe(secondToken);
  });

  it('should report the signed-in state as a signal', () => {
    expect(service.signedIn()).toBeFalse();

    service.signIn('aprilmack', 'password').subscribe();
    httpTesting.expectOne('/api/v1/auth/signin').flush({
      accessToken: liveToken('aprilmack'),
      refreshToken: liveToken('aprilmack')
    });
    expect(service.signedIn()).toBeTrue();

    service.clearSession();
    expect(service.signedIn()).toBeFalse();
  });

  it('should treat an undecodable token as expired and nameless', () => {
    store[ACCESS_TOKEN_KEY] = 'not-a-jwt';
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getCurrentUsername()).toBeNull();
  });

  it('should treat a token without an exp claim as expired', () => {
    store[ACCESS_TOKEN_KEY] = `header.${btoa(JSON.stringify({sub: 'aprilmack'}))}.signature`;
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getCurrentUsername()).toBe('aprilmack');
  });

  it('should treat a token expiring inside the skew window as expired', () => {
    store[ACCESS_TOKEN_KEY] = buildToken(nowSeconds() + 5);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should clear both tokens on clearSession', () => {
    store[ACCESS_TOKEN_KEY] = liveToken();
    store[REFRESH_TOKEN_KEY] = liveToken();

    service.clearSession();

    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });
});
