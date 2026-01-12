import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of, Subscription } from 'rxjs';
import { tap, switchMap, startWith, catchError, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './authService';

export interface Notification {
    id: number;
    message: string;
    type: 'FRIEND_REQUEST' | 'APPOINTMENT_CREATED' | 'APPOINTMENT_UPDATED';
    isRead: boolean;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = `${environment.apiUrl}/notifications`;
    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();
    private pollingSubscription: Subscription | null = null;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.setupPolling();
    }

    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(this.apiUrl, { withCredentials: true }).pipe(
            tap(notifications => {
                const unreadCount = notifications.filter(n => !n.isRead).length;
                this.unreadCountSubject.next(unreadCount);
            }),
            catchError(() => {
                return of([]);
            })
        );
    }

    markAsRead(notificationId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {}, { withCredentials: true }).pipe(
            tap(() => {
                const currentCount = this.unreadCountSubject.value;
                if (currentCount > 0) {
                    this.unreadCountSubject.next(currentCount - 1);
                }
            })
        );
    }

    private setupPolling(): void {
        this.authService.currentUserId$.pipe(
            switchMap(userId => {
                if (userId) {
                    // Start polling active
                    return interval(30000).pipe(
                        startWith(0),
                        switchMap(() => this.getNotifications())
                    );
                } else {
                    // Stop polling / idle
                    this.unreadCountSubject.next(0);
                    return of([]);
                }
            })
        ).subscribe();
    }
}
