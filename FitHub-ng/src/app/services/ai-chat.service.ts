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
        let errorMessage = 'Si è verificato un errore durante la comunicazione con l\'assistente AI.';

        if (error.status === 0) {
            // Network error or server unreachable
            errorMessage = 'Impossibile raggiungere il server. Si prega di verificare la connessione e assicurarsi che il backend sia in esecuzione.';
        } else if (error.status >= 500) {
            errorMessage = 'Il servizio AI è attualmente non disponibile. Si prega di riprovare più tardi.';
        } else if (error.status >= 400) {
            errorMessage = 'Si è verificato un problema con la tua richiesta. Si prega di riprovare.';
        }

        return throwError(() => new Error(errorMessage));
    }
}