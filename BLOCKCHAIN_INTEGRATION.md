# Blockchain Integration & Mixed Payment System

## Overview

Hamro Saath now features a comprehensive blockchain payment system that allows users to combine **Karma Points**, **Blockchain/Cryptocurrency**, and **Cash** in flexible payment combinations for reward redemptions.

## 🎯 Key Features

### 1. **Mixed Payment Options**
Users can pay for rewards using any combination of:
- 🪙 **Karma Points Only**
- ⛓️ **Blockchain/Crypto Only**
- 💵 **Cash Only**
- 🪙⛓️ **Karma + Blockchain**
- 🪙💵 **Karma + Cash**
- ⛓️💵 **Blockchain + Cash**
- 🪙⛓️💵 **All Three Combined**

### 2. **Supported Blockchain Networks**
- **Ethereum** (ETH)
- **Polygon** (MATIC) - Low gas fees
- **Binance Smart Chain** (BNB)
- **Solana** (SOL)

### 3. **Comprehensive Transaction Tracking**
Admin panel includes detailed transaction logs with:
- Payment method breakdowns
- Blockchain transaction hashes
- Wallet addresses
- Network information
- Real-time status updates
- CSV export functionality

## 📂 File Structure

### New Components
```
components/
├── BlockchainTransactions.tsx    # Admin transaction viewer with filters & export
├── MixedPaymentModal.tsx          # User-facing payment selection modal
```

### New Hooks
```
hooks/
├── useBlockchain.ts               # Blockchain wallet connection & payment processing
```

### Updated Files
```
types.ts                           # Added blockchain wallet & transaction types
pages/AdminPage.tsx                # Integrated blockchain transactions tab
pages/ProfilePage.tsx              # Added wallet management tab
pages/RewardsPage.tsx              # Will integrate MixedPaymentModal
```

## 🔧 Implementation Details

### Type Definitions (`types.ts`)

#### BlockchainWallet
```typescript
interface BlockchainWallet {
  address: string;
  network: BlockchainNetwork;
  balance: number;
  currency: string;
  isConnected: boolean;
  lastSync?: number;
}
```

#### BlockchainTransaction
```typescript
interface BlockchainTransaction {
  id: string;
  transactionHash: string;
  network: BlockchainNetwork;
  from: string;
  to: string;
  amount: number;
  currency: string;
  gasUsed?: number;
  gasFee?: number;
  blockNumber?: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}
```

#### MixedPaymentBreakdown
```typescript
interface MixedPaymentBreakdown {
  karmaPoints: number;
  blockchainAmount: number;
  blockchainCurrency: string;
  cashAmountNPR: number;
  totalValueNPR: number;
  blockchainTransaction?: BlockchainTransaction;
}
```

#### PaymentMethod
```typescript
type PaymentMethod = 
  | 'karma_only' 
  | 'blockchain_only' 
  | 'cash_only' 
  | 'karma_blockchain' 
  | 'karma_cash' 
  | 'blockchain_cash' 
  | 'all_three';
```

## 🎨 Component Usage

### 1. MixedPaymentModal

Allows users to select payment combinations:

```tsx
import MixedPaymentModal, { PaymentDetails } from '../components/MixedPaymentModal';

const handlePayment = (details: PaymentDetails) => {
  console.log('Payment details:', details);
  // Process payment with backend
};

<MixedPaymentModal
  reward={selectedReward}
  userKarma={userKarmaPoints}
  userWallet={connectedWallet}
  onClose={() => setShowModal(false)}
  onConfirmPayment={handlePayment}
/>
```

**Features:**
- Karma slider (0 to user's max karma)
- Blockchain/Cash toggle switches
- Network selection (ETH, MATIC, BNB, SOL)
- Wallet address input
- Payment split slider for blockchain/cash ratio
- Real-time payment breakdown
- Exchange rate calculations

### 2. BlockchainTransactions (Admin)

Comprehensive transaction viewer for admin panel:

```tsx
import BlockchainTransactions from '../components/BlockchainTransactions';

<BlockchainTransactions purchases={allPurchases} />
```

**Features:**
- **Statistics Dashboard:** Total transactions, karma used, cash collected, blockchain value
- **Advanced Filters:**
  - Search by user, reward, or wallet address
  - Filter by payment method
  - Filter by blockchain network
  - Filter by status (pending/confirmed)
  - Sort by date, amount, or karma
- **Detailed Table View:**
  - User info with avatar
  - Reward details
  - Payment method badges
  - Payment breakdown (karma/blockchain/cash)
  - Blockchain transaction details
  - Status indicators
- **CSV Export:** Download filtered transactions

### 3. Wallet Tab (ProfilePage)

User wallet management interface:

**Currently Shows:**
- "Coming Soon" message for wallet connection
- Supported networks showcase
- Benefits of blockchain payments
- How it works guide
- Early access notification signup

**Future Implementation:**
- Live wallet connection
- Real balance display
- Transaction history
- Network switching
- QR code for payments

## 🔌 Blockchain Hook (`useBlockchain`)

### Methods

#### `connectWallet(network)`
```typescript
const { connectWallet } = useBlockchain();
await connectWallet('Polygon');
```

#### `processBlockchainPayment(request)`
```typescript
const { processBlockchainPayment } = useBlockchain();

const result = await processBlockchainPayment({
  rewardId: 123,
  karmaPoints: 50,
  blockchainAmount: 0.01,
  blockchainCurrency: 'MATIC',
  cashAmountNPR: 500,
  paymentMethod: 'all_three',
  network: 'Polygon',
  walletAddress: '0x...',
  deliveryAddress: 'Kathmandu, Nepal',
  contactPhone: '+977-9841234567'
});

if (result.success) {
  console.log('Transaction hash:', result.transaction.transactionHash);
  console.log('Redemption ID:', result.redemptionId);
}
```

#### `getTransactionHistory()`
```typescript
const { getTransactionHistory } = useBlockchain();
const history = await getTransactionHistory();
```

## 📊 Admin Dashboard

### Transaction Statistics
- **Total Transactions:** Count of all redemptions
- **Total Karma Used:** Sum of all karma points spent
- **Cash Collected:** Total NPR from cash payments
- **Blockchain Value:** Total USD from crypto payments
- **Blockchain Txs:** Count of transactions with blockchain
- **Mixed Payments:** Count of multi-method payments

### Filters
1. **Search:** User name, reward title, wallet address
2. **Payment Method:** All, karma only, blockchain only, mixed, etc.
3. **Network:** All, Ethereum, Polygon, BSC, Solana
4. **Status:** All, pending, confirmed
5. **Sort By:** Date, amount, karma

### Export
CSV export includes:
- Date & time
- User name
- Reward title
- Payment method
- Karma points used
- Blockchain amount & currency
- Cash amount NPR
- Total value NPR
- Wallet address
- Transaction hash
- Network
- Status

## 💰 Payment Calculations

### Exchange Rates (Configurable)
```typescript
const NPR_TO_USD = 0.0075;  // 1 NPR = $0.0075 USD
const KARMA_TO_NPR = 10;     // 1 Karma = 10 NPR
```

### Example Payment Breakdown

**Reward Cost:** NPR 1,000

**User Selects:**
- 50 Karma Points → NPR 500
- $5 MATIC → NPR 333 (at exchange rate)
- Cash → NPR 167

**Total:** NPR 1,000 ✓

## 🔐 Security Features

### Current (Demo Mode)
- Mock wallet addresses generated
- Simulated transaction hashes
- Local storage for wallet persistence
- Frontend validation of payment amounts

### Production Requirements
- **Web3 Integration:** MetaMask, WalletConnect, Coinbase Wallet
- **Smart Contracts:** Secure payment processing on-chain
- **Backend Verification:** Validate transactions via blockchain explorers
- **Escrow System:** Hold funds until delivery confirmation
- **KYC/AML:** Compliance for high-value transactions
- **Multi-sig:** Partner wallets for added security

## 🚀 Roadmap

### Phase 1: Current (Demo)
- ✅ Type definitions
- ✅ UI components
- ✅ Admin transaction viewer
- ✅ Mock wallet connection
- ✅ Payment flow simulation

### Phase 2: Backend Integration
- 🔲 API endpoints for blockchain transactions
- 🔲 Database schema for mixed payments
- 🔲 Transaction verification system
- 🔲 Webhook handlers for blockchain events

### Phase 3: Web3 Integration
- 🔲 MetaMask connection
- 🔲 WalletConnect support
- 🔲 Smart contract deployment
- 🔲 Real blockchain transactions
- 🔲 Gas optimization

### Phase 4: Advanced Features
- 🔲 Multi-currency support
- 🔲 Stablecoin payments (USDT, USDC)
- 🔲 NFT rewards
- 🔲 Loyalty token system
- 🔲 Automated market making

## 📱 User Flow

### Redeeming a Reward with Mixed Payment

1. **Browse Rewards**
   - User navigates to Rewards Marketplace
   - Sees reward with price and karma cost

2. **Select Reward**
   - Clicks on reward card
   - Views detailed information

3. **Choose Payment**
   - Opens MixedPaymentModal
   - Sees current karma balance and wallet balance
   - Adjusts karma slider
   - Toggles blockchain/cash options
   - Configures network and wallet

4. **Review Breakdown**
   - Views real-time calculation
   - Sees exact amounts for each method
   - Confirms total matches reward cost

5. **Confirm Payment**
   - Submits payment request
   - Backend processes transaction
   - Blockchain tx recorded (if applicable)
   - Karma deducted from balance

6. **Receive Confirmation**
   - Transaction receipt displayed
   - QR code for pickup/delivery
   - Email/SMS notification sent
   - Admin sees transaction in dashboard

## 🧪 Testing

### Test Scenarios

1. **Karma Only Payment**
   - User has sufficient karma
   - Full amount paid with karma
   - No blockchain/cash involved

2. **Blockchain Only Payment**
   - User has 0 karma
   - Full amount paid with crypto
   - Wallet connected and funded

3. **Mixed: Karma + Blockchain**
   - User uses partial karma
   - Remaining paid with crypto
   - Transaction hash generated

4. **All Three Methods**
   - Karma covers 40%
   - Blockchain covers 30%
   - Cash covers 30%
   - Complex calculation verified

5. **Network Switching**
   - User switches from Ethereum to Polygon
   - Balance and currency update
   - Gas fees recalculated

6. **Admin View**
   - All transactions visible
   - Filters work correctly
   - Export generates valid CSV
   - Statistics accurate

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Mock Transactions:** All blockchain transactions are simulated
2. **Fixed Exchange Rates:** Real-time rates not implemented
3. **No Wallet Validation:** Addresses not verified on-chain
4. **Local Storage Only:** Wallet state not synced with backend
5. **No Gas Estimation:** Fixed gas fee values

### Future Improvements
1. Real Web3 provider integration
2. Dynamic exchange rate API
3. Address validation via blockchain
4. Backend wallet state management
5. Actual gas estimation from network

## 📖 API Endpoints (Backend Required)

### Redeem with Mixed Payment
```
POST /api/v1/rewards/redeem
Body: {
  reward_id: number,
  delivery_address?: string,
  contact_phone?: string,
  payment_method: PaymentMethod,
  karma_used: number,
  blockchain_amount?: number,
  blockchain_currency?: string,
  blockchain_network?: string,
  blockchain_tx_hash?: string,
  wallet_address?: string,
  cash_amount_npr?: number,
  total_value_npr: number
}
```

### Get Transaction History
```
GET /api/v1/blockchain/transactions
Response: BlockchainTransaction[]
```

### Verify Transaction
```
POST /api/v1/blockchain/verify
Body: {
  transaction_hash: string,
  network: string
}
```

## 🎓 Educational Resources

The ProfilePage includes educational content about:
- What is blockchain?
- Why blockchain is the best payment method
- How to use blockchain in the app
- Security and transparency benefits
- FAQ section

## 📞 Support

For questions or issues with blockchain integration:
- Check the FAQ in Profile > Blockchain tab
- Review transaction status in Profile > Activity
- Contact admin via Help section
- Report issues in GitHub repository

## 🌟 Benefits Summary

### For Users
- **Flexibility:** Pay how you want
- **Security:** Blockchain-verified transactions
- **Transparency:** All transactions traceable
- **Lower Fees:** Crypto often cheaper than cards
- **Global:** Use crypto from anywhere

### For Partners
- **Instant Settlement:** Blockchain payments confirm fast
- **Lower Costs:** No credit card processing fees
- **Global Reach:** Accept international payments
- **Transparency:** Track all transactions
- **Security:** Funds secured by blockchain

### For Platform
- **Innovation:** First civic platform with crypto
- **Attract Users:** Appeals to crypto enthusiasts
- **Revenue:** Transaction fees on blockchain payments
- **Data:** Rich transaction analytics
- **Reputation:** Tech-forward civic engagement

---

**Version:** 3.0  
**Last Updated:** November 2025  
**Status:** Demo Mode (Production Ready for Backend Integration)
