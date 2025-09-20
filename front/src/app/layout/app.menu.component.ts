import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Dashboard',
                icon: 'pi pi-home',
                routerLink: ['/admin/dashboard'],
                styleClass: 'esprit-menu-item-dashboard'
            },
            
            {
                items: [
                    { 
                        label: 'Formations', 
                        icon: 'pi pi-fw pi-book', 
                        routerLink: ['/admin/formations'],
                        styleClass: 'esprit-menu-item-formations',
                        badge: 'NEW'
                    },
                    { 
                        label: 'Categories', 
                        icon: 'pi pi-fw pi-tags', 
                        routerLink: ['/admin/categories'],
                        styleClass: 'esprit-menu-item-categories'
                    },
                    { 
                        label: 'Reservations', 
                        icon: 'pi pi-fw pi-calendar-plus', 
                        routerLink: ['/admin/reservations'],
                        styleClass: 'esprit-menu-item-reservations'
                    }
                ]
            },
            
            {
                items: [
                    { 
                        label: 'Enseignants', 
                        icon: 'pi pi-fw pi-user-edit', 
                        routerLink: ['/admin/enseignants'],
                        styleClass: 'esprit-menu-item-enseignants'
                    }
                ]
            },
           
            {
                label: 'Profile',
                icon: 'pi pi-user',
                routerLink: ['/admin/profile'],
                styleClass: 'esprit-menu-item-profile'
            },
            
        ];
    }
}
