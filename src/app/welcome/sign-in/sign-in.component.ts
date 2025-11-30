import {Component, inject, output, signal} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {Constraints} from '../constraints';
import {LoadingStatus} from '../../common/types';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';

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
  signInProcessing: LoadingStatus = 'success';
  hideSigninPassword = signal<boolean>(true);
  backEvent = output<void>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

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

  protected readonly Constraints = Constraints;
}
