'use client';

import { useEffect, useState } from 'react';
import { getRates } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

export default function RatesPage() {
  const addToast = useToastStore((state) => state.addToast);
  const [rates, setRates] = useState<any[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRates = async () => {
    try {
      const data = await getRates();
      setRates(data.rates);
      setUpdatedAt(data.updatedAt);
    } catch (error: any) {
      addToast(error.message || 'Не удалось загрузить курсы', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const now = Date.now();
    if (now - lastRefresh < 10000) {
      addToast('Подождите 10 секунд между обновлениями', 'error');
      return;
    }
    setRefreshing(true);
    setLastRefresh(now);
    await loadRates();
    setRefreshing(false);
    addToast('Курсы обновлены', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Курсы обмена</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-primary w-full sm:w-auto touch-manipulation"
        >
          {refreshing ? 'Обновление...' : 'Обновить'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка курсов...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пара</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Курс</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Источник</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Обновлено</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rates.map((rate, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-sm">
                        {rate.fromCurrencyName} → {rate.toCurrencyName}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 text-sm">
                        1 {rate.fromCurrencyCode} = {rate.rate.toFixed(8)} {rate.toCurrencyCode}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-500">{rate.rateSource}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(rate.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {rates.map((rate, idx) => (
              <div key={idx} className="card space-y-2">
                <div className="font-medium">
                  {rate.fromCurrencyName} → {rate.toCurrencyName}
                </div>
                <div className="text-sm text-gray-900">
                  1 {rate.fromCurrencyCode} = {rate.rate.toFixed(8)} {rate.toCurrencyCode}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Источник: {rate.rateSource}</span>
                  <span>{new Date(rate.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {updatedAt && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Последнее обновление: {new Date(updatedAt).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
