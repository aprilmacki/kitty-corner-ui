import { ComponentFixture, TestBed } from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {PostModel} from '../common/models/post.model';

import { PostComponent } from './post.component';

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;

  const post: PostModel = {
    postId: 1,
    author: {
      profileName: 'Test User',
      username: 'testuser',
      profilePhotoUrl: '/assets/testuser.png'
    },
    body: 'Test post body',
    distanceKm: 3,
    totalLikes: 0,
    totalDislikes: 0,
    totalComments: 0,
    createdAt: new Date(0),
    updatedAt: null,
    myReaction: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('post', post);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
