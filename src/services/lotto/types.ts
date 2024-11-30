export interface LottoEvent {
  id?: string;
  eventName: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  currency: string;
  frequency: string;
  numbersToSelect: number;
  gridsPerTicket: number;
  createdAt?: string;
  status?: 'pending' | 'active' | 'completed';
  prizeCalculated?: boolean;
  winningNumbers?: number[];
}

export interface LottoParticipation {
  id?: string;
  lottoId: string;
  userId: string;
  selectedNumbers: number[];
  purchaseDate: string;
  ticketPrice: number;
  currency: string;
}

export interface LottoPrize {
  id?: string;
  lottoId: string;
  drawDate: string;
  winningNumbers: number[];
  prizeDistribution: {
    numbers: number;
    amount: number;
    jackpot: boolean;
  }[];
  totalPrizePool: number;
  winners: {
    userId: string;
    matchedNumbers: number;
    prize: number;
  }[];
}