import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../services/formation.service';
import { Formation, Categorie, Reservation } from '../../models/formation.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-enseignant-formations',
  templateUrl: './enseignant-formations.component.html',
  styleUrls: ['./enseignant-formations.component.scss']
})
export class EnseignantFormationsComponent implements OnInit {
  formations: Formation[] = [];
  allFormations: Formation[] = [];
  categories: Categorie[] = [];
  selectedCategoryFilter: number | null = null;
  loading = false;
  userId: number|null = null;
  userReservations: number[] = [];
  
  // Dialog properties
  displayFormationDialog = false;
  selectedFormation: Formation | null = null;
  reservationLoading = false;
  cancelLoading = false;
  
  // Confirmation dialog
  displayCancelDialog = false;
  formationToCancel: Formation | null = null;

  constructor(
    private formationService: FormationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.authService.getUserId();
    this.userId = typeof id === 'string' ? Number(id) : id;
    if (isNaN(this.userId as number)) this.userId = null;
    this.loadCategories();
    this.loadFormations();
    this.loadUserReservations();
  }

  loadCategories() {
    this.formationService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadFormations() {
    this.loading = true;
    this.formationService.getAllFormations().subscribe(formations => {
      this.allFormations = formations;
      this.applyCategoryFilter();
      this.loading = false;
    });
  }

  trackByFormationId(index: number, formation: Formation): number {
    return formation.id || 0;
  }

  loadUserReservations() {
    if (!this.userId) return;
    this.formationService.getReservationsByParticipant(this.userId).subscribe(reservations => {
      this.userReservations = reservations
        .filter(r => r.statut !== 'ANNULE') // Exclude cancelled reservations
        .map(r => r.formation?.id)
        .filter((id): id is number => typeof id === 'number');
    });
  }

  applyCategoryFilter() {
    if (!this.selectedCategoryFilter) {
      this.formations = this.allFormations;
    } else {
      this.formations = this.allFormations.filter(f => f.categorie?.id === this.selectedCategoryFilter);
    }
  }

  onCategoryChange(event?: any) {
    // Cast value to number if coming from dropdown
    if (typeof this.selectedCategoryFilter === 'string') {
      this.selectedCategoryFilter = Number(this.selectedCategoryFilter);
    }
    this.applyCategoryFilter();
  }

  isReserved(formationId: number | undefined): boolean {
    if (typeof formationId !== 'number') return false;
    return this.userReservations.includes(formationId);
  }

  showFormationDetails(formation: Formation) {
    this.selectedFormation = formation;
    this.displayFormationDialog = true;
  }

  hideFormationDialog() {
    this.displayFormationDialog = false;
    this.selectedFormation = null;
  }

  reserve(formation: Formation) {
    if (!this.userId || typeof formation.id !== 'number') return;
    
    this.reservationLoading = true;
    this.formationService.addReservation({
      participantId: this.userId,
      formation: { id: formation.id } as any,
      statut: 'CONFIRME',
      dateReservation: new Date().toISOString()
    } as any).subscribe({
      next: () => {
        this.loadUserReservations();
        this.reservationLoading = false;
        // Show success message
      },
      error: (error) => {
        console.error('Reservation failed:', error);
        this.reservationLoading = false;
        // Show error message
      }
    });
  }

  reserveFromDialog() {
    if (this.selectedFormation) {
      this.reserve(this.selectedFormation);
      this.hideFormationDialog();
    }
  }

  showCancelDialog(formation: Formation, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.formationToCancel = formation;
    this.displayCancelDialog = true;
  }

  hideCancelDialog() {
    this.displayCancelDialog = false;
    this.formationToCancel = null;
  }

  cancelReservation() {
    if (!this.formationToCancel || !this.userId) return;
    
    this.cancelLoading = true;
    // Find the reservation to cancel
    this.formationService.getReservationsByParticipant(this.userId).subscribe(reservations => {
      const reservation = reservations.find(r => r.formation?.id === this.formationToCancel?.id);
      if (reservation && reservation.id) {
        // Use status update instead of delete to avoid CORS issues
        this.formationService.updateReservationStatus(reservation.id, 'ANNULE').subscribe({
          next: () => {
            this.loadUserReservations();
            this.cancelLoading = false;
            this.hideCancelDialog();
            // Show success message
            console.log('Reservation cancelled successfully');
          },
          error: (error) => {
            console.error('Cancel reservation failed:', error);
            this.cancelLoading = false;
            // Show error message
            // Fallback: try to remove from local array if backend fails
            this.userReservations = this.userReservations.filter(id => id !== this.formationToCancel?.id);
            this.hideCancelDialog();
          }
        });
      } else {
        this.cancelLoading = false;
        console.error('Reservation not found');
      }
    });
  }
}
