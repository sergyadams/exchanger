'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CurrencyType, type Currency, type ExchangePair, type CreateOrderRequest } from '@exchanger/shared';
import { getCurrencies, getPairs, calculateExchange, createOrder } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';

const schema = z.object({
  fromCurrencyCode: z.string().min(1),
  toCurrencyCode: z.string().min(1),
  amountFrom: z.number().min(0.0001),
  destination: z.union([
    z.string().min(1),
    z.object({
      method: z.string().min(1),
      details: z.string().min(1),
    }),
  ]),
  email: z.string().email().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export function ExchangeForm() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [availablePairs, setAvailablePairs] = useState<ExchangePair[]>([]);
  const [rateInfo, setRateInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [payoutMethods, setPayoutMethods] = useState<string[]>([]);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await getCurrencies();
      setCurrencies(data.currencies);
    } catch (error) {
      addToast('Не удалось загрузить валюты', 'error');
    }
  };

  const getStoredFormData = () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('exchangeForm');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const storedData = getStoredFormData();
  const cryptoCurrencies = currencies.filter((c) => c.type === CurrencyType.CRYPTO);
  const fiatCurrencies = currencies.filter((c) => c.type === CurrencyType.FIAT);

  const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: storedData || {
      fromCurrencyCode: 'BTC',
      toCurrencyCode: 'USDT_TRC20',
      amountFrom: 0.1,
      destination: '',
      email: '',
    },
  });

  useEffect(() => {
    const subscription = watch((value) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('exchangeForm', JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const fromCurrencyCode = watch('fromCurrencyCode');
  const toCurrencyCode = watch('toCurrencyCode');
  const amountFrom = watch('amountFrom');

  const fromCurrency = currencies.find((c) => c.code === fromCurrencyCode);
  const toCurrency = currencies.find((c) => c.code === toCurrencyCode);

  useEffect(() => {
    if (fromCurrencyCode) {
      loadPairs(fromCurrencyCode);
    }
  }, [fromCurrencyCode]);

  useEffect(() => {
    if (toCurrency?.isManual && toCurrency.code) {
      const methods = getPayoutMethodsForCurrency(toCurrency.code);
      setPayoutMethods(methods);
      if (methods.length > 0 && !watch('destination.method')) {
        setValue('destination', { method: methods[0], details: '' });
      }
    }
  }, [toCurrency]);

  const loadPairs = async (from: string) => {
    try {
      const data = await getPairs(from);
      setAvailablePairs(data.pairs);
      if (data.pairs.length > 0 && !toCurrencyCode) {
        setValue('toCurrencyCode', data.pairs[0].toCurrencyCode);
      }
    } catch (error) {
      console.error('Failed to load pairs', error);
    }
  };

  const getPayoutMethodsForCurrency = (code: string): string[] => {
    if (code.startsWith('RUB_')) {
      const method = code.split('_')[1];
      return method ? [method] : ['Sber', 'Tinkoff', 'SBP', 'Cash'];
    }
    if (code.startsWith('USD_')) {
      const method = code.split('_')[1];
      return method ? [method] : ['Bank transfer', 'Cash'];
    }
    if (code.startsWith('EUR_')) {
      const method = code.split('_')[1];
      return method ? [method] : ['SEPA', 'Cash'];
    }
    return [];
  };

  useEffect(() => {
    if (amountFrom && fromCurrencyCode && toCurrencyCode && fromCurrencyCode !== toCurrencyCode && fromCurrency && toCurrency) {
      if (amountFrom < fromCurrency.minAmount || amountFrom > fromCurrency.maxAmount) {
        setRateInfo(null);
        return;
      }
      setRateLoading(true);
      calculateExchange(fromCurrencyCode, toCurrencyCode, amountFrom)
        .then(setRateInfo)
        .catch(() => {
          addToast('Не удалось загрузить курсы', 'error');
        })
        .finally(() => setRateLoading(false));
    }
  }, [amountFrom, fromCurrencyCode, toCurrencyCode, fromCurrency, toCurrency, addToast]);

  const isManual = toCurrency?.isManual || false;
  const availableToCurrencies = availablePairs.map((p) => 
    currencies.find((c) => c.code === p.toCurrencyCode)
  ).filter(Boolean) as Currency[];

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      let destination: string | { method: string; details: string };
      if (isManual) {
        const dest = data.destination as any;
        if (typeof dest === 'object' && dest.method && dest.details) {
          destination = { method: dest.method, details: dest.details };
        } else {
          destination = { method: payoutMethods[0] || 'Sber', details: '' };
        }
      } else {
        destination = (data.destination as string) || '';
      }

      const orderData: CreateOrderRequest = {
        fromCurrencyCode: data.fromCurrencyCode,
        toCurrencyCode: data.toCurrencyCode,
        amountFrom: data.amountFrom,
        destination,
        email: data.email || undefined,
      };

      const order = await createOrder(orderData);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('exchangeForm');
      }
      addToast('Заявка успешно создана', 'success');
      router.push(`/order/${order.orderId}`);
    } catch (error: any) {
      addToast(error.message || 'Не удалось создать заявку', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Создать заявку на обмен</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Отдаёте</label>
            <select {...register('fromCurrencyCode')} className="input">
              <optgroup label="Криптовалюты">
                {cryptoCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} {c.network && `(${c.network})`}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Фиат (ручной вывод)">
                {fiatCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Получаете</label>
            <select {...register('toCurrencyCode')} className="input" disabled={!fromCurrencyCode || availableToCurrencies.length === 0}>
              {availableToCurrencies.length === 0 ? (
                <option>Выберите валюту отправки</option>
              ) : (
                availableToCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} {c.network && `(${c.network})`} {c.isManual && '(ручной)'}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Сумма отправки
          </label>
          <input
            type="number"
            step="0.00000001"
            min={fromCurrency?.minAmount || 0}
            max={fromCurrency?.maxAmount || 1000000}
            {...register('amountFrom', { valueAsNumber: true })}
            className="input"
          />
          {fromCurrency && (
            <p className="text-xs text-gray-500 mt-1">
              Min: {fromCurrency.minAmount} {fromCurrency.code}, Max: {fromCurrency.maxAmount} {fromCurrency.code}
            </p>
          )}
          {errors.amountFrom && (
            <p className="text-red-500 text-sm mt-1">{errors.amountFrom.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Сумма получения (только чтение)
          </label>
          <input
            type="text"
            value={rateInfo?.amountTo?.toFixed(toCurrency?.precision || 8) || '0'}
            readOnly
            className="input bg-gray-50"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-t border-b">
          <span className="text-sm text-gray-600">Курс:</span>
          {rateLoading ? (
            <span className="text-sm text-gray-400">Загрузка...</span>
          ) : (
            <span className="text-sm font-medium">
              1 {fromCurrency?.code || ''} = {rateInfo?.rate?.toFixed(8) || '0'} {toCurrency?.code || ''}
              {isManual && ' (ручной вывод)'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">Комиссия сервиса:</span>
          <span className="text-sm font-medium">
            {rateInfo?.feePct || 0.7}% ({rateInfo?.feeAmount?.toFixed(8) || '0'} {fromCurrency?.code || ''})
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">Время обработки:</span>
          <span className="text-sm font-medium">5–15 мин</span>
        </div>

        {!isManual ? (
          <div>
            <label className="block text-sm font-medium mb-2">
              Адрес получения
            </label>
            <input
              type="text"
              {...register('destination')}
              placeholder={toCurrency?.network === 'ETH' || toCurrency?.network === 'BSC' ? '0x...' : toCurrency?.network === 'TRON' ? 'T...' : toCurrency?.network === 'TON' ? 'EQ...' : 'bc1q...'}
              className="input"
            />
            {errors.destination && (
              <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">
                Способ вывода
              </label>
              <select
                className="input"
                onChange={(e) => {
                  const currentDest = watch('destination') as any;
                  setValue('destination', {
                    method: e.target.value,
                    details: (currentDest?.details || '') as string,
                  });
                }}
              >
                {payoutMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Детали
              </label>
              <input
                type="text"
                className="input"
                placeholder="Номер счёта или детали"
                onChange={(e) => {
                  const currentDest = watch('destination') as any;
                  setValue('destination', {
                    method: (currentDest?.method || payoutMethods[0] || 'Sber') as string,
                    details: e.target.value,
                  });
                }}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Email (необязательно)
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="ваш@email.com"
            className="input"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading || !rateInfo || !fromCurrencyCode || !toCurrencyCode}
            className="btn-primary flex-1 touch-manipulation"
          >
            {loading ? 'Создание...' : 'Создать заявку'}
          </button>
          <a href="#how-it-works" className="btn-secondary text-center touch-manipulation">
            Как это работает
          </a>
        </div>
      </form>
    </div>
  );
}
