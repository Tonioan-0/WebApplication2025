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
    public currentUser$ = this.currentUserSubject.asObservable();
    public currentUserId$ = this.currentUserIdSubject.asObservable();

    constructor(private http: HttpClient) { }

    register(username: string, email: string, password: string, isAdmin: boolean = false): Observable<any> {
        const registerData = {
            username: username,
            email: email,
            password: password,
            isAdmin: isAdmin
        };

        return this.http.post(`${this.apiUrl}/register`, registerData, {
            withCredentials: true
        });
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, {
            withCredentials: true
        }).pipe(
            tap(response => {
                this.currentUserSubject.next(response.username);
                this.currentUserIdSubject.next(response.userId);
            })
        );
    }

    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.currentUserSubject.next(null);
                this.currentUserIdSubject.next(null);
            })
        );
    }

    checkAuth(): Observable<boolean> {
        return this.http.get<any>(`${this.apiUrl}/check`, { withCredentials: true }).pipe(
            tap(response => {
                this.currentUserSubject.next(response.username);
                this.currentUserIdSubject.next(response.userId);
            }),
            map(() => true),
            catchError(() => {
                this.currentUserSubject.next(null);
                this.currentUserIdSubject.next(null);
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
}