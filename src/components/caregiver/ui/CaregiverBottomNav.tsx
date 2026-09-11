import React from 'react';
import { Home, Users, MessageSquare, Settings } from 'lucide-react';

export type CaregiverTab = 'home' | 'patients' | 'messages' | 'settings';

interface Props {
  activeTab: CaregiverTab;
  unreadMessagesCount?: number;
  onTabChange: (tab: CaregiverTab) => void;
}

export const CaregiverBottomNav: React.FC<Props> = ({
  activeTab,
  unreadMessagesCount = 0,
  onTabChange
}) => {
  const tabs: { id: CaregiverTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'patients', label: 'Patients', icon: <Users className="w-5 h-5" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, badge: unreadMessagesCount },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-around shadow-lg max-w-md md:max-w-lg mx-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all cursor-pointer ${
              isActive
                ? 'bg-blue-50 text-blue-600 font-extrabold'
                : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-tight block">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
