import { Routes } from '@angular/router';
import {FeedComponent} from './feed/feed.component';
import {ProfileComponent} from './profile/profile.component';
import {SettingsComponent} from './settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: FeedComponent
  },
  {
    path: 'users/:username/profile',
    component: ProfileComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  }
];
