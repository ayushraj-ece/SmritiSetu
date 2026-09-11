import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  UserCheck, 
  HeartHandshake, 
  Stethoscope, 
  Home
} from 'lucide-react';
import type { UserRole } from '../../types';

interface Props {
  currentRole: UserRole;
}

export const BottomMobileNav: React.FC<Props> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Patient Portal Quick Tab */}
        <button
          onClick={() => navigate('/patient')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            location.pathname === '/patient' 
              ? 'text-[#0284C7] font-bold' 
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <UserCheck className={`w-5 h-5 ${location.pathname === '/patient' ? 'text-[#0284C7]' : 'text-slate-400'}`} />
          <span className="text-[10px]">Patient</span>
        </button>

        {/* Caregiver Dashboard Quick Tab */}
        <button
          onClick={() => navigate('/caregiver')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            location.pathname === '/caregiver' 
              ? 'text-[#0284C7] font-bold' 
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <HeartHandshake className={`w-5 h-5 ${location.pathname === '/caregiver' ? 'text-[#0284C7]' : 'text-slate-400'}`} />
          <span className="text-[10px]">Caregiver</span>
        </button>

        {/* Doctor Portal Quick Tab */}
        <button
          onClick={() => navigate('/doctor')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            location.pathname === '/doctor' 
              ? 'text-[#0284C7] font-bold' 
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Stethoscope className={`w-5 h-5 ${location.pathname === '/doctor' ? 'text-[#0284C7]' : 'text-slate-400'}`} />
          <span className="text-[10px]">Doctor</span>
        </button>

        {/* Home Quick Link */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
        >
          <Home className="w-5 h-5 text-slate-400" />
          <span className="text-[10px]">Landing</span>
        </button>
      </div>
    </div>
  );
};
