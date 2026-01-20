'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Что это за платформа?',
    answer: 'Это платформа для мгновенного обмена криптовалют. Вы можете обменивать BTC, USDT и другие валюты быстро и безопасно.',
  },
  {
    question: 'Как работают заявки?',
    answer: 'Вы создаёте заявку, получаете адрес для отправки средств, отправляете криптовалюту, и администратор подтверждает транзакцию.',
  },
  {
    question: 'Какие способы вывода доступны?',
    answer: 'Для криптовалютных пар доступен вывод на указанный вами адрес. Для RUB доступны различные способы вывода.',
  },
  {
    question: 'Какие комиссии?',
    answer: 'Комиссия сервиса составляет 0.7% от суммы транзакции. Она вычитается из суммы, которую вы отправляете, до конвертации.',
  },
  {
    question: 'Как долго действуют заявки?',
    answer: 'Заявки истекают через 20 минут, если не завершены. Вы можете создать новую заявку, если ваша истекла.',
  },
  {
    question: 'Как рассчитываются курсы?',
    answer: 'Курсы загружаются из API CoinGecko для пар BTC/USDT и обновляются каждые 30 секунд. Курсы RUB рассчитываются вручную.',
  },
  {
    question: 'Что происходит, если моя заявка истекает?',
    answer: 'Истекшие заявки не могут быть завершены. Вы можете создать новую заявку с текущими курсами.',
  },
  {
    question: 'Как связаться с поддержкой?',
    answer: 'Для вопросов и поддержки обращайтесь через официальные каналы связи платформы.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Часто задаваемые вопросы</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="card">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-left flex justify-between items-center"
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <span className="text-2xl">{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <p className="mt-4 text-gray-600">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
