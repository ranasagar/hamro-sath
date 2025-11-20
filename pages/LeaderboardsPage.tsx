import React, { useMemo, useState } from 'react';
import { TrophyIcon } from '../components/Icons';
import MayorCard from '../components/MayorCard';
import { useChallengeLeaderboard, useChallenges } from '../hooks/useChallenges';
import { useLeaderboard } from '../hooks/useUser';
import { MayorProfile, UserRank, WardRank } from '../types';

interface LeaderboardsPageProps {
  individualRanks: UserRank[];
  wardRanks: WardRank[];
  mayorProfiles: MayorProfile[];
  initialTab?: string;
}

const LeaderboardTabs: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => (
  <div className="mb-4 flex border-b border-gray-200 overflow-x-auto">
    <button
      onClick={() => setActiveTab('individual')}
      className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'individual' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}
    >
      Top Safa Heroes
    </button>
    <button
      onClick={() => setActiveTab('ward')}
      className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'ward' ? 'border-b-2 border-brand-green text-brand-green' : 'text-gray-500'}`}
    >
      Top Wards
    </button>
    <button
      onClick={() => setActiveTab('challenges')}
      className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'challenges' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
    >
      Mayor's Challenges
    </button>
  </div>
);

const UserRankItem: React.FC<{ user: UserRank }> = ({ user }) => {
  const rankClasses = {
    1: 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300',
    2: 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300',
    3: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300',
  };
  const rankTextClasses = {
    1: 'text-amber-500',
    2: 'text-slate-500',
    3: 'text-orange-600',
  };

  const rankClass = user.rank <= 3 ? rankClasses[user.rank as 1 | 2 | 3] : 'bg-white';
  const rankTextClass = user.rank <= 3 ? rankTextClasses[user.rank as 1 | 2 | 3] : 'text-gray-500';

  return (
    <li className={`flex items-center p-3 rounded-lg shadow-subtle mb-2 gap-4 border ${rankClass}`}>
      <span
        className={`font-bold text-xl w-10 text-center flex items-center justify-center gap-1 ${rankTextClass}`}
      >
        {user.rank <= 3 ? <TrophyIcon className="w-6 h-6" /> : user.rank}
      </span>
      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" loading="lazy" />
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{user.name}</p>
        <p className="text-sm text-gray-500">{user.ward}</p>
      </div>
      <span className="font-bold text-brand-green">{user.points.toLocaleString()} SP</span>
    </li>
  );
};

const WardRankItem: React.FC<{ ward: WardRank }> = ({ ward }) => {
  const rankClasses = {
    1: 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300',
    2: 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300',
    3: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300',
  };
  const rankTextClasses = {
    1: 'text-amber-500',
    2: 'text-slate-500',
    3: 'text-orange-600',
  };

  const rankClass = ward.rank <= 3 ? rankClasses[ward.rank as 1 | 2 | 3] : 'bg-white';
  const rankTextClass = ward.rank <= 3 ? rankTextClasses[ward.rank as 1 | 2 | 3] : 'text-gray-500';

  return (
    <li className={`flex items-center p-3 rounded-lg shadow-subtle mb-2 gap-4 border ${rankClass}`}>
      <span
        className={`font-bold text-xl w-10 text-center flex items-center justify-center gap-1 ${rankTextClass}`}
      >
        {ward.rank <= 3 ? <TrophyIcon className="w-6 h-6" /> : ward.rank}
      </span>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{ward.name}</p>
      </div>
      <span className="font-bold text-brand-green">{ward.points.toLocaleString()} SP</span>
    </li>
  );
};

const CitySelector: React.FC<{
  cities: string[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
}> = ({ cities, selectedCity, onSelectCity }) => (
  <div className="mb-4 flex items-center justify-center gap-2">
    {cities.map(city => (
      <button
        key={city}
        onClick={() => onSelectCity(city)}
        className={`px-4 py-2 font-semibold rounded-full text-sm transition-colors ${
          selectedCity === city
            ? 'bg-brand-green text-white shadow'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        {city}
      </button>
    ))}
  </div>
);

const ChallengesTab: React.FC = () => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const { challenges, loading: challengesLoading } = useChallenges({ is_active: true });
  const { leaderboard, loading: leaderboardLoading } = useChallengeLeaderboard(
    selectedChallengeId,
    50
  );

  // Auto-select first challenge
  React.useEffect(() => {
    if (challenges.length > 0 && !selectedChallengeId) {
      setSelectedChallengeId(challenges[0].id);
    }
  }, [challenges, selectedChallengeId]);

  if (challengesLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading challenges...</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active challenges at the moment.</p>
      </div>
    );
  }

  const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Challenge Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select a Challenge</label>
        <select
          value={selectedChallengeId || ''}
          onChange={e => setSelectedChallengeId(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {challenges.map(challenge => (
            <option key={challenge.id} value={challenge.id}>
              {challenge.title}
              {challenge.ward_name && ` (${challenge.ward_name})`}
            </option>
          ))}
        </select>
      </div>

      {/* Challenge Details */}
      {selectedChallenge && (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 mb-6 border-2 border-purple-200">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-xl text-purple-900">{selectedChallenge.title}</h3>
            {selectedChallenge.ward_name && (
              <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-semibold">
                {selectedChallenge.ward_name}
              </span>
            )}
          </div>
          <p className="text-purple-800 mb-4">{selectedChallenge.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-purple-600 font-semibold">Target:</span>
              <p className="text-purple-900 font-bold">
                {selectedChallenge.target_points.toLocaleString()} SP
              </p>
            </div>
            <div>
              <span className="text-purple-600 font-semibold">Starts:</span>
              <p className="text-purple-900">{formatDate(selectedChallenge.start_date)}</p>
            </div>
            <div>
              <span className="text-purple-600 font-semibold">Ends:</span>
              <p className="text-purple-900">{formatDate(selectedChallenge.end_date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboardLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No participants yet. Be the first!</p>
        </div>
      ) : (
        <ul>
          {leaderboard.map(entry => {
            const rankClasses = {
              1: 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300',
              2: 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300',
              3: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300',
            };
            const rankTextClasses = {
              1: 'text-amber-500',
              2: 'text-slate-500',
              3: 'text-orange-600',
            };

            const rankClass = entry.rank <= 3 ? rankClasses[entry.rank as 1 | 2 | 3] : 'bg-white';
            const rankTextClass =
              entry.rank <= 3 ? rankTextClasses[entry.rank as 1 | 2 | 3] : 'text-gray-500';

            return (
              <li
                key={entry.user_id}
                className={`flex items-center p-3 rounded-lg shadow-subtle mb-2 gap-4 border ${rankClass}`}
              >
                <span
                  className={`font-bold text-xl w-10 text-center flex items-center justify-center gap-1 ${rankTextClass}`}
                >
                  {entry.rank <= 3 ? <TrophyIcon className="w-6 h-6" /> : entry.rank}
                </span>
                <img
                  src={entry.avatar_url || '/default-avatar.png'}
                  alt={entry.full_name}
                  className="w-12 h-12 rounded-full"
                  loading="lazy"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{entry.full_name}</p>
                </div>
                <span className="font-bold text-purple-600">
                  {entry.points_earned.toLocaleString()} SP
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const LeaderboardsPage: React.FC<LeaderboardsPageProps> = ({
  individualRanks,
  wardRanks,
  mayorProfiles,
  initialTab = 'individual',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { leaderboard, loading, fetchLeaderboard } = useLeaderboard();
  const cities = useMemo(
    () => Array.from(new Set(mayorProfiles.map(p => p.city))),
    [mayorProfiles]
  );
  const [selectedCity, setSelectedCity] = useState(cities[0] || '');

  const selectedMayor = useMemo(
    () => mayorProfiles.find(p => p.city === selectedCity),
    [selectedCity, mayorProfiles]
  );

  // Map API leaderboard data to UserRank format
  const apiIndividualRanks = useMemo(() => {
    return leaderboard.map(
      entry =>
        ({
          name: entry.name,
          avatar: entry.avatar_url || '/default-avatar.png',
          ward: entry.ward_name,
          points: entry.points,
          rank: entry.rank,
          isAdmin: false,
          stats: {
            reportsMade: entry.total_issues_reported,
            eventsOrganized: 0,
            eventsJoined: 0,
            recyclingLogs: 0,
            supplyKitsPickedUp: 0,
            microActionsLogged: 0,
          },
          activity: [],
          purchaseHistory: [],
        }) as UserRank
    );
  }, [leaderboard]);

  // Use API data if available, otherwise fall back to props
  const filteredIndividualRanks = useMemo(() => {
    const ranks = apiIndividualRanks.length > 0 ? apiIndividualRanks : individualRanks;
    return ranks
      .filter(u => u.ward.includes(selectedCity))
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [apiIndividualRanks, individualRanks, selectedCity]);

  const filteredWardRanks = useMemo(() => {
    return wardRanks
      .filter(w => w.name.includes(selectedCity))
      .map((ward, index) => ({ ...ward, rank: index + 1 }));
  }, [wardRanks, selectedCity]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center bg-brand-green/10 text-brand-green rounded-xl">
          <TrophyIcon />
        </div>
        <h2 className="font-bold text-2xl text-brand-gray-dark">Leaderboards</h2>
      </div>
      <CitySelector cities={cities} selectedCity={selectedCity} onSelectCity={setSelectedCity} />

      {selectedMayor && <MayorCard mayor={selectedMayor} />}

      <div className="mt-6">
        <LeaderboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        )}
        {!loading && activeTab === 'individual' && (
          <ul>
            {filteredIndividualRanks.map(user => (
              <UserRankItem key={user.name} user={user} />
            ))}
          </ul>
        )}

        {activeTab === 'ward' && (
          <ul>
            {filteredWardRanks.map(ward => (
              <WardRankItem key={ward.name} ward={ward} />
            ))}
          </ul>
        )}

        {activeTab === 'challenges' && <ChallengesTab />}
      </div>
    </div>
  );
};

export default LeaderboardsPage;
