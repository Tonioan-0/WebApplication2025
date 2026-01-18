import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/authService';
import { ProfileService } from '../../../services/profile.service';
import { UserProfile } from '../../../models/user-profile.model';

import { UserIdentityCardComponent } from './user-identity-card/user-identity-card.component';
import { UserStatsCardComponent } from './user-stats-card/user-stats-card.component';
import { ProfileSettingsCardComponent } from './profile-settings-card/profile-settings-card.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserIdentityCardComponent,
    UserStatsCardComponent,
    ProfileSettingsCardComponent
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {

  public userProfile: UserProfile | null = null;
  public isLoading: boolean = false;
  public currentUserId: number | null = null;

  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;

    // 1. Check valore immediato (Logica Vecchia)
    const currentId = this.authService.getCurrentUserId();
    if (currentId) {
      this.currentUserId = currentId;
      this.loadProfile(currentId);
    }

    this.userSubscription = this.authService.currentUserId$.subscribe(userId => {
      if (userId && userId !== this.currentUserId) {
        this.currentUserId = userId;
        this.loadProfile(userId);
      } else if (!userId && !this.currentUserId) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadProfile(userId: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.profileService.getUserProfile(userId).subscribe({
      next: (data) => {
        this.userProfile = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleVisibility(event: Event): void {
    if (!this.currentUserId) return;

    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;
    const oldState = this.userProfile?.isPublic;

    if (this.userProfile) this.userProfile.isPublic = isChecked;

    this.profileService.updateVisibility(this.currentUserId, isChecked).subscribe({
      next: () => {
        console.log('Privacy updated');
      },
      error: (err) => {
        alert('Impossibile aggiornare la privacy.');
        inputElement.checked = !isChecked;
        if (this.userProfile && oldState !== undefined) {
          this.userProfile.isPublic = oldState;
        }
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(newStatus: string): void {
    if (!this.currentUserId || !this.userProfile) return;

    const oldStatus = this.userProfile.statusMessage;
    this.userProfile.statusMessage = newStatus;

    this.profileService.updateStatus(this.currentUserId, newStatus).subscribe({
      next: () => console.log('Stato salvato!'),
      error: (err) => {
        console.error('Errore stato', err);
        // Revert
        if (this.userProfile) this.userProfile.statusMessage = oldStatus;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/'])
    });
  }
}
