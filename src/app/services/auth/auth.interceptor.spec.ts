import {TestBed} from '@angular/core/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';

import {authInterceptor} from './auth.interceptor';
import {AuthService} from './auth.service';

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

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let store: Record<string, string>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    store = {};
    spyOn(localStorage, 'getItem').and.callFake(key => store[key] ?? null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => { store[key] = value; });
    spyOn(localStorage, 'removeItem').and.callFake(key => { delete store[key]; });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should attach the access token to api requests', () => {
    store[ACCESS_TOKEN_KEY] = liveToken();
    httpClient.get('/api/v1/posts').subscribe();

    const request = httpTesting.expectOne('/api/v1/posts');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${store[ACCESS_TOKEN_KEY]}`);
    request.flush({});
  });

  it('should not attach a token to signin', () => {
    store[ACCESS_TOKEN_KEY] = liveToken();
    httpClient.post('/api/v1/auth/signin', {}).subscribe();

    const request = httpTesting.expectOne('/api/v1/auth/signin');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });

  it('should send the refresh token, not the access token, to signout', () => {
    store[ACCESS_TOKEN_KEY] = liveToken();
    store[REFRESH_TOKEN_KEY] = liveToken();
    httpClient.post('/api/v1/auth/signout', {}).subscribe();

    const request = httpTesting.expectOne('/api/v1/auth/signout');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${store[REFRESH_TOKEN_KEY]}`);
    request.flush({});
  });

  it('should refresh and retry the original request after a 401', () => {
    const staleToken = buildToken(nowSeconds() - 60);
    const freshToken = liveToken();
    store[ACCESS_TOKEN_KEY] = staleToken;
    store[REFRESH_TOKEN_KEY] = liveToken();

    let response: unknown = null;
    httpClient.get('/api/v1/posts').subscribe(result => response = result);

    httpTesting.expectOne('/api/v1/posts').flush({}, {status: 401, statusText: 'Unauthorized'});
    httpTesting.expectOne('/api/v1/auth/refresh').flush({
      accessToken: freshToken,
      refreshToken: liveToken()
    });

    const retry = httpTesting.expectOne('/api/v1/posts');
    expect(retry.request.headers.get('Authorization')).toBe(`Bearer ${freshToken}`);
    retry.flush({posts: []});

    expect(response).toEqual({posts: []});
  });

  it('should refresh only once for concurrent 401s', () => {
    store[ACCESS_TOKEN_KEY] = buildToken(nowSeconds() - 60);
    store[REFRESH_TOKEN_KEY] = liveToken();

    httpClient.get('/api/v1/posts').subscribe({error: () => {}});
    httpClient.get('/api/v1/users/aprilmack/profile').subscribe({error: () => {}});

    httpTesting.expectOne('/api/v1/posts').flush({}, {status: 401, statusText: 'Unauthorized'});
    httpTesting.expectOne('/api/v1/users/aprilmack/profile')
      .flush({}, {status: 401, statusText: 'Unauthorized'});

    // Two refreshes here would rotate the chain twice and trip the server's replay detection.
    const refreshRequests = httpTesting.match('/api/v1/auth/refresh');
    expect(refreshRequests.length).toBe(1);
    refreshRequests[0].flush({
      accessToken: liveToken(),
      refreshToken: liveToken()
    });

    httpTesting.expectOne('/api/v1/posts').flush({});
    httpTesting.expectOne('/api/v1/users/aprilmack/profile').flush({});
  });

  it('should end the session when the refresh itself is rejected', () => {
    store[ACCESS_TOKEN_KEY] = buildToken(nowSeconds() - 60);
    store[REFRESH_TOKEN_KEY] = liveToken();

    let errorStatus = 0;
    httpClient.get('/api/v1/posts').subscribe({error: error => errorStatus = error.status});

    httpTesting.expectOne('/api/v1/posts').flush({}, {status: 401, statusText: 'Unauthorized'});
    httpTesting.expectOne('/api/v1/auth/refresh')
      .flush({}, {status: 401, statusText: 'Unauthorized'});

    expect(errorStatus).toBe(401);
    expect(TestBed.inject(AuthService).getAccessToken()).toBeNull();
    expect(TestBed.inject(AuthService).getRefreshToken()).toBeNull();
  });

  it('should not attempt a refresh for a non-401 error', () => {
    store[ACCESS_TOKEN_KEY] = liveToken();

    let errorStatus = 0;
    httpClient.get('/api/v1/posts').subscribe({error: error => errorStatus = error.status});

    httpTesting.expectOne('/api/v1/posts').flush({}, {status: 500, statusText: 'Server Error'});

    expect(errorStatus).toBe(500);
    httpTesting.expectNone('/api/v1/auth/refresh');
  });
});
