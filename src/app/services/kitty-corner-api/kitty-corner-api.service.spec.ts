import { TestBed } from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

import { KittyCornerApiService } from './kitty-corner-api.service';

describe('KittyCornerApiService', () => {
  let service: KittyCornerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(KittyCornerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
