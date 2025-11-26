import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { LocationService, Location } from '../services/location.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SVG_ICONS } from '../shared/constants/svg-icons.constants';

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

  // Icons made with https://yqnn.github.io/svg-path-editor/ 
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
    this.cdr.detectChanges();
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
