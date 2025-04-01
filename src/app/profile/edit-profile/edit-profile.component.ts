import {Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {TopBarComponent} from '../../common/top-bar/top-bar.component';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {toUserProfileModel, UserProfileModel} from '../../services/kitty-corner-api/models/user.model';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {KittyCornerApiService} from '../../services/kitty-corner-api/kitty-corner-api.service';
import {LoadingStatus} from '../../common/types';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';
import {map} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {EditLocationDialogComponent} from '../edit-location-dialog/edit-location-dialog.component';
import {ReverseGeocodeDto} from '../../services/kitty-corner-api/dtos/utils.dto';
import {KittyCornerApiClient} from '../../services/kitty-corner-api/kitty-corner-api.client';
import {UpdateUserProfileDto, UserProfileDto} from '../../services/kitty-corner-api/dtos/user.dto';
import {DatePipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  imports: [
    TopBarComponent,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIcon,
    RouterLink
  ],
  providers: [
    MatDatepickerModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {
  private readonly apiService = inject(KittyCornerApiService);
  private readonly apiClient = inject(KittyCornerApiClient);
  private readonly dialogService = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly datePipe: DatePipe = new DatePipe('en-US')

  username = input.required<string>();
  profileRouterLink = computed(() => `/users/${this.username()}/profile`);
  initialLoadingStatus = signal<LoadingStatus>('loading');
  oldProfile = signal<UserProfileModel | null>(null);
  location = signal<ReverseGeocodeDto | null>(null);

  formGroup: FormGroup = new FormGroup({
    nameField: new FormControl('', [Validators.maxLength(128), Validators.required]),
    pronounsField: new FormControl('', [Validators.maxLength(64), Validators.required]),
    birthdayField: new FormControl(new Date(), [Validators.required]),
    locationField: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.apiService.getUserProfile(this.username()).subscribe({
      next: result => {
        this.oldProfile.set(result);

        this.formGroup.controls['nameField'].setValue(result.name);
        this.formGroup.controls['pronounsField'].setValue(result.pronouns);
        this.formGroup.controls['birthdayField'].setValue(this.toBirthdayDate(result.yourInfo!.birthday));
        this.formGroup.controls['locationField'].setValue(result.location);

        this.location.set({
          latitude: result.yourInfo!.latitude,
          longitude: result.yourInfo!.longitude,
          location: result.location
        } as ReverseGeocodeDto);

        this.initialLoadingStatus.set('success');
      },
      error: error => {
        console.error(error);
        this.initialLoadingStatus.set('error');
      }
    });
  }

  openEditLocationDialog() {
    const dialogRef = this.dialogService.open(EditLocationDialogComponent, {
      width: '50vw',
      data: this.location()
    });

    dialogRef.afterClosed().subscribe({
      next: (results: ReverseGeocodeDto) => {
        console.log(results);
        if (results == null) {
          return;
        }
        this.location.set(results)
        this.formGroup.controls['locationField'].setValue(results.location);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  hasChanged(): boolean {
    if (this.oldProfile() == null) {
      return false;
    }
    if (this.formGroup.controls['nameField'].value !== this.oldProfile()!.name) {
      return true;
    }
    if (this.formGroup.controls['pronounsField'].value !== this.oldProfile()!.pronouns) {
      return true;
    }
    if (this.toBirthdayString(this.formGroup.controls['birthdayField'].value) !== this.oldProfile()!.yourInfo!.birthday) {
      return true;
    }
    if (this.location()!.latitude !== this.oldProfile()!.yourInfo!.latitude
      || this.location()!.longitude !== this.oldProfile()!.yourInfo!.longitude
      || this.location()!.location !== this.oldProfile()!.location) {
      return true;
    }
    return false;
  }

  updateProfile() {
    const update = {
      name: this.formGroup.controls['nameField'].value,
      pronouns: this.formGroup.controls['pronounsField'].value,
      birthday: this.toBirthdayString(this.formGroup.controls['birthdayField'].value),
      latitude: this.location()!.latitude,
      longitude: this.location()!.longitude
    } as UpdateUserProfileDto;
    this.apiClient.updateUserProfile(this.username(), update).pipe(
      map((profile: UserProfileDto) => toUserProfileModel(profile))
    ).subscribe({
      next: (results: UserProfileModel) => {
        this.oldProfile.set(results);
        this.router.navigate([this.profileRouterLink(), {'username': this.username()}]);
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  private toBirthdayString(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd', 'UTC')!;
  }

  private toBirthdayDate(birthday: string): Date {
    const date = new Date();
    date.setFullYear(Number(birthday.substring(0, 4)));
    date.setMonth(Number(birthday.substring(5, 7)) - 1);
    date.setDate(Number(birthday.substring(8)));
    return date;
  }
}
