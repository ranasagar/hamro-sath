import React from 'react';
import { FeatureFlags, Page } from '../types';
import { ForumIcon, GiftIcon, HomeIcon, RecyclingIcon, SuppliesIcon, TrophyIcon } from './Icons';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  featureFlags: FeatureFlags;
}

const NavItem = React.memo<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}>(({ label, icon, isActive, onClick }) => {
  const activeClass = isActive ? 'text-brand-green' : 'text-brand-gray';
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeClass} hover:text-brand-green-light`}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && <div className="absolute top-1 w-1.5 h-1.5 bg-brand-green rounded-full" aria-hidden="true"></div>}
      <span aria-hidden="true">{icon}</span>
      <span className="text-xs font-medium mt-0.5">{label}</span>
    </button>
  );
});

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage, featureFlags }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'leaderboards', label: 'Ranks', icon: <TrophyIcon /> },
    { id: 'rewards', label: 'Rewards', icon: <GiftIcon />, feature: 'rewards' },
    { id: 'recycle', label: 'Recycle', icon: <RecyclingIcon />, feature: 'recycle' },
    { id: 'supplies', label: 'Supplies', icon: <SuppliesIcon />, feature: 'supplies' },
    { id: 'forum', label: 'Forum', icon: <ForumIcon />, feature: 'forum' },
  ];

  const visibleNavItems = navItems.filter(
    item => !item.feature || featureFlags[item.feature as keyof FeatureFlags]
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t border-gray-100 z-50" aria-label="Main navigation">
      <div className="container mx-auto flex justify-around items-center h-16" role="tablist">
        {visibleNavItems.map(item => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={currentPage === item.id}
            onClick={() => setCurrentPage(item.id as Page)}
          />
        ))}
      </div>
    </nav>
  );
};

export default React.memo(BottomNav);
