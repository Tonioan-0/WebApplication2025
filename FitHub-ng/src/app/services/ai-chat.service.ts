import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
    message: string;
}

export interface ChatResponse {
    reply: string;
}

@Injectable({
    providedIn: 'root'
})
export class AiChatService {
    private apiUrl = `${environment.apiUrl}/chat`;

    constructor(private http: HttpClient) { }

    sendMessage(message: string): Observable<ChatResponse> {
        const request: ChatMessage = { message };

        return this.http.post<ChatResponse>(this.apiUrl, request).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An error occurred while communicating with the AI assistant.';

        if (error.status === 0) {
            // Network error or server unreachable
            errorMessage = 'Unable to reach the server. Please check your connection and ensure the backend is running.';
        } else if (error.status >= 500) {
            errorMessage = 'The AI service is currently unavailable. Please try again later.';
        } else if (error.status >= 400) {
            errorMessage = 'There was a problem with your request. Please try again.';
        }

        return throwError(() => new Error(errorMessage));
    }
}
