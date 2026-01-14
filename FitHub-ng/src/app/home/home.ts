import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SVG_ICONS } from '../shared/constants/svg-icons.constants';
import { AuthService } from '../services/authService';
import { StreakService } from '../services/streak.service';
import { Streak } from '../models/streak.model';
import { AiChatButtonComponent } from './home-components/ai-chat-button/ai-chat-button.component';
import { NotificationDropdownComponent } from './home-components/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AiChatButtonComponent, NotificationDropdownComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  readonly icons = SVG_ICONS;
  sidebarCollapsed = false;
  mobileMenuOpen = false;

  // Streak data
  streak: Streak = { currentStreak: 0, weeklyWorkoutsDone: 0, weeklyTarget: 3, lastWorkoutDate: null };
  streakIcon: 'frozen' | 'fire-small' | 'fire-medium' | 'fire-large' | 'star' | 'trophy' = 'frozen';

  constructor(
    private authService: AuthService,
    private router: Router,
    public streakService: StreakService,
    private cdr: ChangeDetectorRef  //per forzare aggiornamento pagina
  ) { }

  ngOnInit(): void {
    //in ascolto su streakService per cambiaemnti streak
    this.streakService.streak$.subscribe(data => {
      this.streak = data;
      this.streakIcon = this.streakService.getStreakIcon(data.currentStreak);
      this.cdr.detectChanges();
    });

    // Richiedi dato iniziale
    this.streakService.refreshStreak();
  }

  loadStreak(): void {
    this.streakService.refreshStreak();
  }

  //get per Icona e Testo streak
  get streakLabel(): string {
    return this.streakService.getStreakLabel(this.streak.currentStreak);
  }
  get streakIconPath(): string {
    return this.icons[this.streakIcon] || this.icons.frozen;
  }

  logOut(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even on error, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth > 768) {
      this.mobileMenuOpen = false;
    } else {
      this.sidebarCollapsed = false;
    }
  }

  toggleMenu() {
    if (window.innerWidth <= 768) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = false;
  }

  closeMobileMenu() {
    if (window.innerWidth <= 768) {
      this.mobileMenuOpen = false;
    }
  }
}