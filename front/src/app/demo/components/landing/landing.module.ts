import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { NavbarComponent } from './navbar/navbar.component';

import { StyleClassModule } from 'primeng/styleclass';
import { DividerModule } from 'primeng/divider';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        LandingRoutingModule,
        DividerModule,
        StyleClassModule,
        ChartModule,
        PanelModule,
        ButtonModule
    ],
    declarations: [LandingComponent, NavbarComponent]
})
export class LandingModule { }
