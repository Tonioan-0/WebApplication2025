import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { LocationService, Location } from '../services/location.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-map-finder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-finder.component.html',
  styleUrls: ['./map-finder.component.css']
})
export class MapFinderComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  selectedLocation: Location | null = null;
  private mapMoveSubject = new Subject<void>();
  isLoading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private locationService: LocationService
  ) {
    // Debounce map movements to avoid excessive API calls
    this.mapMoveSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadMarkersInViewport();
    });
  }

  // Custom icon configurations
  private gymIcon = L.divIcon({
    className: 'custom-marker gym-marker',
    html: `<div class="marker-pin">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  private parkIcon = L.divIcon({
    className: 'custom-marker park-marker',
    html: `<div class="marker-pin">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
            </svg>
          </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  activeFilter: 'all' | 'gym' | 'park' = 'all';

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [41.902782, 12.496366],
      zoom: 13,
      zoomControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', () => {
      this.closeInfoCard();
    });

    // Listen to map movement and zoom events
    this.map.on('moveend', () => {
      this.mapMoveSubject.next();
    });

    this.map.on('zoomend', () => {
      this.mapMoveSubject.next();
    });

    // Load initial markers
    this.loadMarkersInViewport();
  }

  private loadMarkersInViewport(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    const zoom = this.map.getZoom();

    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();

    this.isLoading = true;

    this.locationService.getLocationsByBounds(
      minLat,
      maxLat,
      minLng,
      maxLng,
      this.activeFilter === 'all' ? undefined : this.activeFilter,
      zoom
    ).subscribe({
      next: (locations) => {
        this.addMarkers(locations);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.isLoading = false;
      }
    });
  }

  private addMarkers(locations: Location[]): void {
    this.clearMarkers();

    locations.forEach(location => {
      const icon = location.type === 'gym' ? this.gymIcon : this.parkIcon;
      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(this.map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          this.openInfoCard(location);
        });
      this.markers.push(marker);
    });
  }

  setFilter(filter: 'all' | 'gym' | 'park'): void {
    this.activeFilter = filter;
    this.loadMarkersInViewport();
  }

  openInfoCard(location: Location): void {
    this.selectedLocation = location;
    this.cdr.detectChanges(); // Trigger change detection for Leaflet events
    this.map.flyTo([location.lat, location.lng], 15);
  }

  closeInfoCard(): void {
    this.selectedLocation = null;
    this.cdr.detectChanges(); // Trigger change detection for Leaflet events
  }

  clearMarkers(): void {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.mapMoveSubject.complete();
  }
}
