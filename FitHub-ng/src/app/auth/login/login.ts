import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {

}
