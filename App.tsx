import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import BottomNav from './components/BottomNav';
import CreateThreadModal from './components/CreateThreadModal';
import EmergencyAlertModal, { EmergencyIncident } from './components/EmergencyAlertModal';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import MicroActionsModal from './components/MicroActionsModal';
import PageSkeleton from './components/PageSkeleton';
import ReceiptModal from './components/ReceiptModal';
import ReportDisturbanceModal from './components/ReportDisturbanceModal';
import ReportModal from './components/ReportModal';
import SkipToContent from './components/SkipToContent';
import { SplashScreen } from './components/SplashScreen';
import StudentQuestsModal from './components/StudentQuestsModal';
import Toast from './components/Toast';
import { getRewardMessage, KARMA_POINTS } from './config/karmaPoints';
import {
  INITIAL_DISTURBANCES,
  INITIAL_FEATURE_FLAGS,
  INITIAL_FORUM_THREADS,
  INITIAL_HERO_SLIDES,
  INITIAL_MAYOR_PROFILES,
  INITIAL_MERCHANDISE,
  INITIAL_REWARDS,
  INITIAL_SAFETY_KIT_REDEMPTIONS,
  INITIAL_USERS,
  INITIAL_WARDS,
  MOCK_ALL_BADGES,
  MOCK_CHALLENGES,
  REWARD_POINTS,
} from './constants';
import { useAuth } from './contexts/AuthContext';
import { useAdminIssues } from './hooks/useAdminIssues';
import { useAdminRewards } from './hooks/useAdminRewards';
import { useIssues } from './hooks/useIssues';
import { useUserProfile } from './hooks/useUserProfile';

// Lazy load pages for better performance
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CivicSenseHubPage = lazy(() => import('./pages/CivicSenseHubPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LeaderboardsPage = lazy(() => import('./pages/LeaderboardsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicHomePage = lazy(() => import('./pages/PublicHomePage'));
const RecyclePage = lazy(() => import('./pages/RecyclePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const SuppliesPage = lazy(() => import('./pages/SuppliesPage'));
const ThreadDetailPage = lazy(() => import('./pages/ThreadDetailPage'));

import {
  Activity,
  AdminPurchaseReceipt,
  Disturbance,
  DisturbanceCategory,
  DisturbanceImpact,
  FeatureFlag,
  FeatureFlags,
  ForumPost,
  ForumThread,
  HeroSlide,
  Issue,
  IssueCategory,
  MayorProfile,
  MerchandiseItem,
  MerchandiseReview,
  MicroAction,
  Page,
  PurchaseReceipt,
  RecyclingMaterial,
  Reward,
  SafetyKitRedemption,
  SupplyPoint,
  ToastData,
  UserRank,
  UserStats,
  Ward,
} from './types';

const App: React.FC = () => {
  // Use auth and profile hooks
  const { user: authUser } = useAuth();
  const { profile, fetchProfile } = useUserProfile();

  // Use API hooks for issues and admin operations
  const {
    issues,
    loading: issuesLoading,
    error: issuesError,
    createIssue: createIssueAPI,
    upvoteIssue,
    volunteerForIssue,
    resolveIssue,
    refreshIssues,
  } = useIssues({ limit: 50 });

  const { createReward, updateReward, deleteReward } = useAdminRewards();
  const { deleteIssue } = useAdminIssues();

  // Load other state from localStorage or use mocks
  const [allUsers, setAllUsers] = useState<UserRank[]>(() => {
    const saved = localStorage.getItem('safaNepal-users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [disturbances, setDisturbances] = useState<Disturbance[]>(() => {
    const saved = localStorage.getItem('safaNepal-disturbances');
    return saved ? JSON.parse(saved) : INITIAL_DISTURBANCES;
  });
  const [forumThreads, setForumThreads] = useState<ForumThread[]>(() => {
    const saved = localStorage.getItem('safaNepal-forumThreads');
    return saved ? JSON.parse(saved) : INITIAL_FORUM_THREADS;
  });
  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('safaNepal-rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>(() => {
    const saved = localStorage.getItem('safaNepal-merchandise');
    return saved ? JSON.parse(saved) : INITIAL_MERCHANDISE;
  });
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('safaNepal-heroSlides');
    return saved ? JSON.parse(saved) : INITIAL_HERO_SLIDES;
  });
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(() => {
    const saved = localStorage.getItem('safaNepal-featureFlags');
    return saved ? JSON.parse(saved) : INITIAL_FEATURE_FLAGS;
  });
  const [announcements, setAnnouncements] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('safaNepal-announcements');
    return saved ? JSON.parse(saved) : [];
  });
  const [mayorProfiles, setMayorProfiles] = useState<MayorProfile[]>(() => {
    const saved = localStorage.getItem('safaNepal-mayorProfiles');
    return saved ? JSON.parse(saved) : INITIAL_MAYOR_PROFILES;
  });
  const [wards, setWards] = useState<Ward[]>(() => {
    const saved = localStorage.getItem('safaNepal-wards');
    return saved ? JSON.parse(saved) : INITIAL_WARDS;
  });
  const [safetyKitRedemptions, setSafetyKitRedemptions] = useState<SafetyKitRedemption[]>(() => {
    const saved = localStorage.getItem('safaNepal-safetyKitRedemptions');
    return saved ? JSON.parse(saved) : INITIAL_SAFETY_KIT_REDEMPTIONS;
  });
  // Initialize currentUser as null - user must login after splash screen
  const [currentUser, setCurrentUser] = useState<UserRank | null>(null);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [forumSortBy, setForumSortBy] = useState<'top' | 'newest'>('top');
  const [leaderboardInitialTab, setLeaderboardInitialTab] = useState<string>('individual');
  const [showSplash, setShowSplash] = useState(true);

  // Fetch user profile when logged in to sync karma points
  useEffect(() => {
    if (currentUser && authUser && !profile) {
      fetchProfile();
    }
  }, [currentUser, authUser, profile, fetchProfile]);

  // Calculate current karma (prefer API data over local state)
  const currentKarma = profile?.stats?.total_points ?? currentUser?.points ?? 0;

  // Navigation wrapper that clears thread view
  const navigatePage = (page: Page) => {
    setSelectedThreadId(null);
    setCurrentPage(page);
  };

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDisturbanceModalOpen, setIsDisturbanceModalOpen] = useState(false);
  const [isMicroActionsModalOpen, setIsMicroActionsModalOpen] = useState(false);
  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);
  const [isStudentQuestsOpen, setIsStudentQuestsOpen] = useState(false);
  const [isEmergencyAlertOpen, setIsEmergencyAlertOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<PurchaseReceipt | null>(null);

  // Emergency Incidents Management
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncident[]>([
    {
      id: 'unconscious',
      type: 'medical',
      label: 'Person Unconscious',
      icon: '😵',
      color: '#DC2626',
      authority: 'Medical Emergency',
      phoneNumber: '102',
      isActive: true,
    },
    {
      id: 'accident',
      type: 'accident',
      label: 'Road Accident',
      icon: '🚗💥',
      color: '#EA580C',
      authority: 'Police & Ambulance',
      phoneNumber: '100',
      isActive: true,
    },
    {
      id: 'injured',
      type: 'medical',
      label: 'Person Injured',
      icon: '🩹',
      color: '#DC2626',
      authority: 'Medical Emergency',
      phoneNumber: '102',
      isActive: true,
    },
    {
      id: 'fire',
      type: 'fire',
      label: 'Fire Emergency',
      icon: '🔥',
      color: '#DC2626',
      authority: 'Fire Department',
      phoneNumber: '101',
      isActive: true,
    },
    {
      id: 'pet_injured',
      type: 'animal',
      label: 'Pet Injured',
      icon: '🐶🩹',
      color: '#7C3AED',
      authority: 'Animal Rescue',
      phoneNumber: '9851234567',
      isActive: true,
    },
    {
      id: 'pet_accident',
      type: 'animal',
      label: 'Pet in Accident',
      icon: '🐕🚗',
      color: '#7C3AED',
      authority: 'Animal Rescue',
      phoneNumber: '9851234567',
      isActive: true,
    },
    {
      id: 'violence',
      type: 'crime',
      label: 'Violence/Assault',
      icon: '⚠️',
      color: '#DC2626',
      authority: 'Police',
      phoneNumber: '100',
      isActive: true,
    },
    {
      id: 'natural_disaster',
      type: 'disaster',
      label: 'Natural Disaster',
      icon: '🌀',
      color: '#DC2626',
      authority: 'Emergency Services',
      phoneNumber: '103',
      isActive: true,
    },
  ]);

  // Derived state
  const individualRanks = useMemo(
    () =>
      [...allUsers]
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({ ...user, rank: index + 1 })),
    [allUsers]
  );
  const wardRanks = useMemo(() => {
    const pointsByWard = allUsers.reduce(
      (acc, user) => {
        acc[user.ward] = (acc[user.ward] || 0) + user.points;
        return acc;
      },
      {} as { [key: string]: number }
    );
    return Object.entries(pointsByWard)
      .map(([name, points]) => ({ name, points, rank: 0 }))
      .sort((a, b) => b.points - a.points)
      .map((ward, index) => ({ ...ward, rank: index + 1 }));
  }, [allUsers]);
  const allActivities = useMemo(() => {
    const userActivities = allUsers.flatMap(u => u.activity || []);
    return [...announcements, ...userActivities].sort((a, b) => b.timestamp - a.timestamp);
  }, [allUsers, announcements]);
  const allPurchases = useMemo<AdminPurchaseReceipt[]>(() => {
    return allUsers
      .flatMap(user =>
        (user.purchaseHistory || []).map(receipt => ({
          ...receipt,
          userAvatar: user.avatar,
        }))
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [allUsers]);
  const activeChallenge = useMemo(() => MOCK_CHALLENGES.find(c => c.isActive) || null, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('safaNepal-users', JSON.stringify(allUsers));
  }, [allUsers]);
  useEffect(() => {
    localStorage.setItem('safaNepal-issues', JSON.stringify(issues));
  }, [issues]);
  useEffect(() => {
    localStorage.setItem('safaNepal-disturbances', JSON.stringify(disturbances));
  }, [disturbances]);
  useEffect(() => {
    localStorage.setItem('safaNepal-forumThreads', JSON.stringify(forumThreads));
  }, [forumThreads]);
  useEffect(() => {
    localStorage.setItem('safaNepal-rewards', JSON.stringify(rewards));
  }, [rewards]);
  useEffect(() => {
    localStorage.setItem('safaNepal-merchandise', JSON.stringify(merchandise));
  }, [merchandise]);
  useEffect(() => {
    localStorage.setItem('safaNepal-heroSlides', JSON.stringify(heroSlides));
  }, [heroSlides]);
  useEffect(() => {
    localStorage.setItem('safaNepal-featureFlags', JSON.stringify(featureFlags));
  }, [featureFlags]);
  useEffect(() => {
    localStorage.setItem('safaNepal-announcements', JSON.stringify(announcements));
  }, [announcements]);
  useEffect(() => {
    localStorage.setItem('safaNepal-mayorProfiles', JSON.stringify(mayorProfiles));
  }, [mayorProfiles]);
  useEffect(() => {
    localStorage.setItem('safaNepal-wards', JSON.stringify(wards));
  }, [wards]);
  useEffect(() => {
    localStorage.setItem('safaNepal-safetyKitRedemptions', JSON.stringify(safetyKitRedemptions));
  }, [safetyKitRedemptions]);
  useEffect(() => {
    localStorage.setItem('safaNepal-currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Notification check effect
  useEffect(() => {
    if (currentUser?.notifications?.length) {
      const notification = currentUser.notifications[0];
      // Use setTimeout to defer setState and avoid cascading renders
      setTimeout(() => {
        setToast({ message: notification });
        // Clear notification after showing
        setAllUsers(prevUsers =>
          prevUsers.map(u =>
            u.name === currentUser.name ? { ...u, notifications: u.notifications?.slice(1) } : u
          )
        );
      }, 0);
    }
  }, [currentUser?.notifications?.length, currentUser?.name]);

  // Handlers
  const addPoints = useCallback(
    (amount: number, message: string, userName?: string) => {
      const targetUser = userName || currentUser?.name;
      if (!targetUser) return;

      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.name === targetUser ? { ...user, points: user.points + amount } : user
        )
      );
      setToast({ message, isReward: true });

      // Refresh profile to sync karma from backend
      if (targetUser === currentUser?.name) {
        setTimeout(() => fetchProfile(), 500);
      }
    },
    [currentUser?.name, fetchProfile]
  );

  const updateUserStats = useCallback(
    (stat: keyof UserStats, value: number | boolean, userName?: string) => {
      const targetUser = userName || currentUser?.name;
      if (!targetUser) return;
      setAllUsers(prevUsers =>
        prevUsers.map(user => {
          if (user.name === targetUser) {
            const newStats = { ...user.stats };
            if (stat === 'quizCompleted') {
              if (typeof value === 'boolean') {
                newStats.quizCompleted = value;
              }
            } else {
              // FIX: The compiler cannot infer that `stat` refers to a numeric property
              // inside this `else` block. This leads to an error when trying to add
              // `newStats[stat]` (which is inferred as `number | boolean`) to `value`.
              // Adding a type guard for `currentValue` resolves the ambiguity and ensures
              // both operands are numbers.
              const currentValue = newStats[stat];
              if (typeof value === 'number' && typeof currentValue === 'number') {
                // Since we've established `stat` is not 'quizCompleted', we can safely
                // cast it to a numeric-only key type for the assignment.
                newStats[stat as Exclude<keyof UserStats, 'quizCompleted'>] = currentValue + value;
              }
            }
            return { ...user, stats: newStats };
          }
          return user;
        })
      );
    },
    [currentUser?.name]
  );

  const logActivity = useCallback(
    (
      userName: string,
      activity: Pick<Activity, Exclude<keyof Activity, 'id' | 'timestamp' | 'user'>>
    ) => {
      const user = allUsers.find(u => u.name === userName);
      if (!user) return;

      const newActivity: Activity = {
        id: `act_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        user: { name: user.name, avatar: user.avatar, isAdmin: user.isAdmin },
        ...activity,
      };

      setAllUsers(prevUsers =>
        prevUsers.map(u =>
          u.name === userName
            ? { ...u, activity: [newActivity, ...u.activity].slice(0, 50) } // Keep last 50 activities
            : u
        )
      );
    },
    [allUsers]
  );

  const handleLogin = (email: string) => {
    // AuthContext already handled API login, just sync UI state
    const userToLogin = allUsers.find(
      user => user.name.toLowerCase().replace(/\s+/g, '') + '@safa.com' === email
    );
    if (userToLogin) {
      // Ensure user has all required properties with defaults
      const completeUser: UserRank = {
        ...userToLogin,
        activity: userToLogin.activity || [],
        purchaseHistory: userToLogin.purchaseHistory || [],
        notifications: userToLogin.notifications || [],
        stats: userToLogin.stats || {
          reportsMade: 0,
          eventsOrganized: 0,
          eventsJoined: 0,
          quizCompleted: false,
          recyclingLogs: 0,
          supplyKitsPickedUp: 0,
          supplyKitsToday: 0,
          microActionsLogged: 0,
          microActionsToday: 0,
          disturbanceReports: 0,
          safetyKitsRedeemed: 0,
        },
      };
      console.log('Setting current user:', completeUser);
      setCurrentUser(completeUser);
      return true;
    }
    console.error('User not found for email:', email);
    console.log(
      'Available users:',
      allUsers.map(u => ({
        name: u.name,
        email: u.name.toLowerCase().replace(/\s+/g, '') + '@safa.com',
      }))
    );
    return false;
  };

  const handleLogout = () => setCurrentUser(null);

  const handleRegister = (
    newUser: Omit<
      UserRank,
      'rank' | 'points' | 'stats' | 'activity' | 'purchaseHistory' | 'notifications'
    >
  ) => {
    const newUserData: UserRank = {
      ...newUser,
      rank: 0,
      points: 100, // Starting points
      stats: {
        reportsMade: 0,
        eventsOrganized: 0,
        eventsJoined: 0,
        quizCompleted: false,
        recyclingLogs: 0,
        supplyKitsPickedUp: 0,
        supplyKitsToday: 0,
        microActionsLogged: 0,
        microActionsToday: 0,
        disturbanceReports: 0,
        safetyKitsRedeemed: 0,
      },
      activity: [],
      purchaseHistory: [],
      notifications: [],
    };
    setAllUsers(prev => [...prev, newUserData]);
    setCurrentUser(newUserData);
  };

  const handleReportSubmit = (data: {
    category: IssueCategory;
    description: string;
    photo: File;
  }) => {
    if (!currentUser) return;
    const newIssue: Issue = {
      id: Date.now(),
      user: currentUser.name,
      userAvatar: currentUser.avatar,
      category: data.category,
      imageUrl: URL.createObjectURL(data.photo),
      location: 'New Baneshwor, Kathmandu',
      ward: 'Ward 10, Kathmandu',
      description: data.description,
      timestamp: 'Just now',
      status: 'Reported',
      coordinates: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
    };
    // Issues are now managed by the useIssues hook via createIssueAPI
    // The hook automatically updates the issues list when createIssue is called
    addPoints(REWARD_POINTS.REPORT_ISSUE, `+${REWARD_POINTS.REPORT_ISSUE} Karma for your report!`);
    updateUserStats('reportsMade', 1);
    logActivity(currentUser.name, {
      type: 'reported',
      description: `reported a new issue: '${data.category}'`,
      pointsChange: REWARD_POINTS.REPORT_ISSUE,
      issueId: newIssue.id,
    });
    setIsReportModalOpen(false);
  };

  const handleDisturbanceReport = (data: {
    category: DisturbanceCategory;
    impacts: DisturbanceImpact[];
  }) => {
    if (!currentUser) return;

    const newDisturbance: Disturbance = {
      id: Date.now(),
      category: data.category,
      impacts: data.impacts,
      location: 'Asan, Kathmandu',
      coordinates: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
      timestamp: Date.now(),
      reports: 1,
      reporters: [currentUser.name],
    };

    setDisturbances(prev => [newDisturbance, ...prev]);
    addPoints(20, '+20 Karma for reporting a disturbance.');
    updateUserStats('disturbanceReports', 1);
    setIsDisturbanceModalOpen(false);
  };

  const handleOrganizeSubmit = (
    issue: Issue,
    details: { date: string; time: string; volunteersNeeded: number }
  ) => {
    // Note: This function updates local UI state only
    // The backend should handle event organization through a separate API
    logActivity(currentUser!.name, {
      type: 'organized',
      description: `organized a clean-up for '${issue.category}'`,
      pointsChange: 0,
      issueId: issue.id,
    });
  };

  const handleJoinEvent = (issue: Issue) => {
    // Note: This function is for local activity logging only
    // The actual volunteer API is called through volunteerForIssue from useIssues hook
    logActivity(currentUser!.name, {
      type: 'joined',
      description: `joined the clean-up for '${issue.category}'`,
      pointsChange: 0,
      issueId: issue.id,
    });
  };

  const handleCompleteSubmit = async (issue: Issue, data: { photo: File }) => {
    // Note: Image upload for completion proof will be implemented in next phase
    // For now, just mark the issue as resolved
    const success = await resolveIssue(issue.id);

    if (success) {
      showToast(`Issue resolved successfully! Volunteers have been awarded points.`, 'success');
      // Refresh the issues list to get updated data
      refreshIssues();
    } else {
      showToast('Failed to resolve issue. Please try again.', 'error');
    }
  };

  const handleLogRecycle = (materials: RecyclingMaterial[]) => {
    if (!currentUser) return;
    addPoints(REWARD_POINTS.RECYCLE_LOG, `+${REWARD_POINTS.RECYCLE_LOG} Karma for recycling!`);
    updateUserStats('recyclingLogs', 1);
    logActivity(currentUser.name, {
      type: 'recycled_item',
      description: `logged recycling of ${materials.join(', ')}`,
      pointsChange: REWARD_POINTS.RECYCLE_LOG,
    });
  };

  const handleLogSupplyPickup = (supplyPoint: SupplyPoint) => {
    if (!currentUser) return;
    addPoints(
      REWARD_POINTS.SUPPLY_KIT_PICKUP,
      `+${REWARD_POINTS.SUPPLY_KIT_PICKUP} Karma for picking up a kit!`
    );
    updateUserStats('supplyKitsPickedUp', 1);
    updateUserStats('supplyKitsToday', 1);
    logActivity(currentUser.name, {
      type: 'supply_kit_pickup',
      description: `picked up a clean-up kit from ${supplyPoint.name}`,
      pointsChange: REWARD_POINTS.SUPPLY_KIT_PICKUP,
    });
  };

  const handleQuestSubmit = async (questId: number, proof: File) => {
    if (!currentUser) return;

    try {
      // TODO: POST to backend /api/student-quests/:id/submit
      console.log('Quest submitted:', questId, proof);

      const questPoints = 50;
      addPoints(questPoints, `+${questPoints} Karma for completing quest!`);
      logActivity(currentUser.name, {
        type: 'quest_completed',
        description: `completed a student quest`,
        pointsChange: questPoints,
      });

      showToast('Quest submitted successfully! Teacher will review.', 'success');
      setIsStudentQuestsOpen(false);
    } catch (error) {
      console.error('Quest submission error:', error);
      showToast('Failed to submit quest. Please try again.', 'error');
    }
  };

  const handleEmergencyAlert = async (
    incident: EmergencyIncident,
    location: string,
    details: string,
    contactNumber: string
  ) => {
    if (!currentUser) return;

    try {
      // Create emergency report
      const emergencyReport = {
        id: Date.now(),
        user: currentUser.name,
        incident: incident.label,
        location,
        details,
        contactNumber,
        timestamp: new Date().toISOString(),
        status: 'reported',
      };

      // Create WhatsApp message
      const whatsappMessage = encodeURIComponent(
        `🚨 EMERGENCY ALERT\n\n` +
          `Type: ${incident.label}\n` +
          `Location: ${location}\n` +
          `Details: ${details || 'N/A'}\n` +
          `Contact: ${contactNumber}\n` +
          `Reporter: ${currentUser.name}\n` +
          `Time: ${new Date().toLocaleString()}\n\n` +
          `Please respond immediately!`
      );

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${incident.phoneNumber.replace(/\D/g, '')}?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank');

      // Log activity
      logActivity(currentUser.name, {
        type: 'reported',
        description: `reported emergency: ${incident.label} at ${location}`,
        pointsChange: 0,
      });

      // Notify admin (in real app, would POST to backend)
      console.log('Emergency reported to admin:', emergencyReport);

      showToast(`🚨 Emergency alert sent to ${incident.authority}! Stay safe.`, 'success');
      setIsEmergencyAlertOpen(false);
    } catch (error) {
      console.error('Emergency alert error:', error);
      showToast('Failed to send emergency alert. Please call directly.', 'error');
    }
  };

  const handleLogMicroAction = (action: MicroAction) => {
    if (!currentUser || currentUser.stats.microActionsToday >= 3) return;
    addPoints(action.points, `+${action.points} Karma for your quick action!`);
    updateUserStats('microActionsLogged', 1);
    updateUserStats('microActionsToday', 1);
    logActivity(currentUser.name, {
      type: 'micro_action_logged',
      description: `logged a quick action: '${action.name}'`,
      pointsChange: action.points,
    });
  };

  const handlePurchaseReward = (reward: Reward, pointsUsed: number, amountPaidNPR: number) => {
    if (!currentUser) return;

    const isCashPayment = amountPaidNPR > 0;
    const status = isCashPayment ? 'pending' : 'confirmed';

    const newReceipt: PurchaseReceipt = {
      id: Date.now(),
      userName: currentUser.name,
      rewardTitle: reward.title,
      rewardPartner: reward.partner,
      rewardImageUrl: reward.imageUrl,
      costInSP: reward.cost,
      pointsUsed,
      amountPaidNPR,
      timestamp: Date.now(),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=safa_nepal_receipt_${Date.now()}`,
      status,
    };

    setAllUsers(prevUsers =>
      prevUsers.map(user =>
        user.name === currentUser.name
          ? {
              ...user,
              points: status === 'confirmed' ? user.points - pointsUsed : user.points,
              purchaseHistory: [newReceipt, ...user.purchaseHistory],
            }
          : user
      )
    );

    if (status === 'confirmed') {
      logActivity(currentUser.name, {
        type: 'redeemed',
        description: `redeemed '${reward.title}'`,
        pointsChange: -pointsUsed,
      });
    }

    setViewingReceipt(newReceipt);
    setToast({
      message: isCashPayment ? 'Purchase pending approval!' : 'Reward redeemed successfully!',
    });
  };

  const handlePurchaseMerchandise = (item: MerchandiseItem) => {
    if (!currentUser) return;

    const newReceipt: PurchaseReceipt = {
      id: Date.now(),
      userName: currentUser.name,
      rewardTitle: item.title,
      rewardPartner: 'Official Merchandise',
      rewardImageUrl: item.imageUrl,
      costInSP: 0,
      pointsUsed: 0,
      amountPaidNPR: item.priceNPR,
      timestamp: Date.now(),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=safa_nepal_receipt_${Date.now()}`,
      status: 'pending',
    };

    setAllUsers(prevUsers =>
      prevUsers.map(u =>
        u.name === currentUser.name
          ? { ...u, purchaseHistory: [newReceipt, ...u.purchaseHistory] }
          : u
      )
    );
    logActivity(currentUser.name, {
      type: 'merchandise_purchased',
      description: `purchased '${item.title}'`,
      pointsChange: 0,
    });
    setViewingReceipt(newReceipt);
    setToast({ message: 'Purchase pending approval!' });
  };

  const handleMerchandiseReviewSubmit = (itemId: number, rating: number, comment: string) => {
    if (!currentUser) return;

    const newReview: MerchandiseReview = {
      id: Date.now(),
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating,
      comment,
      timestamp: Date.now(),
    };

    setMerchandise(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, reviews: [newReview, ...item.reviews] } : item
      )
    );

    logActivity(currentUser.name, {
      type: 'merchandise_review',
      description: `reviewed a merchandise item`,
      pointsChange: 0,
    });
    setToast({ message: 'Thank you for your review!' });
  };

  const handleDiscussMerchandise = (item: MerchandiseItem) => {
    if (!currentUser) return;

    const existingThread = forumThreads.find(t => t.merchandiseId === item.id);
    if (existingThread) {
      setSelectedThreadId(existingThread.id);
      setCurrentPage('forum');
      return;
    }

    // Create a new thread
    const botPost: ForumPost = {
      id: Date.now(),
      user: 'Safa Nepal Bot',
      userAvatar: 'https://picsum.photos/id/42/100/100',
      userIsAdmin: true,
      content: `This is the official discussion thread for "${item.title}".\n\n${item.description}\n\nShare your thoughts, questions, or reviews here!`,
      timestamp: 'Just now',
      parentId: null,
      replies: [],
      score: 1,
      votes: { 'Safa Nepal Bot': 1 },
      imageUrl: item.imageUrl,
    };
    const newThread: ForumThread = {
      id: Date.now(),
      title: `Discussion: ${item.title}`,
      posts: [botPost],
      merchandiseId: item.id,
    };

    setForumThreads(prev => [newThread, ...prev]);
    setSelectedThreadId(newThread.id);
    setCurrentPage('forum');
  };

  // Forum Handlers
  const handleCreateThread = (
    title: string,
    content: string,
    imageUrl?: string,
    youtubeLink?: string
  ) => {
    if (!currentUser) return;
    const newPost: ForumPost = {
      id: Date.now(),
      user: currentUser.name,
      userAvatar: currentUser.avatar,
      userIsAdmin: currentUser.isAdmin,
      content,
      timestamp: 'Just now',
      parentId: null,
      replies: [],
      score: 1,
      votes: { [currentUser.name]: 1 },
      imageUrl: imageUrl,
      youtubeVideoId: youtubeLink?.split('v=')[1]?.split('&')[0],
    };
    const newThread: ForumThread = {
      id: Date.now(),
      title,
      posts: [newPost],
    };
    setForumThreads(prev => [newThread, ...prev]);

    // Award points for creating thread
    const points =
      imageUrl || youtubeLink ? KARMA_POINTS.CREATE_THREAD_WITH_MEDIA : KARMA_POINTS.CREATE_THREAD;
    addPoints(points, getRewardMessage('CREATE_THREAD', points));

    logActivity(currentUser.name, {
      type: 'forum_thread_created',
      description: `started a new discussion: "${title}"`,
      pointsChange: points,
    });
    setIsCreateThreadModalOpen(false);
  };

  const handleAddReply = (
    threadId: number,
    parentId: number | null,
    content: string,
    imageUrl?: string,
    youtubeLink?: string
  ) => {
    if (!currentUser) return;
    const newPost: ForumPost = {
      id: Date.now(),
      user: currentUser.name,
      userAvatar: currentUser.avatar,
      userIsAdmin: currentUser.isAdmin,
      content,
      timestamp: 'Just now',
      parentId,
      replies: [],
      score: 1,
      votes: { [currentUser.name]: 1 },
      imageUrl: imageUrl,
      youtubeVideoId: youtubeLink?.split('v=')[1]?.split('&')[0],
    };
    setForumThreads(prev =>
      prev.map(thread => {
        if (thread.id === threadId) {
          const findAndAddReply = (posts: ForumPost[]): ForumPost[] => {
            return posts.map(p => {
              if (p.id === parentId) {
                return { ...p, replies: [newPost, ...p.replies] };
              }
              if (p.replies.length > 0) {
                return { ...p, replies: findAndAddReply(p.replies) };
              }
              return p;
            });
          };
          const newPosts = parentId ? findAndAddReply(thread.posts) : [...thread.posts, newPost];
          return { ...thread, posts: newPosts };
        }
        return thread;
      })
    );

    // Award points for replying
    const points =
      imageUrl || youtubeLink ? KARMA_POINTS.POST_REPLY_WITH_MEDIA : KARMA_POINTS.POST_REPLY;
    addPoints(points, getRewardMessage('POST_REPLY', points));

    logActivity(currentUser.name, {
      type: 'forum_reply',
      description: `replied to a discussion`,
      pointsChange: points,
    });
  };

  const handleVote = (threadId: number, postId: number, vote: 1 | -1) => {
    if (!currentUser) return;

    let postAuthor: string | null = null;
    let wasUpvote = false;

    setForumThreads(prev =>
      prev.map(thread => {
        if (thread.id === threadId) {
          const findAndVote = (posts: ForumPost[]): ForumPost[] => {
            return posts.map(p => {
              if (p.id === postId) {
                postAuthor = p.user;
                const existingVote = p.votes[currentUser!.name] || 0;
                let newScore = p.score;
                const newVotes = { ...p.votes };
                if (existingVote === vote) {
                  // User is undoing their vote
                  newScore -= vote;
                  delete newVotes[currentUser!.name];
                  wasUpvote = false;
                } else {
                  newScore += vote - existingVote;
                  newVotes[currentUser!.name] = vote;
                  wasUpvote = vote === 1 && existingVote !== 1;
                }
                return { ...p, score: newScore, votes: newVotes };
              }
              if (p.replies.length > 0) {
                return { ...p, replies: findAndVote(p.replies) };
              }
              return p;
            });
          };
          return { ...thread, posts: findAndVote(thread.posts) };
        }
        return thread;
      })
    );

    // Award points for giving an upvote
    if (wasUpvote && vote === 1) {
      addPoints(
        KARMA_POINTS.GIVE_HELPFUL_UPVOTE,
        getRewardMessage('GIVE_HELPFUL_UPVOTE', KARMA_POINTS.GIVE_HELPFUL_UPVOTE)
      );

      // Award points to the post author for receiving an upvote
      if (postAuthor && postAuthor !== currentUser.name) {
        // Note: In a full implementation, this would update the post author's points
        // For now, we just log it as an activity
        logActivity(postAuthor, {
          type: 'forum_reply',
          description: `received an upvote on their post`,
          pointsChange: KARMA_POINTS.RECEIVE_UPVOTE,
        });
      }
    }
  };

  const handleViewThread = (threadId: number) => {
    setSelectedThreadId(threadId);
    setCurrentPage('forum');
  };

  // Admin Handlers
  const handleAdminDeleteUser = (userName: string) =>
    setAllUsers(prev => prev.filter(u => u.name !== userName));
  const handleAdminEditUserPoints = (userName: string, newPoints: number) =>
    setAllUsers(prev => prev.map(u => (u.name === userName ? { ...u, points: newPoints } : u)));

  const handleAdminDeleteIssue = async (issueId: number) => {
    const success = await deleteIssue(issueId);
    if (success) {
      refreshIssues();
      showToast('Issue deleted successfully', 'success');
    } else {
      showToast('Failed to delete issue', 'error');
    }
  };

  const handleAdminDeleteDisturbance = (dId: number) =>
    setDisturbances(prev => prev.filter(d => d.id !== dId));

  const handleAdminAddReward = async (newReward: Omit<Reward, 'id'>) => {
    const reward = await createReward(newReward);
    if (reward) {
      setRewards(prev => [reward, ...prev]);
      // Also persist to localStorage
      const updatedRewards = [reward, ...rewards];
      localStorage.setItem('safaNepal-rewards', JSON.stringify(updatedRewards));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('rewardsUpdated'));
      showToast('Reward created successfully', 'success');
    } else {
      showToast('Failed to create reward', 'error');
    }
  };

  const handleAdminEditReward = async (updatedReward: Reward) => {
    const { id, ...data } = updatedReward;

    // Update the local state immediately for instant UI feedback
    setRewards(prev => prev.map(r => (r.id === id ? updatedReward : r)));

    // Also persist to localStorage for offline capability
    const updatedRewards = rewards.map(r => (r.id === id ? updatedReward : r));
    localStorage.setItem('safaNepal-rewards', JSON.stringify(updatedRewards));

    // Dispatch custom event to notify other components (same tab)
    window.dispatchEvent(new Event('rewardsUpdated'));

    // Optionally sync with API if needed (can be added later)
    // const reward = await updateReward(id, data);

    showToast('Reward updated successfully', 'success');
  };

  const handleAdminDeleteReward = async (rewardId: number) => {
    const success = await deleteReward(rewardId);
    if (success) {
      setRewards(prev => prev.filter(r => r.id !== rewardId));
      // Update localStorage
      const updatedRewards = rewards.filter(r => r.id !== rewardId);
      localStorage.setItem('safaNepal-rewards', JSON.stringify(updatedRewards));
      // Dispatch custom event
      window.dispatchEvent(new Event('rewardsUpdated'));
      showToast('Reward deleted successfully', 'success');
    } else {
      showToast('Failed to delete reward', 'error');
    }
  };
  const handleAdminAddHeroSlide = (newSlide: Omit<HeroSlide, 'id'>) =>
    setHeroSlides(prev => [{ ...newSlide, id: Date.now() }, ...prev]);
  const handleAdminEditHeroSlide = (updatedSlide: HeroSlide) =>
    setHeroSlides(prev => prev.map(s => (s.id === updatedSlide.id ? updatedSlide : s)));
  const handleAdminDeleteHeroSlide = (slideId: number) =>
    setHeroSlides(prev => prev.filter(s => s.id !== slideId));
  const handleAdminAddMerchandise = (newItem: Omit<MerchandiseItem, 'id' | 'reviews'>) =>
    setMerchandise(prev => [{ ...newItem, id: Date.now(), reviews: [] }, ...prev]);
  const handleAdminEditMerchandise = (updatedItem: MerchandiseItem) =>
    setMerchandise(prev => prev.map(i => (i.id === updatedItem.id ? updatedItem : i)));
  const handleAdminDeleteMerchandise = (itemId: number) =>
    setMerchandise(prev => prev.filter(i => i.id !== itemId));
  const handleAdminToggleFeature = (feature: FeatureFlag) =>
    setFeatureFlags(prev => ({ ...prev, [feature]: !prev[feature] }));
  const handleAdminCreateAnnouncement = (description: string) => {
    if (!currentUser?.isAdmin) return;
    const newAnnouncement: Activity = {
      id: `ann_${Date.now()}`,
      user: { name: currentUser.name, avatar: currentUser.avatar },
      type: 'announcement',
      description,
      timestamp: Date.now(),
      pointsChange: 0,
      isAnnouncement: true,
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };
  const handleAdminDeleteActivity = (activityId: string) => {
    if (activityId.startsWith('ann_')) {
      setAnnouncements(prev => prev.filter(a => a.id !== activityId));
    } else {
      setAllUsers(prevUsers =>
        prevUsers.map(u => ({ ...u, activity: u.activity.filter(a => a.id !== activityId) }))
      );
    }
  };
  const handleAdminAddMayor = (newMayor: Omit<MayorProfile, 'id'>) =>
    setMayorProfiles(prev => [{ ...newMayor, id: Date.now() }, ...prev]);
  const handleAdminEditMayor = (updatedMayor: MayorProfile) =>
    setMayorProfiles(prev => prev.map(m => (m.id === updatedMayor.id ? updatedMayor : m)));
  const handleAdminDeleteMayor = (mayorId: number) =>
    setMayorProfiles(prev => prev.filter(m => m.id !== mayorId));
  const handleAdminAddWard = (newWard: Omit<Ward, 'id'>) =>
    setWards(prev => [{ ...newWard, id: Date.now() }, ...prev]);
  const handleAdminEditWard = (updatedWard: Ward) =>
    setWards(prev => prev.map(w => (w.id === updatedWard.id ? updatedWard : w)));
  const handleAdminDeleteWard = (wardId: number) =>
    setWards(prev => prev.filter(w => w.id !== wardId));
  const handleAdminApproveRedemption = (redemptionId: number) => {
    const redemption = safetyKitRedemptions.find(r => r.id === redemptionId);
    if (redemption) {
      setSafetyKitRedemptions(prev =>
        prev.map(r => (r.id === redemptionId ? { ...r, status: 'approved' } : r))
      );
      addPoints(
        REWARD_POINTS.SAFETY_KIT_REDEMPTION,
        `+${REWARD_POINTS.SAFETY_KIT_REDEMPTION} Karma for your purchase!`,
        redemption.userName
      );
      updateUserStats('safetyKitsRedeemed', 1, redemption.userName);
      logActivity(redemption.userName, {
        type: 'safety_kit_redeemed',
        description: 'had a safety kit purchase approved',
        pointsChange: REWARD_POINTS.SAFETY_KIT_REDEMPTION,
      });
    }
  };
  const handleAdminRejectRedemption = (redemptionId: number) =>
    setSafetyKitRedemptions(prev =>
      prev.map(r => (r.id === redemptionId ? { ...r, status: 'rejected' } : r))
    );
  const handleAdminConfirmPurchase = (receiptId: number, userName: string) => {
    setAllUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.name === userName) {
          const purchase = u.purchaseHistory.find(p => p.id === receiptId);
          if (!purchase) return u;

          const updatedHistory = u.purchaseHistory.map(p =>
            p.id === receiptId ? { ...p, status: 'confirmed' as const } : p
          );

          logActivity(u.name, {
            type: 'redeemed',
            description: `redeemed '${purchase.rewardTitle}'`,
            pointsChange: -purchase.pointsUsed,
          });

          const updatedUser = {
            ...u,
            points: u.points - purchase.pointsUsed,
            purchaseHistory: updatedHistory,
          };

          // Send notification
          const notificationMessage = `Your purchase of "${purchase.rewardTitle}" has been confirmed!`;
          updatedUser.notifications = [...(updatedUser.notifications || []), notificationMessage];

          return updatedUser;
        }
        return u;
      })
    );
    setToast({ message: 'Purchase confirmed and user notified.' });
  };
  const handleSafetyKitRequest = (receipt: File) => {
    if (!currentUser) return;
    const newRedemption: SafetyKitRedemption = {
      id: Date.now(),
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      receiptImageUrl: URL.createObjectURL(receipt),
      status: 'pending',
      timestamp: Date.now(),
    };
    setSafetyKitRedemptions(prev => [newRedemption, ...prev]);
    setToast({ message: 'Request submitted for admin approval.' });
  };

  const handleAdminDeleteForumThread = (threadId: number) => {
    setForumThreads(prev => prev.filter(t => t.id !== threadId));
    showToast('Thread deleted successfully', 'success');
  };

  const handleAdminDeleteForumPost = (threadId: number, postId: number) => {
    setForumThreads(prev =>
      prev.map(thread =>
        thread.id === threadId
          ? { ...thread, posts: thread.posts.filter((p: any) => p.id !== postId) }
          : thread
      )
    );
    showToast('Post deleted successfully', 'success');
  };

  // Show splash screen on first load
  if (showSplash) {
    // Clear any existing auth tokens and user data to prevent auto-login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safa_access_token');
      localStorage.removeItem('safa_refresh_token');
      localStorage.removeItem('safaNepal-currentUser');
    }
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Page rendering logic
  if (!currentUser) {
    const publicStats = {
      issuesSolved: issues.filter(i => i.status === 'Solved').length,
      activeHeroes: allUsers.length,
      totalPoints: allUsers.reduce((sum, user) => sum + user.points, 0),
    };

    if (authPage === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthPage('register')} />;
    }
    if (authPage === 'register') {
      return (
        <RegisterPage
          wards={wards}
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthPage('login')}
        />
      );
    }

    // Default to public home page if not logging in/registering
    return (
      <PublicHomePage
        stats={publicStats}
        onRequestLogin={() => setAuthPage('login')}
        onRequestRegister={() => setAuthPage('register')}
      />
    );
  }

  // Safety check: ensure currentUser has required properties
  if (!currentUser || !currentUser.stats || !currentUser.activity || !currentUser.purchaseHistory) {
    console.log('Waiting for complete user data...', { currentUser });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const earnedBadgeIds = new Set(
    MOCK_ALL_BADGES.filter(badge => {
      try {
        return badge.condition(currentUser.stats);
      } catch (error) {
        console.error('Error checking badge condition:', badge.name, error);
        return false;
      }
    }).map(b => b.id)
  );

  const renderPage = () => {
    if (selectedThreadId !== null) {
      const thread = forumThreads.find(t => t.id === selectedThreadId);
      if (thread) {
        return (
          <ThreadDetailPage
            thread={thread}
            currentUser={currentUser}
            onAddReply={handleAddReply}
            onVote={handleVote}
            onBack={() => setSelectedThreadId(null)}
            onViewProfile={userName => {
              setSelectedThreadId(null);
              setSelectedUserProfile(userName);
              setCurrentPage('profile');
            }}
          />
        );
      }
    }

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            currentUser={currentUser}
            issues={issues}
            disturbances={disturbances}
            rewards={rewards}
            forumThreads={forumThreads}
            setCurrentPage={navigatePage}
            onUpdateIssues={refreshIssues}
            activeChallenge={activeChallenge}
            allUsers={allUsers}
            allActivities={allActivities}
            onUpvoteIssue={upvoteIssue}
            onVolunteerForIssue={volunteerForIssue}
            onOrganizeSubmit={handleOrganizeSubmit}
            onJoinEvent={handleJoinEvent}
            onCompleteSubmit={handleCompleteSubmit}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenDisturbanceModal={() => setIsDisturbanceModalOpen(true)}
            onOpenMicroActionsModal={() => setIsMicroActionsModalOpen(true)}
            onOpenStudentQuestsModal={() => setIsStudentQuestsOpen(true)}
            onOpenEmergencyAlert={() => setIsEmergencyAlertOpen(true)}
            featureFlags={featureFlags}
            onViewThread={handleViewThread}
            issuesLoading={issuesLoading}
            issuesError={issuesError}
          />
        );
      case 'leaderboards':
        return (
          <LeaderboardsPage
            individualRanks={individualRanks}
            wardRanks={wardRanks}
            mayorProfiles={mayorProfiles}
            initialTab={leaderboardInitialTab}
          />
        );
      case 'rewards':
        return <RewardsPage heroSlides={heroSlides} />;
      case 'hub':
        return (
          <CivicSenseHubPage
            addPoints={addPoints}
            updateUserStats={updateUserStats}
            logActivity={logActivity}
            currentUser={currentUser}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'forum':
        return (
          <ForumPage
            threads={forumThreads}
            onSelectThread={handleViewThread}
            onOpenCreateModal={() => setIsCreateThreadModalOpen(true)}
            sortBy={forumSortBy}
            setSortBy={setForumSortBy}
            onVote={handleVote}
            currentUser={currentUser}
          />
        );
      case 'recycle':
        return <RecyclePage onLogRecycle={handleLogRecycle} />;
      case 'supplies':
        return (
          <SuppliesPage
            onLogSupplyPickup={handleLogSupplyPickup}
            onRequestRedemption={handleSafetyKitRequest}
            currentUser={currentUser}
            featureFlags={featureFlags}
          />
        );
      case 'admin':
        return currentUser.isAdmin ? (
          <AdminPage
            allUsers={allUsers}
            currentUser={currentUser}
            allActivities={allActivities}
            issues={issues}
            disturbances={disturbances}
            forumThreads={forumThreads}
            rewards={rewards}
            heroSlides={heroSlides}
            merchandise={merchandise}
            featureFlags={featureFlags}
            mayorProfiles={mayorProfiles}
            wards={wards}
            safetyKitRedemptions={safetyKitRedemptions}
            allPurchases={allPurchases}
            onDeleteUser={handleAdminDeleteUser}
            onEditUserPoints={handleAdminEditUserPoints}
            onDeleteIssue={handleAdminDeleteIssue}
            onDeleteDisturbance={handleAdminDeleteDisturbance}
            onAddReward={handleAdminAddReward}
            onEditReward={handleAdminEditReward}
            onDeleteReward={handleAdminDeleteReward}
            onAddHeroSlide={handleAdminAddHeroSlide}
            onEditHeroSlide={handleAdminEditHeroSlide}
            onDeleteHeroSlide={handleAdminDeleteHeroSlide}
            onAddMerchandise={handleAdminAddMerchandise}
            onEditMerchandise={handleAdminEditMerchandise}
            onDeleteMerchandise={handleAdminDeleteMerchandise}
            onToggleFeature={handleAdminToggleFeature}
            onCreateAnnouncement={handleAdminCreateAnnouncement}
            onDeleteActivity={handleAdminDeleteActivity}
            onAddMayor={handleAdminAddMayor}
            onEditMayor={handleAdminEditMayor}
            onDeleteMayor={handleAdminDeleteMayor}
            onAddWard={handleAdminAddWard}
            onEditWard={handleAdminEditWard}
            onDeleteWard={handleAdminDeleteWard}
            onApproveRedemption={handleAdminApproveRedemption}
            onRejectRedemption={handleAdminRejectRedemption}
            onConfirmPurchase={handleAdminConfirmPurchase}
            onDeleteForumThread={handleAdminDeleteForumThread}
            onDeleteForumPost={handleAdminDeleteForumPost}
          />
        ) : (
          <HomePage
            currentUser={currentUser}
            issues={issues}
            disturbances={disturbances}
            rewards={rewards}
            forumThreads={forumThreads}
            setCurrentPage={setCurrentPage}
            onUpdateIssues={refreshIssues}
            activeChallenge={activeChallenge}
            allUsers={allUsers}
            allActivities={allActivities}
            onOrganizeSubmit={handleOrganizeSubmit}
            onJoinEvent={handleJoinEvent}
            onCompleteSubmit={handleCompleteSubmit}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenDisturbanceModal={() => setIsDisturbanceModalOpen(true)}
            onOpenMicroActionsModal={() => setIsMicroActionsModalOpen(true)}
            onOpenStudentQuestsModal={() => setIsStudentQuestsOpen(true)}
            onOpenEmergencyAlert={() => setIsEmergencyAlertOpen(true)}
            featureFlags={featureFlags}
            onViewThread={handleViewThread}
            issuesLoading={issuesLoading}
            issuesError={issuesError}
          />
        );
      default:
        return (
          <HomePage
            currentUser={currentUser}
            issues={issues}
            disturbances={disturbances}
            rewards={rewards}
            forumThreads={forumThreads}
            setCurrentPage={setCurrentPage}
            onUpdateIssues={refreshIssues}
            activeChallenge={activeChallenge}
            allUsers={allUsers}
            allActivities={allActivities}
            onUpvoteIssue={upvoteIssue}
            onVolunteerForIssue={volunteerForIssue}
            onOrganizeSubmit={handleOrganizeSubmit}
            onJoinEvent={handleJoinEvent}
            onCompleteSubmit={handleCompleteSubmit}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenDisturbanceModal={() => setIsDisturbanceModalOpen(true)}
            onOpenMicroActionsModal={() => setIsMicroActionsModalOpen(true)}
            onOpenStudentQuestsModal={() => setIsStudentQuestsOpen(true)}
            onOpenEmergencyAlert={() => setIsEmergencyAlertOpen(true)}
            featureFlags={featureFlags}
            onViewThread={handleViewThread}
            issuesLoading={issuesLoading}
            issuesError={issuesError}
            onNavigateToChallengesTab={() => {
              setCurrentPage('leaderboards');
              setLeaderboardInitialTab('challenges');
            }}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative pb-20 min-h-screen bg-gradient-to-b from-[#F5FAFF] via-[#E6F0FA] to-[#E6F0FA]">
        <SkipToContent />
        <Toast toast={toast} onClear={() => setToast(null)} />
        {viewingReceipt && (
          <ReceiptModal receipt={viewingReceipt} onClose={() => setViewingReceipt(null)} />
        )}
        <Header points={currentKarma} currentUser={currentUser} setCurrentPage={setCurrentPage} />
        <main id="main-content" className="pt-16 pb-20 min-h-screen" role="main">
          <ErrorBoundary
            fallback={
              <div className="p-4 text-center">
                <p className="text-red-600">
                  This section encountered an error. Please refresh the page.
                </p>
              </div>
            }
          >
            <Suspense fallback={<PageSkeleton variant="home" />}>{renderPage()}</Suspense>
          </ErrorBoundary>
        </main>
        <BottomNav
          currentPage={currentPage}
          setCurrentPage={navigatePage}
          featureFlags={featureFlags}
        />

        {/* Global Modals */}
        {isReportModalOpen && (
          <ReportModal onClose={() => setIsReportModalOpen(false)} onSubmit={handleReportSubmit} />
        )}
        {isDisturbanceModalOpen && (
          <ReportDisturbanceModal
            onClose={() => setIsDisturbanceModalOpen(false)}
            onSubmit={handleDisturbanceReport}
          />
        )}
        {isMicroActionsModalOpen && (
          <MicroActionsModal
            onClose={() => setIsMicroActionsModalOpen(false)}
            onLogAction={handleLogMicroAction}
            actionsLeft={3 - currentUser.stats.microActionsToday}
          />
        )}
        {isCreateThreadModalOpen && (
          <CreateThreadModal
            onClose={() => setIsCreateThreadModalOpen(false)}
            onSubmit={handleCreateThread}
          />
        )}
        {isStudentQuestsOpen && (
          <StudentQuestsModal
            onClose={() => setIsStudentQuestsOpen(false)}
            onSubmitQuest={handleQuestSubmit}
            schoolId={currentUser?.schoolId}
          />
        )}
        {isEmergencyAlertOpen && (
          <EmergencyAlertModal
            onClose={() => setIsEmergencyAlertOpen(false)}
            onReportEmergency={handleEmergencyAlert}
            incidents={emergencyIncidents}
            currentLocation={currentUser?.ward}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
