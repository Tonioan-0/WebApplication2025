import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`, {withCredentials: true});
  }

  updateVisibility(userId: number, isPublic: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${userId}/visibility`, isPublic, {withCredentials: true});
  }

  updateStatus(userId: number, status: string): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${userId}/status`,
      status,
      { withCredentials: true }
    );
  }

  changePassword(userId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/change-password`, data);
  }
}
