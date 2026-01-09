import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8081/api/auth';

    constructor(private http: HttpClient) { }

    register(username: string, email: string, password: string): Observable<any> {
        const registerData = {
            username: username,
            email: email,
            password: password
        };

        return this.http.post(`${this.apiUrl}/register`, registerData);
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { email, password }, {
            withCredentials: true // Important for setting the cookie
        });
    }
}