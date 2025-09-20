import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../services/formation.service';
import { Formation } from '../../models/formation.model';
import { AuthService } from '../../services/auth.service';

type FormationWithFile = Partial<Formation> & {
  image?: File;
};

@Component({
  selector: 'app-formations',
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.scss']
})
export class FormationsComponent implements OnInit {
  formations: Formation[] = [];
  newFormation: FormationWithFile = {};
  isAdmin = false;
  
  constructor(
    private formationService: FormationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFormations();
    this.isAdmin = this.authService.isAdmin();
  }

  loadFormations(): void {
    this.formationService.getAllFormations().subscribe({
      next: (data) => this.formations = data,
      error: (err) => console.error(err)
    });
  }

  onFileSelected(event: {files: File[]}): void {
    if (event.files?.length) {
      this.newFormation.image = event.files[0];
    }
  }

  addFormation(): void {
    if (!this.newFormation.titre || !this.newFormation.description) return;
    
    const formData = new FormData();
    formData.append('titre', this.newFormation.titre);
    formData.append('description', this.newFormation.description);
    if (this.newFormation.image) {
      formData.append('image', this.newFormation.image);
    }

    this.formationService.addFormation(formData).subscribe({
      next: () => {
        this.loadFormations();
        this.newFormation = {};
      },
      error: (err) => console.error(err)
    });
  }

  deleteFormation(id: number): void {
    this.formationService.deleteFormation(id).subscribe({
      next: () => this.loadFormations(),
      error: (err) => console.error(err)
    });
  }
}
