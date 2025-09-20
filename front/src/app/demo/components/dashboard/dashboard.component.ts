import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { FormationService } from '../../services/formation.service';
import { UserService } from '../../services/user.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ChartModule,
    ButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  // Statistics Data
  totalFormations: number = 0;
  totalEnseignants: number = 0;
  totalReservations: number = 0;
  totalCategories: number = 0;
  
  // Chart Configuration
  formationChartData: any;
  chartOptions: any;
  chartPeriod: string = 'month';
  
  // Loading State
  loading: boolean = false;

  constructor(
    private formationService: FormationService,
    private userService: UserService,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    this.initializeCharts();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load formations
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.totalFormations = formations.length;
        this.updateFormationChart(formations);
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
    
    // Load reservations from database
    this.reservationService.getReservationCount().subscribe({
      next: (count) => {
        this.totalReservations = count;
      },
      error: (error) => {
        console.error('Error loading reservations count:', error);
        // Fallback to getting all reservations and counting them
        this.reservationService.getAllReservations().subscribe({
          next: (reservations) => {
            this.totalReservations = reservations.length;
          },
          error: (fallbackError) => {
            console.error('Error loading reservations:', fallbackError);
            this.totalReservations = 0;
          }
        });
      }
    });
    
    this.loading = false;
  }

  initializeCharts() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#111827',
            font: {
              family: 'Inter, sans-serif',
              size: 12,
              weight: '600'
            },
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#111827',
          bodyColor: '#6b7280',
          borderColor: '#e30613',
          borderWidth: 2,
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
      scales: {
        x: {
          ticks: {
            color: '#6b7280',
            font: {
              family: 'Inter, sans-serif',
              size: 11,
              weight: '500'
            }
          },
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: '#6b7280',
            font: {
              family: 'Inter, sans-serif',
              size: 11,
              weight: '500'
            }
          },
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
            drawBorder: false
          }
        }
      }
    };
  }

  updateFormationChart(formations: any[]) {
    // Group formations by category for chart
    const categoryCount: { [key: string]: number } = {};
    formations.forEach(formation => {
      const categoryName = formation.categorie?.nom || 'Uncategorized';
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });

    this.formationChartData = {
      labels: Object.keys(categoryCount),
      datasets: [{
        label: 'Formations by Category',
        data: Object.values(categoryCount),
        backgroundColor: [
          '#e30613',
          '#b91c1c',
          '#991b1b',
          '#7f1d1d',
          '#6b7280',
          '#9ca3af'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }

  setChartPeriod(period: string) {
    this.chartPeriod = period;
    // Here you would typically reload chart data based on the selected period
    console.log('Chart period changed to:', period);
  }

  refreshData() {
    this.loadDashboardData();
  }
}
