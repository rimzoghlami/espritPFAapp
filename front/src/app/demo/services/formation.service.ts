import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Categorie, Formation, Reservation } from '../models/formation.model';


@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private readonly apiUrl = 'http://localhost:9094/Formation-Service/api';

  constructor(private http: HttpClient) {}

  // Categorie Service Methods
  getAllCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/categories`).pipe(
      catchError(this.handleError)
    );
  }

  getCategorieById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/categories/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addCategorie(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.apiUrl}/categories`, categorie).pipe(
      catchError(this.handleError)
    );
  }

  deleteCategorie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Formation Service Methods
  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/formations`).pipe(
      catchError(this.handleError)
    );
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/formations/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addFormation(formData: FormData): Observable<Formation> {
    // Let Angular automatically set the Content-Type header for multipart/form-data
    // Don't specify headers to allow browser to set proper multipart boundary
    return this.http.post<Formation>(`${this.apiUrl}/formations/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  updateFormation(formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/formations`, formation).pipe(
      catchError(this.handleError)
    );
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/formations/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Reservation Service Methods
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations`).pipe(
      catchError(this.handleError)
    );
  }

  getReservationsByParticipant(participantId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/participant/${participantId}`).pipe(
      catchError(this.handleError)
    );
  }

  getReservationsByFormation(formationId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/formation/${formationId}`).pipe(
      catchError(this.handleError)
    );
  }

  addReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, reservation).pipe(
      catchError(this.handleError)
    );
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservations/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateReservationStatus(reservationId: number, status: string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/reservations/${reservationId}/status?status=${status}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}