import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../services/formation.service';
import { Categorie } from '../../models/formation.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TooltipModule,
    ProgressBarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories-modern.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  loading: boolean = false;
  displayDialog: boolean = false;
  editMode: boolean = false;
  selectedCategory: Categorie | null = null;
  formSubmitted: boolean = false;
  totalCategories: number = 0;
  
  // Enhanced form validation
  validationErrors: { [key: string]: string } = {};
  isFormValid: boolean = false;
  
  // Form interaction states
  focusedField: string = '';
  touchedFields: Set<string> = new Set();
  
  // Enhanced category form with additional fields
  categoryForm = {
    id: null as number | null,
    nom: '',
    description: '',
    color: '#e30613',
    icon: 'pi-tag',
    isActive: true,
    sortOrder: 0,
    metadata: {
      createdAt: null as Date | null,
      updatedAt: null as Date | null,
      createdBy: '',
      tags: [] as string[]
    }
  };

  // Predefined category suggestions
  categorySuggestions = [
    { name: 'Web Development', icon: 'pi-code', color: '#3b82f6' },
    { name: 'Data Science', icon: 'pi-chart-bar', color: '#10b981' },
    { name: 'Mobile Development', icon: 'pi-mobile', color: '#8b5cf6' },
    { name: 'Design & UX', icon: 'pi-palette', color: '#f59e0b' },
    { name: 'DevOps & Cloud', icon: 'pi-cloud', color: '#06b6d4' },
    { name: 'Cybersecurity', icon: 'pi-shield', color: '#ef4444' },
    { name: 'AI & Machine Learning', icon: 'pi-android', color: '#6366f1' },
    { name: 'Project Management', icon: 'pi-briefcase', color: '#84cc16' }
  ];

  // Description templates
  descriptionTemplates = {
    technical: 'Comprehensive technical training covering programming, software development, system administration, and IT infrastructure. Perfect for professionals looking to advance their technical skills and stay current with industry trends.',
    creative: 'Creative and artistic courses including design, multimedia, photography, video production, and digital arts. Ideal for developing creative skills and expressing artistic vision through various mediums.',
    business: 'Business and management training focused on leadership, strategy, finance, marketing, and entrepreneurship. Essential for professionals seeking to advance their careers and business acumen.',
    language: 'Language learning courses covering grammar, conversation, writing, and cultural understanding. Designed for learners at all levels seeking to master new languages for personal or professional growth.',
    science: 'Scientific and research-oriented courses covering various disciplines including biology, chemistry, physics, mathematics, and environmental sciences. Perfect for academic and research professionals.',
    healthcare: 'Healthcare and medical training programs including clinical skills, patient care, medical technology, and healthcare administration. Essential for healthcare professionals and students.',
    finance: 'Financial services and accounting courses covering investment, banking, financial analysis, taxation, and financial planning. Ideal for finance professionals and entrepreneurs.',
    marketing: 'Marketing and digital marketing courses including social media, content marketing, SEO, advertising, and brand management. Perfect for marketing professionals and business owners.'
  };

  constructor(
    private formationService: FormationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.initializeValidation();
  }

  initializeValidation(): void {
    this.validateForm();
  }

  loadCategories(): void {
    this.loading = true;
    this.formationService.getAllCategories().subscribe({
      next: (data) => {
        console.log('Categories loaded successfully:', data);
        this.categories = data || [];
        this.totalCategories = this.categories.length;
        this.loading = false;
        
        // Initialize filtered categories and show success message
        this.filterCategories();
        if (this.categories.length > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Loaded ${this.categories.length} categories`,
            life: 3000
          });
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
        this.categories = [];
        this.totalCategories = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories. Please try again.',
          life: 5000
        });
      }
    });
  }

  showAddDialog(): void {
    this.editMode = false;
    this.resetForm();
    this.displayDialog = true;
    this.formSubmitted = false;
    this.validationErrors = {};
    this.touchedFields.clear();
    this.focusedField = '';
  }

  editCategory(category: Categorie): void {
    this.editMode = true;
    this.selectedCategory = category;
    this.categoryForm = {
      id: category.id || null,
      nom: category.nom || '',
      description: category.description || '',
      color: (category as any).color || '#e30613',
      icon: (category as any).icon || 'pi-tag',
      isActive: (category as any).isActive !== false,
      sortOrder: (category as any).sortOrder || 0,
      metadata: {
        createdAt: (category as any).createdAt ? new Date((category as any).createdAt) : null,
        updatedAt: new Date(),
        createdBy: (category as any).createdBy || '',
        tags: (category as any).tags || []
      }
    };
    this.displayDialog = true;
    this.formSubmitted = false;
    this.validationErrors = {};
    this.touchedFields.clear();
    this.validateForm();
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedCategory = null;
    this.resetForm();
    this.formSubmitted = false;
    this.validationErrors = {};
    this.touchedFields.clear();
    this.focusedField = '';
  }

  resetForm(): void {
    this.categoryForm = {
      id: null,
      nom: '',
      description: '',
      color: '#e30613',
      icon: 'pi-tag',
      isActive: true,
      sortOrder: this.categories.length,
      metadata: {
        createdAt: null,
        updatedAt: null,
        createdBy: '',
        tags: []
      }
    };
  }

  // Enhanced form validation
  validateForm(): void {
    this.validationErrors = {};
    let isValid = true;

    // Category name validation
    if (!this.categoryForm.nom.trim()) {
      this.validationErrors['nom'] = 'Category name is required';
      isValid = false;
    } else if (this.categoryForm.nom.trim().length < 2) {
      this.validationErrors['nom'] = 'Category name must be at least 2 characters';
      isValid = false;
    } else if (this.categoryForm.nom.trim().length > 50) {
      this.validationErrors['nom'] = 'Category name must not exceed 50 characters';
      isValid = false;
    } else if (this.isDuplicateName(this.categoryForm.nom.trim())) {
      this.validationErrors['nom'] = 'A category with this name already exists';
      isValid = false;
    }

    // Description validation
    if (!this.categoryForm.description.trim()) {
      this.validationErrors['description'] = 'Category description is required';
      isValid = false;
    } else if (this.categoryForm.description.trim().length < 10) {
      this.validationErrors['description'] = 'Description must be at least 10 characters';
      isValid = false;
    } else if (this.categoryForm.description.trim().length > 500) {
      this.validationErrors['description'] = 'Description must not exceed 500 characters';
      isValid = false;
    }

    this.isFormValid = isValid;
  }

  isDuplicateName(name: string): boolean {
    if (!name) return false;
    
    return this.categories.some(cat => {
      // In edit mode, exclude the current category being edited
      if (this.editMode && this.categoryForm.id && cat.id === this.categoryForm.id) {
        return false;
      }
      return cat.nom.toLowerCase().trim() === name.toLowerCase().trim();
    });
  }

  saveCategory(): void {
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

    const categoryData = {
      ...this.categoryForm,
      nom: this.categoryForm.nom.trim(),
      description: this.categoryForm.description.trim(),
      metadata: {
        ...this.categoryForm.metadata,
        updatedAt: new Date(),
        createdAt: this.editMode ? this.categoryForm.metadata.createdAt : new Date()
      }
    };

    if (this.editMode && this.categoryForm.id) {
      // Update functionality removed as per user request
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Category editing is not available',
        life: 3000
      });
      this.hideDialog();
    } else {
      // Add new category
      const newCategory = {
        nom: categoryData.nom,
        description: categoryData.description
      };
      
      this.formationService.addCategorie(newCategory).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Category "${categoryData.nom}" created successfully`,
            life: 4000
          });
          this.loadCategories();
          this.hideDialog();
        },
        error: (err: any) => {
          console.error('Error adding category:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to create category. Please try again.',
            life: 5000
          });
        }
      });
    }
  }

  confirmDelete(id: number): void {
    const category = this.categories.find(c => c.id === id);
    const categoryName = category?.nom || 'this category';
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${categoryName}"? This action cannot be undone and may affect existing formations.`,
      header: 'Delete Category',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.deleteCategory(id);
      }
    });
  }

  deleteCategory(id: number): void {
    this.formationService.deleteCategorie(id).subscribe({
      next: () => {
        const category = this.categories.find(c => c.id === id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Category "${category?.nom || 'Unknown'}" deleted successfully`,
          life: 4000
        });
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to delete category. Please try again.',
          life: 5000
        });
      }
    });
  }

  // Enhanced helper methods
  getActiveCategories(): number {
    return this.categories.filter(cat => cat.nom && cat.nom.trim().length > 0).length;
  }

  // Search and filter properties
  searchTerm: string = '';
  filteredCategories: Categorie[] = [];
  selectedSort: string = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  
  sortOptions = [
    { label: 'Name (A-Z)', value: 'name', icon: 'pi-sort-alpha-down' },
    { label: 'Name (Z-A)', value: 'name-desc', icon: 'pi-sort-alpha-up' },
    { label: 'Newest First', value: 'date-desc', icon: 'pi-sort-numeric-down' },
    { label: 'Oldest First', value: 'date', icon: 'pi-sort-numeric-up' },
    { label: 'Most Formations', value: 'formations-desc', icon: 'pi-sort-amount-down' },
    { label: 'Least Formations', value: 'formations', icon: 'pi-sort-amount-up' }
  ];

  // Search and filter methods
  onSearch(): void {
    this.filterCategories();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterCategories();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedSort = 'name';
    this.filterCategories();
  }

  filterCategories(): void {
    let filtered = [...this.categories];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(cat => 
        cat.nom.toLowerCase().includes(term) || 
        cat.description.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered = this.sortCategories(filtered);

    this.filteredCategories = filtered;
  }

  sortCategories(categories: Categorie[]): Categorie[] {
    return categories.sort((a, b) => {
      switch (this.selectedSort) {
        case 'name':
          return a.nom.localeCompare(b.nom);
        case 'name-desc':
          return b.nom.localeCompare(a.nom);
        case 'date':
          return (a.id || 0) - (b.id || 0);
        case 'date-desc':
          return (b.id || 0) - (a.id || 0);
        case 'formations':
          return (a.formations?.length || 0) - (b.formations?.length || 0);
        case 'formations-desc':
          return (b.formations?.length || 0) - (a.formations?.length || 0);
        default:
          return 0;
      }
    });
  }

  onSortChange(): void {
    this.filterCategories();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  getSortIcon(): string {
    const option = this.sortOptions.find(opt => opt.value === this.selectedSort);
    return option?.icon || 'pi-sort';
  }

  getSortLabel(): string {
    const option = this.sortOptions.find(opt => opt.value === this.selectedSort);
    return option?.label || 'Sort by';
  }

  getActiveCategoriesPercentage(): number {
    if (this.categories.length === 0) return 0;
    return (this.getActiveCategories() / this.categories.length) * 100;
  }

  getQualityClass(): string {
    const avgLength = this.getCategoryStats().averageNameLength;
    if (avgLength >= 15) return 'esprit-quality-excellent';
    if (avgLength >= 10) return 'esprit-quality-good';
    if (avgLength >= 5) return 'esprit-quality-fair';
    return 'esprit-quality-poor';
  }

  getQualityIcon(): string {
    const avgLength = this.getCategoryStats().averageNameLength;
    if (avgLength >= 15) return 'pi-star-fill';
    if (avgLength >= 10) return 'pi-star';
    if (avgLength >= 5) return 'pi-circle';
    return 'pi-exclamation-triangle';
  }

  getQualityText(): string {
    const avgLength = this.getCategoryStats().averageNameLength;
    if (avgLength >= 15) return 'Excellent';
    if (avgLength >= 10) return 'Good';
    if (avgLength >= 5) return 'Fair';
    return 'Needs Improvement';
  }

  trackByCategory(index: number, category: Categorie): number {
    return category.id || index;
  }

  // Form progress calculation
  getFormProgress(): number {
    let progress = 0;
    const totalFields = 2;
    
    if (this.categoryForm.nom && this.categoryForm.nom.trim().length > 0) {
      progress += 50;
    }
    
    if (this.categoryForm.description && this.categoryForm.description.trim().length > 0) {
      progress += 50;
    }
    
    return progress;
  }

  // Enhanced input interaction methods
  onInputFocus(field: string): void {
    this.focusedField = field;
    this.touchedFields.add(field);
  }

  onInputBlur(field: string): void {
    this.focusedField = '';
    this.validateForm();
  }

  onFieldChange(field: string): void {
    // Clear specific field error when user starts typing
    if (this.validationErrors[field]) {
      delete this.validationErrors[field];
    }
    
    // Re-validate form
    this.validateForm();
  }

  // Suggestion methods
  applySuggestion(suggestion: string): void {
    this.categoryForm.nom = suggestion;
    this.onFieldChange('nom');
    
    // Auto-focus description field
    setTimeout(() => {
      const descriptionField = document.getElementById('categoryDescription');
      if (descriptionField) {
        descriptionField.focus();
      }
    }, 100);
  }

  applyTemplate(type: string): void {
    const template = this.descriptionTemplates[type as keyof typeof this.descriptionTemplates];
    if (template) {
      this.categoryForm.description = template;
      this.onFieldChange('description');
    }
  }

  // Character progress calculations
  getCharProgressCircumference(): string {
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    return `${circumference} ${circumference}`;
  }

  getCharProgressOffset(current: number, max: number): number {
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min((current / max) * 100, 100);
    return circumference - (progress / 100) * circumference;
  }

  // Category name quality analysis
  getCategoryNameQuality(): string {
    if (!this.categoryForm.nom) return 'poor';
    
    const name = this.categoryForm.nom.trim();
    let score = 0;
    
    // Length check (optimal: 3-30 characters)
    if (name.length >= 3 && name.length <= 30) score += 30;
    else if (name.length > 30) score += 10;
    
    // Word count check (optimal: 1-4 words)
    const words = name.split(' ').filter(w => w.length > 0);
    if (words.length >= 1 && words.length <= 4) score += 25;
    
    // Character variety
    if (/[A-Z]/.test(name)) score += 15;
    if (!/[^a-zA-Z0-9\s&-]/.test(name)) score += 15;
    
    // Common category patterns
    if (/\b(development|design|management|science|arts|skills|training|course|programming|data|web|mobile)\b/i.test(name)) score += 15;
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }



  getQualityColor(): string {
    const quality = this.getCategoryNameQuality();
    switch (quality) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      default: return '#ef4444';
    }
  }

  // Description analysis methods
  getReadabilityScore(): number {
    if (!this.categoryForm.description) return 0;
    
    const text = this.categoryForm.description.trim();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = text.replace(/\s/g, '').length / words.length;
    
    // Simple readability score (higher is better)
    let score = 100;
    
    // Penalize long sentences
    if (avgWordsPerSentence > 20) score -= 30;
    else if (avgWordsPerSentence > 15) score -= 15;
    
    // Penalize long words
    if (avgCharsPerWord > 6) score -= 20;
    else if (avgCharsPerWord > 5) score -= 10;
    
    // Bonus for good length
    if (text.length >= 100 && text.length <= 300) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  hasKeywords(): boolean {
    if (!this.categoryForm.description) return false;
    
    const keywords = ['course', 'training', 'skills', 'learn', 'education', 'development', 'program', 'certification', 'workshop', 'tutorial', 'professional', 'career'];
    const text = this.categoryForm.description.toLowerCase();
    
    return keywords.some(keyword => text.includes(keyword));
  }

  getReadingTime(): number {
    if (!this.categoryForm.description) return 0;
    
    const words = this.categoryForm.description.split(/\s+/).filter(w => w.length > 0);
    const wordsPerSecond = 3; // Average reading speed
    
    return Math.ceil(words.length / wordsPerSecond);
  }

  getWordCount(): number {
    if (!this.categoryForm.description) return 0;
    
    return this.categoryForm.description.split(/\s+/).filter(w => w.length > 0).length;
  }

  getSentenceCount(): number {
    if (!this.categoryForm.description) return 0;
    
    return this.categoryForm.description.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }

  // Enhanced progress methods for circular progress indicator
  getProgressCircumference(): string {
    const radius = 25;
    const circumference = 2 * Math.PI * radius;
    return `${circumference} ${circumference}`;
  }

  getProgressOffset(): number {
    const radius = 25;
    const circumference = 2 * Math.PI * radius;
    const progress = this.getFormProgress();
    return circumference - (progress / 100) * circumference;
  }

  // Input particles for premium effects
  getInputParticles(): any[] {
    return Array.from({ length: 6 }, (_, i) => ({ 
      id: i,
      delay: i * 0.1,
      size: Math.random() * 3 + 2
    }));
  }

  // Category icon and color management
  getAvailableIcons(): string[] {
    return [
      'pi-tag', 'pi-tags', 'pi-bookmark', 'pi-star', 'pi-heart',
      'pi-code', 'pi-desktop', 'pi-mobile', 'pi-tablet',
      'pi-chart-bar', 'pi-chart-line', 'pi-chart-pie',
      'pi-palette', 'pi-image', 'pi-camera', 'pi-video',
      'pi-briefcase', 'pi-building', 'pi-users', 'pi-user',
      'pi-globe', 'pi-map', 'pi-compass', 'pi-flag',
      'pi-book', 'pi-graduation-cap', 'pi-pencil', 'pi-file',
      'pi-cog', 'pi-wrench', 'pi-shield', 'pi-lock'
    ];
  }

  getAvailableColors(): string[] {
    return [
      '#e30613', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
      '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#ec4899',
      '#6366f1', '#14b8a6', '#eab308', '#a855f7', '#22c55e'
    ];
  }

  // Search and filter functionality
  searchCategories(term: string): Categorie[] {
    if (!term.trim()) return this.categories;
    
    const searchTerm = term.toLowerCase().trim();
    return this.categories.filter(category =>
      category.nom.toLowerCase().includes(searchTerm) ||
      (category.description && category.description.toLowerCase().includes(searchTerm))
    );
  }

  // Export functionality
  exportCategories(): void {
    const dataStr = JSON.stringify(this.categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `categories_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.messageService.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: 'Categories exported successfully',
      life: 3000
    });
  }

  // Bulk operations
  bulkDeleteCategories(categoryIds: number[]): void {
    // Implementation for bulk delete
    this.messageService.add({
      severity: 'info',
      summary: 'Bulk Operations',
      detail: 'Bulk delete functionality would be implemented here',
      life: 3000
    });
  }

  // Category statistics
  getCategoryStats(): any {
    return {
      total: this.categories.length,
      active: this.getActiveCategories(),
      withDescriptions: this.categories.filter(c => c.description && c.description.trim().length > 0).length,
      averageNameLength: this.categories.reduce((sum, c) => sum + c.nom.length, 0) / this.categories.length || 0,
      averageDescriptionLength: this.categories.reduce((sum, c) => sum + (c.description?.length || 0), 0) / this.categories.length || 0
    };
  }

  // Form field validation helpers
  isFieldValid(fieldName: string): boolean {
    return !this.validationErrors[fieldName] && this.touchedFields.has(fieldName);
  }

  isFieldInvalid(fieldName: string): boolean {
    return !!this.validationErrors[fieldName] && (this.touchedFields.has(fieldName) || this.formSubmitted);
  }

  getFieldValidationClass(fieldName: string): string {
    if (this.isFieldValid(fieldName)) return 'esprit-input-success';
    if (this.isFieldInvalid(fieldName)) return 'esprit-input-error';
    if (this.focusedField === fieldName) return 'esprit-input-focused';
    return '';
  }

  // Auto-save functionality (for future implementation)
  autoSave(): void {
    if (this.isFormValid && this.editMode) {
      // Auto-save logic would go here
      console.log('Auto-saving category...');
    }
  }

  // Keyboard shortcuts
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl+S to save
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      if (this.displayDialog && this.isFormValid) {
        this.saveCategory();
      }
    }
    
    // Escape to close dialog
    if (event.key === 'Escape' && this.displayDialog) {
      this.hideDialog();
    }
  }
}

