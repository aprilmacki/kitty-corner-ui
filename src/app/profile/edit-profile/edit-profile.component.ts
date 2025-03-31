import {Component, computed, inject, input, OnInit, signal} from '@angular/core';
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
import {PostDialogComponent} from '../../feed/post-dialog/post-dialog.component';
import {Observable} from 'rxjs';
import {PostModel} from '../../services/kitty-corner-api/models/post.model';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {EditLocationDialogComponent} from '../edit-location-dialog/edit-location-dialog.component';
import {ReverseGeocodeDto} from '../../services/kitty-corner-api/dtos/utils.dto';

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
  private dialogService = inject(MatDialog);

  username = input.required<string>();
  initialLoadingStatus = signal<LoadingStatus>('loading');

  nameField = new FormControl('', [Validators.maxLength(256), Validators.required]);
  pronounsField = new FormControl('', [Validators.maxLength(256), Validators.required]);
  birthdayField = new FormControl(new Date(), [Validators.required]);
  locationField = new FormControl('', [Validators.maxLength(256), Validators.required]);

  currentLocation = signal<ReverseGeocodeDto | null>(null);

  ngOnInit(): void {
    this.apiService.getUserProfile(this.username()).subscribe({
      next: result => {
        this.nameField.setValue(result.name);
        this.pronounsField.setValue(result.pronouns);
        this.birthdayField.setValue(new Date(result.yourInfo!.birthday));

        this.currentLocation.set({
          latitude: result.yourInfo!.latitude,
          longitude: result.yourInfo!.longitude,
          location: result.location
        } as ReverseGeocodeDto);
        this.locationField.setValue(this.currentLocation()!.location);

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
      data: this.currentLocation()
    });

    dialogRef.afterClosed().subscribe({
      next: (results: ReverseGeocodeDto) => {
        console.log(results);
        if (results == null) {
          return;
        }
        this.currentLocation.set(results);
        this.locationField.setValue(results.location);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
