import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SVG_ICONS } from '../shared/constants/svg-icons.constants';
import { AuthService } from '../services/authService';
import { AiChatButtonComponent } from '../ai-chat-button/ai-chat-button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AiChatButtonComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  readonly icons = SVG_ICONS;
  sidebarCollapsed = false;
  mobileMenuOpen = false;

  constructor(private authService: AuthService) { }

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