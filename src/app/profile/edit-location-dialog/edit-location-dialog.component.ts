import {Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {KittyCornerApiClient} from '../../services/kitty-corner-api/kitty-corner-api.client';
import {concatMap, Observable} from 'rxjs';
import {ReverseGeocodeDto} from '../../services/kitty-corner-api/dtos/utils.dto';

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
  private apiClient = inject(KittyCornerApiClient);
  readonly currentLocation = inject<ReverseGeocodeDto>(MAT_DIALOG_DATA);

  locationLoadingStatus = signal<LocationLoadingStatus>('loading');
  location = signal<ReverseGeocodeDto | null>(null);

  ngOnInit() {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      this.locationLoadingStatus.set('error');
      return;
    }

    const getGeoObs = new Observable<GeolocationCoordinates>((observer) => {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          observer.next(position.coords);
          observer.complete();
        },
        (error: GeolocationPositionError) => {
          observer.error(error);
        },
        {timeout: 20000, maximumAge: 0, enableHighAccuracy: false}
      );
    });

    getGeoObs.pipe(
      concatMap((coords: GeolocationCoordinates) => {
        return this.apiClient.reverseGeocode(coords.latitude, coords.longitude);
      })
    ).subscribe({
      next: (results: ReverseGeocodeDto) => {
        this.location.set(results);
        this.locationLoadingStatus.set('success');
      },
      error: (err) => {
        console.error(err);
        if (err?.code === GeolocationPositionError.PERMISSION_DENIED) {
          this.locationLoadingStatus.set('error-permission-denied');
          return;
        }
        this.locationLoadingStatus.set('error');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
