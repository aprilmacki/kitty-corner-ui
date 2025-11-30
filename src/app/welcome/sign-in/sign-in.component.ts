import {Component, inject, output, signal} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {Constraints} from '../constraints';
import {LoadingStatus} from '../../common/types';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';

export type SignInState = 'loading' | 'success' | '403' | 'error';

@Component({
  selector: 'app-sign-in',
  imports: [
    FormsModule,
    MatButton,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  signinForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.maxLength(Constraints.USERNAME_MAX_LENGTH), Validators.minLength(Constraints.USERNAME_MIN_LENGTH), Validators.required]),
    password: new FormControl('', [Validators.maxLength(Constraints.PASSWORD_MAX_LENGTH), Validators.minLength(Constraints.PASSWORD_MIN_LENGTH), Validators.required]),
  });

  signInProcessing = signal<SignInState>('success');
  hideSigninPassword = signal<boolean>(true);
  backEvent = output<void>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public signIn() {
    this.signInProcessing.set('loading');
    this.authService.signIn(this.signinForm.controls['username'].value, this.signinForm.controls['password'].value).subscribe({
      next: result => {
        this.signInProcessing.set('success');
        this.router.navigate(['']);
      },
      error: error => {
        console.log(JSON.stringify(error));
        if (error.status === 403) {
          this.signInProcessing.set('403');
        } else {
          this.signInProcessing.set('error');
        }
        this.signinForm.controls['password'].setValue('');
      }
    });
  }

  protected readonly Constraints = Constraints;
}
