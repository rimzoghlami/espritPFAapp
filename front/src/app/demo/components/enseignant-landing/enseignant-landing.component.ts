import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-enseignant-landing',
  templateUrl: './enseignant-landing.component.html',
  styleUrls: ['./enseignant-landing.component.scss']
})
export class EnseignantLandingComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToFormations() {
    this.router.navigate(['/enseignant/formations']);
  }

  navigateToCategories() {
    this.router.navigate(['/enseignant/categories']);
  }

  navigateToReservations() {
    this.router.navigate(['/enseignant/reservations']);
  }

  navigateToProfile() {
    this.router.navigate(['/enseignant/profile']);
  }

  navigateToAbout() {
    this.router.navigate(['/enseignant/about']);
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  showWelcomeBanner(): boolean {
    // Show welcome banner only on the main enseignant route
    return this.router.url === '/enseignant' || this.router.url === '/enseignant/';
  }
}
