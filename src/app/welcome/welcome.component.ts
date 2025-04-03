import {Component, signal} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

export type WelcomeState = 'welcome' | 'signin' | 'signup1' | 'signup2';

@Component({
  selector: 'app-welcome',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule,
    MatIconButton,
    MatButton,
    RouterLink
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  readonly USERNAME_MAX_LENGTH = 32;
  readonly USERNAME_MIN_LENGTH = 3;
  readonly PASSWORD_MAX_LENGTH = 64;
  readonly PASSWORD_MIN_LENGTH = 12;

  welcomeState = signal<WelcomeState>('welcome');

  hideSigninPassword = signal<boolean>(true);
  signinForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.maxLength(this.USERNAME_MAX_LENGTH), Validators.minLength(this.USERNAME_MIN_LENGTH), Validators.required]),
    password: new FormControl('', [Validators.maxLength(this.PASSWORD_MAX_LENGTH), Validators.minLength(this.PASSWORD_MIN_LENGTH), Validators.required]),
  });

  signupForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    username: new FormControl('', [Validators.maxLength(this.USERNAME_MAX_LENGTH), Validators.minLength(this.USERNAME_MIN_LENGTH), Validators.required]),
    password: new FormControl('', [Validators.maxLength(this.PASSWORD_MAX_LENGTH), Validators.minLength(this.PASSWORD_MIN_LENGTH), Validators.required]),
    confirmPassword: new FormControl('', [Validators.maxLength(128), Validators.required]),
  });

  hideSignupPassword = signal<boolean>(true);
  hideSignupConfirmPassword = signal<boolean>(true);

  signup2Form: FormGroup = new FormGroup({
    profileName: new FormControl('', [Validators.maxLength(128), Validators.required]),
  });

  constructor() {
    this.signupForm.controls['confirmPassword'].addValidators(this.buildPasswordsMatchValidator(this.signupForm.controls['password']));
    this.signupForm.controls['password'].valueChanges.subscribe(() => this.signupForm.controls['confirmPassword'].updateValueAndValidity());
  }

  private buildPasswordsMatchValidator(passwordControl: AbstractControl): ValidatorFn {
    return (confirmPasswordControl: AbstractControl): ValidationErrors | null => {
      if (passwordControl.value !== confirmPasswordControl.value) {
        return {
          'passwordMismatch': true
        };
      }
      return null;
    };
  }

}
