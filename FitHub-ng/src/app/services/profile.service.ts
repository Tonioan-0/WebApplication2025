import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  username: string;
  email: string;
  isPublic: boolean;
}

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
}
