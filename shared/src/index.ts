export enum CurrencyType {
  CRYPTO = 'CRYPTO',
  FIAT = 'FIAT',
}

export enum NetworkType {
  BTC = 'BTC',
  ETH = 'ETH',
  TRON = 'TRON',
  TON = 'TON',
  BSC = 'BSC',
  LTC = 'LTC',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export enum StatusActor {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum RateSource {
  COINGECKO = 'COINGECKO',
  FIXED = 'FIXED',
  MANUAL = 'MANUAL',
}

export interface Currency {
  code: string;
  name: string;
  type: CurrencyType;
  network: NetworkType | null;
  isManual: boolean;
  precision: number;
  minAmount: number;
  maxAmount: number;
  enabled: boolean;
}

export interface ExchangePair {
  fromCurrencyCode: string;
  toCurrencyCode: string;
  enabled: boolean;
  feePct: number;
  rateSource: RateSource;
  notes?: string;
}

export interface CreateOrderRequest {
  fromCurrencyCode: string;
  toCurrencyCode: string;
  amountFrom: number;
  destination: string | DestinationRUB | DestinationFiat;
  email?: string;
}

export interface DestinationRUB {
  method: 'Sber' | 'Tinkoff' | 'SBP' | 'Cash';
  details: string;
}

export interface DestinationFiat {
  method: string;
  details: string;
}

export interface Order {
  id: string;
  shortId: string;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  fromNetwork: string | null;
  toNetwork: string | null;
  amountFrom: number;
  amountTo: number;
  rate: number;
  feePct: number;
  feeAmount: number;
  destinationJson: string | DestinationRUB | DestinationFiat;
  payoutMethod: string | null;
  payoutDetails: string | null;
  email?: string;
  payinAddress: string;
  status: OrderStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedAt: string;
  actor: StatusActor;
  note?: string;
}

export interface OrderWithTimeline extends Order {
  timeline: OrderStatusEvent[];
}

export const ORDER_EXPIRY_MINUTES = 20;
export const DEFAULT_FEE_PERCENT = 0.7;
