export function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-8 sm:mt-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Как это работает</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-4">1️⃣</div>
          <h3 className="font-semibold mb-2">Выберите пару</h3>
          <p className="text-sm text-gray-600">
            Выберите валюты для обмена
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">2️⃣</div>
          <h3 className="font-semibold mb-2">Создайте заявку</h3>
          <p className="text-sm text-gray-600">
            Заполните форму и создайте заявку на обмен
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">3️⃣</div>
          <h3 className="font-semibold mb-2">Отправьте крипту</h3>
          <p className="text-sm text-gray-600">
            Отправьте средства на указанный адрес
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">4️⃣</div>
          <h3 className="font-semibold mb-2">Админ подтверждает</h3>
          <p className="text-sm text-gray-600">
            Администратор вручную подтверждает транзакцию
          </p>
        </div>
      </div>
    </section>
  );
}
