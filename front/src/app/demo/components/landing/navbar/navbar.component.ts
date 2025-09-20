import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  username = '';
  isSponsor = false;
  isMentor = false;
  user: User | null = null;
  isAuthenticated = false;
  userMenuVisible = false;
  applicationsMenuVisible = false;

  constructor(
    public router: Router,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.storageService.isLoggedIn();
    this.user = this.storageService.getUser();
    
    if (this.user) {
      this.username = this.user.name;
      this.isSponsor = this.user.roles?.some(role => role.name === 'SPONSOR') || false;
      this.isMentor = this.user.roles?.some(role => role.name === 'MENTOR') || false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.storageService.clearAll();
    window.location.reload();
  }

  navigateToLanding(): void {
    this.router.navigate(['/landing']);
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuVisible = !this.userMenuVisible;
    if (this.userMenuVisible) {
      this.applicationsMenuVisible = false;
    }
  }

  viewOrCreateMentorApplication(): void {
    // Implementation for mentor application logic
    this.router.navigate(['/mentor-applications']);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.user-dropdown');
    
    if (dropdown && !dropdown.contains(target)) {
      this.userMenuVisible = false;
      this.applicationsMenuVisible = false;
    }
  }
}
