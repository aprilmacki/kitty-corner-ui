import { ComponentFixture, TestBed } from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FeedFilterModel} from '../../common/types';

import { FiltersDialogComponent } from './filters-dialog.component';

describe('FiltersDialogComponent', () => {
  let component: FiltersDialogComponent;
  let fixture: ComponentFixture<FiltersDialogComponent>;

  const existingFilters: FeedFilterModel = {
    startAge: 18,
    endAge: 40,
    distanceKm: 50
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: {close: () => {}}},
        {provide: MAT_DIALOG_DATA, useValue: existingFilters}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
