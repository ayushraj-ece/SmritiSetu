import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import type { PatientProfile, GameResult, PatientReminder } from '../../../types';
import { adaptiveEngine } from '../../../ai/adaptiveEngine';

interface Props {
  patient?: PatientProfile | null;
  patientName?: string;
  patientId?: string;
  gameResults?: GameResult[];
  reminders?: PatientReminder[];
  isOpen: boolean;
  onClose: () => void;
}

export const CaregiverReportModal: React.FC<Props> = ({
  patient,
  patientName: propPatientName,
  patientId: propPatientId,
  gameResults = [],
  reminders = [],
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const displayName = propPatientName || patient?.name || 'Patient';
  const displayId = propPatientId || patient?.patientId || 'ASM58291';
  const patientState = patient?.state || 'Assam, India';
  const patientAge = patient?.age || 72;

  // Sort game results chronologically (newest first)
  const sortedResults = [...gameResults].sort((a, b) => b.timestamp - a.timestamp);

  // Compute domain indices using adaptive engine
  const indices = adaptiveEngine.calculateCognitiveIndices(gameResults);
  
  // Calculate overall average score & response speed
  const avgAccuracy = gameResults.length > 0
    ? Math.round(gameResults.reduce((acc, g) => acc + (g.accuracyPercentage ?? g.score ?? 0), 0) / gameResults.length)
    : 0;

  const avgResponseSpeed = gameResults.length > 0
    ? (gameResults.reduce((acc, g) => acc + (g.responseTimeSeconds || 3), 0) / gameResults.length).toFixed(1)
    : '0.0';

  const validDomainScores = [indices.mri, indices.apsi, indices.pre, indices.era].filter(s => s > 0);
  const overallScore = validDomainScores.length > 0
    ? Math.round(validDomainScores.reduce((a, b) => a + b, 0) / validDomainScores.length)
    : avgAccuracy;

  // Medication compliance rate
  const completedReminders = reminders.filter(r => r.completed).length;
  const totalReminders = reminders.length;
  const medComplianceRate = totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 100;

  // Helper for domain status text
  const getDomainStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good Progress';
    if (score > 0) return 'Needs Practice';
    return 'Not Evaluated Yet';
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col w-screen h-screen overflow-hidden animate-in fade-in">
      
      {/* Top Header bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Portal</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          Cognitive & Health Assessment Report
        </span>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>Print Report</span>
        </button>
      </header>

      {/* Clean Document Canvas */}
      <div className="flex-1 bg-white overflow-y-auto antialiased font-sans text-slate-800">
        <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8">

          {/* Title & Detailed Metadata */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <h1 className="text-xl font-normal text-slate-900">
                Patient Progress Report
              </h1>
              <span className="text-xs text-slate-400">{todayStr}</span>
            </div>
            <p className="text-xs text-slate-500">
              Patient Name: <span className="text-slate-900">{displayName}</span> • Code: <span className="font-mono text-slate-900">{displayId}</span> • Age {patientAge} • {patientState}
            </p>
          </div>

          {/* 5-Metric Summary Row (Borderless, Minimal Theme) */}
          <div className="py-4 border-y border-slate-100 grid grid-cols-5 gap-3 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Overall Index</span>
              <span className="text-base text-slate-900 block mt-0.5">{overallScore}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Composite</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Tests Played</span>
              <span className="text-base text-slate-900 block mt-0.5">{gameResults.length}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Evaluations</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Avg Accuracy</span>
              <span className="text-base text-slate-900 block mt-0.5">{avgAccuracy}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Accuracy</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Reaction Time</span>
              <span className="text-base text-slate-900 block mt-0.5">{avgResponseSpeed}s</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Avg Speed</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Meds Adherence</span>
              <span className="text-base text-slate-900 block mt-0.5">{medComplianceRate}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{completedReminders}/{totalReminders} Taken</span>
            </div>
          </div>

          {/* Cognitive Domain Scores & Detailed Statuses */}
          <div className="space-y-3">
            <h2 className="text-xs text-slate-400 uppercase tracking-wider">
              Cognitive Domain Breakdown
            </h2>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
              {/* Memory */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Memory & Recall (MRI)</span>
                  <span>{indices.mri}% <span className="text-slate-400 text-[11px]">({getDomainStatus(indices.mri)})</span></span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-800 h-full rounded-full" style={{ width: `${indices.mri}%` }} />
                </div>
              </div>

              {/* Focus */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Focus & Attention (APSI)</span>
                  <span>{indices.apsi}% <span className="text-slate-400 text-[11px]">({getDomainStatus(indices.apsi)})</span></span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-slate-800 h-full rounded-full" style={{ width: `${indices.apsi}%` }} />
                </div>
              </div>

              {/* Pattern */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Pattern Recognition (PRE)</span>
                  <span>{indices.pre}% <span className="text-slate-400 text-[11px]">({getDomainStatus(indices.pre)})</span></span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-slate-800 h-full rounded-full" style={{ width: `${indices.pre}%` }} />
                </div>
              </div>

              {/* Routine */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Daily Routines (ERA)</span>
                  <span>{indices.era}% <span className="text-slate-400 text-[11px]">({getDomainStatus(indices.era)})</span></span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-slate-800 h-full rounded-full" style={{ width: `${indices.era}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Medication & Care Reminders Status */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs text-slate-400 uppercase tracking-wider">
              Medication & Care Discipline ({completedReminders}/{totalReminders} Completed)
            </h2>

            {reminders.length === 0 ? (
              <p className="text-xs text-slate-400 py-1">
                No active medication alarms set yet for this patient.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {reminders.map((rem) => (
                  <div key={rem.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="text-slate-800 block font-medium">
                        {rem.title}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Scheduled Time: {rem.time || 'Daily'}
                      </span>
                    </div>

                    <div>
                      <span className={`text-[11px] ${rem.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                        {rem.completed ? '✓ Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Evaluation History Timeline */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs text-slate-400 uppercase tracking-wider">
              Cognitive Evaluations History ({sortedResults.length} Sessions)
            </h2>

            {sortedResults.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No evaluation tests recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {sortedResults.map((result, idx) => {
                  const score = result.accuracyPercentage ?? result.score ?? 0;
                  const dateStr = new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(result.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  const categoryName = result.gameCategory ? result.gameCategory.charAt(0).toUpperCase() + result.gameCategory.slice(1) : 'Cognitive';

                  return (
                    <div key={result.id || idx} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 block capitalize">
                          {categoryName} Evaluation Session #{sortedResults.length - idx}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Recorded: {dateStr}
                        </span>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="text-slate-900 block">
                          {score}% Accuracy
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {result.responseTimeSeconds || 3.2}s reaction speed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adaptive AI Clinical Recommendation Note */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 leading-relaxed">
            <h2 className="text-xs text-slate-400 uppercase tracking-wider">
              Caregiver Insight Summary
            </h2>
            <p>
              Patient {displayName} (Code: {displayId}) has completed {gameResults.length} test sessions with an average accuracy of {avgAccuracy}% and an average response time of {avgResponseSpeed} seconds. Medication compliance stands at {medComplianceRate}%.
            </p>
            <p className="text-[11px] text-slate-500">
              {indices.mri < 60 
                ? 'Recommendation: Memory exercises show opportunity for improvement. Encourage daily 5-minute personal photo memory sessions.' 
                : 'Recommendation: Cognitive baseline is healthy and steady. Continue maintaining regular daily routine practice.'}
            </p>
          </div>

          {/* Minimal Medical Record Footer */}
          <footer className="pt-6 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
            <span>Smritisetu Clinical Record • Patient ID: {displayId}</span>
            <span>Generated: {new Date().toLocaleTimeString()}</span>
          </footer>

        </div>
      </div>
    </div>
  );
};






