import { TestBed } from '@angular/core/testing';

import { KittyCornerApiClient } from './kitty-corner-api.client';

describe('KittyCornerApiService', () => {
  let service: KittyCornerApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KittyCornerApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
