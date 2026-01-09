import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/authService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.authService.register(this.username, this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('Registration succes:', response);
          this.successMessage = response.message || 'Registration completed successfully';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000)
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.errorMessage = error.error.message || 'Registration failed';
        }
      });
  }
}
