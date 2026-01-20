'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-primary-600">
            Exchanger
          </Link>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex gap-4 lg:gap-6">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base">
              Обмен
            </Link>
            <Link href="/rates" className="text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base">
              Курсы
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base">
              FAQ
            </Link>
            <Link href="/terms" className="text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base">
              Условия
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base">
              Админка
            </Link>
            <Link href="/admin/wallets" className="text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base">
              Кошельки
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600"
            aria-label="Меню"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              Обмен
            </Link>
            <Link
              href="/rates"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              Курсы
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/terms"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              Условия
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              Админка
            </Link>
            <Link
              href="/admin/wallets"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              Кошельки
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
