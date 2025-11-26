import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

interface Location {
  id: number;
  lat: number;
  lng: number;
  name: string;
  type: 'gym' | 'park';
  address: string;
  rating: number;
}

@Component({
  selector: 'app-map-finder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-finder.component.html',
  styleUrls: ['./map-finder.component.scss']
})
export class MapFinderComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  selectedLocation: Location | null = null;

  mockLocations: Location[] = [
    { id: 1, lat: 41.902782, lng: 12.496366, name: 'FitHub Central Gym', type: 'gym', address: 'Via del Corso, 1, Roma', rating: 4.8 },
    { id: 2, lat: 41.9109, lng: 12.4818, name: 'Villa Borghese Park', type: 'park', address: 'Piazzale Napoleone I, Roma', rating: 4.7 },
    { id: 3, lat: 41.8986, lng: 12.5083, name: 'Colosseum Fitness', type: 'gym', address: 'Piazza del Colosseo, 1, Roma', rating: 4.5 },
    { id: 4, lat: 41.8929, lng: 12.4825, name: 'Trastevere Workout Park', type: 'park', address: 'Piazza di Santa Maria, Roma', rating: 4.3 },
    { id: 5, lat: 41.9070, lng: 12.4750, name: 'Pantheon Gym & Spa', type: 'gym', address: 'Piazza della Rotonda, Roma', rating: 4.9 },
    { id: 6, lat: 41.8850, lng: 12.4880, name: 'Aventine Hill Park', type: 'park', address: 'Via di Santa Sabina, Roma', rating: 4.6 }
  ];

  activeFilter: 'all' | 'gym' | 'park' = 'all';

  ngAfterViewInit(): void {
    this.initMap();
    this.addMarkers();
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
  }

  private addMarkers(): void {
    this.clearMarkers();
    const filteredLocations = this.mockLocations.filter(location =>
      this.activeFilter === 'all' || location.type === this.activeFilter
    );

    filteredLocations.forEach(location => {
      const marker = L.marker([location.lat, location.lng])
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
    this.addMarkers();
  }

  openInfoCard(location: Location): void {
    this.selectedLocation = location;
    this.map.flyTo([location.lat, location.lng], 15);
  }

  closeInfoCard(): void {
    this.selectedLocation = null;
  }

  clearMarkers(): void {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
