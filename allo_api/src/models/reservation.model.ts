export interface ReservationSummary {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'RELEASED';
  quantity: number;
  expiresAt: string;
}
