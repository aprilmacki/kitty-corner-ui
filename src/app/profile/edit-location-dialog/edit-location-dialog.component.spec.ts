import { ComponentFixture, TestBed } from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ReverseGeocodeDto} from '../../services/kitty-corner-api/dtos/utils.dto';

import { EditLocationDialogComponent } from './edit-location-dialog.component';

describe('EditLocationDialogComponent', () => {
  let component: EditLocationDialogComponent;
  let fixture: ComponentFixture<EditLocationDialogComponent>;

  const currentLocation: ReverseGeocodeDto = {
    latitude: 42.36,
    longitude: -71.06,
    location: 'Boston, MA'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLocationDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: MatDialogRef, useValue: {close: () => {}}},
        {provide: MAT_DIALOG_DATA, useValue: currentLocation}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
