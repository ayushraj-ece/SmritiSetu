import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { dataService } from '../../services/dataService';
import { offlineStorage } from '../../services/offlineStorage';
import { adaptiveEngine } from '../../ai/adaptiveEngine';
import { pdfReportService } from '../../services/pdfReportService';
import type { PatientProfile, GameResult, PatientReminder, AdaptiveEvaluation } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { 
  Search, 
  FileText, 
  Brain, 
  Sparkles, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {}

export const DoctorDashboard: React.FC<Props> = () => {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState<string>('ASM58291');
  const [activePatient, setActivePatient] = useState<PatientProfile | null>(null);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [reminders, setReminders] = useState<PatientReminder[]>([]);
  const [evaluations, setEvaluations] = useState<AdaptiveEvaluation[]>([]);
  const [searched, setSearched] = useState<boolean>(true);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toUpperCase();

    const patient = await dataService.searchPatientById(query);
    setActivePatient(patient);
    setSearched(true);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    if (!activePatient) return;

    const unsubResults = dataService.subscribeGameResults(activePatient.patientId, (data) => {
      setGameResults(data);
    });

    const unsubReminders = dataService.subscribeReminders(activePatient.patientId, (data) => {
      setReminders(data);
    });

    setEvaluations(offlineStorage.getEvaluations(activePatient.patientId));

    return () => {
      unsubResults();
      unsubReminders();
    };
  }, [activePatient]);

  // Compute Domain Scores dynamically using AI ML Engine
  const cognitiveIndices = adaptiveEngine.calculateCognitiveIndices(gameResults);

  const domainData = [
    { domain: 'Memory (MRI)', score: cognitiveIndices.mri },
    { domain: 'Attention (APSI)', score: cognitiveIndices.apsi },
    { domain: 'Pattern (PRE)', score: cognitiveIndices.pre },
    { domain: 'Routine (ERA)', score: cognitiveIndices.era }
  ];

  // Calculate Real 7-Day Performance Trend from live gameResults
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trendData = daysOfWeek.map((dayName, dayIdx) => {
    const dayResults = gameResults.filter(r => {
      const d = new Date(r.timestamp);
      return d.getDay() === dayIdx;
    });

    let avgScore = 75; // Baseline if no trials on that weekday yet
    if (dayResults.length > 0) {
      avgScore = Math.round(dayResults.reduce((sum, r) => sum + r.score, 0) / dayResults.length);
    }
    return { day: dayName, score: avgScore };
  });

  const handleDownloadPDF = () => {
    if (!activePatient) return;
    pdfReportService.generatePatientReport({
      patient: activePatient,
      gameResults,
      reminders,
      evaluations
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 text-[#0F172A] font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
            {t('doctorDashboardTitle')}
          </span>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">
            Doctor Clinical Analytics Portal
          </h1>
          <p className="text-xs text-[#64748B] font-medium max-w-xl">
            Search patient records by Patient ID, view real-time cognitive domain trends, and generate clinical progress reports.
          </p>
        </div>

        {activePatient && (
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold px-5 py-3.5 rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>{t('generatePdfReport')}</span>
          </button>
        )}
      </div>

      {/* Patient Search Box */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#94A3B8] absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] font-bold rounded-xl focus:border-[#0284C7] outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
          >
            Search Patient
          </button>
        </form>
      </div>

      {/* Search Result View */}
      {searched && activePatient ? (
        <div className="space-y-8">
          {/* Patient Info Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0">
                👴
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-[#0F172A]">{activePatient.name}</h2>
                  <span className="bg-[#F0F9FF] text-[#0284C7] font-mono font-bold px-3 py-1 text-xs rounded-full border border-[#BAE6FD]">
                    {activePatient.patientId}
                  </span>
                </div>
                <p className="text-[#64748B] text-xs font-medium">
                  {activePatient.age} Years • {activePatient.gender} • State: <span className="font-bold text-[#0F172A]">{activePatient.state}</span>
                </p>
                <p className="text-xs font-medium text-[#64748B]">
                  Preferred Language: <span className="font-bold text-[#0284C7]">{activePatient.preferredLanguage.toUpperCase()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">Monitoring Telemetry</span>
                <span className="text-[#0284C7] font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7]" /> Live Firestore Sync
                </span>
              </div>
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Domain Scores Bar Chart */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3">
                <Brain className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  ML AI Cognitive Indices (%)
                </h3>
              </div>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainData}>
                    <XAxis dataKey="domain" stroke="#64748B" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#BAE6FD', borderRadius: '12px', color: '#0F172A' }} />
                    <Bar dataKey="score" fill="#0284C7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 7-Day Performance Trend Line Chart */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3">
                <Sparkles className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  7-Day Historical Score Trend (Live)
                </h3>
              </div>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#BAE6FD', borderRadius: '12px', color: '#0F172A' }} />
                    <Line type="monotone" dataKey="score" stroke="#0284C7" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Logs Audit Trail */}
          <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3">
              <Sparkles className="w-5 h-5 text-[#0284C7]" />
              <h3 className="text-lg font-extrabold text-[#0F172A]">
                ML AI Difficulty Progression Trail
              </h3>
            </div>
            {evaluations.length === 0 ? (
              <p className="text-[#94A3B8] font-mono text-xs">No adaptive evaluation logs stored yet.</p>
            ) : (
              <div className="space-y-3">
                {evaluations.slice(0, 4).map((ev, idx) => (
                  <div key={idx} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-[#0F172A]">
                      <span>{ev.gameCategory.toUpperCase()} (Level {ev.previousLevel} ➔ Level {ev.newLevel})</span>
                      <span className="text-[#64748B]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[#64748B] font-medium">{ev.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center border-2 border-dashed border-[#E2E8F0] rounded-2xl space-y-3">
          <AlertCircle className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h3 className="text-2xl font-bold text-[#0F172A]">{t('patientNotFound')}</h3>
          <p className="text-[#64748B] text-sm font-medium">
            Search for registered Patient ID (e.g. <code className="bg-[#F0F9FF] border border-[#BAE6FD] px-2.5 py-1 text-[#0284C7] font-bold rounded-lg">ASM58291</code>).
          </p>
        </div>
      )}
    </div>
  );
};
