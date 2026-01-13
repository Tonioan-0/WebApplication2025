import { Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/authService';
import { ProfileService, UserProfile } from '../../../services/profile.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProfileComponent implements OnInit, OnDestroy {

  // Variabili PUBBLICHE accessibili dall'HTML
  public userProfile: UserProfile | null = null;
  public isLoading: boolean = false;

  // Variabili private (interne)
  private userSubscription: Subscription | undefined;
  private currentUserId: number | null = null;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.userSubscription = this.authService.currentUserId$.subscribe(userId => {
      if (userId) {
        this.currentUserId = userId;
        this.loadProfile(userId);
      } else {
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

    this.profileService.updateVisibility(this.currentUserId, isChecked).subscribe({
      next: () => {
        console.log('Privacy updated');
        if (this.userProfile) {
          this.userProfile.isPublic = isChecked;
        }
      },
      error: (err) => {
        alert('Impossibile aggiornare la privacy.');
        // Revert visivo in caso di errore
        inputElement.checked = !isChecked;
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
