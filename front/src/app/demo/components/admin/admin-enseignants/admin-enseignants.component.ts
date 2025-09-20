import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-admin-enseignants',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TableModule, 
    ButtonModule, 
    CardModule, 
    TagModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    DropdownModule,
    TooltipModule,
    ConfirmDialogModule,
    ProgressBarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-enseignants.component.html',
  styleUrls: ['./admin-enseignants.component.scss']
})
export class AdminEnseignantsComponent implements OnInit {
  enseignants: User[] = [];
  filteredEnseignants: User[] = [];
  loading: boolean = false;
  displayDialog: boolean = false;
  displayViewDialog: boolean = false;
  editMode: boolean = false;
  selectedEnseignant: User | null = null;
  formSubmitted: boolean = false;
  
  // Enhanced search and filter properties
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  
  // Form validation states
  validationErrors: { [key: string]: string } = {};
  isFormValid: boolean = false;
  
  // Enhanced dropdown options
  roleOptions = [
    { label: 'All Roles', value: '' },
    { label: 'Enseignant', value: 'ENSEIGNANT' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Coordinator', value: 'COORDINATOR' }
  ];

  // Role management options for admin (excluding 'All Roles' filter option)
  adminRoleOptions = [
    { label: 'Enseignant', value: 'ENSEIGNANT', icon: 'pi pi-user', description: 'Teaching staff member' },
    { label: 'Admin', value: 'ADMIN', icon: 'pi pi-shield', description: 'System administrator' },
    { label: 'Coordinator', value: 'COORDINATOR', icon: 'pi pi-users', description: 'Department coordinator' }
  ];

  // Dialog properties
  dialogTitle: string = '';
  dialogSubtitle: string = '';
  
  statusOptions = [
    { label: 'All Status', value: '', color: '#6c757d' },
    { label: 'Active', value: 'active', color: '#28a745' },
    { label: 'Inactive', value: 'inactive', color: '#dc3545' },
    { label: 'Pending', value: 'pending', color: '#ffc107' },
    { label: 'Suspended', value: 'suspended', color: '#fd7e14' }
  ];
  
  // Enhanced form structure
  enseignantForm = {
    id: null as number | null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    roleType: 'ENSEIGNANT',
    department: '',
    specialization: '',
    dateOfBirth: null as Date | null,
    hireDate: null as Date | null,
    emergencyContact: '',
    notes: ''
  };

  // Form step management
  currentStep: number = 1;
  totalSteps: number = 3;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEnseignants();
    this.initializeValidation();
  }

  initializeValidation() {
    // Initialize form validation
    this.validateForm();
  }

  loadEnseignants() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Filter only ENSEIGNANT users
        this.enseignants = users.filter(user => user.roleType === 'ENSEIGNANT');
        this.applyFilters(); // Initialize filtered list
        this.loading = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Loaded ${this.enseignants.length} enseignants`,
          life: 3000
        });
      },
      error: (error: any) => {
        console.error('Error loading enseignants:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load enseignants. Please try again.',
          life: 5000
        });
      }
    });
  }

  // Dialog methods moved to end of class to avoid duplicates

  resetForm(): void {
    this.enseignantForm = {
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: '',
      roleType: 'ENSEIGNANT',
      department: '',
      specialization: '',
      dateOfBirth: null,
      hireDate: null,
      emergencyContact: '',
      notes: ''
    };
  }

  // Enhanced form validation
  validateForm(): void {
    this.validationErrors = {};
    let isValid = true;

    // Step 1: Personal Information
    if (!this.enseignantForm.firstName.trim()) {
      this.validationErrors['firstName'] = 'First name is required';
      isValid = false;
    } else if (this.enseignantForm.firstName.trim().length < 2) {
      this.validationErrors['firstName'] = 'First name must be at least 2 characters';
      isValid = false;
    }

    if (!this.enseignantForm.lastName.trim()) {
      this.validationErrors['lastName'] = 'Last name is required';
      isValid = false;
    } else if (this.enseignantForm.lastName.trim().length < 2) {
      this.validationErrors['lastName'] = 'Last name must be at least 2 characters';
      isValid = false;
    }

    // Step 2: Contact Information
    if (!this.enseignantForm.email.trim()) {
      this.validationErrors['email'] = 'Email address is required';
      isValid = false;
    } else if (!this.isValidEmail(this.enseignantForm.email)) {
      this.validationErrors['email'] = 'Please enter a valid email address';
      isValid = false;
    }

    if (this.enseignantForm.phoneNumber && !this.isValidPhoneNumber(this.enseignantForm.phoneNumber)) {
      this.validationErrors['phoneNumber'] = 'Please enter a valid phone number';
      isValid = false;
    }

    // Step 3: Security (only for new enseignants)
    if (!this.editMode) {
      if (!this.enseignantForm.password) {
        this.validationErrors['password'] = 'Password is required';
        isValid = false;
      } else if (this.enseignantForm.password.length < 8) {
        this.validationErrors['password'] = 'Password must be at least 8 characters';
        isValid = false;
      } else if (!this.isStrongPassword(this.enseignantForm.password)) {
        this.validationErrors['password'] = 'Password must contain uppercase, lowercase, number and special character';
        isValid = false;
      }

      if (this.enseignantForm.password !== this.enseignantForm.confirmPassword) {
        this.validationErrors['confirmPassword'] = 'Passwords do not match';
        isValid = false;
      }
    }

    this.isFormValid = isValid;
  }

  // Enhanced validation methods
  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhoneNumber(phone: string): boolean {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  isStrongPassword(password: string): boolean {
    if (!password) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  // Form step navigation
  nextStep(): void {
    this.formSubmitted = true;
    this.validateForm();
    
    if (this.canProceedToNextStep()) {
      this.currentStep++;
      this.formSubmitted = false;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fix the errors before proceeding',
        life: 4000
      });
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.formSubmitted = false;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !this.validationErrors['firstName'] && !this.validationErrors['lastName'];
      case 2:
        return !this.validationErrors['email'] && !this.validationErrors['phoneNumber'];
      case 3:
        return this.editMode || (!this.validationErrors['password'] && !this.validationErrors['confirmPassword']);
      default:
        return true;
    }
  }

  saveEnseignant(): void {
    this.formSubmitted = true;
    this.validateForm();

    if (!this.isFormValid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fix all validation errors before saving',
        life: 4000
      });
      return;
    }

    const enseignantData = {
      ...this.enseignantForm,
      firstName: this.enseignantForm.firstName.trim(),
      lastName: this.enseignantForm.lastName.trim(),
      email: this.enseignantForm.email.trim().toLowerCase(),
      phoneNumber: this.enseignantForm.phoneNumber.trim(),
      address: this.enseignantForm.address.trim(),
      department: this.enseignantForm.department.trim(),
      specialization: this.enseignantForm.specialization.trim(),
      emergencyContact: this.enseignantForm.emergencyContact.trim(),
      notes: this.enseignantForm.notes.trim()
    };

    if (this.editMode && this.enseignantForm.id) {
      // Update existing enseignant
      const { password, confirmPassword, ...updateData } = enseignantData;
      
      this.userService.updateUser(updateData as User).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${enseignantData.firstName} ${enseignantData.lastName} updated successfully`,
            life: 4000
          });
          this.loadEnseignants();
          this.hideDialog();
        },
        error: (err: any) => {
          console.error('Error updating enseignant:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: err.error?.message || 'Failed to update enseignant. Please try again.',
            life: 5000
          });
        }
      });
    } else {
      // Create new enseignant
      const { confirmPassword, id, ...createData } = enseignantData;
      
      this.userService.addUser(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${enseignantData.firstName} ${enseignantData.lastName} created successfully`,
            life: 4000
          });
          this.loadEnseignants();
          this.hideDialog();
        },
        error: (error: any) => {
          console.error('Error creating enseignant:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Creation Failed',
            detail: error.error?.message || 'Failed to create enseignant. Please try again.',
            life: 5000
          });
        }
      });
    }
  }

  deleteEnseignant(enseignant: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${enseignant.firstName} ${enseignant.lastName}? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (enseignant.id) {
          this.userService.deleteUser(enseignant.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `${enseignant.firstName} ${enseignant.lastName} deleted successfully`,
                life: 4000
              });
              this.loadEnseignants();
            },
            error: (error) => {
              console.error('Error deleting enseignant:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Deletion Failed',
                detail: error.error?.message || 'Failed to delete enseignant. Please try again.',
                life: 5000
              });
            }
          });
        }
      }
    });
  }

  // Enhanced statistics methods
  getActiveEnseignantsCount(): number {
    return this.enseignants.filter(enseignant => 
      enseignant.roleType === 'ENSEIGNANT'
    ).length;
  }

  getVerifiedEmailsCount(): number {
    return this.enseignants.filter(enseignant => 
      enseignant.email && this.isValidEmail(enseignant.email)
    ).length;
  }

  getRecentEnseignantsCount(): number {
    // For demo purposes, return a calculated number
    // In real implementation, you would filter by creation date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Simulate recent additions (in real app, compare with actual creation dates)
    return Math.floor(this.enseignants.length * 0.2);
  }

  // Enhanced search and filter methods
  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.applyFilters();
    
    this.messageService.add({
      severity: 'info',
      summary: 'Filters Cleared',
      detail: 'All filters have been reset',
      life: 3000
    });
  }

  applyFilters(): void {
    let filtered = [...this.enseignants];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(enseignant => 
        enseignant.firstName?.toLowerCase().includes(searchLower) ||
        enseignant.lastName?.toLowerCase().includes(searchLower) ||
        enseignant.email?.toLowerCase().includes(searchLower) ||
        enseignant.phoneNumber?.toLowerCase().includes(searchLower) ||
        enseignant.address?.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (this.selectedRole) {
      filtered = filtered.filter(enseignant => enseignant.roleType === this.selectedRole);
    }

    // Apply status filter (for demo purposes, all are considered active)
    if (this.selectedStatus) {
      // In real implementation, you would filter by actual status
      if (this.selectedStatus === 'active') {
        // Keep all for demo
      } else if (this.selectedStatus === 'inactive') {
        filtered = filtered.filter(enseignant => !enseignant.email); // Demo logic
      } else {
        filtered = [];
      }
    }

    this.filteredEnseignants = filtered;
  }

  // Enhanced password strength methods
  getPasswordStrength(password: string): number {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length criteria
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;
    
    // Character type criteria
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    return Math.min(100, strength);
  }

  getPasswordStrengthText(password: string): string {
    const strength = this.getPasswordStrength(password);
    if (strength < 30) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 70) return 'Fair';
    if (strength < 85) return 'Good';
    if (strength < 95) return 'Strong';
    return 'Very Strong';
  }

  getPasswordStrengthColor(password: string): string {
    const strength = this.getPasswordStrength(password);
    if (strength < 30) return '#dc3545';
    if (strength < 50) return '#fd7e14';
    if (strength < 70) return '#ffc107';
    if (strength < 85) return '#20c997';
    return '#28a745';
  }

  // Utility methods
  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFullName(enseignant: User): string {
    return `${enseignant.firstName || ''} ${enseignant.lastName || ''}`.trim();
  }

  getInitials(enseignant: User): string {
    const firstName = enseignant.firstName || '';
    const lastName = enseignant.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  // Form field change handlers
  onFieldChange(fieldName: string): void {
    // Clear specific field error when user starts typing
    if (this.validationErrors[fieldName]) {
      delete this.validationErrors[fieldName];
    }
    
    // Re-validate form
    this.validateForm();
  }

  // Export functionality
  exportEnseignants(): void {
    // In a real application, you would implement CSV/Excel export
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Export functionality would be implemented here',
      life: 3000
    });
  }

  // Bulk operations
  bulkDelete(selectedEnseignants: User[]): void {
    // In a real application, you would implement bulk delete
    this.messageService.add({
      severity: 'info',
      summary: 'Bulk Operations',
      detail: 'Bulk delete functionality would be implemented here',
      life: 3000
    });
  }

  // Dialog management methods
  showAddDialog(): void {
    this.editMode = false;
    this.selectedEnseignant = null;
    this.dialogTitle = 'Add New Enseignant';
    this.dialogSubtitle = 'Create a new enseignant account with role assignment';
    this.resetForm();
    this.currentStep = 1;
    this.displayDialog = true;
  }

  showEditDialog(enseignant: User): void {
    this.editMode = true;
    this.selectedEnseignant = enseignant;
    this.dialogTitle = 'Edit Enseignant';
    this.dialogSubtitle = `Modify ${enseignant.firstName} ${enseignant.lastName}'s information and role`;
    this.populateForm(enseignant);
    this.currentStep = 1;
    this.displayDialog = true;
  }

  showViewDialog(enseignant: User): void {
    this.selectedEnseignant = enseignant;
    this.displayViewDialog = true;
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.displayViewDialog = false;
    this.resetForm();
    this.formSubmitted = false;
    this.validationErrors = {};
    this.currentStep = 1;
  }

  populateForm(enseignant: User): void {
    this.enseignantForm = {
      id: enseignant.id || null,
      firstName: enseignant.firstName || '',
      lastName: enseignant.lastName || '',
      email: enseignant.email || '',
      phoneNumber: enseignant.phoneNumber || '',
      address: enseignant.address || '',
      password: '', // Don't populate password for security
      confirmPassword: '',
      roleType: enseignant.roleType || 'ENSEIGNANT',
      department: '',
      specialization: '',
      dateOfBirth: null,
      hireDate: null,
      emergencyContact: '',
      notes: ''
    };
  }

  // Role management methods
  onRoleChange(): void {
    // Clear validation errors when role changes
    if (this.validationErrors['roleType']) {
      delete this.validationErrors['roleType'];
    }
    this.validateForm();
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'ADMIN': return 'pi pi-shield';
      case 'COORDINATOR': return 'pi pi-users';
      case 'ENSEIGNANT':
      default: return 'pi pi-user';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return '#e30613'; // Esprit red
      case 'COORDINATOR': return '#17a2b8'; // Info blue
      case 'ENSEIGNANT':
      default: return '#28a745'; // Success green
    }
  }

  getRoleDescription(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Full system access and user management';
      case 'COORDINATOR': return 'Department coordination and oversight';
      case 'ENSEIGNANT':
      default: return 'Teaching and course management';
    }
  }
}

