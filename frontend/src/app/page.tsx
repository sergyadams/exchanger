'use client';

import { ExchangeForm } from '@/components/ExchangeForm';
import { ReservesCard } from '@/components/ReservesCard';
import { HowItWorks } from '@/components/HowItWorks';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
          Мгновенный Криптообменник
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Быстрый и безопасный обмен криптовалют
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        <div className="lg:col-span-2">
          <ExchangeForm />
        </div>
        <div className="lg:col-span-1">
          <ReservesCard />
        </div>
      </div>

      <HowItWorks />
    </div>
  );
}
