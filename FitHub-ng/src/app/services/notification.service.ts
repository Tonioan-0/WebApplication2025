import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

    constructor(private http: HttpClient) {
        this.startPolling();
    }

    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(this.apiUrl).pipe(
            tap(notifications => {
                const unreadCount = notifications.filter(n => !n.isRead).length;
                this.unreadCountSubject.next(unreadCount);
            })
        );
    }

    markAsRead(notificationId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
            tap(() => {
                const currentCount = this.unreadCountSubject.value;
                if (currentCount > 0) {
                    this.unreadCountSubject.next(currentCount - 1);
                }
            })
        );
    }

    private startPolling(): void {
        // Poll every 30 seconds
        interval(30000).pipe(
            startWith(0),
            switchMap(() => this.getNotifications())
        ).subscribe();
    }
}
