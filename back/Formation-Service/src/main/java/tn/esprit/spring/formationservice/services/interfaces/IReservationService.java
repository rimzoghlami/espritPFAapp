package tn.esprit.spring.formationservice.services.interfaces;

import tn.esprit.spring.formationservice.entity.Reservation;

import java.util.List;

public interface IReservationService {
    Reservation addReservation(Reservation reservation);
    List<Reservation> getAllReservations();
    List<Reservation> getReservationsByParticipant(Long participantId);

    List<Reservation> getReservationsByFormation(Long formationId);

    Reservation updateReservationStatus(Long reservationId, String status);}
