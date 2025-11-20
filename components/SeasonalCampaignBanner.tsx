import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, TrophyIcon } from './Icons';

interface Campaign {
  id: number;
  name: string;
  type: 'festival' | 'seasonal' | 'emergency';
  icon: string;
  description: string;
  bonusMultiplier: number;
  startDate: Date;
  endDate: Date;
  targetActions: string[];
  progress?: number;
  goal?: number;
}

interface SeasonalCampaignBannerProps {
  onViewDetails?: () => void;
}

const SeasonalCampaignBanner: React.FC<SeasonalCampaignBannerProps> = ({ onViewDetails }) => {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Determine active campaign based on current date
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    let campaign: Campaign | null = null;

    // Dashain (September/October) - 15 days
    if ((month === 8 && day >= 15) || (month === 9 && day <= 30)) {
      campaign = {
        id: 1,
        name: 'Dashain Anti-Litter Campaign',
        type: 'festival',
        icon: '🪔',
        description: 'Double points for picking plastic near temples during Dashain!',
        bonusMultiplier: 2.0,
        startDate: new Date(now.getFullYear(), 8, 15),
        endDate: new Date(now.getFullYear(), 9, 30),
        targetActions: ['Litter pickup near temples', 'Temple area cleaning', 'Plastic removal'],
        progress: 67,
        goal: 100,
      };
    }
    // Tihar (October/November) - 5 days
    else if ((month === 9 && day >= 25) || (month === 10 && day <= 3)) {
      campaign = {
        id: 2,
        name: 'Tihar Clean Homes Initiative',
        type: 'festival',
        icon: '🪔',
        description: 'Triple points for cleaning and decorating your home sustainably!',
        bonusMultiplier: 3.0,
        startDate: new Date(now.getFullYear(), 9, 25),
        endDate: new Date(now.getFullYear(), 10, 3),
        targetActions: ['Home cleaning', 'Sustainable decorations', 'Waste segregation'],
        progress: 45,
        goal: 100,
      };
    }
    // Monsoon (June-September)
    else if (month >= 5 && month <= 8) {
      campaign = {
        id: 3,
        name: 'Monsoon Drain Patrol',
        type: 'seasonal',
        icon: '🌧️',
        description: 'Report clogged drains and earn +75 Karma!',
        bonusMultiplier: 1.5,
        startDate: new Date(now.getFullYear(), 5, 1),
        endDate: new Date(now.getFullYear(), 8, 30),
        targetActions: ['Report clogged drains', 'Drain cleaning', 'Flood prevention'],
        progress: 82,
        goal: 100,
      };
    }
    // Holi (February/March)
    else if ((month === 1 && day >= 15) || (month === 2 && day <= 15)) {
      campaign = {
        id: 4,
        name: 'Eco-Friendly Holi',
        type: 'festival',
        icon: '🎨',
        description: 'Double points for using natural colors and cleaning after celebrations!',
        bonusMultiplier: 2.0,
        startDate: new Date(now.getFullYear(), 1, 15),
        endDate: new Date(now.getFullYear(), 2, 15),
        targetActions: ['Natural color usage', 'Post-Holi cleanup', 'Water conservation'],
        progress: 34,
        goal: 100,
      };
    }
    // New Year Clean-up (December/January)
    else if (month === 11 || month === 0) {
      campaign = {
        id: 5,
        name: 'New Year Fresh Start',
        type: 'seasonal',
        icon: '✨',
        description: 'Start the year clean! Extra karma for community cleanup drives.',
        bonusMultiplier: 1.5,
        startDate: new Date(now.getFullYear(), 11, 20),
        endDate: new Date(now.getFullYear() + 1, 0, 15),
        targetActions: ['Community cleanup', 'Resolution pledges', 'Neighborhood beautification'],
        progress: 56,
        goal: 100,
      };
    }

    setActiveCampaign(campaign);

    // Update countdown timer
    if (campaign) {
      const updateTimer = () => {
        const diff = campaign.endDate.getTime() - Date.now();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
          setTimeLeft(`${days} day${days > 1 ? 's' : ''} left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} hour${hours > 1 ? 's' : ''} left`);
        } else {
          setTimeLeft('Ending soon!');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, []);

  if (!activeCampaign) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg mb-6 animate-fadeInUp cursor-pointer hover:shadow-xl transition-all ${
        activeCampaign.type === 'festival'
          ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
          : activeCampaign.type === 'seasonal'
            ? 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500'
            : 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-600'
      }`}
      onClick={onViewDetails}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Campaign Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl drop-shadow-lg">{activeCampaign.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white drop-shadow-md">
                  {activeCampaign.name}
                </h3>
                {activeCampaign.type === 'festival' && (
                  <span className="bg-white/30 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
                    FESTIVAL
                  </span>
                )}
              </div>
              <p className="text-white/90 text-sm font-medium drop-shadow">
                {activeCampaign.description}
              </p>
            </div>
          </div>

          {/* Bonus Multiplier Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-full px-4 py-2 mb-3">
            <TrophyIcon className="w-5 h-5 text-yellow-200" />
            <span className="text-white font-bold">
              {activeCampaign.bonusMultiplier}x Karma Bonus
            </span>
          </div>

          {/* Target Actions */}
          <div className="space-y-2 mb-3">
            {activeCampaign.targetActions.slice(0, 2).map((action, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-white/90 text-sm bg-black/10 rounded-lg px-3 py-1.5"
              >
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                <span>{action}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {activeCampaign.progress !== undefined && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-white/80 mb-1 font-medium">
                <span>Community Progress</span>
                <span>{activeCampaign.progress}%</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/90 rounded-full transition-all duration-500"
                  style={{ width: `${activeCampaign.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold text-white drop-shadow">
              {timeLeft.split(' ')[0]}
            </div>
            <div className="text-xs text-white/80 font-semibold">{timeLeft.split(' ')[1]}</div>
          </div>
          {onViewDetails && (
            <button className="text-white text-sm font-semibold hover:underline">
              View Details →
            </button>
          )}
        </div>
      </div>

      {/* Participation CTA */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white/90 text-sm font-medium text-center">
          🎯 Participate now and multiply your impact for {activeCampaign.name}!
        </p>
      </div>
    </div>
  );
};

export default SeasonalCampaignBanner;
