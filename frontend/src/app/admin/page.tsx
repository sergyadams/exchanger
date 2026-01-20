'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminOrders } from '@/lib/api';
import { OrderStatus } from '@exchanger/shared';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders({
        status: statusFilter || undefined,
        q: searchQuery || undefined,
        currency: currencyFilter || undefined,
        page: 1,
      });
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [statusFilter, searchQuery, currencyFilter]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CREATED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.WAITING_PAYMENT:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PAID:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      case OrderStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <h1 className="text-3xl font-bold mb-8">Админка - Заявки</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Фильтр по статусу</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Все</option>
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Фильтр по валюте</label>
            <input
              type="text"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              placeholder="Код валюты (BTC, ETH, etc.)"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Поиск по ID</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ID заявки или короткий ID"
              className="input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка заявок...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Пара
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Создано
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {order.shortId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.fromCurrencyCode} → {order.toCurrencyCode}
                    {order.fromNetwork && ` (${order.fromNetwork})`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Number(order.amountFrom)} {order.fromCurrencyCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      Просмотр / Изменить статус
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">Заявки не найдены</div>
          )}
        </div>
      )}
    </div>
  );
}
