export default function AMLKYCPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Политика AML / KYC</h1>
      <div className="card space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Требования KYC</h2>
          <p className="text-gray-700 mb-4">
            В соответствии с требованиями законодательства, пользователи могут быть обязаны пройти
            проверку Know Your Customer (KYC) перед обработкой транзакций. Это включает проверку личности,
            проверку адреса и документацию об источнике средств.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Соответствие AML</h2>
          <p className="text-gray-700 mb-4">
            Процедуры противодействия отмыванию денег (AML) включают мониторинг транзакций,
            отчётность о подозрительной активности и соответствие нормативным требованиям
            в применимых юрисдикциях.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Соблюдение требований</h2>
          <p className="text-gray-700">
            Платформа соблюдает все применимые требования KYC/AML и регулярно обновляет
            процедуры соответствия в соответствии с изменениями в законодательстве.
          </p>
        </section>
      </div>
    </div>
  );
}
