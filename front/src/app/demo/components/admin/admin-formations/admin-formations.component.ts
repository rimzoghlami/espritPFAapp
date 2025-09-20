import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { FormationService } from '../../../services/formation.service';
import { UserService } from '../../../services/user.service';
import { Formation, Categorie, Reservation } from '../../../models/formation.model';

@Component({
  selector: 'app-admin-formations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    FileUploadModule,
    InputNumberModule,
    ToastModule,
    CalendarModule,
    RadioButtonModule,
    InputTextareaModule,
    TagModule,
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './admin-formations.component.html',
  styleUrls: ['./admin-formations.component.scss']
})
export class AdminFormationsComponent implements OnInit {
  formations: Formation[] = [];
  allFormations: Formation[] = [];
  categories: { label: string; value: Categorie }[] = [];
  categoryOptions: Categorie[] = [];
  selectedCategoryFilter: number | null = null;
  loading: boolean = false;
  displayDialog: boolean = false;
  displayReservationsDialog: boolean = false;
  selectedFormationReservations: Reservation[] = [];
  selectedFormationTitle: string = '';
  selectedFormation: Formation | null = null;
  selectedFile: File | null = null;
  formSubmitted: boolean = false;
  isEditing = false;

  // Enhanced form structure matching the Formation entity
  newFormation = {
    id: undefined as number | undefined,
    titre: '',
    description: '',
    imageUrl: '',
    enLigne: false, // boolean field from entity
    lieu: '', // location for in-person formations
    meetLink: '', // meeting link for online formations
    dateDebut: null as Date | null,
    dateFin: null as Date | null,
    datePublication: null as Date | null,
    dureePauseMinutes: 0,
    formateurId: undefined as number | undefined,
    evenementId: undefined as number | undefined, // future use field from entity
    titrePause: '',
    price: undefined as number | undefined, // price field for formation cost
    categorie: undefined as Categorie | undefined,
    image: null as File | null
  };

  // Options for dropdowns
  formationModes = [
    { label: 'Online', value: true },
    { label: 'In-Person', value: false }
  ];

  constructor(
    private formationService: FormationService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    // Load both formations and categories, then map them together
    Promise.all([
      this.formationService.getAllFormations().toPromise(),
      this.formationService.getAllCategories().toPromise()
    ]).then(([formations, categories]) => {
      console.log('Formations loaded:', formations);
      console.log('Categories loaded:', categories);
      
      // Set up category options first
      if (categories && categories.length > 0) {
        this.categories = categories.map((cat: Categorie) => ({
          label: cat.nom,
          value: cat
        }));
        this.categoryOptions = categories;
        console.log('Category options set up:', this.categories);
      } else {
        this.categories = [];
        this.categoryOptions = [];
        console.warn('No categories found');
      }
      
      // Map categories to formations if they don't have category info
      if (formations && formations.length > 0) {
        this.allFormations = formations.map(formation => {
          console.log('Processing formation:', formation.titre);
          console.log('Full formation object:', formation);
          console.log('Formation category field:', formation.categorie);
          console.log('Formation categorieId field:', (formation as any).categorieId);
          console.log('Formation category_id field:', (formation as any).category_id);
          
          // Check multiple possible category field names
          let categoryId: number | null = null;
          if ((formation as any).categorieId) {
            categoryId = (formation as any).categorieId;
          } else if ((formation as any).category_id) {
            categoryId = (formation as any).category_id;
          } else if ((formation as any).categoryId) {
            categoryId = (formation as any).categoryId;
          } else if (formation.categorie && formation.categorie.id) {
            categoryId = formation.categorie.id;
          }
          
          console.log('Detected categoryId:', categoryId);
          
          // If we found a category ID, map it to the full category object
          if (categoryId && categories) {
            const category = categories.find(cat => cat.id === categoryId);
            if (category) {
              formation.categorie = category;
              console.log('Successfully mapped category:', category.nom);
            } else {
              console.log('Category not found for ID:', categoryId);
            }
          } else if (!formation.categorie) {
            console.log('No category information found for formation:', formation.titre);
          }
          
          return formation;
        });
      } else {
        this.allFormations = [];
        console.warn('No formations found');
      }
      
      this.formations = this.allFormations;
      console.log('Final formations with categories:', this.formations);
      
      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load formations and categories'
      });
      this.loading = false;
    });
  }

  loadFormations() {
    this.loading = true;
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.allFormations = formations;
        this.formations = formations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load formations'
        });
        this.loading = false;
      }
    });
  }

  loadCategories() {
    console.log('Loading categories...');
    this.formationService.getAllCategories().subscribe({
      next: (categories: Categorie[]) => {
        console.log('Categories loaded:', categories);
        this.categories = categories.map((cat: Categorie) => ({
          label: cat.nom,
          value: cat
        }));
        this.categoryOptions = categories;
        console.log('Category options:', this.categories);
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories'
        });
      }
    });
  }

  filterByCategory() {
    if (this.selectedCategoryFilter) {
      this.formations = this.allFormations.filter(formation => 
        formation.categorie && formation.categorie.id === this.selectedCategoryFilter
      );
    } else {
      this.formations = [...this.allFormations];
    }
  }

  getActiveFormationsCount(): number {
    const currentDate = new Date();
    return this.formations.filter(formation => {
      if (formation.dateDebut) {
        const startDate = new Date(formation.dateDebut);
        return startDate >= currentDate;
      }
      return false;
    }).length;
  }

  showAddDialog() {
    this.displayDialog = true;
    this.resetForm();
  }

  hideDialog() {
    this.displayDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.newFormation = {
      id: undefined,
      titre: '',
      description: '',
      imageUrl: '',
      enLigne: false,
      lieu: '',
      meetLink: '',
      dateDebut: null,
      dateFin: null,
      datePublication: null,
      dureePauseMinutes: 0,
      formateurId: undefined,
      evenementId: undefined,
      titrePause: '',
      price: undefined,
      categorie: undefined,
      image: null
    };
    this.selectedFile = null;
    this.formSubmitted = false;
    this.isEditing = false;
  }

  onFileSelect(event: any) {
    this.selectedFile = event.files[0];
    this.newFormation.image = event.files[0];
  }

  addFormation() {
    this.formSubmitted = true;
    
    const formatDateForApi = (date: Date | null | undefined): string => {
      return date ? new Date(date).toISOString() : new Date().toISOString();
    };

    // Create a new formation data object with only the fields we want to send to the API
    const formationData: any = {
      titre: this.newFormation.titre,
      description: this.newFormation.description,
      enLigne: this.newFormation.enLigne,
      lieu: this.newFormation.lieu,
      meetLink: this.newFormation.meetLink,
      dureePauseMinutes: this.newFormation.dureePauseMinutes,
      formateurId: this.newFormation.formateurId,
      evenementId: this.newFormation.evenementId,
      titrePause: this.newFormation.titrePause,
      dateDebut: formatDateForApi(this.newFormation.dateDebut),
      dateFin: formatDateForApi(this.newFormation.dateFin),
      datePublication: formatDateForApi(this.newFormation.datePublication || new Date()),
      categorieId: this.newFormation.categorie?.id
    };
    
    // Only include the image if it exists
    if (this.newFormation.image) {
      formationData.image = this.newFormation.image;
    }

    if (this.isFormValid()) {
      if (this.isEditing && this.newFormation.id) {
        // For editing
        this.formationService.updateFormation({
          ...formationData,
          id: this.newFormation.id
        }).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => this.handleError(err)
        });
      } else {
        // For creation
        const formData = new FormData();
        const { image, ...formationWithoutImage } = formationData;
        
        formData.append('request', new Blob([JSON.stringify(formationWithoutImage)], {
          type: 'application/json'
        }));

        if (image) {
          formData.append('image', image);
        }

        this.formationService.addFormation(formData).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => this.handleError(err)
        });
      }
    }
  }

  isFormValid(): boolean {
    // Validate required fields
    if (!this.newFormation.titre || !this.newFormation.description || 
        !this.newFormation.dateDebut || !this.newFormation.dateFin || !this.newFormation.categorie) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields (Title, Description, Category, Start Date, End Date)'
      });
      return false;
    }
    
    // Validate image for new formations
    if (!this.isEditing && !this.selectedFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please select an image file'
      });
      return false;
    }
    
    // Validate date logic
    if (this.newFormation.dateDebut && this.newFormation.dateFin) {
      const startDate = new Date(this.newFormation.dateDebut);
      const endDate = new Date(this.newFormation.dateFin);
      if (startDate >= endDate) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'End date must be after start date'
        });
        return false;
      }
    }

    // Validate location based on formation mode
    if (!this.newFormation.enLigne && !this.newFormation.lieu) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Location is required for in-person formations'
      });
      return false;
    }

    if (this.newFormation.enLigne && !this.newFormation.meetLink) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Meeting link is required for online formations'
      });
      return false;
    }

    return true;
  }

  deleteFormation(id: number) {
    if (confirm('Are you sure you want to delete this formation?')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Formation deleted successfully'
          });
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting formation:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete formation'
          });
        }
      });
    }
  }

  showReservations(formation: Formation) {
    this.selectedFormation = formation;
    this.selectedFormationTitle = formation.titre;
    this.formationService.getReservationsByFormation(formation.id!).subscribe({
      next: (reservations) => {
        console.log('Reservations for formation:', reservations);
        
        // Fetch user details for each reservation
        const reservationsWithUsers = reservations.map(reservation => {
          this.userService.getUserById(reservation.participantId).subscribe({
            next: (user) => {
              reservation.participantName = `${user.firstName} ${user.lastName}`;
              reservation.participantEmail = user.email;
              reservation.participantPhone = user.phoneNumber;
            },
            error: (error) => {
              console.error('Error loading user details:', error);
              reservation.participantName = 'Unknown User';
              reservation.participantEmail = 'N/A';
              reservation.participantPhone = 'N/A';
            }
          });
          return reservation;
        });
        
        this.selectedFormationReservations = reservationsWithUsers;
        this.displayReservationsDialog = true;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load reservations'});
      }
    });
  }

  hideReservationsDialog() {
    this.displayReservationsDialog = false;
    this.selectedFormationReservations = [];
    this.selectedFormationTitle = '';
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'CONFIRME': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'ANNULE': return 'danger';
      default: return 'info';
    }
  }

  acceptReservation(reservationId: number) {
    this.formationService.updateReservationStatus(reservationId, 'CONFIRME').subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Reservation accepted'});
        // Refresh the reservations list
        if (this.selectedFormation) {
          this.showReservations(this.selectedFormation);
        }
      },
      error: (error) => {
        console.error('Error accepting reservation:', error);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to accept reservation'});
      }
    });
  }

  cancelReservation(reservationId: number) {
    this.formationService.updateReservationStatus(reservationId, 'ANNULE').subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Reservation cancelled'});
        // Refresh the reservations list
        if (this.selectedFormation) {
          this.showReservations(this.selectedFormation);
        }
      },
      error: (error) => {
        console.error('Error cancelling reservation:', error);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to cancel reservation'});
      }
    });
  }

  getCategoryLabel(category: Categorie): string {
    return category?.nom || '';
  }

  editFormation(formation: Formation) {
    this.newFormation = {
      id: formation.id,
      titre: formation.titre,
      description: formation.description,
      imageUrl: formation.imageUrl || '',
      enLigne: formation.enLigne,
      lieu: formation.lieu || '',
      meetLink: formation.meetLink || '',
      dateDebut: formation.dateDebut ? new Date(formation.dateDebut) : null,
      dateFin: formation.dateFin ? new Date(formation.dateFin) : null,
      datePublication: formation.datePublication ? new Date(formation.datePublication) : null,
      dureePauseMinutes: formation.dureePauseMinutes || 0,
      formateurId: formation.formateurId,
      evenementId: formation.evenementId,
      titrePause: formation.titrePause || '',
      price: formation.prix || undefined, // Map prix from Formation model to price in form
      categorie: formation.categorie ? { ...formation.categorie } : undefined,
      image: null
    };
    this.isEditing = true;
    this.displayDialog = true;
  }

  handleSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Formation ${this.isEditing ? 'updated' : 'created'} successfully`
    });
    this.loadData();
    this.hideDialog();
    this.isEditing = false;
  }

  handleError(err: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'An error occurred while processing the formation'
    });
  }

  // Helper method to get formation mode display text
  getFormationModeText(enLigne: boolean): string {
    return enLigne ? 'Online' : 'In-Person';
  }

  // Helper method to format dates
  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
