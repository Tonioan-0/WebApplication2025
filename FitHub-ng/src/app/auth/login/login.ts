import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/authService';
import { BanPopupComponent } from '../../shared/components/ban-popup/ban-popup.component';

@Component({
  selector: 'app-login',
  imports: [RouterLink, CommonModule, FormsModule, BanPopupComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Ban popup state
  showBanPopup: boolean = false;
  banReason: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  onSubmit() {
    this.errorMessage = '';
    this.showBanPopup = false; //Reset popup state prima di ogni submit

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        //Naviga alla home o al dashboard
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;

        //Controlla se l'utente è bannato (403 Forbidden con flag banned)
        if (error.status === 403 && error.error?.banned) {
          this.banReason = error.error.reason || 'Account sospeso';
          this.showBanPopup = true;
          this.cdr.detectChanges(); //Forza la rilettura del template
          return;
        }

        this.errorMessage = error.error?.message || error.error?.error || 'Login failed. Please check your credentials.';
      }
    });
  }

  closeBanPopup(): void {
    this.showBanPopup = false;
    this.banReason = '';
    this.cdr.detectChanges();
  }
}
