import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BlacklistEntry {
  id: number;
  userId: number;
  email: string;
  reason: string;
  bannedAt: string;
  bannedBy: number;
}

export interface BanRequest {
  userIdOrEmail: string;
  reason: string;
}

//Service per le operazioni di amministrazione
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly API_URL = '/api/admin';

  constructor(private http: HttpClient) { }

  //Banna un utente tramite ID o email.
  banUser(userIdOrEmail: string, reason: string): Observable<any> {
    return this.http.post(`${this.API_URL}/ban`, { userIdOrEmail, reason }, { withCredentials: true });
  }

  //Rimuove il ban di un utente.
  unbanUser(userId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/unban/${userId}`, {}, { withCredentials: true });
  }

  //Ottiene la lista degli utenti bannati.
  getBlacklist(): Observable<BlacklistEntry[]> {
    return this.http.get<BlacklistEntry[]>(`${this.API_URL}/blacklist`, { withCredentials: true });
  }
}
