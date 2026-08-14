import { TestBed } from '@angular/core/testing';
import {ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';

import { authGuard } from './auth.guard';

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

  function buildToken(expirationSeconds: number): string {
    return `header.${btoa(JSON.stringify({exp: expirationSeconds}))}.signature`;
  }

  function nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  function expectRedirectToUnauthenticated(result: unknown) {
    expect(result instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/unauthenticated');
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
