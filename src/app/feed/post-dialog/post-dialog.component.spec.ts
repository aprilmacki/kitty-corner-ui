import { ComponentFixture, TestBed } from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

import { PostDialogComponent } from './post-dialog.component';

describe('PostDialogComponent', () => {
  let component: PostDialogComponent;
  let fixture: ComponentFixture<PostDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: MatDialogRef, useValue: {close: () => {}}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
