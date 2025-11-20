import React from 'react';
import { Activity } from '../types';
import { CampaignIcon, RssIcon } from './Icons';

interface LiveActivityFeedProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
}

const ActivityItem: React.FC<{ activity: Activity; onClick: () => void }> = ({
  activity,
  onClick,
}) => {
  const isAnnouncement = activity.isAnnouncement;
  const isClickable = !!activity.issueId;

  const content = (
    <>
      <div className="flex-shrink-0">
        {isAnnouncement ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#4A90E2] text-white flex items-center justify-center shadow-md">
            <CampaignIcon className="w-6 h-6" />
          </div>
        ) : (
          <img
            src={activity.user.avatar}
            alt={activity.user.name}
            className="w-10 h-10 rounded-full shadow-md border-2 border-white"
          />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-baseline text-sm">
          {isAnnouncement ? (
            <>
              <span className="font-bold text-[#007AFF] flex-shrink-0 whitespace-nowrap">
                Admin:&nbsp;
              </span>
              <span className="font-semibold text-[#4A90E2] truncate min-w-0">
                {activity.description}
              </span>
            </>
          ) : (
            <>
              <span
                className={`font-semibold flex-shrink-0 whitespace-nowrap ${activity.user.isAdmin ? 'text-[#007AFF]' : 'text-[#1C1C1E]'}`}
              >
                {activity.user.name}&nbsp;
              </span>
              <span className="text-gray-600 truncate min-w-0">{activity.description}</span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {new Date(activity.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      {activity.pointsChange !== 0 && !isAnnouncement && (
        <div
          className={`text-sm font-bold flex-shrink-0 ml-2 ${activity.pointsChange > 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}
        >
          {activity.pointsChange > 0 ? '+' : ''}
          {activity.pointsChange} SP
        </div>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 p-3 text-left ${isAnnouncement ? 'bg-[#007AFF]/5' : ''} hover:bg-gradient-to-r hover:from-[#007AFF]/5 hover:to-transparent transition-all`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`flex w-full items-center gap-3 p-3 ${isAnnouncement ? 'bg-[#007AFF]/5' : ''}`}>
      {content}
    </div>
  );
};

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ activities, onActivityClick }) => {
  return (
    <div className="my-10 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center bg-[#34C759]/10 text-[#34C759] rounded-xl shadow-sm">
          <RssIcon />
        </div>
        <div>
          <h2 className="font-bold text-2xl text-[#1C1C1E]">Live Community Activity</h2>
          <p className="text-gray-600 text-sm">Click on an activity to see details.</p>
        </div>
      </div>
      <div className="space-y-2">
        {activities.slice(0, 5).map(
          (
            activity // Show latest 5 activities
          ) => (
            <div
              key={activity.id}
              className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-soft border border-white/50 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <ActivityItem activity={activity} onClick={() => onActivityClick(activity)} />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LiveActivityFeed;
