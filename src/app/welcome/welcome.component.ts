import {Component, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {SignUpComponent} from './sign-up/sign-up.component';
import {SignInComponent} from './sign-in/sign-in.component';

export type WelcomeState = 'welcome' | 'signin' | 'signup';

@Component({
  selector: 'app-welcome',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButton,
    MatDatepickerModule,
    MatNativeDateModule,
    SignUpComponent,
    SignInComponent
  ],
  providers: [
    MatDatepickerModule
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  welcomeState = signal<WelcomeState>('welcome');
}
