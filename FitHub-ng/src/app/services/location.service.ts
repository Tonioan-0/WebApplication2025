import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
    id: number;
    lat: number;
    lng: number;
    name: string;
    type: 'gym' | 'park';
    address: string;
    rating: number;
    warning?: string;
}

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    // TODO: Non so se va messo nelle variabili d'ambiente, da chiedere al professore
    private apiUrl = 'http://localhost:8081/api/locations';

    constructor(private http: HttpClient) { }

    getLocationsByBounds(
        minLat: number,
        maxLat: number,
        minLng: number,
        maxLng: number,
        type?: string,
        zoom?: number
    ): Observable<Location[]> {
        let params = new HttpParams()
            .set('minLat', minLat.toString())
            .set('maxLat', maxLat.toString())
            .set('minLng', minLng.toString())
            .set('maxLng', maxLng.toString());

        if (type && type !== 'all') {
            params = params.set('type', type);
        }

        if (zoom !== undefined) {
            params = params.set('zoom', zoom.toString());
        }

        return this.http.get<Location[]>(this.apiUrl, { params });
    }
}
