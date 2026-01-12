import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';
import { SVG_ICONS } from '../../../shared/constants/svg-icons.constants';

@Component({
    selector: 'app-notification-dropdown',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-dropdown.component.html',
    styleUrl: './notification-dropdown.component.css'
})
export class NotificationDropdownComponent implements OnInit {
    notifications: Notification[] = [];
    unreadCount = 0;
    isOpen = false;
    readonly svgIcons = SVG_ICONS;

    constructor(
        private notificationService: NotificationService,
        private elementRef: ElementRef
    ) { }

    ngOnInit(): void {
        this.notificationService.unreadCount$.subscribe(count => {
            this.unreadCount = count;
        });

        this.loadNotifications();
    }

    loadNotifications(): void {
        this.notificationService.getNotifications().subscribe({
            next: (notifications) => {
                this.notifications = notifications.sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
            },
            error: (error) => console.error('Error loading notifications:', error)
        });
    }

    toggleDropdown(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.loadNotifications();
        }
    }

    markAsRead(notification: Notification): void {
        if (notification.isRead) return;

        this.notificationService.markAsRead(notification.id).subscribe({
            next: () => {
                notification.isRead = true;
                this.loadNotifications();
            },
            error: (error) => console.error('Error marking notification as read:', error)
        });
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'FRIEND_REQUEST':
                return this.svgIcons.community;
            case 'APPOINTMENT_CREATED':
            case 'APPOINTMENT_UPDATED':
                return this.svgIcons.dumbbell;
            default:
                return this.svgIcons.notification;
        }
    }

    getRelativeTime(timestamp: string): string {
        const now = new Date().getTime();
        const notificationTime = new Date(timestamp).getTime();
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
}
