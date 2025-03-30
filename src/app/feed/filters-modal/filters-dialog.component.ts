import {Component, computed, inject, signal} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from '@angular/material/slider';
import {FeedFilterModel} from '../../common/types';

@Component({
  selector: 'app-filters-modal',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatDialogActions,
    MatButton,
    MatSlider,
    MatSliderRangeThumb,
    FormsModule,
    MatDialogClose,
    MatSliderThumb
  ],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss'
})
export class FiltersDialogComponent {
  readonly dialogRef = inject(MatDialogRef<FiltersDialogComponent>);
  readonly existingFilters: FeedFilterModel = inject<FeedFilterModel>(MAT_DIALOG_DATA);
  readonly MAX_AGE: number = 80;

  // We use separate signals for each property due to two-way bindings with input components
  newStartAge = signal<number | null>(this.existingFilters.startAge);
  newEndAge = signal<number | null>(this.existingFilters.endAge);
  newDistanceKm = signal<number | null>(this.existingFilters.distanceKm);
  newFilters = computed(() => {
    return {
      startAge: this.newStartAge(),
      endAge: this.newEndAge(),
      distanceKm: this.newDistanceKm()
    } as FeedFilterModel;
  });

  closeDialog(): void {
    this.dialogRef.close();
  }

  toEndAgeLabel(endAge: number | null): string {
    if (endAge == null || endAge >= this.MAX_AGE) {
      return String(this.MAX_AGE) + '+';
    }
    return String(endAge);
  }
}
