'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminWallets, createWallet, updateWallet, deleteWallet, type PayInWallet } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import Link from 'next/link';

export default function AdminWalletsPage() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [wallets, setWallets] = useState<PayInWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<PayInWallet | null>(null);
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [formData, setFormData] = useState({
    currencyCode: '',
    network: '',
    address: '',
    label: '',
    priority: 100,
    isActive: true,
  });

  useEffect(() => {
    loadWallets();
  }, [currencyFilter, networkFilter, statusFilter]);

  const loadWallets = async () => {
    setLoading(true);
    try {
      const data = await getAdminWallets({
        currencyCode: currencyFilter || undefined,
        network: networkFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true',
      });
      setWallets(data.wallets);
    } catch (error: any) {
      addToast(error.message || 'Не удалось загрузить кошельки', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWallet) {
        await updateWallet(editingWallet.id, {
          label: formData.label,
          priority: formData.priority,
          isActive: formData.isActive,
        });
        addToast('Кошелёк обновлён', 'success');
      } else {
        await createWallet(formData);
        addToast('Кошелёк добавлен', 'success');
      }
      setShowForm(false);
      setEditingWallet(null);
      setFormData({
        currencyCode: '',
        network: '',
        address: '',
        label: '',
        priority: 100,
        isActive: true,
      });
      loadWallets();
    } catch (error: any) {
      addToast(error.message || 'Ошибка при сохранении', 'error');
    }
  };

  const handleEdit = (wallet: PayInWallet) => {
    setEditingWallet(wallet);
    setFormData({
      currencyCode: wallet.currencyCode,
      network: wallet.network,
      address: wallet.address,
      label: wallet.label || '',
      priority: wallet.priority,
      isActive: wallet.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (wallet: PayInWallet) => {
    if (!confirm('Вы уверены, что хотите отключить этот кошелёк?\nОн больше не будет использоваться для новых заявок.')) {
      return;
    }
    try {
      await deleteWallet(wallet.id);
      addToast('Кошелёк отключён', 'success');
      loadWallets();
    } catch (error: any) {
      addToast(error.message || 'Ошибка при отключении', 'error');
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    addToast('Адрес скопирован', 'success');
  };

  const shortenAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworksForCurrency = (currency: string) => {
    if (currency === 'BTC') return ['BTC'];
    if (currency === 'ETH') return ['ETH'];
    if (currency === 'USDT') return ['TRON', 'ETH'];
    if (currency === 'USDC') return ['ETH'];
    if (currency === 'TON') return ['TON'];
    return [];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-primary-600 hover:underline">
          ← Назад к заявкам
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Кошельки приёма</h1>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-semibold text-yellow-900">
          ⚠️ DEMO-режим. Используются только тестовые адреса. Не используйте реальные кошельки.
        </p>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Валюта</label>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="input"
            >
              <option value="">Все</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="TON">TON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Сеть</label>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="input"
            >
              <option value="">Все</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="TRON">TRON</option>
              <option value="TON">TON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Все</option>
              <option value="true">Активен</option>
              <option value="false">Отключён</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingWallet(null);
            setFormData({
              currencyCode: '',
              network: '',
              address: '',
              label: '',
              priority: 100,
              isActive: true,
            });
          }}
          className="btn-primary"
        >
          ➕ Добавить кошелёк
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingWallet ? 'Редактирование кошелька' : 'Добавление кошелька приёма'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Валюта *</label>
                <select
                  required
                  value={formData.currencyCode}
                  onChange={(e) => {
                    setFormData({ ...formData, currencyCode: e.target.value, network: '' });
                  }}
                  className="input"
                  disabled={!!editingWallet}
                >
                  <option value="">Выберите валюту</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="TON">TON</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Сеть *</label>
                <select
                  required
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="input"
                  disabled={!!editingWallet}
                >
                  <option value="">Выберите сеть</option>
                  {getNetworksForCurrency(formData.currencyCode).map((net) => (
                    <option key={net} value={net}>
                      {net}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {!editingWallet && (
              <div>
                <label className="block text-sm font-medium mb-2">Адрес кошелька *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Введите адрес (только DEMO / testnet)"
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Используйте только тестовые адреса. Реальные переводы запрещены.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Комментарий</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Например: Demo hot wallet #1"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Приоритет</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 100 })}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Меньше значение — выше приоритет при выборе адреса.
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm">
                Использовать этот кошелёк для приёма
              </label>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                💾 Сохранить
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingWallet(null);
                }}
                className="btn-secondary"
              >
                ↩️ Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Валюта</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сеть</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Адрес</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Комментарий</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Приоритет</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Использований</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Последнее использование</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wallets.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap font-medium text-sm">{wallet.currencyCode}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="badge bg-blue-100 text-blue-800 text-xs">{wallet.network}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs" title={wallet.address}>
                          {shortenAddress(wallet.address)}
                        </span>
                        <button
                          onClick={() => handleCopyAddress(wallet.address)}
                          className="text-primary-600 hover:underline text-xs"
                        >
                          Копировать
                        </button>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                      {wallet.label || '-'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">{wallet.priority}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">{wallet.usageCount}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {wallet.lastUsedAt ? new Date(wallet.lastUsedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs`}>
                        {wallet.isActive ? 'Активен' : 'Отключён'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(wallet)}
                          className="text-primary-600 hover:underline text-xs"
                        >
                          ✏️ Редактировать
                        </button>
                        {wallet.isActive && (
                          <button
                            onClick={() => handleDelete(wallet)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            ⛔ Отключить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-4">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{wallet.currencyCode}</div>
                    <span className="badge bg-blue-100 text-blue-800 text-xs">{wallet.network}</span>
                  </div>
                  <span className={`badge ${wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs`}>
                    {wallet.isActive ? 'Активен' : 'Отключён'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs break-all" title={wallet.address}>
                      {shortenAddress(wallet.address)}
                    </span>
                    <button
                      onClick={() => handleCopyAddress(wallet.address)}
                      className="text-primary-600 hover:underline text-xs"
                    >
                      Копировать
                    </button>
                  </div>
                  {wallet.label && (
                    <div className="text-xs text-gray-600">{wallet.label}</div>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Приоритет: {wallet.priority}</span>
                    <span>Использований: {wallet.usageCount}</span>
                  </div>
                  {wallet.lastUsedAt && (
                    <div className="text-xs text-gray-500">
                      Последнее: {new Date(wallet.lastUsedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="flex-1 text-primary-600 hover:underline text-sm text-center py-2 border border-primary-600 rounded"
                  >
                    ✏️ Редактировать
                  </button>
                  {wallet.isActive && (
                    <button
                      onClick={() => handleDelete(wallet)}
                      className="flex-1 text-red-600 hover:underline text-sm text-center py-2 border border-red-600 rounded"
                    >
                      ⛔ Отключить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {wallets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Кошельки не найдены
            </div>
          )}
        </>
      )}
    </div>
  );
}
