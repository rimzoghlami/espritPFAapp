import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationsComponent } from './formations.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';

@NgModule({
  declarations: [FormationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule,
    RouterModule.forChild([
      { path: '', component: FormationsComponent }
    ])
  ]
})
export class FormationsModule { }
