import {Component, inject, output, signal} from '@angular/core';
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
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SignUpModel} from '../../common/models/signup.model';
import moment from 'moment/moment';
import {LoadingStatus} from '../../common/types';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';
import {Constraints} from '../constraints';

export type SignupState = 'signup1' | 'signup2';

@Component({
  selector: 'app-sign-up',
  imports: [
    FormsModule,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  signupForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    username: new FormControl('', [Validators.maxLength(Constraints.USERNAME_MAX_LENGTH), Validators.minLength(Constraints.USERNAME_MIN_LENGTH), Validators.required]),
    password: new FormControl('', [Validators.maxLength(Constraints.PASSWORD_MAX_LENGTH), Validators.minLength(Constraints.PASSWORD_MIN_LENGTH), Validators.required]),
    confirmPassword: new FormControl('', [Validators.maxLength(128), Validators.required]),
  });

  birthdayMax: Date = moment().subtract(18, 'years').toDate();
  signup2Form: FormGroup = new FormGroup({
    profileName: new FormControl('', [Validators.maxLength(128), Validators.required]),
    pronouns: new FormControl('', [Validators.maxLength(64)]),
    birthday: new FormControl(null, [Validators.required]),
  });
  signUpProcessing: LoadingStatus = 'success';
  hideSignupPassword = signal<boolean>(true);
  hideSignupConfirmPassword = signal<boolean>(true);
  signupState = signal<SignupState>('signup1');
  backEvent = output<void>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor(
  ) {
    this.signupForm.controls['confirmPassword'].addValidators(this.buildPasswordsMatchValidator(this.signupForm.controls['password']));
    this.signupForm.controls['password'].valueChanges.subscribe(() => this.signupForm.controls['confirmPassword'].updateValueAndValidity());
  }

  public signUp() {
    this.signUpProcessing = 'loading';
    const signUpData = {
      email: this.signupForm.controls['email'].value,
      username: this.signupForm.controls['username'].value,
      password: this.signupForm.controls['password'].value,
      profileName: this.signup2Form.controls['profileName'].value,
      pronouns: this.signup2Form.controls['pronouns'].value,
      birthday: this.signup2Form.controls['birthday'].value,
    } as SignUpModel;
    this.authService.signUp(signUpData).subscribe({
      next: res => {
        this.signUpProcessing= 'success';
        this.router.navigate(['']);
      },
      error: err => {
        this.signUpProcessing = 'error';
        console.error(err);
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

  protected readonly Constraints = Constraints;
}
