import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

interface Activity {
  action: string;
  details: string;
  time: Date;
  icon: string;
}

interface DashboardStats {
  formations: number;
  enseignants: number;
  formationsChange?: number;
  enseignantsChange?: number;
}

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DialogModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    DatePipe
  ],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss'],
  providers: [
    MessageService,
    ConfirmationService,
    DatePipe
  ]
})
export class AdminProfileComponent implements OnInit {
  // Component properties
  currentUser: User | null = null;
  user: User | null = null;
  loading: boolean = false;
  showEditDialog: boolean = false;
  
  // Profile form data
  profileForm = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@esprit.tn',
    phoneNumber: '+216 00 000 000',
    address: 'ESPRIT, El Ghazala, Ariana, Tunisia'
  };
  
  // Edit form data for dialog
  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: ''
  };
  
  // Dashboard stats
  stats: DashboardStats = {
    formations: 24,
    enseignants: 12,
    formationsChange: 8,
    enseignantsChange: 3
  };
  
 

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadDashboardStats();
  }

  loadUserProfile() {
    this.loading = true;
    
    this.authService.getCurrentUser().subscribe({
      next: (userData: any) => {
        // Create a properly typed User object
        this.currentUser = {
          id: userData.id || 0,
          name: userData.name || `${userData.firstName || 'Admin'} ${userData.lastName || 'User'}`,
          email: userData.email || 'admin@esprit.tn',
          roles: userData.roles || [{ name: this.authService.getRole() || 'ADMIN' }]
        };
        this.user = this.currentUser;
        
        this.profileForm = {
          firstName: userData.firstName || 'Admin',
          lastName: userData.lastName || 'User',
          email: userData.email || 'admin@esprit.tn',
          phoneNumber: userData.phoneNumber || '+216 00 000 000',
          address: userData.address || 'ESPRIT, El Ghazala, Ariana, Tunisia'
        };
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
        // Set default values if user loading fails
        this.currentUser = {
          id: 0,
          name: 'Admin User',
          email: 'admin@esprit.tn',
          roles: [{ name: 'ADMIN' }]
        };
        this.profileForm = {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@esprit.tn',
          phoneNumber: '+216 00 000 000',
          address: 'ESPRIT, El Ghazala, Ariana, Tunisia'
        };
        this.loading = false;
      }
    });
  }

  loadDashboardStats() {
    // Mock data for dashboard stats
    this.stats = {
      formations: 24,
      enseignants: 12,
      formationsChange: 8,
      enseignantsChange: 3
    };
  }

  getInitials(): string {
    try {
      const firstName = this.profileForm.firstName || 'A';
      const lastName = this.profileForm.lastName || 'D';
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } catch (error) {
      console.error('Error getting user initials:', error);
      return 'AD';
    }
  }

  showEditProfileDialog() {
    // Copy current profile data to edit form
    this.editForm = { ...this.profileForm };
    this.showEditDialog = true;
  }

  saveProfile() {
    if (!this.editForm.firstName || !this.editForm.lastName || !this.editForm.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    this.loading = true;
    
    // Update profile form with edit form data
    this.profileForm = { ...this.editForm };
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.showEditDialog = false;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully'
      });
    }, 1000);
  }

  cancelEdit() {
    this.showEditDialog = false;
    this.editForm = { ...this.profileForm };
  }

  showChangePasswordDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change your password?',
      header: 'Change Password',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Password Change',
          detail: 'Password change functionality will be implemented'
        });
      }
    });
  }

  exportData() {
    this.confirmationService.confirm({
      message: 'Do you want to export your profile data?',
      header: 'Export Data',
      icon: 'pi pi-download',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Data Export',
          detail: 'Data export functionality will be implemented'
        });
      }
    });
  }

  getCurrentDate(): Date {
    return new Date();
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return this.datePipe.transform(dateObj, 'MMM dd, yyyy HH:mm') || 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  }
}
