'use client';

import { useEffect, useState } from 'react';
import { getCurrencies } from '@/lib/api';
import { CurrencyType, type Currency } from '@exchanger/shared';

export function ReservesCard() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    getCurrencies()
      .then((data) => {
        setCurrencies(data.currencies);
        setLastUpdate(new Date().toLocaleString());
      })
      .catch(() => {});
  }, []);

  const cryptoCurrencies = currencies.filter((c) => c.type === CurrencyType.CRYPTO).slice(0, 5);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Резервы</h3>
      <div className="space-y-2 text-sm">
        {cryptoCurrencies.map((currency) => (
          <div key={currency.code} className="flex justify-between">
            <span className="text-gray-600">{currency.code}:</span>
            <span className="font-medium">Доступно</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span className="text-gray-600">Фиат:</span>
          <span className="font-medium">Доступно</span>
        </div>
      </div>
      {lastUpdate && (
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          Последнее обновление курсов: {lastUpdate}
        </div>
      )}
    </div>
  );
}
