import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, BehaviorSubject } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<string | null>(null);
    private currentUserIdSubject = new BehaviorSubject<number | null>(null);
    private isAdminSubject = new BehaviorSubject<boolean>(false);
    
    public currentUser$ = this.currentUserSubject.asObservable();
    public currentUserId$ = this.currentUserIdSubject.asObservable();
    public isAdmin$ = this.isAdminSubject.asObservable();

    constructor(private http: HttpClient) {
        // Restore state from localStorage on service init
        const savedIsAdmin = localStorage.getItem('isAdmin');
        const savedUserId = localStorage.getItem('userId');
        const savedUsername = localStorage.getItem('username');
        
        if (savedIsAdmin === 'true') {
            this.isAdminSubject.next(true);
        }
        if (savedUserId) {
            this.currentUserIdSubject.next(parseInt(savedUserId, 10));
        }
        if (savedUsername) {
            this.currentUserSubject.next(savedUsername);
        }
    }

    register(username: string, email: string, password: string, isAdmin: boolean = false): Observable<any> {
        const registerData = {
            username: username,
            email: email,
            password: password,
            isAdmin: isAdmin
        };

        return this.http.post<any>(`${this.apiUrl}/register`, registerData, {
            withCredentials: true
        }).pipe(
            tap(response => {
                this.currentUserSubject.next(response.username);
                this.currentUserIdSubject.next(response.userId);
                const adminStatus = response.isAdmin === true;
                this.isAdminSubject.next(adminStatus);
                localStorage.setItem('isAdmin', adminStatus ? 'true' : 'false');
                localStorage.setItem('userId', response.userId?.toString() || '');
                localStorage.setItem('username', response.username || '');
            })
        );
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, {
            withCredentials: true
        }).pipe(
            tap(response => {
                this.currentUserSubject.next(response.username);
                this.currentUserIdSubject.next(response.userId);
                const isAdmin = response.isAdmin === true;
                this.isAdminSubject.next(isAdmin);
                localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
                localStorage.setItem('userId', response.userId?.toString() || '');
                localStorage.setItem('username', response.username || '');
            })
        );
    }

    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.currentUserSubject.next(null);
                this.currentUserIdSubject.next(null);
                this.isAdminSubject.next(false);
                localStorage.removeItem('isAdmin');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
            })
        );
    }

    checkAuth(): Observable<boolean> {
        return this.http.get<any>(`${this.apiUrl}/check`, { withCredentials: true }).pipe(
            tap(response => {
                this.currentUserSubject.next(response.username);
                this.currentUserIdSubject.next(response.userId);
                const isAdmin = response.isAdmin === true;
                this.isAdminSubject.next(isAdmin);
                localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
                localStorage.setItem('userId', response.userId?.toString() || '');
                localStorage.setItem('username', response.username || '');
            }),
            map(() => true),
            catchError(() => {
                this.currentUserSubject.next(null);
                this.currentUserIdSubject.next(null);
                this.isAdminSubject.next(false);
                localStorage.removeItem('isAdmin');
                return of(false);
            })
        );
    }

    getCurrentUsername(): string | null {
        return this.currentUserSubject.value;
    }

    getCurrentUserId(): number | null {
        return this.currentUserIdSubject.value;
    }

    isAdmin(): boolean {
        return this.isAdminSubject.value;
    }
}