import React, { useEffect, useState } from 'react';
import { BlockchainNetwork, BlockchainWallet, PaymentMethod, Reward } from '../types';
import { CloseIcon, CoinsIcon } from './Icons';

interface MixedPaymentModalProps {
  reward: Reward;
  userKarma: number;
  userWallet?: BlockchainWallet;
  onClose: () => void;
  onConfirmPayment: (paymentDetails: PaymentDetails) => void;
}

export interface PaymentDetails {
  karmaPoints: number;
  blockchainAmount: number;
  blockchainCurrency: string;
  cashAmountNPR: number;
  paymentMethod: PaymentMethod;
  network?: BlockchainNetwork;
  walletAddress?: string;
}

const MixedPaymentModal: React.FC<MixedPaymentModalProps> = ({
  reward,
  userKarma,
  userWallet,
  onClose,
  onConfirmPayment,
}) => {
  const [karmaToUse, setKarmaToUse] = useState(0);
  const [useBlockchain, setUseBlockchain] = useState(false);
  const [useCash, setUseCash] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>('Polygon');
  const [walletAddress, setWalletAddress] = useState(userWallet?.address || '');

  // Exchange rates (mock - would be real-time in production)
  const NPR_TO_USD = 0.0075;
  const KARMA_TO_NPR = 10; // 1 karma = 10 NPR

  // Calculate remaining amount after karma
  const rewardTotalNPR = reward.priceNPR || reward.cost * KARMA_TO_NPR;
  const karmaValueNPR = karmaToUse * KARMA_TO_NPR;
  const remainingNPR = Math.max(0, rewardTotalNPR - karmaValueNPR);

  // Calculate splits
  const [blockchainPercentage, setBlockchainPercentage] = useState(50);
  const blockchainAmountNPR = useBlockchain ? (remainingNPR * blockchainPercentage) / 100 : 0;
  const cashAmountNPR = useCash ? remainingNPR - blockchainAmountNPR : 0;

  // Convert to USD for blockchain
  const blockchainAmountUSD = blockchainAmountNPR * NPR_TO_USD;

  useEffect(() => {
    // Auto-adjust if only one payment method for remaining
    if (useBlockchain && !useCash) {
      setBlockchainPercentage(100);
    } else if (!useBlockchain && useCash) {
      setBlockchainPercentage(0);
    }
  }, [useBlockchain, useCash]);

  const maxKarma = Math.min(userKarma, Math.floor(rewardTotalNPR / KARMA_TO_NPR));

  const handleConfirm = () => {
    let paymentMethod: PaymentMethod = 'karma_only';

    if (karmaToUse > 0 && useBlockchain && useCash) {
      paymentMethod = 'all_three';
    } else if (karmaToUse > 0 && useBlockchain) {
      paymentMethod = 'karma_blockchain';
    } else if (karmaToUse > 0 && useCash) {
      paymentMethod = 'karma_cash';
    } else if (useBlockchain && useCash) {
      paymentMethod = 'blockchain_cash';
    } else if (useBlockchain) {
      paymentMethod = 'blockchain_only';
    } else if (useCash) {
      paymentMethod = 'cash_only';
    }

    onConfirmPayment({
      karmaPoints: karmaToUse,
      blockchainAmount: blockchainAmountUSD,
      blockchainCurrency: getCurrency(selectedNetwork),
      cashAmountNPR,
      paymentMethod,
      network: useBlockchain ? selectedNetwork : undefined,
      walletAddress: useBlockchain ? walletAddress : undefined,
    });
  };

  const getCurrency = (network: BlockchainNetwork): string => {
    const currencies: Record<BlockchainNetwork, string> = {
      Ethereum: 'ETH',
      Polygon: 'MATIC',
      'Binance Smart Chain': 'BNB',
      Solana: 'SOL',
    };
    return currencies[network];
  };

  const canProceed =
    karmaValueNPR + blockchainAmountNPR + cashAmountNPR >= rewardTotalNPR &&
    (!useBlockchain || walletAddress.length > 0);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-brand-green to-green-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Mixed Payment Options</h2>
              <p className="text-sm opacity-90 mt-1">
                Combine Karma + Blockchain + Cash for maximum flexibility
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Reward Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={reward.imageUrl}
                alt={reward.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{reward.title}</h3>
                <p className="text-sm text-gray-600">{reward.partner}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold text-brand-green">
                    NPR {rewardTotalNPR.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">or {reward.cost} Karma Points</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Your Karma Balance</div>
              <div className="text-2xl font-bold text-green-700 flex items-center gap-2">
                <CoinsIcon className="w-6 h-6" />
                {userKarma.toLocaleString()}
              </div>
            </div>
            {userWallet?.isConnected && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Wallet Balance</div>
                <div className="text-2xl font-bold text-blue-700">
                  {userWallet.balance.toFixed(4)} {userWallet.currency}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono truncate">
                  {userWallet.address}
                </div>
              </div>
            )}
          </div>

          {/* Karma Slider */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <CoinsIcon className="w-5 h-5 text-green-600" />
                Use Karma Points
              </span>
              <span className="text-lg font-bold text-green-600">
                {karmaToUse} Karma (NPR {karmaValueNPR})
              </span>
            </label>
            <input
              type="range"
              min="0"
              max={maxKarma}
              value={karmaToUse}
              onChange={e => setKarmaToUse(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 Karma</span>
              <span>{maxKarma} Karma (Max)</span>
            </div>
          </div>

          {/* Remaining Amount */}
          {remainingNPR > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-gray-600 mb-1">Remaining Amount to Pay</div>
              <div className="text-2xl font-bold text-orange-700">
                NPR {remainingNPR.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Choose how to pay the remaining amount below
              </p>
            </div>
          )}

          {/* Payment Method Toggles */}
          {remainingNPR > 0 && (
            <div className="space-y-4">
              <div className="font-semibold text-gray-700">Select Payment Methods:</div>

              {/* Blockchain Toggle */}
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={useBlockchain}
                  onChange={e => setUseBlockchain(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-blue-700">⛓️ Blockchain Payment</div>
                  <div className="text-sm text-gray-600">
                    Pay with crypto wallet - secure & transparent
                  </div>
                </div>
              </label>

              {/* Cash Toggle */}
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={useCash}
                  onChange={e => setUseCash(e.target.checked)}
                  className="w-5 h-5 text-gray-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-700">💵 Cash Payment</div>
                  <div className="text-sm text-gray-600">Pay with cash on delivery/pickup</div>
                </div>
              </label>
            </div>
          )}

          {/* Blockchain Options */}
          {useBlockchain && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-900">Blockchain Configuration</div>

              {/* Network Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Network
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Ethereum', 'Polygon', 'Binance Smart Chain', 'Solana'] as const).map(
                    network => (
                      <button
                        key={network}
                        onClick={() => setSelectedNetwork(network)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          selectedNetwork === network
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {network}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                  placeholder="0x... or wallet address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* Split Slider (if both blockchain and cash) */}
              {useCash && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blockchain / Cash Split
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={blockchainPercentage}
                    onChange={e => setBlockchainPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0% Blockchain</span>
                    <span>
                      {blockchainPercentage}% / {100 - blockchainPercentage}%
                    </span>
                    <span>100% Blockchain</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="font-semibold text-gray-800 mb-3">Payment Breakdown</div>
            {karmaToUse > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <CoinsIcon className="w-4 h-4" /> Karma Points
                </span>
                <span className="font-semibold text-green-600">
                  {karmaToUse} points (NPR {karmaValueNPR})
                </span>
              </div>
            )}
            {blockchainAmountNPR > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">⛓️ Blockchain ({selectedNetwork})</span>
                <span className="font-semibold text-blue-600">
                  ${blockchainAmountUSD.toFixed(4)} {getCurrency(selectedNetwork)} (NPR{' '}
                  {blockchainAmountNPR.toFixed(0)})
                </span>
              </div>
            )}
            {cashAmountNPR > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">💵 Cash</span>
                <span className="font-semibold text-gray-700">NPR {cashAmountNPR.toFixed(0)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-xl text-brand-green">
                NPR {(karmaValueNPR + blockchainAmountNPR + cashAmountNPR).toFixed(0)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canProceed}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                canProceed
                  ? 'bg-brand-green text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm Payment
            </button>
          </div>

          {!canProceed && (
            <div className="text-sm text-red-600 text-center">
              {!walletAddress && useBlockchain
                ? 'Please enter your wallet address'
                : 'Payment amount must cover the full reward price'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MixedPaymentModal;
