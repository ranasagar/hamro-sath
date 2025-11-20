import React, { useMemo, useState } from 'react';
import { AdminPurchaseReceipt, BlockchainNetwork, PaymentMethod } from '../types';
import { CoinsIcon, DownloadIcon, SearchIcon } from './Icons';

interface BlockchainTransactionsProps {
  purchases: AdminPurchaseReceipt[];
}

const BlockchainTransactions: React.FC<BlockchainTransactionsProps> = ({ purchases }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [filterNetwork, setFilterNetwork] = useState<BlockchainNetwork | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'karma'>('date');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTransactions = purchases.length;
    const totalKarmaUsed = purchases.reduce((sum, p) => sum + (p.pointsUsed || 0), 0);
    const totalCashNPR = purchases.reduce((sum, p) => sum + (p.amountPaidNPR || 0), 0);
    const totalBlockchainValue = purchases.reduce((sum, p) => {
      return sum + (p.paymentBreakdown?.blockchainAmount || 0);
    }, 0);

    const blockchainTransactions = purchases.filter(p =>
      p.paymentMethod?.includes('blockchain')
    ).length;
    const mixedPayments = purchases.filter(
      p =>
        p.paymentMethod &&
        (p.paymentMethod.includes('karma_blockchain') ||
          p.paymentMethod.includes('karma_cash') ||
          p.paymentMethod.includes('all_three'))
    ).length;

    return {
      totalTransactions,
      totalKarmaUsed,
      totalCashNPR,
      totalBlockchainValue,
      blockchainTransactions,
      mixedPayments,
    };
  }, [purchases]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    const filtered = purchases.filter(purchase => {
      const matchesSearch =
        searchTerm === '' ||
        purchase.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.rewardTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPaymentMethod =
        filterPaymentMethod === 'all' || purchase.paymentMethod === filterPaymentMethod;

      const matchesNetwork =
        filterNetwork === 'all' ||
        purchase.paymentBreakdown?.blockchainTransaction?.network === filterNetwork;

      const matchesStatus = filterStatus === 'all' || purchase.status === filterStatus;

      return matchesSearch && matchesPaymentMethod && matchesNetwork && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.timestamp - a.timestamp;
        case 'amount':
          return (
            (b.paymentBreakdown?.totalValueNPR || b.amountPaidNPR) -
            (a.paymentBreakdown?.totalValueNPR || a.amountPaidNPR)
          );
        case 'karma':
          return b.pointsUsed - a.pointsUsed;
        default:
          return 0;
      }
    });

    return filtered;
  }, [purchases, searchTerm, filterPaymentMethod, filterNetwork, filterStatus, sortBy]);

  const exportToCSV = () => {
    const headers = [
      'Date',
      'User',
      'Reward',
      'Payment Method',
      'Karma Points',
      'Blockchain Amount',
      'Cash NPR',
      'Total Value NPR',
      'Wallet Address',
      'Tx Hash',
      'Network',
      'Status',
    ];

    const rows = filteredTransactions.map(tx => [
      new Date(tx.timestamp).toLocaleString(),
      tx.userName,
      tx.rewardTitle,
      tx.paymentMethod || 'karma_only',
      tx.pointsUsed || 0,
      tx.paymentBreakdown?.blockchainAmount || 0,
      tx.amountPaidNPR || 0,
      tx.paymentBreakdown?.totalValueNPR || tx.amountPaidNPR || 0,
      tx.walletAddress || 'N/A',
      tx.paymentBreakdown?.blockchainTransaction?.transactionHash || 'N/A',
      tx.paymentBreakdown?.blockchainTransaction?.network || 'N/A',
      tx.status,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockchain_transactions_${new Date().toISOString()}.csv`;
    a.click();
  };

  const getPaymentMethodBadge = (method?: PaymentMethod) => {
    const badges = {
      karma_only: { bg: 'bg-green-100', text: 'text-green-800', label: '🪙 Karma Only' },
      blockchain_only: { bg: 'bg-blue-100', text: 'text-blue-800', label: '⛓️ Blockchain' },
      cash_only: { bg: 'bg-gray-100', text: 'text-gray-800', label: '💵 Cash Only' },
      karma_blockchain: { bg: 'bg-purple-100', text: 'text-purple-800', label: '🪙⛓️ Mixed' },
      karma_cash: { bg: 'bg-orange-100', text: 'text-orange-800', label: '🪙💵 Mixed' },
      blockchain_cash: { bg: 'bg-teal-100', text: 'text-teal-800', label: '⛓️💵 Mixed' },
      all_three: { bg: 'bg-pink-100', text: 'text-pink-800', label: '🪙⛓️💵 All' },
    };

    const badge = badges[method || 'karma_only'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          <div className="text-sm opacity-90">Total Transactions</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-2xl font-bold">{stats.totalKarmaUsed.toLocaleString()}</div>
          <div className="text-sm opacity-90">Karma Used</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-2xl font-bold">NPR {stats.totalCashNPR.toLocaleString()}</div>
          <div className="text-sm opacity-90">Cash Collected</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-2xl font-bold">${stats.totalBlockchainValue.toFixed(2)}</div>
          <div className="text-sm opacity-90">Blockchain Value</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-2xl font-bold">{stats.blockchainTransactions}</div>
          <div className="text-sm opacity-90">Blockchain Txs</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-2xl font-bold">{stats.mixedPayments}</div>
          <div className="text-sm opacity-90">Mixed Payments</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search user, reward, wallet..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green"
            />
          </div>

          {/* Payment Method Filter */}
          <select
            value={filterPaymentMethod}
            onChange={e => setFilterPaymentMethod(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green"
          >
            <option value="all">All Payment Methods</option>
            <option value="karma_only">Karma Only</option>
            <option value="blockchain_only">Blockchain Only</option>
            <option value="cash_only">Cash Only</option>
            <option value="karma_blockchain">Karma + Blockchain</option>
            <option value="karma_cash">Karma + Cash</option>
            <option value="blockchain_cash">Blockchain + Cash</option>
            <option value="all_three">All Three</option>
          </select>

          {/* Network Filter */}
          <select
            value={filterNetwork}
            onChange={e => setFilterNetwork(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green"
          >
            <option value="all">All Networks</option>
            <option value="Ethereum">Ethereum</option>
            <option value="Polygon">Polygon</option>
            <option value="Binance Smart Chain">BSC</option>
            <option value="Solana">Solana</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="karma">Sort by Karma</option>
          </select>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {purchases.length} transactions
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DownloadIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Blockchain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(tx.timestamp).toLocaleDateString()}
                    <br />
                    <span className="text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={tx.userAvatar}
                        alt={tx.userName}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div className="text-sm font-medium text-gray-900">{tx.userName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{tx.rewardTitle}</div>
                    <div className="text-xs text-gray-500">{tx.rewardPartner}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentMethodBadge(tx.paymentMethod)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {tx.pointsUsed > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CoinsIcon className="w-4 h-4" />
                        {tx.pointsUsed} Karma
                      </div>
                    )}
                    {tx.paymentBreakdown?.blockchainAmount && (
                      <div className="text-blue-600">
                        ⛓️ ${tx.paymentBreakdown.blockchainAmount.toFixed(4)}{' '}
                        {tx.paymentBreakdown.blockchainCurrency}
                      </div>
                    )}
                    {tx.amountPaidNPR > 0 && (
                      <div className="text-gray-600">💵 NPR {tx.amountPaidNPR}</div>
                    )}
                    {tx.paymentBreakdown && (
                      <div className="text-xs font-semibold text-gray-800 mt-1">
                        Total: NPR {tx.paymentBreakdown.totalValueNPR.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {tx.paymentBreakdown?.blockchainTransaction ? (
                      <div className="space-y-1">
                        <div className="font-mono text-xs text-blue-600 truncate max-w-[200px]">
                          {tx.paymentBreakdown.blockchainTransaction.transactionHash}
                        </div>
                        <div className="text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {tx.paymentBreakdown.blockchainTransaction.network}
                          </span>
                        </div>
                        {tx.walletAddress && (
                          <div className="font-mono text-xs text-gray-500 truncate max-w-[200px]">
                            {tx.walletAddress}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No blockchain tx</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainTransactions;
