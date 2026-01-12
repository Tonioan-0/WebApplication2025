import { Component, AfterViewInit, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { LocationService, type Location } from '../../../services/location.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SVG_ICONS } from '../../../shared/constants/svg-icons.constants';

@Component({
  selector: 'app-map-finder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-finder.component.html',
  styleUrls: ['./map-finder.component.css']
})
export class MapFinderComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  selectedLocation: Location | null = null;
  private mapMoveSubject = new Subject<void>();
  isLoading = false;

  searchQuery: string = '';
  private searchTimeout: any;
  activeFilter: 'all' | 'gym' | 'park' = 'all';

  readonly svgIcons = SVG_ICONS;

  isSelectionMode = false;
  selectedLocationData: string | null = null;
  private tempMarker: L.Marker | null = null;
  private lastTapTime = 0;

  // Geolocation
  userLocation: { lat: number; lng: number } | null = null;
  private userLocationMarker: L.Marker | null = null;

  // Create new location
  showCreateModal = false;
  newLocation = {
    name: '',
    type: 'gym' as 'gym' | 'park',
    address: '',
    lat: 0,
    lng: 0
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.mapMoveSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadMarkersInViewport();
    });
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.isSelectionMode = data['selectionMode'] === true;
    });

    this.route.queryParams.subscribe(params => {
      if (params['lat'] && params['lng']) {
        const lat = parseFloat(params['lat']);
        const lng = parseFloat(params['lng']);
        if (!isNaN(lat) && !isNaN(lng)) {
          setTimeout(() => {
            if (this.map) {
              this.map.setView([lat, lng], 16);
            }
          }, 100);
        }
      } else if (params['location']) {
        this.searchQuery = params['location'];
        setTimeout(() => this.performSearchNow(), 100);
      }
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

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const now = Date.now();
      if (this.isSelectionMode && now - this.lastTapTime < 300) {
        this.addTemporaryPin(e.latlng.lat, e.latlng.lng);
      } else {
        this.closeInfoCard();
        if (this.isSelectionMode) {
          this.selectedLocationData = null;
          this.cdr.detectChanges();
        }
      }
      this.lastTapTime = now;
    });

    this.map.on('moveend', () => {
      this.mapMoveSubject.next();
    });

    this.map.on('zoomend', () => {
      this.mapMoveSubject.next();
    });

    // Double click to create location
    this.map.on('dblclick', (e: L.LeafletMouseEvent) => {
      if (!this.isSelectionMode) {
        this.openCreateModal(e.latlng.lat, e.latlng.lng);
      }
    });

    this.loadMarkersInViewport();
  }

  private addTemporaryPin(lat: number, lng: number): void {
    if (this.tempMarker) {
      this.map.removeLayer(this.tempMarker);
    }
    const tempIcon = L.divIcon({
      className: 'custom-marker temp-marker',
      html: `<div class="marker-pin temp-pin">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="${SVG_ICONS.location}"/>
              </svg>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    this.tempMarker = L.marker([lat, lng], { icon: tempIcon }).addTo(this.map);
    this.selectedLocationData = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    this.cdr.detectChanges();
  }

  selectLocationForAppointment(location: Location): void {
    this.selectedLocationData = location.name;
    this.cdr.detectChanges();
  }

  returnToAppointment(): void {
    if (this.selectedLocationData) {
      this.router.navigate(['/home/community'], {
        queryParams: { selectedLocation: this.selectedLocationData }
      });
    }
  }

  private loadMarkersInViewport(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    const zoom = this.map.getZoom();

    this.isLoading = true;

    console.log('Fetching locations for bounds:', {
      south: bounds.getSouth(),
      north: bounds.getNorth(),
      west: bounds.getWest(),
      east: bounds.getEast(),
      zoom
    });

    this.locationService.getLocationsByBounds(
      bounds.getSouth(),
      bounds.getNorth(),
      bounds.getWest(),
      bounds.getEast(),
      this.activeFilter === 'all' ? undefined : this.activeFilter,
      zoom
    ).subscribe({
      next: (locations) => {
        console.log('API Response - Locations found:', locations.length, locations);
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
          if (this.isSelectionMode) {
            this.selectLocationForAppointment(location);
          }
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
        if (this.isSelectionMode) {
          this.selectLocationForAppointment(location);
        }
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

  // Geolocation methods
  getUserLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    // Options to avoid using Google's geolocation API
    const options = {
      enableHighAccuracy: false, // Use network-based location instead of GPS
      timeout: 10000, // 10 seconds timeout
      maximumAge: 300000 // Accept cached position up to 5 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.userLocation = { lat, lng };
        this.centerOnUserLocation();
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to retrieve your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Try using the search function instead.';
            break;
          case error.TIMEOUT:
            errorMessage += 'The request to get your location timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }

        alert(errorMessage);
      },
      options
    );
  }

  private centerOnUserLocation(): void {
    if (!this.userLocation || !this.map) return;

    this.map.flyTo([this.userLocation.lat, this.userLocation.lng], 15);

    // Remove old user location marker if exists
    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
    }

    // Add new user location marker
    const userIcon = L.divIcon({
      className: 'custom-marker user-marker',
      html: `<div class="marker-pin user-pin">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="${SVG_ICONS.person}"/>
              </svg>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    this.userLocationMarker = L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
      .addTo(this.map);
  }

  // Create new location methods
  openCreateModal(lat?: number, lng?: number): void {
    const center = this.map.getCenter();
    this.newLocation = {
      name: '',
      type: 'gym',
      address: '',
      lat: lat || center.lat,
      lng: lng || center.lng
    };
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.cdr.detectChanges();
  }

  submitNewLocation(): void {
    if (!this.newLocation.name || !this.newLocation.address) {
      alert('Please fill in all required fields');
      return;
    }

    const locationData = {
      name: this.newLocation.name,
      type: this.newLocation.type,
      address: this.newLocation.address,
      lat: this.newLocation.lat,
      lng: this.newLocation.lng,
      rating: 0,
      warning: undefined
    };

    this.locationService.createLocation(locationData).subscribe({
      next: (newLocation) => {
        console.log('Location created:', newLocation);
        this.closeCreateModal();
        this.loadMarkersInViewport();
        // Center on new location
        this.map.flyTo([newLocation.lat, newLocation.lng], 16);
      },
      error: (error) => {
        console.error('Error creating location:', error);
        alert('Failed to create location. Please try again.');
      }
    });
  }

  // Warning management
  removeWarningFromLocation(locationId: number): void {
    if (!confirm('Are you sure you want to remove this warning?')) {
      return;
    }

    this.locationService.removeWarning(locationId).subscribe({
      next: () => {
        console.log('Warning removed');
        if (this.selectedLocation) {
          this.selectedLocation.warning = undefined;
          this.cdr.detectChanges();
        }
        this.loadMarkersInViewport();
      },
      error: (error) => {
        console.error('Error removing warning:', error);
        alert('Failed to remove warning. Please try again.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.mapMoveSubject.complete();
    clearTimeout(this.searchTimeout);
  }
}
