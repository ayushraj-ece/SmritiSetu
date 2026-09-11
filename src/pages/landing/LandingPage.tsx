import React from 'react';
import { ArrowRight, ShieldCheck, Activity, Users } from 'lucide-react';
import { SmritiSetuLogo } from '../../components/brand/SmritiSetuLogo';

interface Props {
  onSelectLive: () => void;
  onSelectDemo: () => void;
}

export const LandingPage: React.FC<Props> = ({ onSelectLive, onSelectDemo }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#0284C7] selection:text-white flex flex-col justify-between">
      {/* Clean Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-6 lg:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <SmritiSetuLogo variant="horizontal" size="md" showTagline={true} />

          <div className="flex items-center gap-3">
            <button
              onClick={onSelectDemo}
              className="bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              SIH Demo Sandbox
            </button>

            <button
              onClick={onSelectLive}
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Live Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Portal Launch Options */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-12 my-auto">
        {/* Public Health Badge */}
        <div className="inline-flex items-center gap-2 bg-[#F0F9FF] border border-[#BAE6FD] px-4 py-2 rounded-full text-[#0284C7] text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
          <span>MINISTRY OF DEVELOPMENT OF NORTH EASTERN REGION (MDoNER) • PS 26003</span>
        </div>

        {/* Monumental Clean Title */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
            स्मृतिसेतु
          </h1>
          <p className="text-lg sm:text-xl font-bold text-[#0284C7] uppercase tracking-wider">
            SMRITISETU • BRIDGING MEMORY & CARE
          </p>
          <p className="text-base sm:text-lg text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed pt-2">
            A calm, dignified digital platform for dementia evaluation and cognitive therapy across 9 regional languages in North-Eastern India.
          </p>
        </div>

        {/* Portal Entry Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-6 text-left">
          {/* Live Platform Entry Option */}
          <div className="bg-white border-2 border-[#E2E8F0] hover:border-[#0284C7] p-8 sm:p-10 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] rounded-2xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-[#0284C7]" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#0284C7] uppercase tracking-wider block mb-1">
                  FULL CLINICAL ENVIRONMENT
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] group-hover:text-[#0284C7] transition-colors">
                  Live Platform
                </h2>
              </div>
              <p className="text-sm text-[#64748B] font-medium leading-relaxed">
                Connect to real live Firebase authentication, real Patient ID assignment (<code className="text-[#0284C7] font-bold">ASM58291</code>), live Firestore sync, and active clinical tracking.
              </p>
            </div>

            <button
              onClick={onSelectLive}
              className="w-full py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Enter Live Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* SIH Demo Sandbox Option */}
          <div className="bg-white border-2 border-[#E2E8F0] hover:border-[#0284C7] p-8 sm:p-10 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-[#0F172A]" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider block mb-1">
                  PRE-CONFIGURED EVALUATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] group-hover:text-[#0284C7] transition-colors">
                  SIH Demo Sandbox
                </h2>
              </div>
              <p className="text-sm text-[#64748B] font-medium leading-relaxed">
                Preloaded evaluation environment featuring sample profiles (<span className="text-[#0F172A] font-bold">Ramesh Kumar, Anita Sharma, Dr. Arjun Mehta</span>) for instant testing.
              </p>
            </div>

            <button
              onClick={onSelectDemo}
              className="w-full py-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Enter Demo Sandbox</span>
            </button>
          </div>
        </div>
      </main>

      {/* Simple Clean Medical Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-[#0F172A]">
            स्मृतिसेतु (SMRITISETU) • MDoNER PS 26003
          </div>
          <div>
            Dementia Care & Cognitive Assessment Solution
          </div>
        </div>
      </footer>
    </div>
  );
};
