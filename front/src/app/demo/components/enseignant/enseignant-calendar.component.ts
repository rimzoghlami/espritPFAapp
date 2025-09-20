import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../services/formation.service';
import { UserService } from '../../services/user.service';
import { Formation, Reservation } from '../../models/formation.model';
import { AuthService } from '../../services/auth.service';

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end?: Date;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    formation: Formation;
    reservation: Reservation;
    status: string;
  };
}

@Component({
  selector: 'app-enseignant-calendar',
  templateUrl: './enseignant-calendar.component.html',
  styleUrls: ['./enseignant-calendar.component.scss']
})
export class EnseignantCalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  reservations: Reservation[] = [];
  loading = false;
  userId: number | null = null;
  selectedEvent: CalendarEvent | null = null;
  showEventDialog = false;

  calendarOptions: any = {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: false,
    selectable: false,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    height: 'auto',
    themeSystem: 'standard'
  };

  constructor(
    private formationService: FormationService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.authService.getUserId();
    this.userId = typeof id === 'string' ? Number(id) : id;
    if (isNaN(this.userId as number)) this.userId = null;
    
    this.loadReservations();
  }

  loadReservations(): void {
    if (!this.userId) return;
    
    this.loading = true;
    this.formationService.getReservationsByParticipant(this.userId).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loadFormationDetails();
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.loading = false;
      }
    });
  }

  loadFormationDetails(): void {
    console.log('Loading formation details, reservations:', this.reservations);
    
    // Since reservations already contain formation data, we can directly create calendar events
    const formations = this.reservations
      .map(r => r.formation)
      .filter(f => f) as Formation[];
    
    console.log('Filtered formations:', formations);
    this.createCalendarEvents(formations);
    this.loading = false;
  }

  createCalendarEvents(formations: Formation[]): void {
    this.events = [];
    
    this.reservations.forEach(reservation => {
      const formation = reservation.formation;
      if (formation && formation.dateDebut) {
        const event: CalendarEvent = {
          id: reservation.id || 0,
          title: formation.titre || 'Formation',
          start: new Date(formation.dateDebut),
          end: formation.dateFin ? new Date(formation.dateFin) : undefined,
          backgroundColor: this.getStatusColor(reservation.statut).background,
          borderColor: this.getStatusColor(reservation.statut).border,
          textColor: '#ffffff',
          extendedProps: {
            formation,
            reservation,
            status: reservation.statut || 'EN_ATTENTE'
          }
        };
        this.events.push(event);
      }
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
    };
  }

  getStatusColor(status: string): { background: string; border: string } {
    switch (status) {
      case 'CONFIRME':
        return { background: '#10b981', border: '#059669' };
      case 'ANNULE':
        return { background: '#ef4444', border: '#dc2626' };
      case 'EN_ATTENTE':
      default:
        return { background: '#f59e0b', border: '#d97706' };
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRME':
        return 'Confirmed';
      case 'ANNULE':
        return 'Cancelled';
      case 'EN_ATTENTE':
      default:
        return 'Pending';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'CONFIRME':
        return 'success';
      case 'ANNULE':
        return 'danger';
      case 'EN_ATTENTE':
      default:
        return 'warning';
    }
  }

  handleEventClick(clickInfo: any): void {
    this.selectedEvent = clickInfo.event as CalendarEvent;
    this.showEventDialog = true;
  }

  closeEventDialog(): void {
    this.showEventDialog = false;
    this.selectedEvent = null;
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
