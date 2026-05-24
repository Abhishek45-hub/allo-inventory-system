export type ReservationEvent =
  | { type: 'reservation.created'; reservationId: string }
  | { type: 'reservation.confirmed'; reservationId: string }
  | { type: 'reservation.released'; reservationId: string };
