'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrder, markOrderSent } from '@/lib/api';
import { OrderStatus, type OrderWithTimeline } from '@exchanger/shared';
import { useToastStore } from '@/store/toastStore';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [order, setOrder] = useState<OrderWithTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      loadOrder();
      const interval = setInterval(loadOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [params.id]);

  useEffect(() => {
    if (order?.expiresAt) {
      const updateTimeLeft = () => {
        const expires = new Date(order.expiresAt).getTime();
        const now = Date.now();
        const diff = expires - now;
        if (diff <= 0) {
          setTimeLeft('Истекло');
          return;
        }
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [order]);

  const loadOrder = async () => {
    try {
      const data = await getOrder(params.id as string);
      setOrder(data);
    } catch (error: any) {
      addToast(error.message || 'Не удалось загрузить заявку', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSent = async () => {
    try {
      await markOrderSent(params.id as string);
      addToast('Заявка отмечена как отправленная', 'success');
      loadOrder();
    } catch (error: any) {
      addToast(error.message || 'Не удалось отметить как отправленную', 'error');
    }
  };

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
        <Link href="/" className="text-primary-600 hover:underline">
          ← Назад к обмену
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Заявка #{order.shortId}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Детали заявки</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Пара:</span>
                <span className="font-medium">
                  {order.fromCurrencyCode} → {order.toCurrencyCode}
                  {order.fromNetwork && ` (${order.fromNetwork})`}
                  {order.toNetwork && ` → (${order.toNetwork})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Отправляете:</span>
                <span className="font-medium">
                  {Number(order.amountFrom)} {order.fromCurrencyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Получаете:</span>
                <span className="font-medium">
                  {Number(order.amountTo)} {order.toCurrencyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Курс:</span>
                <span className="font-medium">
                  1 {order.fromCurrencyCode} = {Number(order.rate)} {order.toCurrencyCode}
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
                <span className="text-gray-600">Создано:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Истекает через:</span>
                <span className="font-medium">{timeLeft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Получатель:</span>
                <span className="font-medium text-right">
                  {typeof destination === 'string' ? destination : `${destination.method}: ${destination.details}`}
                </span>
              </div>
              {order.fromNetwork && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Сеть отправки:</span>
                  <span className="font-medium">{order.fromNetwork}</span>
                </div>
              )}
              {order.toNetwork && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Сеть получения:</span>
                  <span className="font-medium">{order.toNetwork}</span>
                </div>
              )}
              {order.payoutMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Способ вывода:</span>
                  <span className="font-medium">{order.payoutMethod}</span>
                </div>
              )}
              {order.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{order.email}</span>
                </div>
              )}
            </div>
          </div>

          {order.status === OrderStatus.CREATED && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Отправка средств</h2>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Отправьте точно:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${Number(order.amountFrom)} ${order.fromCurrencyCode}`}
                      readOnly
                      className="input flex-1 bg-gray-50"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${Number(order.amountFrom)} ${order.fromCurrencyCode}`);
                        addToast('Скопировано в буфер обмена', 'success');
                      }}
                      className="btn-secondary"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">
                      Адрес для перевода:
                    </label>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(order.payinAddress);
                        addToast('Адрес скопирован', 'success');
                      }}
                      className="btn-secondary text-sm"
                    >
                      Скопировать адрес
                    </button>
                  </div>
                  <div className="font-mono text-sm break-all bg-gray-50 p-3 rounded">
                    {order.payinAddress}
                  </div>
                  {order.fromNetwork && (
                    <div className="flex items-center gap-2">
                      <span className="badge bg-blue-100 text-blue-800">{order.fromNetwork}</span>
                      <span className="text-xs text-gray-500">Сеть</span>
                    </div>
                  )}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900">
                    ⚠️ DEMO-адрес. Не отправляйте реальные средства.
                  </div>
                </div>
                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                  <QRCodeSVG value={order.payinAddress} size={200} />
                </div>
                <button
                  onClick={handleMarkSent}
                  className="btn-primary w-full"
                >
                  Я отправил
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Статус</h2>
            <div className="mb-4">
              <span className={`badge ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className={`text-sm ${order.status === OrderStatus.CREATED ? 'font-semibold' : ''}`}>
                ✓ Создана
              </div>
              <div className={`text-sm ${order.status === OrderStatus.WAITING_PAYMENT ? 'font-semibold' : ''}`}>
                {order.status === OrderStatus.WAITING_PAYMENT ? '→' : '✓'} Ожидание оплаты
              </div>
              <div className={`text-sm ${order.status === OrderStatus.PAID ? 'font-semibold' : ''}`}>
                {order.status === OrderStatus.PAID ? '→' : order.status === OrderStatus.COMPLETED ? '✓' : ''} Оплачено
              </div>
              <div className={`text-sm ${order.status === OrderStatus.COMPLETED ? 'font-semibold' : ''}`}>
                {order.status === OrderStatus.COMPLETED ? '→' : ''} Завершено
              </div>
            </div>
            {order.status === OrderStatus.EXPIRED && (
              <Link href="/" className="btn-primary w-full mt-4 block text-center">
                Создать новую заявку
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/terms" className="text-sm text-gray-600 hover:underline">
          Условия / Отказ от ответственности
        </Link>
      </div>
    </div>
  );
}
