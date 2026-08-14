import { Component } from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-unauthenticated',
  imports: [
    MatButton,
    MatIcon,
    RouterLink
  ],
  templateUrl: './unauthenticated.component.html',
  styleUrl: './unauthenticated.component.scss'
})
export class UnauthenticatedComponent {

}
