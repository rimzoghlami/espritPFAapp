import { Component, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { LayoutService } from "./service/app.layout.service";
import { AuthService } from '../demo/services/auth.service';

interface Administrator {
  id: number;
  name: string;
  email: string;
}

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, MenuModule],
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent implements OnInit {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    adminMenuActive = false;
    name = 'Admin User';
    initials = 'AU';
  
    administrators: Administrator[] = [
      { id: 1, name: 'Primary Admin', email: 'admin@esprit.com' },
      { id: 2, name: 'Secondary Admin', email: 'admin2@esprit.com' },
      { id: 3, name: 'Support Admin', email: 'support@esprit.com' }
    ];

    private authService = inject(AuthService);
    private router = inject(Router);

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
      // Initialize admin data if needed
    }

    toggleAdminMenu() {
      this.adminMenuActive = !this.adminMenuActive;
    }

    /**
     * Handles the logout process
     */
    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        this.layoutService.hideProfileSidebar();
    }
}
