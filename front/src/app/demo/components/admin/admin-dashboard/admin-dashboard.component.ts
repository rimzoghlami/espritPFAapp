import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { FormationService } from '../../../services/formation.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  
  // Statistics
  totalFormations: number = 0;
  totalEnseignants: number = 0;
  totalReservations: number = 0;
  totalCategories: number = 0;
  
  // Chart data
  formationsChartData: any;
  reservationsChartData: any;
  chartOptions: any;
  
  // Recent activities
  recentFormations: any[] = [];
  recentReservations: any[] = [];
  
  loading: boolean = false;

  constructor(
    private formationService: FormationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.initializeCharts();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load formations
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.totalFormations = formations.length;
        this.recentFormations = formations.slice(0, 5); // Get latest 5
        this.updateFormationsChart(formations);
      },
      error: (error) => console.error('Error loading formations:', error)
    });
    
    // Load enseignants
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.totalEnseignants = users.filter(user => user.roleType === 'ENSEIGNANT').length;
      },
      error: (error) => console.error('Error loading users:', error)
    });
    
    // Load categories
    this.formationService.getAllCategories().subscribe({
      next: (categories) => {
        this.totalCategories = categories.length;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
    
    this.loading = false;
  }

  initializeCharts() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#111827',
            font: {
              family: 'Inter, sans-serif',
              size: 12,
              weight: '600'
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#111827',
          bodyColor: '#6b7280',
          borderColor: '#e30613',
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          titleFont: {
            family: 'Inter, sans-serif',
            size: 14,
            weight: '700'
          },
          bodyFont: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500'
          }
        }
      },
      elements: {
        arc: {
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      }
    };
  }

  updateFormationsChart(formations: any[]) {
    // Group formations by category
    const categoryCount: { [key: string]: number } = {};
    formations.forEach(formation => {
      const categoryName = formation.categorie?.nom || 'Uncategorized';
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });

    this.formationsChartData = {
      labels: Object.keys(categoryCount),
      datasets: [{
        data: Object.values(categoryCount),
        backgroundColor: [
          '#e30613',
          '#b91c1c',
          '#991b1b',
          '#7f1d1d',
          '#6b7280',
          '#9ca3af',
          '#d1d5db',
          '#f3f4f6'
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverBorderColor: '#e30613'
      }]
    };
  }

  getFormationStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }
}
