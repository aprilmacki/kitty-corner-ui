import { ComponentFixture, TestBed } from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

import { CommentSectionComponent } from './comment-section.component';

describe('CommentSectionComponent', () => {
  let component: CommentSectionComponent;
  let fixture: ComponentFixture<CommentSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentSectionComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('postId', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
