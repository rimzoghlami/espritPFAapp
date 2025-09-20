import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { UserProfileComponent } from './demo/components/auth/user-profile/user-profile.component';
import { AuthGuard } from './demo/services/auth.guard';
import { CategoriesComponent } from './demo/components/categories/categories.component';
import { ReservationsComponent } from './demo/components/reservations/reservations.component';
import { AdminReservationsComponent } from './demo/components/admin/admin-reservations/admin-reservations.component';
import { EnseignantReservationsComponent } from './demo/components/enseignant/enseignant-reservations/enseignant-reservations.component';
import { AdminEnseignantsComponent } from './demo/components/admin/admin-enseignants/admin-enseignants.component';
import { AdminFormationsComponent } from './demo/components/admin/admin-formations/admin-formations.component';
import { AdminProfileComponent } from './demo/components/admin/admin-profile/admin-profile.component';
import { DashboardComponent } from './demo/components/dashboard/dashboard.component';
import { EnseignantLandingComponent } from './demo/components/enseignant-landing/enseignant-landing.component';
import { EnseignantFormationsComponent } from './demo/components/enseignant/enseignant-formations.component';
import { EnseignantAboutComponent } from './demo/components/enseignant/enseignant-about/enseignant-about.component';
import { EnseignantCalendarComponent } from './demo/components/enseignant/enseignant-calendar.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            { 
                path: '', 
                redirectTo: 'auth/login', 
                pathMatch: 'full' 
            },
            // Admin routes with sidebar layout
            {
                path: 'admin', 
                component: AppLayoutComponent,
                canActivate: [AuthGuard],
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', component: DashboardComponent },
                    { path: 'profile', component: AdminProfileComponent },
                    { path: 'formations', component: AdminFormationsComponent },
                    { path: 'categories', component: CategoriesComponent },
                    { path: 'enseignants', component: AdminEnseignantsComponent },
                    { path: 'reservations', component: AdminReservationsComponent },
                    { path: 'user-profile', component: UserProfileComponent },
                    { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UikitModule) },
                    { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
                    { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
                    { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
                    { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },
                ],
            },
            // Enseignant routes with simple landing layout
            {
                path: 'enseignant',
                component: EnseignantLandingComponent,
                canActivate: [AuthGuard],
                children: [
                    { path: 'formations', component: EnseignantFormationsComponent },
                    { path: 'reservations', component: EnseignantReservationsComponent },
                    { path: 'about', component: EnseignantAboutComponent },
                    { path: 'profile', component: UserProfileComponent },
                    { path: '', redirectTo: 'formations', pathMatch: 'full' }
                ]
            },

            // Authentication & Other Routes
            { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
            { path: 'pages/notfound', component: NotfoundComponent },
            { path: '**', redirectTo: 'pages/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
