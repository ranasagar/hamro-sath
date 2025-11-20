import React from 'react';
import { Challenge, Disturbance, Issue } from '../types';
import { WarningIcon } from './Icons';

interface HeatmapProps {
  issues: Issue[];
  disturbances: Disturbance[];
  onSelectIssue: (issue: Issue) => void;
  activeChallenge: Challenge | null;
}

const Heatmap: React.FC<HeatmapProps> = ({
  issues,
  disturbances,
  onSelectIssue,
  activeChallenge,
}) => {
  const getStatusClasses = (issue: Issue) => {
    let colorClass = '';
    const status =
      typeof issue.status === 'string'
        ? issue.status
        : issue.status === 'pending'
          ? 'Reported'
          : issue.status === 'in_progress'
            ? 'In Progress'
            : issue.status === 'resolved'
              ? 'Solved'
              : 'Reported';

    switch (status) {
      case 'Reported':
      case 'pending':
        colorClass = 'bg-red-500 animate-pulse';
        break;
      case 'In Progress':
      case 'in_progress':
        colorClass = 'bg-yellow-500';
        break;
      case 'Solved':
      case 'resolved':
        colorClass = 'bg-green-500 opacity-70';
        break;
    }

    const isChallengeIssue =
      activeChallenge &&
      (issue.ward === activeChallenge.ward || issue.ward_name === activeChallenge.ward);
    const challengeClass = isChallengeIssue
      ? 'ring-4 ring-offset-2 ring-brand-green animate-pulse'
      : '';

    return { colorClass, challengeClass };
  };

  const getDisturbanceColor = (reports: number) => {
    if (reports >= 10) return 'text-red-600 animate-pulse'; // Alert
    return 'text-yellow-500'; // Warning
  };

  // Helper to get coordinates from either old or new format
  const getCoordinates = (issue: any) => {
    if (issue.coordinates) {
      return { x: issue.coordinates.x, y: issue.coordinates.y };
    }
    // Generate pseudo coordinates from lat/long if available
    if (issue.latitude != null && issue.longitude != null) {
      // Convert lat/long to percentage (rough approximation for demo)
      const x = ((issue.longitude + 180) / 360) * 100;
      const y = ((90 - issue.latitude) / 180) * 100;
      return { x, y };
    }
    // Default fallback - random position
    return {
      x: 30 + (issue.id % 40),
      y: 30 + ((issue.id * 7) % 40),
    };
  };

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-200">
      <img
        src="https://images.unsplash.com/photo-1614323990371-8313388145ce?q=80&w=2070&auto=format&fit=crop"
        alt="Map of city"
        className="w-full h-full object-cover"
      />
      {issues.map(issue => {
        const { colorClass, challengeClass } = getStatusClasses(issue);
        const coords = getCoordinates(issue);
        const location = (issue as any).location || issue.ward_name || 'Unknown';
        const category = issue.category || issue.title;

        return (
          <div
            key={`issue-${issue.id}`}
            onClick={() => onSelectIssue(issue)}
            className={`absolute w-4 h-4 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-xl cursor-pointer hover:scale-150 transition-transform ${challengeClass}`}
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            title={`${category} in ${location} (${issue.status})`}
          >
            <div className={`w-full h-full rounded-full ${colorClass}`}></div>
          </div>
        );
      })}
      {disturbances
        .filter(d => d.reports >= 3)
        .map(disturbance => (
          <div
            key={`disturbance-${disturbance.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform"
            style={{ left: `${disturbance.coordinates.x}%`, top: `${disturbance.coordinates.y}%` }}
            title={`${disturbance.category} in ${disturbance.location} (${disturbance.reports} reports)`}
          >
            <WarningIcon
              className={`w-8 h-8 drop-shadow-lg ${getDisturbanceColor(disturbance.reports)}`}
            />
          </div>
        ))}
    </div>
  );
};

export default Heatmap;
