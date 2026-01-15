import { Component, Input, Output, EventEmitter } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-user-stats-card',
  templateUrl: './user-stats-card.component.html',
  imports: [
    FormsModule,
    NgClass
  ],
  standalone: true,
  styleUrls: ['./user-stats-card.component.css']
})
export class UserStatsCardComponent {
  @Input() streak: number = 0;
  @Input() weeklyWorkouts: number = 0;
  @Input() statusMessage: string = '';
  @Input() isMyProfile: boolean = false;

  @Output() statusChange = new EventEmitter<string>();

  isEditing = false;
  tempStatus = '';

  enableEdit() {
    this.tempStatus = this.statusMessage;
    this.isEditing = true;
  }

  saveStatus() {
    if (this.tempStatus !== this.statusMessage) {
      this.statusChange.emit(this.tempStatus);
    }
    this.isEditing = false;
  }
}
