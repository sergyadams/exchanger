import { type CreateOrderRequest, type OrderWithTimeline, type Currency, type ExchangePair } from '@exchanger/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getCurrencies(): Promise<{ currencies: Currency[] }> {
  // Используем маршрут без /api префикса (Railway перехватывает /api/*)
  const response = await fetch(`${API_URL}/currencies`);
  if (!response.ok) throw new Error('Failed to fetch currencies');
  return response.json();
}

export async function getPairs(from?: string): Promise<{ pairs: ExchangePair[] }> {
  const url = from 
    ? `${API_URL}/pairs?from=${encodeURIComponent(from)}`
    : `${API_URL}/pairs`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch pairs');
  return response.json();
}

export async function calculateExchange(
  fromCurrencyCode: string,
  toCurrencyCode: string,
  amountFrom: number
): Promise<{
  rate: number;
  feePct: number;
  feeAmount: number;
  amountTo: number;
  expiresInSeconds: number;
  rateSource: string;
  updatedAt: string;
}> {
  const response = await fetch(`${API_URL}/exchange/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromCurrencyCode, toCurrencyCode, amountFrom }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to calculate');
  }
  return response.json();
}

export async function createOrder(data: CreateOrderRequest): Promise<{
  orderId: string;
  shortId: string;
  payinAddress: string;
  payinQrData: string;
  expiresAt: string;
  status: string;
}> {
  const response = await fetch(`${API_URL}/exchange/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }
  return response.json();
}

export async function getOrder(id: string): Promise<OrderWithTimeline> {
  const response = await fetch(`${API_URL}/exchange/${id}`);
  if (!response.ok) throw new Error('Failed to fetch order');
  return response.json();
}

export async function markOrderSent(id: string): Promise<any> {
  const response = await fetch(`${API_URL}/exchange/${id}/mark-sent`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to mark order as sent');
  return response.json();
}

export async function getRates(): Promise<{
  rates: Array<{
    fromCurrencyCode: string;
    toCurrencyCode: string;
    fromCurrencyName: string;
    toCurrencyName: string;
    rate: number;
    rateSource: string;
    updatedAt: string;
  }>;
  updatedAt: string;
}> {
  const response = await fetch(`${API_URL}/rates`);
  if (!response.ok) throw new Error('Failed to fetch rates');
  return response.json();
}

export async function getAdminOrders(params?: {
  status?: string;
  q?: string;
  page?: number;
  currency?: string;
}): Promise<{
  orders: any[];
  pagination: any;
}> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.q) query.append('q', params.q);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.currency) query.append('currency', params.currency);
  
  const response = await fetch(`${API_URL}/admin/orders?${query}`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function getAdminOrder(id: string): Promise<OrderWithTimeline> {
  const response = await fetch(`${API_URL}/admin/orders/${id}`);
  if (!response.ok) throw new Error('Failed to fetch order');
  return response.json();
}

export async function updateOrderStatus(
  id: string,
  status: string,
  adminNote?: string
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, adminNote }),
  });
  if (!response.ok) throw new Error('Failed to update order');
  return response.json();
}

export interface PayInWallet {
  id: string;
  currencyCode: string;
  network: string;
  address: string;
  label: string | null;
  isActive: boolean;
  priority: number;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminWallets(params?: {
  currencyCode?: string;
  network?: string;
  isActive?: boolean;
}): Promise<{ wallets: PayInWallet[] }> {
  const query = new URLSearchParams();
  if (params?.currencyCode) query.append('currencyCode', params.currencyCode);
  if (params?.network) query.append('network', params.network);
  if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());
  
  const response = await fetch(`${API_URL}/admin/wallets?${query}`);
  if (!response.ok) throw new Error('Failed to fetch wallets');
  return response.json();
}

export async function getAdminWallet(id: string): Promise<{ wallet: PayInWallet }> {
  const response = await fetch(`${API_URL}/admin/wallets/${id}`);
  if (!response.ok) throw new Error('Failed to fetch wallet');
  return response.json();
}

export async function createWallet(data: {
  currencyCode: string;
  network: string;
  address: string;
  label?: string;
  priority?: number;
  isActive?: boolean;
}): Promise<{ wallet: PayInWallet }> {
  const response = await fetch(`${API_URL}/admin/wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create wallet');
  }
  return response.json();
}

export async function updateWallet(
  id: string,
  data: {
    label?: string;
    priority?: number;
    isActive?: boolean;
  }
): Promise<{ wallet: PayInWallet }> {
  const response = await fetch(`${API_URL}/admin/wallets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update wallet');
  }
  return response.json();
}

export async function deleteWallet(id: string): Promise<{ wallet: PayInWallet }> {
  const response = await fetch(`${API_URL}/admin/wallets/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete wallet');
  return response.json();
}
