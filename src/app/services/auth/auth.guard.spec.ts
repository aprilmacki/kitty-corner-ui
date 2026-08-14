import { TestBed } from '@angular/core/testing';
import {ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';

import { authGuard, signedOutGuard } from './auth.guard';

function buildToken(expirationSeconds: number): string {
  return `header.${btoa(JSON.stringify({exp: expirationSeconds}))}.signature`;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function expectRedirectTo(result: unknown, url: string) {
  expect(result instanceof UrlTree).toBeTrue();
  expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(url);
}

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  }

  function expectRedirectToUnauthenticated(result: unknown) {
    expectRedirectTo(result, '/unauthenticated');
  }

  it('should allow access when the access token is not expired', () => {
    spyOn(localStorage, 'getItem').and.returnValue(buildToken(nowSeconds() + 60));
    expect(runGuard()).toBeTrue();
  });

  it('should redirect when there is no access token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expectRedirectToUnauthenticated(runGuard());
  });

  it('should redirect when the access token is expired', () => {
    spyOn(localStorage, 'getItem').and.returnValue(buildToken(nowSeconds() - 60));
    expectRedirectToUnauthenticated(runGuard());
  });

  it('should redirect when the access token cannot be decoded', () => {
    spyOn(localStorage, 'getItem').and.returnValue('not-a-jwt');
    expectRedirectToUnauthenticated(runGuard());
  });
});

describe('signedOutGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      signedOutGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  }

  it('should redirect to the feed when the access token is not expired', () => {
    spyOn(localStorage, 'getItem').and.returnValue(buildToken(nowSeconds() + 60));
    expectRedirectTo(runGuard(), '/posts');
  });

  it('should allow access when there is no access token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(runGuard()).toBeTrue();
  });

  it('should allow access when the access token is expired', () => {
    spyOn(localStorage, 'getItem').and.returnValue(buildToken(nowSeconds() - 60));
    expect(runGuard()).toBeTrue();
  });
});
