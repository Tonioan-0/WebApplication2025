import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, BlacklistEntry } from '../../../services/admin.service';
import { LocationService, Location } from '../../../services/location.service';
import { SVG_ICONS } from '../../../shared/constants/svg-icons.constants';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  readonly icons = SVG_ICONS;
  //Ban form
  userIdOrEmail = '';
  banReason = '';
  banLoading = false;
  banError = '';
  banSuccess = '';

  // Blacklist
  blacklist: BlacklistEntry[] = [];
  blacklistLoading = false;

  // Gestione location
  locations: Location[] = [];
  locationsLoading = false;
  showAddLocationModal = false;
  newLocation = {
    name: '',
    type: 'park' as 'gym' | 'park',
    address: '',
    lat: 0,
    lng: 0
  };

  // Warning modal
  showWarningModal = false;
  selectedLocationForWarning: Location | null = null;
  warningText = '';

  constructor(
    private adminService: AdminService,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadBlacklist();
    this.loadLocations();
  }

  // --- Sezione Ban ---
  banUser(): void {
    if (!this.userIdOrEmail || !this.banReason) {
      this.banError = 'Compila tutti i campi';
      return;
    }

    this.banLoading = true;
    this.banError = '';
    this.banSuccess = '';

    this.adminService.banUser(this.userIdOrEmail, this.banReason).subscribe({
      next: (response) => {
        this.banSuccess = `Utente ${response.email} bannato con successo`;
        this.userIdOrEmail = '';
        this.banReason = '';
        this.banLoading = false;
        this.cdr.detectChanges();
        this.loadBlacklist();
      },
      error: (error) => {
        this.banError = error.error?.error || 'Errore durante il ban';
        this.banLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadBlacklist(): void {
    this.blacklistLoading = true;
    this.adminService.getBlacklist().subscribe({
      next: (data) => {
        this.blacklist = data;
        this.blacklistLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.blacklistLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  unbanUser(userId: number): void {
    if (!confirm('Sei sicuro di voler rimuovere il ban?')) return;

    this.adminService.unbanUser(userId).subscribe({
      next: () => {
        this.loadBlacklist();
      },
      error: (error) => {
        alert(error.error?.error || 'Errore durante la rimozione del ban');
      }
    });
  }

  // --- Gestione Location ---
  loadLocations(): void {
    this.locationsLoading = true;
    // Carica tutte le location
    this.locationService.getLocationsByBounds(-90, 90, -180, 180, undefined, 5).subscribe({
      next: (data) => {
        this.locations = data;
        this.locationsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.locationsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddLocationModal(): void {
    this.newLocation = {
      name: '',
      type: 'park',
      address: '',
      lat: 41.9028,
      lng: 12.4964
    };
    this.showAddLocationModal = true;
  }

  closeAddLocationModal(): void {
    this.showAddLocationModal = false;
  }

  addLocation(): void {
    if (!this.newLocation.name || !this.newLocation.address) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const locationData = {
      name: this.newLocation.name,
      type: this.newLocation.type,
      address: this.newLocation.address,
      lat: this.newLocation.lat,
      lng: this.newLocation.lng
    };

    this.locationService.createLocation(locationData).subscribe({
      next: () => {
        this.closeAddLocationModal();
        this.loadLocations();
      },
      error: (error) => {
        alert(error.error?.error || 'Errore durante l\'aggiunta');
      }
    });
  }

  deleteLocation(locationId: number): void {
    if (!confirm('Sei sicuro di voler eliminare questa location?')) return;

    this.locationService.deleteLocation(locationId).subscribe({
      next: () => {
        this.loadLocations();
      },
      error: (error) => {
        alert(error.error?.error || 'Errore durante l\'eliminazione');
      }
    });
  }

  // --- Gestione Warning ---
  openWarningModal(location: Location): void {
    this.selectedLocationForWarning = location;
    this.warningText = location.warning || '';
    this.showWarningModal = true;
  }

  closeWarningModal(): void {
    this.showWarningModal = false;
    this.selectedLocationForWarning = null;
    this.warningText = '';
  }

  saveWarning(): void {
    if (!this.selectedLocationForWarning) return;

    this.locationService.addWarning(this.selectedLocationForWarning.id, this.warningText).subscribe({
      next: () => {
        this.closeWarningModal();
        this.loadLocations();
      },
      error: (error) => {
        alert(error.error?.error || 'Errore durante l\'aggiunta del warning');
      }
    });
  }

  removeWarning(locationId: number): void {
    if (!confirm('Sei sicuro di voler rimuovere il warning?')) return;

    this.locationService.removeWarning(locationId).subscribe({
      next: () => {
        this.loadLocations();
      },
      error: (error) => {
        alert(error.error?.error || 'Errore durante la rimozione del warning');
      }
    });
  }
}
