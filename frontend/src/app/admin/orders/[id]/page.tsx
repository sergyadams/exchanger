'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminOrder, updateOrderStatus } from '@/lib/api';
import { OrderStatus, type OrderWithTimeline } from '@exchanger/shared';
import { useToastStore } from '@/store/toastStore';
import Link from 'next/link';

export default function AdminOrderPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [order, setOrder] = useState<OrderWithTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const data = await getAdminOrder(params.id as string);
      setOrder(data);
      setAdminNote(data.adminNote || '');
    } catch (error: any) {
      addToast(error.message || 'Не удалось загрузить заявку', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: OrderStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(params.id as string, status, adminNote || undefined);
      addToast('Статус обновлён', 'success');
      loadOrder();
    } catch (error: any) {
      addToast(error.message || 'Не удалось обновить статус', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Заявка не найдена</div>
      </div>
    );
  }

  const destination = typeof order.destinationJson === 'string'
    ? order.destinationJson
    : JSON.parse(order.destinationJson as any);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-primary-600 hover:underline">
          ← Назад в админку
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Админка - Заявка #{order.shortId}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Детали заявки</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono font-medium">{order.shortId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Пара:</span>
                <span className="font-medium">
                  {order.fromCurrencyCode} → {order.toCurrencyCode}
                  {order.fromNetwork && ` (${order.fromNetwork})`}
                  {order.toNetwork && ` → (${order.toNetwork})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Сумма отправки:</span>
                <span className="font-medium">
                  {Number(order.amountFrom)} {order.fromCurrencyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Сумма получения:</span>
                <span className="font-medium">
                  {Number(order.amountTo)} {order.toCurrencyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Курс:</span>
                <span className="font-medium">
                  {Number(order.rate)} {order.toCurrencyCode} за {order.fromCurrencyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Комиссия:</span>
                <span className="font-medium">
                  {Number(order.feeAmount)} {order.fromCurrencyCode} ({Number(order.feePct)}%)
                </span>
              </div>
              {order.payoutMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Способ вывода:</span>
                  <span className="font-medium">{order.payoutMethod}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Адрес оплаты:</span>
                <span className="font-mono text-sm">{order.payinAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium text-right">
                  {typeof destination === 'string' ? destination : `${destination.method}: ${destination.details}`}
                </span>
              </div>
              {order.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{order.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Истекает:</span>
                <span className="font-medium">
                  {new Date(order.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">История статусов</h2>
            <div className="space-y-2">
              {order.timeline?.map((event, idx) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <div className="flex-1">
                    <div className="font-medium">
                      {event.fromStatus ? `${event.fromStatus} → ${event.toStatus}` : `Создано: ${event.toStatus}`}
                    </div>
                    <div className="text-gray-500">
                      {new Date(event.changedAt).toLocaleString()} by {event.actor}
                    </div>
                    {event.note && (
                      <div className="text-gray-600 mt-1 italic">Примечание: {event.note}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Действия администратора</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Примечание администратора</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Добавить примечание..."
                />
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleStatusChange(OrderStatus.WAITING_PAYMENT)}
                  disabled={updating}
                  className="btn-secondary w-full"
                >
                  Отметить ОЖИДАНИЕ ОПЛАТЫ
                </button>
                <button
                  onClick={() => handleStatusChange(OrderStatus.PAID)}
                  disabled={updating}
                  className="btn-secondary w-full"
                >
                  Отметить ОПЛАЧЕНО
                </button>
                <button
                  onClick={() => handleStatusChange(OrderStatus.COMPLETED)}
                  disabled={updating}
                  className="btn-primary w-full"
                >
                  Отметить ЗАВЕРШЕНО
                </button>
                <button
                  onClick={() => handleStatusChange(OrderStatus.CANCELED)}
                  disabled={updating}
                  className="btn-secondary w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Отменить
                </button>
              </div>
              <Link
                href={`/order/${order.id}`}
                className="btn-secondary w-full block text-center"
              >
                Открыть вид пользователя
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
