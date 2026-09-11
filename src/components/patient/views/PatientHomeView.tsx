import { 
  Brain, 
  CalendarCheck, 
  Image as ImageIcon, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Pill, 
  Droplet, 
  Sprout,
  Sun,
  Sunset,
  Moon,
  Flame,
  ArrowRight,
  User,
  Footprints,
  Bell
} from 'lucide-react';
import { SoftActionTile } from '../ui/SoftActionTile';
import type { PatientReminder, GameResult, PatientProfile } from '../../../types';
import heroLandscapeImg from '../../../assets/hero_landscape.jpg';
import { adaptiveEngine } from '../../../ai/adaptiveEngine';
import { calculateStreakDays } from '../../../utils/streakCalculator';

interface Props {
  patientProfile: PatientProfile;
  reminders: PatientReminder[];
  gameResults: GameResult[];
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onNavigate: (view: 'games' | 'game_detail' | 'reminders' | 'add_reminder' | 'more' | 'profile' | 'memories' | 'progress') => void;
  onToggleReminder: (id: string, completed: boolean) => void;
  onOpenVoice: () => void;
}

export const PatientHomeView: React.FC<Props> = ({
  patientProfile,
  reminders,
  gameResults,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onNavigate,
  onToggleReminder,
  onOpenVoice
}) => {
  // Time-based greeting helper
  const getGreetingData = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return { text: 'Good Morning,', label: 'Good Morning', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> };
    } else if (hours >= 12 && hours < 17) {
      return { text: 'Good Afternoon,', label: 'Good Afternoon', icon: <Sunset className="w-3.5 h-3.5 text-amber-500" /> };
    } else {
      return { text: 'Good Evening,', label: 'Good Evening', icon: <Moon className="w-3.5 h-3.5 text-indigo-500" /> };
    }
  };

  const greetingData = getGreetingData();

  // Extract first name (e.g. "Ramesh" or "Dadi")
  const firstName = patientProfile.name ? patientProfile.name.split(' ')[0] : 'Friend';

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const completedCount = reminders.filter(r => r.completed).length;
  const totalReminders = reminders.length;
  const playedGamesCount = gameResults.length;
  const targetGames = 7;
  
  // Real 4-Domain Overall Cognitive Score & Consecutive Active Days Streak
  const indices = adaptiveEngine.calculateCognitiveIndices(gameResults);
  const overallCognitiveScore = Math.round((indices.mri + indices.apsi + indices.pre + indices.era) / 4);
  const streakCount = calculateStreakDays(gameResults, reminders);

  const todayReminders = reminders.slice(0, 3);

  return (
    <div className="relative w-full pb-28 animate-in fade-in duration-300 overflow-x-hidden bg-white">
      
      {/* Full-bleed Top Landscape Background (Fades into pure white) */}
      <div className="absolute top-0 left-0 right-0 w-full h-[360px] sm:h-[420px] md:h-[480px] z-0 overflow-hidden pointer-events-none">
        <img 
          src={heroLandscapeImg} 
          alt="Scenic Mountain Background" 
          className="w-full h-full object-cover object-top opacity-95"
        />
        {/* Gradient transition into clean white background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent via-50% to-white" />
      </div>

      {/* Main Content Layer (Z-10) */}
      <div className="relative z-10 max-w-xl md:max-w-2xl mx-auto space-y-7 px-4 sm:px-6 pt-4">
        
        {/* Top Header & Dynamic Greeting */}
        <div className="flex items-start justify-between pt-2">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-slate-700 drop-shadow-2xs">
              {greetingData.text}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight drop-shadow-2xs">
              {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
              A healthier mind for brighter tomorrows
            </p>
          </div>

          {/* Right Top Header Actions: Notification Bell + Profile */}
          <div className="flex items-center gap-2.5 mt-1">
            <button
              onClick={onOpenNotifications}
              className="relative w-11 h-11 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:ring-2 hover:ring-[#0284C7] transition-all cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="w-11 h-11 rounded-full bg-white/90 border border-white/80 shadow-sm flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer shrink-0"
              title="Open Profile"
            >
              <User className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Cursive Green Handwritten Callout Text over Upper Sky */}
        <div className="flex justify-end pr-2 pt-2 pb-4 select-none">
          <p className="font-script text-2xl sm:text-3xl font-bold text-[#1E7F53] leading-tight rotate-[-4deg] drop-shadow-2xs text-right">
            You<br />
            are doing<br />
            great! <span className="font-sans text-lg">💚</span>
          </p>
        </div>

        {/* Inspirational Quote Card (Clean, borderless soft surface) */}
        <div 
          onClick={() => onNavigate('games')}
          className="bg-[#F8FAFC] rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#1E7F53] flex items-center justify-center shrink-0">
              <Sprout className="w-5.5 h-5.5 text-[#1E7F53]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                "A calm mind brings happiness to every day."
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">
                – Keep going!
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white group-hover:bg-emerald-50 flex items-center justify-center text-slate-400 group-hover:text-[#1E7F53] transition-colors shrink-0 shadow-2xs">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4 Soft Action Activity Tiles Grid (2x2) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          <SoftActionTile
            variant="blue"
            icon={<Brain className="w-7 h-7" />}
            title="Play Games"
            subtitle="Keep your mind active"
            onClick={() => onNavigate('games')}
          />
          <SoftActionTile
            variant="green"
            icon={<CalendarCheck className="w-7 h-7" />}
            title="Daily Reminders"
            subtitle="Medicines, meals & more"
            onClick={() => onNavigate('reminders')}
          />
          <SoftActionTile
            variant="peach"
            icon={<ImageIcon className="w-7 h-7" />}
            title="Photo Memories"
            subtitle="Relive your moments"
            onClick={() => onNavigate('memories')}
          />
          <SoftActionTile
            variant="purple"
            icon={<MessageSquare className="w-7 h-7" />}
            title="Talk to Me"
            subtitle="Voice support in your language"
            onClick={onOpenVoice}
          />
        </div>

        {/* Section: Today's Plan (Clean, borderless layout directly on white page) */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Today's Plan
              </h2>
              <p className="text-xs text-slate-400 font-medium pt-0.5">{todayStr}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF8E7] text-[#8C6D1F] text-xs font-bold rounded-full border border-[#FDE68A]/60">
              {greetingData.icon} <span>{greetingData.label}</span>
            </span>
          </div>

          {/* Clean Reminders List */}
          <div className="divide-y divide-slate-100">
            {todayReminders.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">
                No reminders scheduled for today.
              </p>
            ) : (
              todayReminders.map((rem) => (
                <div
                  key={rem.id}
                  onClick={() => onToggleReminder(rem.id, !rem.completed)}
                  className="flex items-center justify-between py-3.5 cursor-pointer group hover:bg-slate-50/60 px-1 transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      rem.type === 'medicine' ? 'bg-[#FFEBEB] text-[#EF4444]' :
                      rem.type === 'hydration' ? 'bg-[#EBF5FF] text-[#3B82F6]' :
                      'bg-[#EBFBF0] text-[#10B981]'
                    }`}>
                      {rem.type === 'medicine' ? <Pill className="w-5 h-5" /> :
                       rem.type === 'hydration' ? <Droplet className="w-5 h-5" /> :
                       <Footprints className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold ${rem.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {rem.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium pt-0.5">{rem.time}</p>
                    </div>
                  </div>

                  {rem.completed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 fill-current text-white" />
                    </div>
                  ) : (
                    <Circle className="w-5.5 h-5.5 text-slate-300 group-hover:text-emerald-400 shrink-0 transition-colors stroke-[1.5]" />
                  )}
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigate('reminders')}
            className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-[#1E7F53] flex items-center justify-center gap-1 transition-all cursor-pointer border-t border-slate-100 pt-3"
          >
            <span>View All Reminders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Section: Mind Games Banner (Soft pastel green accent block) */}
        <div className="bg-[#EFFBF2] p-6 rounded-3xl flex items-center justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">
              Mind Games
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-[190px]">
              Fun activities to keep your brain active
            </p>
            <button
              onClick={() => onNavigate('games')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E7F53] hover:bg-[#146743] text-white text-xs font-extrabold rounded-full shadow-2xs transition-all cursor-pointer mt-1"
            >
              <span>Start Playing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Brain Artwork Box */}
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-2xs shrink-0">
            🧠
          </div>
        </div>

        {/* Section: Your Progress (Redesigned SmritiSetu Emerald Card) */}
        <div className="bg-gradient-to-br from-[#F0FDF4] via-white to-[#ECFDF5] border border-[#DCFCE7] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#1E7F53] uppercase tracking-widest block">
                COGNITIVE PROFILE
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Your Progress
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('progress')}
              className="text-xs font-bold text-[#1E7F53] hover:text-[#146743] hover:underline flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-2xs transition-all"
            >
              <span>See Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-5 pt-1">
            {/* Progress Ring displaying 4-Domain Overall Cognitive Score */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-100/60"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#1E7F53] transition-all duration-1000 ease-out"
                  strokeDasharray={`${overallCognitiveScore}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-900 block leading-none">{overallCognitiveScore}%</span>
                <span className="text-[10px] text-[#1E7F53] font-extrabold block mt-0.5">Overall</span>
              </div>
            </div>

            {/* Metrics List */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs font-semibold bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Brain className="w-3.5 h-3.5" />
                  </span>
                  Games Played
                </span>
                <span className="text-slate-900 font-extrabold">{playedGamesCount} / {targetGames}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  Reminders Done
                </span>
                <span className="text-slate-900 font-extrabold">{completedCount} / {totalReminders}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                  </span>
                  Daily Streak
                </span>
                <span className="text-amber-600 font-extrabold">{streakCount} {streakCount === 1 ? 'Day' : 'Days'} 🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Moments from Your Day (Borderless, clean layout) */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Moments from Your Day
            </h2>
            <button 
              onClick={() => onNavigate('memories')}
              className="text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity">
              <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=300&q=80" alt="Moment 1" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity">
              <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80" alt="Moment 2" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" alt="Moment 3" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity">
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80" alt="Moment 4" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
