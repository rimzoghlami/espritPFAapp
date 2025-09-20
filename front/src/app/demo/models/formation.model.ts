export interface Categorie {
    id?: number;
    nom: string;
    description: string;
    formations?: Formation[];
  }
  
  export interface Formation {
    id?: number;
    titre: string;
    description: string;
    dateDebut: string | Date;
    dateFin?: string | Date;
    enLigne: boolean;
    lieu?: string;
    meetLink?: string;
    datePublication?: string;
    dureePauseMinutes?: number;
    formateurId?: number;
    evenementId?: number;
    titrePause?: string;
    categorie?: Categorie;
    duree?: number;
    niveau?: string;
    prix?: number;
    capacite?: number;
    prerequis?: string;
    imageUrl?: string;
    reservations?: Reservation[];
  }
  
  export interface FormationRequest {
    titre: string;
    description: string;
    prix?: number;
    formateurId: number;
    mode: string;
    dateDebut: string;
    dateFin: string;
    categorieId?: number;
    lieu?: string;
    pauseTitle?: string;
    pauseDuration?: number;
  }
  
  export enum StatutReservation {
    CONFIRME = 'CONFIRME',
    REFUSE = 'REFUSE',
    EN_ATTENTE = 'EN_ATTENTE',
    ANNULE = 'ANNULE'
  }
  
  export interface Reservation {
    id?: number;
    participantId: number;
    statut: StatutReservation;
    dateReservation: string;
    formation?: Formation;
    // Additional fields for UI display
    participantName?: string;
    participantEmail?: string;
    participantPhone?: string;
  }