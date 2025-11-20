import React from 'react';
import { Page, UserRank } from '../types';
import { AdminPanelIcon, UserCircleIcon } from './Icons';

interface HeaderProps {
  points: number;
  currentUser: UserRank | null;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ points, currentUser, setCurrentPage }) => {
  return (
    <header
      className="bg-white/70 backdrop-blur-xl shadow-soft fixed top-0 left-0 right-0 z-50 border-b border-white/20"
      role="banner"
    >
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#1C1C1E]">Hamro Saath 🇳🇵</h1>
        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              <div
                className="flex items-center gap-2 bg-[#007AFF] text-white font-bold py-2 px-4 rounded-full shadow-lg shadow-blue-200"
                aria-label={`Your Karma Points: ${points.toLocaleString()}`}
              >
                <span aria-hidden="true">⚡</span>
                <span className="font-mono">{points.toLocaleString()}</span>
                <span className="text-xs opacity-90">KP</span>
              </div>
              <nav aria-label="User navigation">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage('profile')}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                    aria-label="Go to Profile"
                  >
                    <UserCircleIcon className="text-[#4A90E2]" />
                  </button>
                  {currentUser.isAdmin && (
                    <button
                      onClick={() => setCurrentPage('admin')}
                      className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                      aria-label="Go to Admin Panel"
                    >
                      <AdminPanelIcon className="text-[#FF3B30]" />
                    </button>
                  )}
                </div>
              </nav>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
