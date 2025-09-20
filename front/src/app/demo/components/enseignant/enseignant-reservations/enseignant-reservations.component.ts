import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormationService } from '../../../services/formation.service';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { UserService } from '../../../services/user.service';
import { Reservation, StatutReservation } from '../../../models/formation.model';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-enseignant-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    CardModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  templateUrl: './enseignant-reservations.component.html',
  styleUrls: ['./enseignant-reservations.component.scss']
})
export class EnseignantReservationsComponent implements OnInit {
  myReservations: any[] = [];
  filteredReservations: any[] = [];
  loading = false;
  currentUserId: number = 0;
  
  // Filter properties
  selectedStatusFilter: string | null = null;
  selectedFormationFilter: string | null = null;
  dateRange: Date[] = [];
  
  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Confirmed', value: 'CONFIRME' },
    { label: 'Pending', value: 'EN_ATTENTE' },
    { label: 'Cancelled', value: 'ANNULE' }
  ];
  
  formationOptions: any[] = [];
  
  // Dialog properties
  showDetailsDialog = false;
  selectedReservation: any = null;
  
  // Statistics
  totalReservations = 0;
  confirmedReservations = 0;
  pendingReservations = 0;
  cancelledReservations = 0;

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadFormationOptions();
  }

  getCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        if (currentUser && currentUser.id) {
          this.currentUserId = currentUser.id;
          this.loadMyReservations();
        }
      },
      error: (error) => {
        console.error('Error getting current user:', error);
      }
    });
  }

  loadMyReservations(): void {
    if (!this.currentUserId) {
      console.error('No current user ID found');
      return;
    }

    this.loading = true;
    this.formationService.getReservationsByParticipant(this.currentUserId).subscribe({
      next: (data) => {
        this.myReservations = data;
        this.calculateStatistics();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading my reservations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load your reservations'
        });
        this.loading = false;
      }
    });
  }

  loadFormationOptions(): void {
    // Load formations for filter
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.formationOptions = [
          { label: 'All Formations', value: null },
          ...formations.map(formation => ({
            label: formation.titre,
            value: formation.id
          }))
        ];
      },
      error: (error) => console.error('Error loading formations:', error)
    });
  }

  calculateStatistics(): void {
    this.totalReservations = this.myReservations.length;
    this.confirmedReservations = this.myReservations.filter(r => r.statut === 'CONFIRME').length;
    this.pendingReservations = this.myReservations.filter(r => r.statut === 'EN_ATTENTE').length;
    this.cancelledReservations = this.myReservations.filter(r => r.statut === 'ANNULE').length;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRME': return 'Confirmed';
      case 'EN_ATTENTE': return 'Pending';
      case 'ANNULE': return 'Cancelled';
      default: return status;
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'CONFIRME': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'ANNULE': return 'danger';
      default: return 'info';
    }
  }

  trackByReservationId(index: number, reservation: Reservation): number {
    return reservation.id || index;
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onDateRangeChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredReservations = this.myReservations.filter(reservation => {
      // Status filter
      if (this.selectedStatusFilter && reservation.statut !== this.selectedStatusFilter) {
        return false;
      }
      
      // Formation filter
      if (this.selectedFormationFilter && reservation.formationId !== this.selectedFormationFilter) {
        return false;
      }
      
      // Date range filter
      if (this.dateRange && this.dateRange.length === 2) {
        const reservationDate = new Date(reservation.dateReservation);
        const startDate = this.dateRange[0];
        const endDate = this.dateRange[1];
        
        if (reservationDate < startDate || reservationDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }

  viewReservationDetails(reservation: any): void {
    this.selectedReservation = reservation;
    this.showDetailsDialog = true;
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedReservation = null;
  }

  // Enseignant-specific actions (limited compared to admin)
  cancelMyReservation(reservation: any): void {
    // Only allow cancellation if status is pending or confirmed
    if (reservation.statut === 'ANNULE') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'This reservation is already cancelled'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to cancel your reservation for "${reservation.formation?.titre}"?`,
      header: 'Cancel My Reservation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (reservation.id) {
          this.formationService.updateReservationStatus(reservation.id, 'ANNULE').subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Your reservation has been cancelled'
              });
              this.loadMyReservations();
              this.closeDetailsDialog();
            },
            error: (error) => {
              console.error('Error cancelling reservation:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to cancel your reservation'
              });
            }
          });
        }
      }
    });
  }

  // Helper method to check if reservation can be cancelled
  canCancelReservation(reservation: any): boolean {
    return reservation.statut === 'EN_ATTENTE' || reservation.statut === 'CONFIRME';
  }

  // Helper method to get formation start date for display
  getFormationStartDate(reservation: any): string {
    if (reservation.formation?.dateDebut) {
      return new Date(reservation.formation.dateDebut).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Date not available';
  }

  // Helper method to check if formation has started
  hasFormationStarted(reservation: any): boolean {
    if (reservation.formation?.dateDebut) {
      return new Date(reservation.formation.dateDebut) <= new Date();
    }
    return false;
  }

  // Navigate to formations to make new reservations
  navigateToFormations(): void {
    // This would typically use router.navigate, but since we're in enseignant layout
    // we can just provide a helpful message
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Navigate to Formations page to make new reservations'
    });
  }
}
