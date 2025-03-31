import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';

export type LocationLoadingStatus = 'loading' | 'success' | 'error' | 'error-permission-denied';

@Component({
  selector: 'app-edit-location-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './edit-location-dialog.component.html',
  styleUrl: './edit-location-dialog.component.scss'
})
export class EditLocationDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<EditLocationDialogComponent>);

  locationLoadingStatus = signal<LocationLoadingStatus>('loading');

  latitude = signal<number>(NaN);
  longitude = signal<number>(NaN);
  location = computed<{lat: number, lon: number}>(() => {
    return {
      lat: this.latitude(),
      lon: this.longitude()
    };
  });

  ngOnInit() {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      this.locationLoadingStatus.set('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        this.latitude.set(position.coords.latitude);
        this.longitude.set(position.coords.longitude);
        this.locationLoadingStatus.set('success');
      },
      (error: GeolocationPositionError) => {
        console.error(error);
        if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
          this.locationLoadingStatus.set('error-permission-denied');
          return
        }
        this.locationLoadingStatus.set('error');
      },
      {timeout: 20000, maximumAge: 0, enableHighAccuracy: false}
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
