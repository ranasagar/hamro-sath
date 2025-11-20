import React from 'react';
import { Issue, UserRank } from '../types';
import { CloseIcon } from './Icons';

interface IssueDetailModalProps {
  issue: Issue;
  currentUser: UserRank;
  onClose: () => void;
  onUpvote?: () => void | Promise<void>;
  onVolunteer?: () => void | Promise<void>;
  onOrganize?: (issue: Issue) => void;
  onJoin?: (issue: Issue) => void;
  onComplete?: (issue: Issue) => void;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  currentUser,
  onClose,
  onUpvote,
  onVolunteer,
  onOrganize,
  onJoin,
  onComplete,
}) => {
  const getStatusChip = () => {
    switch (issue.status) {
      case 'Reported':
        return (
          <div className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full">
            {issue.status}
          </div>
        );
      case 'In Progress':
        return (
          <div className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full">
            {issue.status}
          </div>
        );
      case 'Solved':
        return (
          <div className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
            {issue.status}
          </div>
        );
    }
  };

  const getActionButton = () => {
    const volunteersJoined = issue.participants?.length ?? 0;

    switch (issue.status) {
      case 'Reported':
        return (
          <button
            onClick={() => onOrganize?.(issue)}
            className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold hover:bg-brand-blue-dark transition-colors"
          >
            Organize Clean-Up
          </button>
        );
      case 'In Progress': {
        const isEventFull = volunteersJoined >= issue.volunteersNeeded!;
        const hasJoined = issue.participants?.includes(currentUser.name);
        const isOrganizer = issue.user === currentUser.name;

        if (isEventFull) {
          if (isOrganizer) {
            return (
              <button
                onClick={() => onComplete?.(issue)}
                className="w-full bg-brand-green text-white py-3 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
              >
                Mark as Solved
              </button>
            );
          }
          return (
            <button
              className="w-full bg-brand-green text-white py-3 rounded-lg font-semibold cursor-not-allowed"
              disabled
            >
              Event Full
            </button>
          );
        }

        if (hasJoined) {
          return (
            <button
              className="w-full bg-green-200 text-green-800 py-3 rounded-lg font-semibold cursor-not-allowed"
              disabled
            >
              ✓ You've Joined
            </button>
          );
        }

        return (
          <button
            onClick={() => onJoin?.(issue)}
            className="w-full bg-brand-green text-white py-3 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Join Event
          </button>
        );
      }
      case 'Solved':
        return (
          <button className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold cursor-not-allowed">
            Completed
          </button>
        );
    }
  };

  const volunteersJoined = issue.participants?.length ?? 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slideInUp">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-brand-gray-dark">{issue.category}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {issue.status === 'Solved' && issue.afterImageUrl ? (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <h4 className="font-bold text-center mb-1">Before</h4>
                <img
                  src={issue.imageUrl}
                  alt="Before"
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div>
                <h4 className="font-bold text-center mb-1">After</h4>
                <img
                  src={issue.afterImageUrl}
                  alt="After"
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            </div>
          ) : (
            <img
              src={issue.imageUrl}
              alt={issue.category}
              className="w-full h-56 object-cover rounded-lg mb-4"
            />
          )}

          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <img
                src={issue.userAvatar}
                alt={issue.user}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{issue.user}</p>
                <p className="text-xs text-gray-500">{issue.timestamp}</p>
              </div>
            </div>
            {getStatusChip()}
          </div>

          <p className="text-gray-600 mb-4">{issue.description}</p>

          {issue.status === 'In Progress' && issue.eventDetails && (
            <div className="bg-brand-blue-light text-brand-blue-dark p-3 rounded-lg mb-4">
              <h4 className="font-bold mb-2">Clean-Up Event Scheduled!</h4>
              <p>
                <strong>Date:</strong> {issue.eventDetails.date}
              </p>
              <p>
                <strong>Time:</strong> {issue.eventDetails.time}
              </p>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-brand-blue h-2.5 rounded-full"
                    style={{ width: `${(volunteersJoined / issue.volunteersNeeded!) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center mt-1">
                  {volunteersJoined} of {issue.volunteersNeeded} volunteers have joined
                </p>
              </div>
            </div>
          )}

          {issue.status === 'Solved' && (
            <div className="bg-brand-green-light text-brand-green-dark p-3 rounded-lg mb-4 text-center">
              <h4 className="font-bold">Problem Solved!</h4>
              <p>Thank you to all the volunteers who made this possible.</p>
            </div>
          )}

          {/* Upvote and Volunteer Buttons */}
          {(onUpvote || onVolunteer) && issue.status !== 'Solved' && (
            <div className="flex gap-3 mb-4">
              {onUpvote && (
                <button
                  onClick={onUpvote}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    issue.user_has_upvoted
                      ? 'bg-brand-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{issue.user_has_upvoted ? '👍' : '👍🏼'}</span>
                  <span>{issue.upvotes_count || 0} Upvotes</span>
                </button>
              )}
              {onVolunteer && issue.status !== 'In Progress' && (
                <button
                  onClick={onVolunteer}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    issue.user_is_volunteer
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>✋</span>
                  <span>{issue.user_is_volunteer ? 'Volunteering' : 'Volunteer'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t mt-auto">{getActionButton()}</div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
