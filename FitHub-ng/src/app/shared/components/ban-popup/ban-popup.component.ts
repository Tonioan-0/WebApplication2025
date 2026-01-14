import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SVG_ICONS } from '../../../shared/constants/svg-icons.constants';

//Popup component per mostrare agli utenti bannati il motivo del ban.
@Component({
  selector: 'app-ban-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ban-popup.component.html',
  styleUrls: ['./ban-popup.component.css']
})
export class BanPopupComponent {
  readonly icons = SVG_ICONS;
  @Input() reason: string = '';
  @Output() close = new EventEmitter<void>();
}
