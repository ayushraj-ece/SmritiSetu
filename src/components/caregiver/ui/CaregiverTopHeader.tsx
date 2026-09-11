import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

interface Props {
  caregiverName?: string;
  avatarUrl?: string;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const CaregiverTopHeader: React.FC<Props> = ({
  caregiverName = 'Rahul',
  avatarUrl,
  unreadNotificationsCount = 3,
  onOpenNotifications,
  onOpenProfile
}) => {
  return (
    <header className="bg-white px-5 pt-3 pb-3 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-sm flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-cyan-600">
            <svg className="w-6 h-6 fill-current text-cyan-500" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" fill="#0EA5E9" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 leading-tight tracking-tight">
            স্মৃতিসেতু
          </h1>
          <span className="text-[11px] font-semibold text-slate-400 block -mt-0.5 tracking-wide">
            Care Together
          </span>
        </div>
      </div>

      {/* Right Actions: Notification Bell + Caregiver Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer transition-all border border-slate-100"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar & Role */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 shadow-xs bg-indigo-50 flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={caregiverName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-extrabold text-indigo-700">
                {caregiverName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold text-slate-900 block leading-tight group-hover:text-indigo-600 transition-colors">
              {caregiverName}
            </span>
            <span className="text-[10px] font-medium text-slate-400 block">
              Caregiver
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        </button>
      </div>
    </header>
  );
};
