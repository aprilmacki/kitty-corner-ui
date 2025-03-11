import { Routes } from '@angular/router';
import {FeedComponent} from './feed/feed.component';
import {ProfileComponent} from './profile/profile.component';
import {SettingsComponent} from './settings/settings.component';

export const routes: Routes = [
  {
    path: 'users/:username/profile',
    component: ProfileComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'feed',
    component: FeedComponent,
  },
  {
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full'
  }
];
