import { ComponentFixture, TestBed } from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {CommentModel} from '../../common/models/comment.model';

import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const comment: CommentModel = {
    postId: 1,
    author: {
      profileName: 'Test User',
      username: 'testuser',
      profilePhotoUrl: '/assets/testuser.png'
    },
    commentId: 1,
    username: 'testuser',
    body: 'Test comment body',
    totalLikes: 0,
    totalDislikes: 0,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    myReaction: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('comment', comment);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
