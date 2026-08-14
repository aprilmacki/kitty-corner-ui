import { ComponentFixture, TestBed } from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import { UnauthenticatedComponent } from './unauthenticated.component';

describe('UnauthenticatedComponent', () => {
  let component: UnauthenticatedComponent;
  let fixture: ComponentFixture<UnauthenticatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthenticatedComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthenticatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
