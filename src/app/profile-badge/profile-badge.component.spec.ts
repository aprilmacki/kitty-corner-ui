import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileBadgeComponent } from './profile-badge.component';

describe('ProfileBadgeComponent', () => {
  let component: ProfileBadgeComponent;
  let fixture: ComponentFixture<ProfileBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileBadgeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('username', 'testuser');
    fixture.componentRef.setInput('name', 'Test User');
    fixture.componentRef.setInput('photoUrl', '/assets/testuser.png');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the given user, not a hardcoded one', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Test User');
    expect(text).toContain('@testuser');
  });
});
