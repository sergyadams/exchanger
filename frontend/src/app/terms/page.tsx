export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Условия использования</h1>
      <div className="card space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Общие положения</h2>
          <p className="text-gray-700 mb-4">
            Используя данную платформу, вы соглашаетесь с условиями использования.
            Платформа предоставляет услуги по обмену криптовалют.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Процесс обмена</h2>
          <p className="text-gray-700 mb-4">
            Все заявки обрабатываются в соответствии с указанными параметрами.
            Подтверждения и выплаты выполняются в установленные сроки.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. Ответственность</h2>
          <p className="text-gray-700 mb-4">
            Пользователь несёт ответственность за корректность указанных данных.
            Платформа не несёт ответственности за ошибки, допущенные пользователем при указании адресов.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. Данные и конфиденциальность</h2>
          <p className="text-gray-700 mb-4">
            Данные, введённые на платформе, обрабатываются в соответствии с политикой конфиденциальности.
            Подробнее см. в Политике конфиденциальности.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Контакты</h2>
          <p className="text-gray-700">
            По вопросам обращайтесь в службу поддержки платформы.
          </p>
        </section>
      </div>
    </div>
  );
}
