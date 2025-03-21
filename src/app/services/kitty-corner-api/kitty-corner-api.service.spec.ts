import { TestBed } from '@angular/core/testing';

import { KittyCornerApiService } from './kitty-corner-api.service';

describe('KittyCornerApiService', () => {
  let service: KittyCornerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KittyCornerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
