import { Routes } from '@angular/router';
import {FeedComponent} from './feed/feed.component';
import {ProfileComponent} from './profile/profile.component';
import {SettingsComponent} from './settings/settings.component';
import {CommentSectionComponent} from './comment-section/comment-section.component';
import {EditProfileComponent} from './profile/edit-profile/edit-profile.component';
import {WelcomeComponent} from './welcome/welcome.component';
import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'users/:username/profile/edit',
        component: EditProfileComponent,
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
        redirectTo: '/posts',
        pathMatch: 'full'
      }
    ]
  },
];
