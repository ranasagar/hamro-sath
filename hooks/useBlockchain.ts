import { useCallback, useState } from 'react';
import { api } from '../services/api';
import {
  BlockchainNetwork,
  BlockchainTransaction,
  BlockchainWallet,
  MixedPaymentBreakdown,
  PaymentMethod,
} from '../types';

export interface BlockchainPaymentRequest {
  rewardId: number;
  karmaPoints: number;
  blockchainAmount: number;
  blockchainCurrency: string;
  cashAmountNPR: number;
  paymentMethod: PaymentMethod;
  network?: BlockchainNetwork;
  walletAddress?: string;
  deliveryAddress?: string;
  contactPhone?: string;
}

export const useBlockchain = () => {
  const [wallet, setWallet] = useState<BlockchainWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet (simulated - would use Web3 in production)
  const connectWallet = useCallback(
    async (network: BlockchainNetwork = 'Polygon'): Promise<boolean> => {
      setIsConnecting(true);
      setError(null);

      try {
        // Simulate wallet connection
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate mock wallet address
        const mockAddress = `0x${Math.random().toString(16).substring(2, 42)}`;

        // Get mock balance based on network
        const balances: Record<BlockchainNetwork, { balance: number; currency: string }> = {
          Ethereum: { balance: 0.5, currency: 'ETH' },
          Polygon: { balance: 100, currency: 'MATIC' },
          'Binance Smart Chain': { balance: 2.5, currency: 'BNB' },
          Solana: { balance: 10, currency: 'SOL' },
        };

        const { balance, currency } = balances[network];

        const connectedWallet: BlockchainWallet = {
          address: mockAddress,
          network,
          balance,
          currency,
          isConnected: true,
          lastSync: Date.now(),
        };

        setWallet(connectedWallet);

        // Store in localStorage for persistence
        localStorage.setItem('blockchain_wallet', JSON.stringify(connectedWallet));

        console.log('Wallet connected:', connectedWallet);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
        setError(errorMessage);
        console.error('Wallet connection error:', err);
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWallet(null);
    localStorage.removeItem('blockchain_wallet');
    console.log('Wallet disconnected');
  }, []);

  // Process blockchain payment
  const processBlockchainPayment = useCallback(
    async (
      request: BlockchainPaymentRequest
    ): Promise<{
      success: boolean;
      transaction?: BlockchainTransaction;
      breakdown?: MixedPaymentBreakdown;
      redemptionId?: number;
    }> => {
      setError(null);

      try {
        // Simulate blockchain transaction
        const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        const blockNumber = Math.floor(Math.random() * 1000000) + 15000000;

        const blockchainTx: BlockchainTransaction = {
          id: `tx-${Date.now()}`,
          transactionHash: txHash,
          network: request.network || 'Polygon',
          from: wallet?.address || 'unknown',
          to: '0xRewardPartnerAddress', // Would be actual partner wallet
          amount: request.blockchainAmount,
          currency: request.blockchainCurrency,
          gasUsed: 21000,
          gasFee: 0.0001,
          blockNumber,
          timestamp: Date.now(),
          status: 'confirmed',
        };

        // Calculate NPR values for breakdown
        const NPR_TO_USD = 0.0075;
        const KARMA_TO_NPR = 10;

        const paymentBreakdown: MixedPaymentBreakdown = {
          karmaPoints: request.karmaPoints,
          blockchainAmount: request.blockchainAmount,
          blockchainCurrency: request.blockchainCurrency,
          cashAmountNPR: request.cashAmountNPR,
          totalValueNPR:
            request.karmaPoints * KARMA_TO_NPR +
            request.blockchainAmount / NPR_TO_USD +
            request.cashAmountNPR,
          blockchainTransaction: blockchainTx,
        };

        // Record transaction in backend
        try {
          const response = await api.post('/api/v1/rewards/redeem', {
            reward_id: request.rewardId,
            delivery_address: request.deliveryAddress,
            contact_phone: request.contactPhone,
            payment_method: request.paymentMethod,
            karma_used: request.karmaPoints,
            blockchain_amount: request.blockchainAmount,
            blockchain_currency: request.blockchainCurrency,
            blockchain_network: request.network,
            blockchain_tx_hash: txHash,
            wallet_address: request.walletAddress,
            cash_amount_npr: request.cashAmountNPR,
            total_value_npr: paymentBreakdown.totalValueNPR,
          });

          return {
            success: true,
            transaction: blockchainTx,
            breakdown: paymentBreakdown,
            redemptionId: response.data?.data?.id,
          };
        } catch (apiError) {
          console.error('API error, using fallback:', apiError);
          // Fallback for demo - still return success
          return {
            success: true,
            transaction: blockchainTx,
            breakdown: paymentBreakdown,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to process blockchain payment';
        setError(errorMessage);
        console.error('Blockchain payment error:', err);
        return { success: false };
      }
    },
    [wallet]
  );

  // Get transaction history
  const getTransactionHistory = useCallback(async (): Promise<BlockchainTransaction[]> => {
    try {
      const response = await api.get('/api/v1/blockchain/transactions');
      return response.data?.data || [];
    } catch (err) {
      console.error('Failed to fetch transaction history:', err);
      return [];
    }
  }, []);

  // Get estimated gas fee
  const estimateGasFee = useCallback(
    async (network: BlockchainNetwork, amount: number): Promise<number> => {
      // Mock gas estimation - would use actual blockchain in production
      const gasEstimates: Record<BlockchainNetwork, number> = {
        Ethereum: 0.002,
        Polygon: 0.0001,
        'Binance Smart Chain': 0.0003,
        Solana: 0.00001,
      };

      return gasEstimates[network] || 0.001;
    },
    []
  );

  // Restore wallet from localStorage on mount
  const restoreWallet = useCallback(() => {
    const stored = localStorage.getItem('blockchain_wallet');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWallet(parsed);
        console.log('Wallet restored from storage:', parsed);
      } catch (err) {
        console.error('Failed to restore wallet:', err);
        localStorage.removeItem('blockchain_wallet');
      }
    }
  }, []);

  return {
    wallet,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    processBlockchainPayment,
    getTransactionHistory,
    estimateGasFee,
    restoreWallet,
  };
};
