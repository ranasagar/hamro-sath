import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bike,
  Bus,
  Car,
  CheckCircle,
  Clock,
  Droplets,
  Leaf,
  Lightbulb,
  MapPin,
  PieChart,
  Plus,
  ShoppingBag,
  Sparkles,
  Target,
  Trash2,
  Trees,
  TrendingDown,
  Trophy,
  Users,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  useCarbonChallenges,
  useCarbonFootprint,
  useEcoBrands,
  useRecommendations,
  useSajhaBus,
  useTransport,
} from '../hooks/useSustainability';

type ActivityType =
  | 'public_transport'
  | 'cycling'
  | 'walking'
  | 'recycling'
  | 'composting'
  | 'tree_planting'
  | 'eco_product'
  | 'renewable_energy'
  | 'water_conservation'
  | 'plastic_reduction'
  | 'carpooling'
  | 'energy_saving';

const CarbonFootprintTracker: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'log' | 'challenges' | 'brands'>(
    'overview'
  );
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  const { stats, loading: statsLoading, error: statsError, logActivity } = useCarbonFootprint();
  const { transportStats, leaderboard: transportLeaderboard } = useTransport();
  const { brands, loading: brandsLoading, purchaseProduct } = useEcoBrands();
  const { recommendations } = useRecommendations();
  const { busInfo, sajhaBonus } = useSajhaBus();
  const { challenges, loading: challengesLoading } = useCarbonChallenges();

  // Activity definitions with icons and impact
  const activities: Record<
    ActivityType,
    { icon: React.ElementType; label: string; impact: string; color: string }
  > = {
    public_transport: {
      icon: Bus,
      label: 'Public Transport',
      impact: '-500g CO₂',
      color: 'from-blue-500 to-blue-600',
    },
    cycling: {
      icon: Bike,
      label: 'Cycling',
      impact: '-800g CO₂',
      color: 'from-green-500 to-green-600',
    },
    walking: {
      icon: Activity,
      label: 'Walking',
      impact: '-1kg CO₂',
      color: 'from-emerald-500 to-emerald-600',
    },
    recycling: {
      icon: Trash2,
      label: 'Recycling',
      impact: '-300g CO₂',
      color: 'from-cyan-500 to-cyan-600',
    },
    composting: {
      icon: Leaf,
      label: 'Composting',
      impact: '-200g CO₂',
      color: 'from-lime-500 to-lime-600',
    },
    tree_planting: {
      icon: Trees,
      label: 'Tree Planting',
      impact: '-2kg CO₂',
      color: 'from-green-600 to-green-700',
    },
    eco_product: {
      icon: ShoppingBag,
      label: 'Eco Product',
      impact: '-400g CO₂',
      color: 'from-teal-500 to-teal-600',
    },
    renewable_energy: {
      icon: Zap,
      label: 'Renewable Energy',
      impact: '-1.5kg CO₂',
      color: 'from-yellow-500 to-yellow-600',
    },
    water_conservation: {
      icon: Droplets,
      label: 'Water Conservation',
      impact: '-150g CO₂',
      color: 'from-blue-400 to-blue-500',
    },
    plastic_reduction: {
      icon: Wind,
      label: 'Plastic Reduction',
      impact: '-600g CO₂',
      color: 'from-purple-500 to-purple-600',
    },
    carpooling: {
      icon: Car,
      label: 'Carpooling',
      impact: '-700g CO₂',
      color: 'from-indigo-500 to-indigo-600',
    },
    energy_saving: {
      icon: Lightbulb,
      label: 'Energy Saving',
      impact: '-350g CO₂',
      color: 'from-orange-500 to-orange-600',
    },
  };

  const getEquivalent = (carbonSaved: number) => {
    const trees = (carbonSaved / 21).toFixed(1); // 21kg CO₂ per tree per year
    const kmDriven = (carbonSaved / 0.192).toFixed(0); // 192g CO₂ per km
    const plasticBottles = (carbonSaved / 0.082).toFixed(0); // 82g CO₂ per bottle

    return { trees, kmDriven, plasticBottles };
  };

  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Data</h3>
          <p className="text-gray-600">{statsError}</p>
        </div>
      </div>
    );
  }

  const equivalent = stats
    ? getEquivalent(stats.total_carbon_saved || 0)
    : { trees: '0', kmDriven: '0', plasticBottles: '0' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden"
        >
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Leaf className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Carbon Footprint Tracker</h1>
                  <p className="text-green-100 text-lg">
                    Track your environmental impact in real-time
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogModal(true)}
                className="px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Log Activity
              </button>
            </div>

            {/* Main Stats */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-white/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingDown className="w-6 h-6" />
                    <span className="text-sm text-green-100">Total CO₂ Saved</span>
                  </div>
                  <div className="text-4xl font-bold">
                    {((stats?.total_carbon_saved || 0) / 1000).toFixed(2)} kg
                  </div>
                  <div className="text-sm text-green-100 mt-1">
                    This month: {((stats?.monthly_carbon_saved || 0) / 1000).toFixed(2)} kg
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-6 h-6" />
                    <span className="text-sm text-green-100">Activities Logged</span>
                  </div>
                  <div className="text-4xl font-bold">{stats?.total_activities || 0}</div>
                  <div className="text-sm text-green-100 mt-1">
                    Streak: {stats?.current_streak || 0} days 🔥
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-6 h-6" />
                    <span className="text-sm text-green-100">Your Rank</span>
                  </div>
                  <div className="text-4xl font-bold">#{stats?.rank || '-'}</div>
                  <div className="text-sm text-green-100 mt-1">
                    Top {stats?.percentile || 0}% in your area
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Real-World Equivalents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Your Impact in Real-World Terms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="p-3 bg-green-500 rounded-xl">
                <Trees className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{equivalent.trees}</div>
                <div className="text-sm text-gray-600">Trees planted equivalent</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{equivalent.kmDriven}</div>
                <div className="text-sm text-gray-600">Km not driven</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {equivalent.plasticBottles}
                </div>
                <div className="text-sm text-gray-600">Plastic bottles saved</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 flex gap-2 overflow-x-auto">
          {(['overview', 'log', 'challenges', 'brands'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 min-w-[120px] px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTab === tab
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <OverviewTab
              stats={stats}
              transportStats={transportStats}
              transportLeaderboard={transportLeaderboard}
              recommendations={recommendations}
              sajhaBonus={sajhaBonus}
              busInfo={busInfo}
            />
          )}
          {selectedTab === 'log' && (
            <LogTab activities={activities} onSelectActivity={setSelectedActivity} stats={stats} />
          )}
          {selectedTab === 'challenges' && (
            <ChallengesTab challenges={challenges} loading={challengesLoading} />
          )}
          {selectedTab === 'brands' && (
            <BrandsTab brands={brands} loading={brandsLoading} purchaseProduct={purchaseProduct} />
          )}
        </AnimatePresence>
      </div>

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setSelectedActivity(null);
        }}
        activities={activities}
        selectedActivity={selectedActivity}
        onSelectActivity={setSelectedActivity}
        onSubmit={logActivity}
      />
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<any> = ({
  stats,
  transportStats,
  transportLeaderboard,
  recommendations,
  sajhaBonus,
  busInfo,
}) => (
  <motion.div
    key="overview"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    {/* Recent Activities */}
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" />
        Recent Activities
      </h3>
      {stats?.recent_activities && stats.recent_activities.length > 0 ? (
        <div className="space-y-3">
          {stats.recent_activities.slice(0, 5).map((activity: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 bg-gradient-to-r ${activity.color || 'from-green-500 to-emerald-600'} rounded-lg`}
                >
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{activity.type}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{activity.carbon_saved}g</div>
                <div className="text-xs text-gray-500">CO₂ saved</div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No activities logged yet. Start tracking your impact!</p>
        </div>
      )}
    </div>

    {/* Transport Stats & Sajha Bonus */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Bus className="w-5 h-5 text-blue-500" />
          Transport Impact
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-gray-700">Total Distance</span>
            <span className="font-bold text-blue-600">
              {transportStats?.total_distance || 0} km
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">CO₂ Saved</span>
            <span className="font-bold text-green-600">
              {((transportStats?.carbon_saved || 0) / 1000).toFixed(2)} kg
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-gray-700">Sajha Bus Trips</span>
            <span className="font-bold text-purple-600">{transportStats?.sajha_trips || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-md p-6 border-2 border-yellow-200">
        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-600" />
          Sajha Bus Bonus
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          Use Sajha Sewa buses to earn bonus karma and help reduce city emissions!
        </p>
        <div className="bg-white rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bonus Multiplier</span>
            <span className="text-2xl font-bold text-yellow-600">2.5x</span>
          </div>
          <div className="text-xs text-gray-500">Each Sajha trip earns 2.5x karma</div>
        </div>
        {sajhaBonus && (
          <div className="text-sm text-green-600 font-medium flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            You've earned +{sajhaBonus.bonus_karma} bonus karma this month!
          </div>
        )}
      </div>
    </div>

    {/* Recommendations */}
    {recommendations && recommendations.length > 0 && (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-500" />
          Personalized Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 4).map((rec: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <div className="text-xs font-medium text-orange-600">
                    Potential impact: {rec.impact}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

// Log Tab Component
const LogTab: React.FC<any> = ({ activities, onSelectActivity, stats }) => (
  <motion.div
    key="log"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Log Activities</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(activities).map(([key, activity]) => {
          const Icon = activity.icon;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectActivity(key as ActivityType)}
              className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all group"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${activity.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-800 mb-1">{activity.label}</div>
              <div className="text-xs font-bold text-green-600">{activity.impact}</div>
            </motion.button>
          );
        })}
      </div>
    </div>

    {/* Activity History */}
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        Activity Breakdown
      </h3>
      {stats?.activity_breakdown ? (
        <div className="space-y-3">
          {Object.entries(stats.activity_breakdown).map(([type, count]: [string, any], index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-800">{count} times</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / (stats.total_activities || 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Start logging activities to see your breakdown</p>
        </div>
      )}
    </div>
  </motion.div>
);

// Challenges Tab Component
const ChallengesTab: React.FC<any> = ({ challenges, loading }) => (
  <motion.div
    key="challenges"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 bg-white rounded-xl shadow-md animate-pulse" />
        ))}
      </div>
    ) : challenges && challenges.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge: any, index: number) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{challenge.title}</h3>
                  <p className="text-sm text-gray-600">{challenge.duration}</p>
                </div>
              </div>
              {challenge.participants && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {challenge.participants}
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-4">{challenge.description}</p>

            {/* Progress */}
            {challenge.progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-purple-600">
                    {challenge.current}/{challenge.target}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${challenge.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                  />
                </div>
              </div>
            )}

            {/* Rewards */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Reward</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-yellow-600">+{challenge.karma_reward} Karma</span>
                {challenge.badge && (
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    +Badge
                  </span>
                )}
              </div>
            </div>

            {/* Join Button */}
            {!challenge.joined && (
              <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                Join Challenge
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Challenges</h3>
        <p className="text-gray-600">Check back soon for new sustainability challenges!</p>
      </div>
    )}
  </motion.div>
);

// Brands Tab Component
const BrandsTab: React.FC<any> = ({ brands, loading, purchaseProduct }) => (
  <motion.div
    key="brands"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
      <h3 className="text-2xl font-bold mb-2">Nepal Eco-Friendly Brands</h3>
      <p className="text-teal-100">Support local sustainable businesses and earn karma rewards!</p>
    </div>

    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-80 bg-white rounded-xl shadow-md animate-pulse" />
        ))}
      </div>
    ) : brands && brands.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand: any, index: number) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
          >
            {/* Brand Image/Banner */}
            <div className="h-48 bg-gradient-to-br from-teal-400 to-cyan-500 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-20 h-20 text-white/60" />
              </div>
              {brand.verified && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{brand.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{brand.description}</p>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {brand.categories?.map((cat: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-600">
                    {brand.carbon_reduction || 0}g
                  </div>
                  <div className="text-xs text-gray-600">CO₂ Reduction</div>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    +{brand.karma_reward || 0}
                  </div>
                  <div className="text-xs text-gray-600">Karma Reward</div>
                </div>
              </div>

              {/* Location */}
              {brand.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{brand.location}</span>
                </div>
              )}

              {/* Visit/Purchase Button */}
              <button
                onClick={() => purchaseProduct(brand.id)}
                className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Log Purchase
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Brands Available</h3>
        <p className="text-gray-600">We're adding more eco-friendly brands soon!</p>
      </div>
    )}
  </motion.div>
);

// Log Activity Modal Component
const LogActivityModal: React.FC<any> = ({
  isOpen,
  onClose,
  activities,
  selectedActivity,
  onSelectActivity,
  onSubmit,
}) => {
  const [details, setDetails] = useState({
    distance: '',
    quantity: '',
    duration: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setSubmitting(true);
    try {
      await onSubmit({
        type: selectedActivity,
        ...details,
        distance: details.distance ? Number(details.distance) : undefined,
        quantity: details.quantity ? Number(details.quantity) : undefined,
        duration: details.duration ? Number(details.duration) : undefined,
      });
      setDetails({ distance: '', quantity: '', duration: '', notes: '' });
      onClose();
    } catch (error) {
      console.error('Failed to log activity:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Log Carbon-Saving Activity</h2>
                <p className="text-green-100 text-sm">Track your environmental impact</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!selectedActivity ? (
            <>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Select Activity Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(activities).map(([key, activity]) => {
                  const Icon = activity.icon;
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelectActivity(key as ActivityType)}
                      className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${activity.color} rounded-lg flex items-center justify-center mx-auto mb-2`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-800 mb-1">{activity.label}</div>
                      <div className="text-xs font-bold text-green-600">{activity.impact}</div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Activity Display */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  {React.createElement(activities[selectedActivity].icon, {
                    className: 'w-6 h-6 text-green-600',
                  })}
                  <h3 className="text-lg font-bold text-gray-800">
                    {activities[selectedActivity].label}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Impact:{' '}
                  <span className="font-bold text-green-600">
                    {activities[selectedActivity].impact}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => onSelectActivity(null)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change activity
                </button>
              </div>

              {/* Details Form */}
              {['public_transport', 'cycling', 'walking', 'carpooling'].includes(
                selectedActivity
              ) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance (km) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    value={details.distance}
                    onChange={e => setDetails({ ...details, distance: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 5.5"
                  />
                </div>
              )}

              {['recycling', 'composting', 'tree_planting', 'plastic_reduction'].includes(
                selectedActivity
              ) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={details.quantity}
                    onChange={e => setDetails({ ...details, quantity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={
                      selectedActivity === 'tree_planting' ? 'Number of trees' : 'Amount (kg)'
                    }
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={details.notes}
                  onChange={e => setDetails({ ...details, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Add any additional details..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Earn karma!</strong> Each logged activity earns you karma points based on
                  your environmental impact.
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Logging...' : 'Log Activity'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CarbonFootprintTracker;
