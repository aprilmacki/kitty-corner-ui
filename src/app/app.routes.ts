import { Routes } from '@angular/router';
import {FeedComponent} from './feed/feed.component';
import {ProfileComponent} from './profile/profile.component';
import {SettingsComponent} from './settings/settings.component';
import {CommentSectionComponent} from './comment-section/comment-section.component';
import {EditProfileComponent} from './profile/edit-profile/edit-profile.component';
import {WelcomeComponent} from './welcome/welcome.component';
import {HomeComponent} from './home/home.component';
import {UnauthenticatedComponent} from './unauthenticated/unauthenticated.component';
import {authGuard, ownProfileGuard, signedOutGuard} from './services/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [signedOutGuard],
  },
  {
    path: 'unauthenticated',
    component: UnauthenticatedComponent,
    // Safe because the interceptor clears the session before navigating here.
    canActivate: [signedOutGuard],
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'users/:username/profile/edit',
        component: EditProfileComponent,
        canActivate: [ownProfileGuard],
      },
      {
        path: 'users/:username/profile',
        component: ProfileComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'posts',
        component: FeedComponent,
      },
      {
        path: 'posts/:postId/comments',
        component: CommentSectionComponent
      },
      {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: '/posts'
      }
    ]
  },
];
