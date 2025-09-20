import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { CategoriesComponent } from './demo/components/categories/categories.component';
import { ReservationsComponent } from './demo/components/reservations/reservations.component';
import { EnseignantLandingComponent } from './demo/components/enseignant-landing/enseignant-landing.component';
import { EnseignantFormationsComponent } from './demo/components/enseignant/enseignant-formations.component';
import { EnseignantAboutComponent } from './demo/components/enseignant/enseignant-about/enseignant-about.component';
import { EnseignantCalendarComponent } from './demo/components/enseignant/enseignant-calendar.component';
import { FilterPipe } from './demo/pipes/filter.pipe';

//New TODO mydasboard
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarModule } from 'primeng/calendar';
import { AuthService } from './demo/services/auth.service';

@NgModule({
    declarations: [
        AppComponent, 
        NotfoundComponent,
        EnseignantLandingComponent,
        EnseignantFormationsComponent,
        EnseignantAboutComponent,
        EnseignantCalendarComponent,
        FilterPipe
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        AppLayoutModule,
        TableModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        RatingModule,
        ButtonModule,
        SliderModule,
        InputTextModule,
        ToggleButtonModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
        ToastModule,
        CardModule,
        TagModule,
        DialogModule,
        InputTextareaModule,
        FullCalendarModule,
        CalendarModule,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, MessageService, AuthService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
