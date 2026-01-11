import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Friend {
    id: number;
    username: string;
    email: string;
}

export interface FriendRequest {
    id: number;
    senderId: number;
    senderUsername: string;
    timestamp: string;
}

export interface Session {
    id: number;
    title: string;
    type: 'STRENGTH' | 'CARDIO' | 'YOGA' | 'HIIT';
    startTime: string;
    duration: string;
    location: string;
    participants: Friend[];
}

export interface AppointmentRequest {
    title: string;
    type: string;
    location: string;
    dateTime: string;
}

export interface Appointment {
    id: number;
    title: string;
    type: string;
    location: string;
    dateTime: string;
    creatorUsername: string;
}

@Injectable({
    providedIn: 'root'
})
export class CommunityService {
    private readonly apiUrl = environment.apiUrl;
    private refreshAppointmentsSubject = new Subject<void>();
    public refreshAppointments$ = this.refreshAppointmentsSubject.asObservable();

    constructor(private http: HttpClient) { }

    getFriends(): Observable<Friend[]> {
        return this.http.get<Friend[]>(`${this.apiUrl}/friends`);
    }

    getPendingRequests(): Observable<FriendRequest[]> {
        return this.http.get<FriendRequest[]>(`${this.apiUrl}/friends/requests`);
    }

    searchUsers(query: string): Observable<Friend[]> {
        return this.http.get<Friend[]>(`${this.apiUrl}/friends/search`, { params: { query } });
    }

    sendFriendRequest(receiverId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/friends/request/${receiverId}`, {});
    }

    acceptFriendRequest(requestId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/friends/accept/${requestId}`, {});
    }

    rejectFriendRequest(requestId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/friends/reject/${requestId}`, {});
    }

    getMyAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`);
    }

    createAppointment(request: AppointmentRequest): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/appointments`, request).pipe(
            tap(() => this.refreshAppointmentsSubject.next())
        );
    }

    updateAppointment(id: number, request: AppointmentRequest): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/appointments/${id}`, request).pipe(
            tap(() => this.refreshAppointmentsSubject.next())
        );
    }

    deleteAppointment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/appointments/${id}`).pipe(
            tap(() => this.refreshAppointmentsSubject.next())
        );
    }

    unfriend(friendId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/friends/${friendId}`);
    }
}
