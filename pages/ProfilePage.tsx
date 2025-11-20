import React, { useEffect, useState } from 'react';
import {
  ClipboardListIcon,
  RecyclingIcon,
  StarIcon,
  TrophyIcon,
  UsersIcon,
} from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { user: authUser } = useAuth();
  const { profile, activities, loading, error, fetchProfile, fetchActivities } = useUserProfile();
  const [activeTab, setActiveTab] = useState<
    'stats' | 'activity' | 'badges' | 'blockchain' | 'wallet'
  >('stats');
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (authUser && !profile && !loading && !hasFetched) {
      setHasFetched(true);
      fetchProfile();
    }
  }, [authUser, profile, loading, hasFetched, fetchProfile]);

  useEffect(() => {
    if (profile?.id) {
      // Initial fetch
      fetchActivities(profile.id).catch(err => {
        console.error('Failed to fetch activities:', err);
      });

      // Auto-refresh activities every 30 seconds (reduced frequency)
      const interval = setInterval(() => {
        if (profile?.id) {
          fetchActivities(profile.id).catch(err => {
            console.error('Failed to refresh activities:', err);
          });
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-2">Error loading profile</p>
          <p className="text-sm mb-3">{error}</p>
          {authUser && (
            <button
              onClick={() => fetchProfile()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500 bg-white rounded-lg p-8 shadow-md">
          <p className="text-lg mb-4">No profile data available</p>
          <p className="text-sm mb-4">
            Please try logging in again or contact support if the problem persists.
          </p>
          {authUser && (
            <button
              onClick={() => fetchProfile()}
              className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-green-dark transition-colors font-semibold"
            >
              Reload Profile
            </button>
          )}
        </div>
      </div>
    );
  }

  // Extra safety check - if profile becomes null during render, show error
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500 bg-white rounded-lg p-8 shadow-md">
          <p className="text-lg mb-4">Profile data unavailable</p>
          <p className="text-sm mb-4">Please refresh the page or try again</p>
          {authUser && (
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-green-dark transition-colors font-semibold"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    );
  }

  const stats = profile.stats || {
    total_points: 0,
    issues_reported: 0,
    issues_resolved: 0,
    recycle_count: 0,
    recycle_weight_kg: 0,
    volunteer_hours: 0,
    current_streak: 0,
    longest_streak: 0,
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-brand-green to-brand-blue flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg transform transition-transform hover:scale-105">
            {profile.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-brand-gray-dark">
                {profile.full_name}
              </h1>
              {profile.role === 'admin' && (
                <span className="text-xs bg-brand-blue text-white font-bold px-2 py-1 rounded-full">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600">{profile.email}</p>
            {profile.phone && <p className="text-sm sm:text-base text-gray-600">{profile.phone}</p>}
          </div>
          <div className="text-center w-full sm:w-auto mt-4 sm:mt-0">
            <div className="bg-gradient-to-r from-brand-green to-brand-blue text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:shadow-2xl hover:scale-105">
              <div className="flex items-center gap-2 justify-center mb-1">
                <TrophyIcon className="w-6 h-6" />
                <span className="text-2xl">{stats.total_points.toLocaleString()}</span>
              </div>
              <div className="text-xs opacity-90">Karma Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-gray-200 overflow-x-auto">
        {['stats', 'activity', 'badges', 'blockchain', 'wallet'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`capitalize px-4 sm:px-6 py-3 font-semibold transition-colors text-xs sm:text-base whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-brand-green text-brand-green'
                : 'text-gray-500 hover:text-brand-green'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-slide-up">
          <div className="bg-white p-6 rounded-lg shadow-subtle text-center">
            <ClipboardListIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-brand-blue" />
            <p className="text-2xl sm:text-3xl font-bold text-brand-gray-dark">
              {stats.issues_reported}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Issues Reported</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-subtle text-center transform transition-all hover:shadow-md hover:-translate-y-1">
            <ClipboardListIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-green-500" />
            <p className="text-2xl sm:text-3xl font-bold text-brand-gray-dark">
              {stats.issues_resolved}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Issues Resolved</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-subtle text-center transform transition-all hover:shadow-md hover:-translate-y-1">
            <RecyclingIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-brand-green" />
            <p className="text-2xl sm:text-3xl font-bold text-brand-gray-dark">
              {stats.recycle_count}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Recycling Logs</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-subtle text-center transform transition-all hover:shadow-md hover:-translate-y-1">
            <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl sm:text-3xl font-bold text-brand-gray-dark">
              {stats.volunteer_hours}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Volunteer Hours</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-subtle text-center transform transition-all hover:shadow-md hover:-translate-y-1">
            <StarIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl sm:text-3xl font-bold text-brand-gray-dark">
              {stats.current_streak}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Current Streak</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-subtle text-center transform transition-all hover:shadow-md hover:-translate-y-1">
            <StarIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl sm:text-3xl font-bold text-brand-gray-dark">
              {stats.longest_streak}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Longest Streak</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-subtle text-center col-span-2 transform transition-all hover:shadow-md hover:-translate-y-1">
            <RecyclingIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-lime-500" />
            <p className="text-2xl sm:text-3xl font-bold text-brand-gray-dark">
              {(stats.recycle_weight_kg || 0).toFixed(1)} kg
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Recycled</p>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-3 animate-slide-up">
          {!activities || activities.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-subtle text-center text-gray-500">
              No activities yet
            </div>
          ) : (
            activities
              .map(activity => {
                try {
                  const activityDate = activity.created_at
                    ? new Date(activity.created_at).toLocaleString()
                    : 'Unknown date';

                  return (
                    <div
                      key={activity.id}
                      className="bg-white p-4 rounded-lg shadow-subtle transform transition-all hover:shadow-md hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-brand-gray-dark capitalize">
                            {activity.activity_type?.replace(/_/g, ' ') || 'Activity'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description || 'No description'}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">{activityDate}</p>
                        </div>
                        {activity.points_earned > 0 && (
                          <div className="ml-4 text-right">
                            <span className="text-brand-green font-bold">
                              +{activity.points_earned} Karma
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } catch (err) {
                  console.error('Error rendering activity:', activity, err);
                  return null;
                }
              })
              .filter(Boolean)
          )}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 animate-slide-up">
          {profile?.badges && profile.badges.length > 0 ? (
            profile.badges
              .map(badge => {
                try {
                  const earnedDate = badge.earned_at
                    ? new Date(badge.earned_at).toLocaleDateString()
                    : null;

                  return (
                    <div
                      key={badge.id}
                      className="bg-white p-4 rounded-lg shadow-subtle text-center transform transition-all hover:shadow-md hover:-translate-y-1"
                    >
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <h3 className="font-bold text-brand-gray-dark">{badge.name || 'Badge'}</h3>
                      <p className="text-xs text-gray-600 mt-1">{badge.description || ''}</p>
                      {earnedDate && (
                        <p className="text-xs text-gray-400 mt-2">Earned: {earnedDate}</p>
                      )}
                    </div>
                  );
                } catch (err) {
                  console.error('Error rendering badge:', badge, err);
                  return null;
                }
              })
              .filter(Boolean)
          ) : (
            <div className="col-span-full bg-white p-8 rounded-lg shadow-subtle text-center text-gray-500">
              No badges earned yet. Keep participating to earn badges!
            </div>
          )}
        </div>
      )}

      {/* Blockchain Tab */}
      {activeTab === 'blockchain' && (
        <div className="space-y-6 animate-slide-up">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">🔗</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Blockchain-Powered Payments</h2>
                <p className="text-blue-100 text-sm">Secure, Transparent, and Decentralized</p>
              </div>
            </div>
          </div>

          {/* What is Blockchain? */}
          <div className="bg-white p-6 rounded-lg shadow-subtle">
            <h3 className="text-xl font-bold text-brand-gray-dark mb-4 flex items-center gap-2">
              <span>💡</span> What is Blockchain?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Blockchain is a revolutionary digital ledger technology that records transactions in a
              secure, transparent, and tamper-proof way. Think of it as a digital notebook that
              everyone can read, but no one can erase or change past entries.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>In simple terms:</strong> Every transaction you make is recorded in a
                "block" and linked to previous blocks, creating a secure "chain" that cannot be
                altered.
              </p>
            </div>
          </div>

          {/* Why Blockchain for Payments? */}
          <div className="bg-white p-6 rounded-lg shadow-subtle">
            <h3 className="text-xl font-bold text-brand-gray-dark mb-4 flex items-center gap-2">
              <span>✨</span> Why Blockchain is the Best Payment Method
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h4 className="font-bold text-brand-gray-dark mb-1">Maximum Security</h4>
                  <p className="text-sm text-gray-600">
                    Your transactions are encrypted and distributed across thousands of computers,
                    making them virtually impossible to hack or manipulate.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👁️</span>
                </div>
                <div>
                  <h4 className="font-bold text-brand-gray-dark mb-1">Complete Transparency</h4>
                  <p className="text-sm text-gray-600">
                    Every transaction is publicly recorded (while keeping your identity private),
                    ensuring full accountability and preventing fraud.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h4 className="font-bold text-brand-gray-dark mb-1">Fast & Low-Cost</h4>
                  <p className="text-sm text-gray-600">
                    No banks or middlemen means faster transactions and lower fees. Send money
                    anywhere in minutes, not days.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
                <div>
                  <h4 className="font-bold text-brand-gray-dark mb-1">Borderless Transactions</h4>
                  <p className="text-sm text-gray-600">
                    Send and receive payments globally without currency conversion hassles or
                    international banking fees.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="font-bold text-brand-gray-dark mb-1">Full Control</h4>
                  <p className="text-sm text-gray-600">
                    You own and control your money directly—no bank can freeze your account or deny
                    your transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use in App */}
          <div className="bg-white p-6 rounded-lg shadow-subtle">
            <h3 className="text-xl font-bold text-brand-gray-dark mb-4 flex items-center gap-2">
              <span>📱</span> How to Use Blockchain Payments in This App
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <h4 className="font-bold text-brand-gray-dark">Earn Karma Points</h4>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  Complete civic activities, report issues, recycle, and volunteer to earn Karma
                  points. These are stored securely on the blockchain.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </span>
                  <h4 className="font-bold text-brand-gray-dark">Visit Rewards Marketplace</h4>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  Browse available rewards, discounts, and services from our partner organizations.
                  All transactions are blockchain-verified.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </span>
                  <h4 className="font-bold text-brand-gray-dark">Redeem with Blockchain</h4>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  When you redeem a reward, your Karma points are deducted via a blockchain
                  transaction— instant, secure, and permanently recorded.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-brand-green text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </span>
                  <h4 className="font-bold text-brand-gray-dark">Track Everything</h4>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  View your complete transaction history in your profile. Every Karma point earned
                  and spent is permanently recorded on the blockchain.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Summary */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-brand-gray-dark mb-3 flex items-center gap-2">
              <span>🎉</span> Your Benefits with Blockchain
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Your Karma points are truly yours—stored in a decentralized system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Instant verification of your civic contributions and rewards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>No hidden fees or transaction delays from traditional payment systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Permanent proof of your positive impact on the community</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Future-proof technology that grows with you</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="bg-white p-6 rounded-lg shadow-subtle">
            <h3 className="text-xl font-bold text-brand-gray-dark mb-4 flex items-center gap-2">
              <span>❓</span> Common Questions
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-brand-gray-dark mb-1">
                  Do I need cryptocurrency?
                </h4>
                <p className="text-sm text-gray-600">
                  No! You earn Karma points through civic activities. We handle all blockchain
                  technology in the background—you just focus on making a difference.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-brand-gray-dark mb-1">Is it safe?</h4>
                <p className="text-sm text-gray-600">
                  Absolutely! Blockchain is one of the most secure technologies available. Your
                  transactions are encrypted and verified by the entire network.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-brand-gray-dark mb-1">
                  Can I convert Karma to cash?
                </h4>
                <p className="text-sm text-gray-600">
                  Karma points are designed for redeeming rewards within our marketplace. This
                  ensures they're used to benefit you and the community, not for speculation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-slide-up">
          {/* Wallet Connection Status */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Blockchain Wallet</h2>
                <p className="text-sm opacity-90">
                  Connect your crypto wallet to enable blockchain payments
                </p>
              </div>
              <div className="text-4xl">💳</div>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-purple-300">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Wallet Integration Coming Soon!
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We're building secure wallet connections to support multiple blockchain networks
                including Ethereum, Polygon, Binance Smart Chain, and Solana. Soon you'll be able to
                connect your wallet and make seamless blockchain payments.
              </p>

              {/* Demo Wallet Info */}
              <div className="bg-purple-50 p-6 rounded-lg max-w-md mx-auto text-left">
                <h4 className="font-semibold text-purple-900 mb-3">Demo Wallet Features:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Connect MetaMask, WalletConnect, Coinbase Wallet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Support for ETH, MATIC, BNB, SOL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Real-time balance tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Transaction history with blockchain explorer links</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Mixed payment options (Karma + Crypto + Cash)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Supported Networks */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⛓️</span> Supported Networks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <div className="text-3xl mb-2">⟠</div>
                <div className="font-bold">Ethereum</div>
                <div className="text-sm opacity-90">ETH Mainnet</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                <div className="text-3xl mb-2">⬡</div>
                <div className="font-bold">Polygon</div>
                <div className="text-sm opacity-90">MATIC</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
                <div className="text-3xl mb-2">◆</div>
                <div className="font-bold">Binance Smart Chain</div>
                <div className="text-sm opacity-90">BNB</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                <div className="text-3xl mb-2">◎</div>
                <div className="font-bold">Solana</div>
                <div className="text-sm opacity-90">SOL</div>
              </div>
            </div>
          </div>

          {/* Benefits of Blockchain Payments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💎</span> Why Use Blockchain Payments?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Ultimate Security</h4>
                  <p className="text-sm text-gray-600">
                    Your funds are protected by military-grade encryption and decentralized networks
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Lightning Fast</h4>
                  <p className="text-sm text-gray-600">
                    Transactions complete in seconds, not days like traditional banking
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">🌍</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Global Access</h4>
                  <p className="text-sm text-gray-600">
                    Use your crypto from anywhere in the world with no restrictions
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">💰</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Lower Fees</h4>
                  <p className="text-sm text-gray-600">
                    Save money on transaction fees compared to credit cards and banks
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📚</span> How Blockchain Payments Work
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Connect Your Wallet</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Use MetaMask or any Web3 wallet to securely connect to the platform
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Choose Your Payment Mix</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Select how much to pay with Karma, crypto, or cash for maximum flexibility
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Confirm Transaction</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Review the details and approve the transaction in your wallet
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Get Your Reward</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Transaction is recorded on blockchain and your reward is delivered instantly
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notify Button */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Want Early Access?</h3>
            <p className="mb-4 opacity-90">
              Be the first to know when wallet integration goes live!
            </p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Notify Me When Available
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
