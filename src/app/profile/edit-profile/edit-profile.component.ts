import {Component, inject, input, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TopBarComponent} from '../../common/top-bar/top-bar.component';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatButtonModule, MatIconButton} from '@angular/material/button';
import {UserProfileModel} from '../../services/kitty-corner-api/models/user.model';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSlider, MatSliderRangeThumb} from '@angular/material/slider';
import {MatFormField, MatHint, MatInput, MatInputModule, MatLabel} from '@angular/material/input';
import {KittyCornerApiService} from '../../services/kitty-corner-api/kitty-corner-api.service';
import {LoadingStatus} from '../../common/types';
import {initializeAutocomplete} from '@angular/cli/src/utilities/completion';
import {MatProgressSpinner, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';

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
    MatIcon
  ],
  providers: [
    MatDatepickerModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {
  private apiService = inject(KittyCornerApiService);

  username = input.required<string>();

  initialLoadingStatus = signal<LoadingStatus>('loading');

  nameField= new FormControl('', [Validators.maxLength(256), Validators.required]);
  pronounsField= new FormControl('', [Validators.maxLength(256), Validators.required]);
  birthdayField = new FormControl(new Date(), [Validators.required]);
  locationField = new FormControl('', [Validators.maxLength(256), Validators.required]);
  latitude: number = NaN;
  longitude: number = NaN;

  ngOnInit(): void {
    this.apiService.getUserProfile(this.username()).subscribe({
      next: result => {
        this.nameField.setValue(result.name);
        this.pronounsField.setValue(result.pronouns);
        this.birthdayField.setValue(new Date(result.yourInfo!.birthday));
        this.locationField.setValue(result.location);
        this.latitude = result.yourInfo!.latitude;
        this.longitude = result.yourInfo!.longitude;

        this.initialLoadingStatus.set('success');
      },
      error: error => {
        console.log(error);
        this.initialLoadingStatus.set('error');
      }
    });
  }

  updateLocation() {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    // https://ipinfo.io/64.53.128.124/json
    // https://api.ipify.org/?format=json

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        console.log(`(lat, lon) = (${this.latitude}, ${this.longitude})`);
      },
      (error: GeolocationPositionError) => {
        console.log(`Error fetching geo location: code=${error.code}, message=${error.message}`);
      },
      {timeout: 20000, maximumAge: 0, enableHighAccuracy: false}
    );
  }
}
