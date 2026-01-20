import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Страница не найдена</h1>
      <p className="text-gray-600 mb-8">Страница, которую вы ищете, не существует.</p>
      <Link href="/" className="btn-primary">
        На главную
      </Link>
    </div>
  );
}
