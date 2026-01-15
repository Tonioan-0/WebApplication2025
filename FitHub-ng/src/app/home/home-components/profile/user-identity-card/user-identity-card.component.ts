import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-identity-card',
  templateUrl: './user-identity-card.component.html',
  standalone: true,
  styleUrls: ['./user-identity-card.component.css']
})
export class UserIdentityCardComponent {
  @Input() username: string = '';
  @Input() email: string = '';
}
