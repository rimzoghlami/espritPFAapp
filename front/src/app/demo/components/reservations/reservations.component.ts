import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormationService } from '../../services/formation.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { UserService } from '../../services/user.service';
import { Reservation, StatutReservation } from '../../models/formation.model';
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
  selector: 'app-reservations',
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
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  reservations: any[] = [];
  filteredReservations: any[] = [];
  loading = false;
  
  // Filter properties
  selectedStatusFilter: string | null = null;
  selectedEnseignantFilter: string | null = null;
  selectedFormationFilter: string | null = null;
  dateRange: Date[] = [];
  
  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Confirmed', value: 'CONFIRME' },
    { label: 'Pending', value: 'EN_ATTENTE' },
    { label: 'Cancelled', value: 'ANNULE' }
  ];
  
  enseignantOptions: any[] = [];
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
    this.loadAllReservations();
    this.loadFilterOptions();
  }

  loadAllReservations(): void {
    this.loading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.calculateStatistics();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load reservations'
        });
        this.loading = false;
      }
    });
  }

  loadFilterOptions(): void {
    // Load enseignants for filter
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.enseignantOptions = [
          { label: 'All Enseignants', value: null },
          ...users
            .filter(user => user.roleType === 'ENSEIGNANT')
            .map(user => ({
              label: `${user.firstName} ${user.lastName}`,
              value: user.id
            }))
        ];
      },
      error: (error) => console.error('Error loading enseignants:', error)
    });

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
    this.totalReservations = this.reservations.length;
    this.confirmedReservations = this.reservations.filter(r => r.status === 'CONFIRME').length;
    this.pendingReservations = this.reservations.filter(r => r.status === 'EN_ATTENTE').length;
    this.cancelledReservations = this.reservations.filter(r => r.status === 'ANNULE').length;
  }

  getReservationsByStatus(status: string): Reservation[] {
    return this.reservations.filter(r => r.statut === status);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRME': return 'Confirmed';
      case 'ANNULE': return 'Cancelled';
      case 'EN_ATTENTE': default: return 'Pending';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'CONFIRME': return 'success';
      case 'ANNULE': return 'danger';
      case 'EN_ATTENTE': default: return 'warning';
    }
  }

  trackByReservationId(index: number, reservation: Reservation): number {
    return reservation.id || 0;
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onDateRangeChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredReservations = this.reservations.filter(reservation => {
      // Status filter
      if (this.selectedStatusFilter && reservation.status !== this.selectedStatusFilter) {
        return false;
      }
      
      // Enseignant filter
      if (this.selectedEnseignantFilter && reservation.userId !== this.selectedEnseignantFilter) {
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



  cancelReservation(reservation: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel the reservation for ${reservation.user?.firstName} ${reservation.user?.lastName}?`,
      header: 'Cancel Reservation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (reservation.id) {
          this.reservationService.updateReservation(reservation.id, { status: 'ANNULE' }).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Reservation cancelled successfully'
              });
              this.loadAllReservations();
              this.closeDetailsDialog();
            },
            error: (error) => {
              console.error('Error cancelling reservation:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to cancel reservation'
              });
            }
          });
        }
      }
    });
  }

  approveReservation(reservation: any): void {
    this.confirmationService.confirm({
      message: `Approve reservation for ${reservation.user?.firstName} ${reservation.user?.lastName}?`,
      header: 'Approve Reservation',
      icon: 'pi pi-check-circle',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        if (reservation.id) {
          this.reservationService.updateReservation(reservation.id, { status: 'CONFIRME' }).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Reservation approved successfully'
              });
              this.loadAllReservations();
            },
            error: (error) => {
              console.error('Error approving reservation:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to approve reservation'
              });
            }
          });
        }
      }
    });
  }

  deleteReservation(reservation: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete this reservation?`,
      header: 'Delete Reservation',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (reservation.id) {
          this.reservationService.deleteReservation(reservation.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Reservation deleted successfully'
              });
              this.loadAllReservations();
            },
            error: (error) => {
              console.error('Error deleting reservation:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete reservation'
              });
            }
          });
        }
      }
    });
  }
}
