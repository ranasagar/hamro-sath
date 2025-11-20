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
  const [activeTab, setActiveTab] = useState<'stats' | 'activity' | 'badges'>('stats');
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
      <div className="mb-6 flex border-b border-gray-200">
        {['stats', 'activity', 'badges'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`capitalize px-6 py-3 font-semibold transition-colors ${
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
    </div>
  );
};

export default ProfilePage;
