import { TestBed } from '@angular/core/testing';
import {ActivatedRouteSnapshot, convertToParamMap, provideRouter, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {firstValueFrom, Observable} from 'rxjs';

import { authGuard, ownProfileGuard, signedOutGuard } from './auth.guard';

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

function expiredToken(subject?: string): string {
  return buildToken(nowSeconds() - 60, subject);
}

// Backs localStorage with a plain object so setSession() during refresh doesn't leak between specs.
function fakeLocalStorage(): Record<string, string> {
  const store: Record<string, string> = {};
  spyOn(localStorage, 'getItem').and.callFake(key => store[key] ?? null);
  spyOn(localStorage, 'setItem').and.callFake((key, value) => { store[key] = value; });
  spyOn(localStorage, 'removeItem').and.callFake(key => { delete store[key]; });
  return store;
}

function expectRedirectTo(result: unknown, url: string) {
  expect(result instanceof UrlTree).toBeTrue();
  expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(url);
}

function routeWithParams(params: Record<string, string>): ActivatedRouteSnapshot {
  return {paramMap: convertToParamMap(params)} as ActivatedRouteSnapshot;
}

describe('authGuard', () => {
  let store: Record<string, string>;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    store = fakeLocalStorage();
  });

  afterEach(() => httpTesting.verify());

  function runGuard(url: string = '/settings') {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {url: url} as RouterStateSnapshot));
  }

  function expectRedirectToUnauthenticated(result: unknown) {
    expectRedirectTo(result, '/unauthenticated?returnUrl=%2Fsettings');
  }

  it('should allow access when the access token is not expired', () => {
    store[ACCESS_TOKEN_KEY] = liveToken();
    expect(runGuard()).toBeTrue();
  });

  it('should redirect when there is no access token', () => {
    expectRedirectToUnauthenticated(runGuard());
  });

  it('should redirect when the access token cannot be decoded', () => {
    store[ACCESS_TOKEN_KEY] = 'not-a-jwt';
    expectRedirectToUnauthenticated(runGuard());
  });

  it('should redirect when both tokens are expired, without attempting a refresh', () => {
    store[ACCESS_TOKEN_KEY] = expiredToken();
    store[REFRESH_TOKEN_KEY] = expiredToken();
    expectRedirectToUnauthenticated(runGuard());
    httpTesting.expectNone('/api/v1/auth/refresh');
  });

  it('should allow access when an expired access token is refreshed successfully', async () => {
    store[ACCESS_TOKEN_KEY] = expiredToken();
    store[REFRESH_TOKEN_KEY] = liveToken();

    const result = firstValueFrom(runGuard() as Observable<boolean | UrlTree>);
    httpTesting.expectOne('/api/v1/auth/refresh').flush({
      accessToken: liveToken(),
      refreshToken: liveToken()
    });

    expect(await result).toBeTrue();
  });

  it('should redirect when the refresh attempt fails', async () => {
    store[ACCESS_TOKEN_KEY] = expiredToken();
    store[REFRESH_TOKEN_KEY] = liveToken();

    const result = firstValueFrom(runGuard() as Observable<boolean | UrlTree>);
    httpTesting.expectOne('/api/v1/auth/refresh')
      .flush({}, {status: 401, statusText: 'Unauthorized'});

    expectRedirectToUnauthenticated(await result);
  });
});

describe('signedOutGuard', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = fakeLocalStorage();
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      signedOutGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  }

  it('should redirect to the feed when the access token is not expired', () => {
    store[ACCESS_TOKEN_KEY] = liveToken();
    expectRedirectTo(runGuard(), '/posts');
  });

  it('should allow access when there is no access token', () => {
    expect(runGuard()).toBeTrue();
  });

  it('should allow access when the access token is expired', () => {
    store[ACCESS_TOKEN_KEY] = expiredToken();
    expect(runGuard()).toBeTrue();
  });
});

describe('ownProfileGuard', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = fakeLocalStorage();
  });

  function runGuard(username: string) {
    return TestBed.runInInjectionContext(() =>
      ownProfileGuard(routeWithParams({username: username}), {} as RouterStateSnapshot));
  }

  it('should allow the owner through', () => {
    store[ACCESS_TOKEN_KEY] = liveToken('aprilmack');
    expect(runGuard('aprilmack')).toBeTrue();
  });

  it('should redirect everyone else to the read-only profile', () => {
    store[ACCESS_TOKEN_KEY] = liveToken('aprilmack');
    expectRedirectTo(runGuard('someone-else'), '/users/someone-else/profile');
  });

  it('should redirect when the token carries no subject', () => {
    store[ACCESS_TOKEN_KEY] = liveToken();
    expectRedirectTo(runGuard('aprilmack'), '/users/aprilmack/profile');
  });
});
