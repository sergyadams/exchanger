export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>
      <div className="card space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Сбор данных</h2>
          <p className="text-gray-700 mb-4">
            Платформа собирает и хранит данные, необходимые для обработки заявок на обмен.
            Вводимая информация используется исключительно для предоставления услуг.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Использование данных</h2>
          <p className="text-gray-700 mb-4">
            Данные используются для обработки транзакций и связи с пользователями.
            Данные не передаются третьим лицам без согласия пользователя.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Безопасность</h2>
          <p className="text-gray-700">
            Платформа применяет современные меры безопасности для защиты данных пользователей.
            Все транзакции обрабатываются с соблюдением стандартов безопасности.
          </p>
        </section>
      </div>
    </div>
  );
}
