import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../../services/profile.service';

@Component({
  selector: 'app-profile-settings-card',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile-settings-card.component.html',
  styleUrls: ['./profile-settings-card.component.css']
})
export class ProfileSettingsCardComponent {
  @Input() isPublic: boolean = false;
  @Input() currentUserId: number | null = null;

  @Output() visibilityChange = new EventEmitter<Event>();
  @Output() logoutRequest = new EventEmitter<void>();

  // Variabili per il Modale Password
  showPasswordModal = false;
  passData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private profileService: ProfileService) {}

  onToggle(event: Event) {
    this.visibilityChange.emit(event);
  }

  onLogout() {
    this.logoutRequest.emit();
  }

  openModal() {
    this.showPasswordModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.passData = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  closeModal() {
    this.showPasswordModal = false;
  }

  submitPasswordChange(): void {
    if (this.passData.newPassword !== this.passData.confirmPassword) {
      this.errorMessage = 'Le nuove password non coincidono.';
      return; // Blocca tutto, non chiama il server
    }
    if (this.passData.newPassword.length < 6) {
      this.errorMessage = 'La password deve avere almeno 6 caratteri.';
      return; // Blocca tutto
    }
    if (!this.currentUserId) {
      this.errorMessage = "Errore: Sessione utente non valida.";
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      currentPassword: this.passData.currentPassword,
      newPassword: this.passData.newPassword
    };

    this.profileService.changePassword(this.currentUserId, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password aggiornata con successo!';
        this.passData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        if (err.status === 400 || err.status === 401) {
          this.errorMessage = err.error?.message || err.error?.error || 'La password attuale non è corretta.';
        } else {
          this.errorMessage = 'Si è verificato un errore nel server. Riprova più tardi.';
        }
      }
    });
  }
}
