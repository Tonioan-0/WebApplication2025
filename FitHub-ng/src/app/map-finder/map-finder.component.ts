import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { LocationService, type Location } from '../services/location.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SVG_ICONS } from '../shared/constants/svg-icons.constants';
import { AiChatButtonComponent } from '../ai-chat-button/ai-chat-button.component';

@Component({
  selector: 'app-map-finder',
  standalone: true,
  imports: [CommonModule, FormsModule, AiChatButtonComponent],
  templateUrl: './map-finder.component.html',
  styleUrls: ['./map-finder.component.css']
})
export class MapFinderComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  selectedLocation: Location | null = null;
  private mapMoveSubject = new Subject<void>();
  isLoading = false;

  searchQuery: string = '';
  private searchTimeout: any;
  activeFilter: 'all' | 'gym' | 'park' = 'all';

  readonly svgIcons = SVG_ICONS;

  constructor(
    private cdr: ChangeDetectorRef,
    private locationService: LocationService
  ) {
    this.mapMoveSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadMarkersInViewport();
    });
  }

  private gymIcon = L.divIcon({
    className: 'custom-marker gym-marker',
    html: `<div class="marker-pin">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="${SVG_ICONS.gym}"/>
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
              <path d="${SVG_ICONS.park}"/>
            </svg>
          </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

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

    this.map.on('moveend', () => {
      this.mapMoveSubject.next();
    });

    this.map.on('zoomend', () => {
      this.mapMoveSubject.next();
    });

    this.loadMarkersInViewport();
  }

  private loadMarkersInViewport(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    const zoom = this.map.getZoom();

    this.isLoading = true;

    this.locationService.getLocationsByBounds(
      bounds.getSouth(),
      bounds.getNorth(),
      bounds.getWest(),
      bounds.getEast(),
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
    if (!this.searchQuery) {
      this.loadMarkersInViewport();
    }
  }

  openInfoCard(location: Location): void {
    this.selectedLocation = location;
    this.cdr.detectChanges();
    this.map.flyTo([location.lat, location.lng], 15);
  }

  closeInfoCard(): void {
    this.selectedLocation = null;
    this.cdr.detectChanges();
  }

  clearMarkers(): void {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);

    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.loadMarkersInViewport();
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 500);
  }

  performSearchNow(): void {
    clearTimeout(this.searchTimeout);

    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.loadMarkersInViewport();
      return;
    }

    this.performSearch();
  }

  private performSearch(): void {
    const query = this.searchQuery.trim();

    this.locationService.searchLocations(query).subscribe({
      next: (locations) => {
        this.clearMarkers();
        this.addSearchMarkers(locations);
      },
      error: (error) => {
        console.error('Search error:', error);
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    clearTimeout(this.searchTimeout);
    this.loadMarkersInViewport();
  }

  private addSearchMarkers(locations: Location[]): void {
    locations.forEach((location: Location) => {
      const icon = location.type === 'gym' ? this.gymIcon : this.parkIcon;
      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(this.map!);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        this.openInfoCard(location);
      });

      this.markers.push(marker);
    });

    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.lat, loc.lng] as L.LatLngTuple)
      );
      this.map?.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.mapMoveSubject.complete();
    clearTimeout(this.searchTimeout);
  }
}
