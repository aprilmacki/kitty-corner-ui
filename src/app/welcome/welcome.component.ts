import {Component, inject, signal} from '@angular/core';
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
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {LoadingStatus} from '../common/types';
import {SignUpModel} from '../common/models/signup.model';

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

  signinForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.maxLength(this.USERNAME_MAX_LENGTH), Validators.minLength(this.USERNAME_MIN_LENGTH), Validators.required]),
    password: new FormControl('', [Validators.maxLength(this.PASSWORD_MAX_LENGTH), Validators.minLength(this.PASSWORD_MIN_LENGTH), Validators.required]),
  });
  signInProcessing: LoadingStatus = 'success';
  hideSigninPassword = signal<boolean>(true);

  signupForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    username: new FormControl('', [Validators.maxLength(this.USERNAME_MAX_LENGTH), Validators.minLength(this.USERNAME_MIN_LENGTH), Validators.required]),
    password: new FormControl('', [Validators.maxLength(this.PASSWORD_MAX_LENGTH), Validators.minLength(this.PASSWORD_MIN_LENGTH), Validators.required]),
    confirmPassword: new FormControl('', [Validators.maxLength(128), Validators.required]),
  });
  signup2Form: FormGroup = new FormGroup({
    profileName: new FormControl('', [Validators.maxLength(128), Validators.required]),
    pronouns: new FormControl('', [Validators.maxLength(64)]),
  });
  signUpProcessing: LoadingStatus = 'success';
  hideSignupPassword = signal<boolean>(true);
  hideSignupConfirmPassword = signal<boolean>(true);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor(
  ) {
    this.signupForm.controls['confirmPassword'].addValidators(this.buildPasswordsMatchValidator(this.signupForm.controls['password']));
    this.signupForm.controls['password'].valueChanges.subscribe(() => this.signupForm.controls['confirmPassword'].updateValueAndValidity());
  }

  public signUp() {
    const signUpData = {
      email: this.signupForm.controls['email'].value,
      username: this.signupForm.controls['username'].value,
      password: this.signupForm.controls['password'].value,
      profileName: this.signup2Form.controls['profileName'].value,
    } as SignUpModel;
    this.authService.signUp(signUpData).subscribe({
      next: res => {
        this.signInProcessing = 'success';
        this.router.navigate(['']);
      },
      error: err => {
        this.signUpProcessing = 'error';
        console.error(err);
      }
    });
  }

  public signIn() {
    this.signInProcessing = 'loading';
    this.authService.signIn(this.signinForm.controls['username'].value, this.signinForm.controls['password'].value).subscribe({
      next: result => {
        this.signInProcessing = 'success';
        this.router.navigate(['']);
      },
      error: error => {
        this.signInProcessing = 'error';
      }
    });
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
