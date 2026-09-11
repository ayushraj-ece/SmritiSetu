import React, { useState, useEffect } from 'react';
import { Mic, MicOff, ShieldAlert, Sparkles, Volume2, Save } from 'lucide-react';
import { toneMonitorService, type VocalToneMetrics } from '../../services/toneMonitorService';
import { dataService } from '../../services/dataService';

interface Props {
  patientId?: string;
  showSaveButton?: boolean;
}

export const ToneMonitorWidget: React.FC<Props> = ({ patientId = 'MC-DEMO-001', showSaveButton = true }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<VocalToneMetrics>({
    calmScore: 85,
    stressScore: 15,
    confidenceScore: 90,
    pitchHz: 160,
    decibels: 54,
    timestamp: 'Just now'
  });

  const [waveformData, setWaveformData] = useState<number[]>(new Array(16).fill(10));
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  useEffect(() => {
    const unsubscribe = toneMonitorService.subscribe((newMetrics, rawWaveform) => {
      setMetrics(newMetrics);
      // Downsample 128 frequency bins to 16 visual bars
      const bars: number[] = [];
      const step = Math.floor(rawWaveform.length / 16);
      for (let i = 0; i < 16; i++) {
        bars.push(rawWaveform[i * step] || 10);
      }
      setWaveformData(bars);
    });

    return () => {
      unsubscribe();
      toneMonitorService.stopListening();
    };
  }, []);

  const toggleMic = async () => {
    if (isListening) {
      toneMonitorService.stopListening();
      setIsListening(false);
    } else {
      const started = await toneMonitorService.startListening();
      setIsListening(started);
    }
  };

  const handleSaveSnapshot = () => {
    dataService.saveVocalToneLog({
      id: `tone-${Date.now()}`,
      patientId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calmScore: metrics.calmScore,
      stressScore: metrics.stressScore,
      confidenceScore: metrics.confidenceScore,
      pitchHz: metrics.pitchHz,
      decibels: metrics.decibels,
      caregiverAlert: metrics.stressScore > 35
    });

    setSaveSuccessMsg('Acoustic Tone Log recorded successfully.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD3] p-6 space-y-6 shadow-xs font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2DDD3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2B352B] border border-[#C5A059] text-[#FAF8F5] flex items-center justify-center font-serif text-lg font-bold">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-[#1C1F24]">Real-Time Vocal Tone Monitor</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#FAF0D9] text-[#7A612D] border border-[#D4B46E] uppercase">
                Acoustic AI
              </span>
            </div>
            <p className="text-xs text-[#555A62] font-mono">Microphone frequency analysis & emotional resonance index</p>
          </div>
        </div>

        <button
          onClick={toggleMic}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
            isListening
              ? 'bg-[#8B0000] text-white border-[#8B0000] animate-pulse'
              : 'bg-[#2B352B] text-[#FAF8F5] border-[#C5A059] hover:bg-[#1E251E]'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#C5A059]" />}
          <span>{isListening ? 'Stop Mic Analysis' : 'Start Mic Monitor'}</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-[#EBF0EB] border border-[#B8CBB8] text-[#2B352B] text-xs font-semibold font-mono">
          ✓ {saveSuccessMsg}
        </div>
      )}

      {/* Live Animated Audio Waveform */}
      <div className="bg-white border border-[#E2DDD3] p-4 flex flex-col items-center justify-center gap-2 min-h-[100px]">
        <div className="flex items-end justify-center gap-1.5 h-16 w-full px-4">
          {waveformData.map((val, idx) => {
            const normalizedHeight = Math.max(8, Math.min(60, (val / 255) * 60));
            return (
              <div
                key={idx}
                className="w-2.5 bg-[#9E7F40] transition-all duration-75 rounded-t-xs"
                style={{
                  height: `${isListening ? normalizedHeight : 10}px`,
                  opacity: isListening ? 0.6 + (val / 255) * 0.4 : 0.3
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#555A62]">
          <Volume2 className="w-3.5 h-3.5 text-[#9E7F40]" />
          <span>{isListening ? `Live Input • ${metrics.decibels} dB • ${metrics.pitchHz} Hz` : 'Microphone idle — click Start Mic Monitor'}</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Calm Index */}
        <div className="bg-white border border-[#E2DDD3] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#555A62] font-mono">
            <span>Calm Resonance</span>
            <span className="text-[#2B352B] font-bold">🎯 Target &gt; 75%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#2B352B]">{metrics.calmScore}%</span>
            <span className="text-xs text-[#4A5B4A] font-semibold font-mono">
              {metrics.calmScore >= 75 ? 'Serene Cadence' : 'Mild Hesitation'}
            </span>
          </div>
          <div className="w-full bg-[#FAF7F0] h-2 border border-[#E2DDD3]">
            <div className="bg-[#2B352B] h-full transition-all duration-300" style={{ width: `${metrics.calmScore}%` }} />
          </div>
        </div>

        {/* Acoustic Stress Index */}
        <div className="bg-white border border-[#E2DDD3] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#555A62] font-mono">
            <span>Acoustic Stress</span>
            <span className="text-[#7A612D] font-bold">Jitter Variance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-serif text-3xl font-bold ${metrics.stressScore > 35 ? 'text-[#8B0000]' : 'text-[#9E7F40]'}`}>
              {metrics.stressScore}%
            </span>
            <span className="text-xs text-[#555A62] font-mono">
              {metrics.stressScore > 35 ? 'High Tremor' : 'Normal Pitch'}
            </span>
          </div>
          <div className="w-full bg-[#FAF7F0] h-2 border border-[#E2DDD3]">
            <div
              className={`h-full transition-all duration-300 ${metrics.stressScore > 35 ? 'bg-[#8B0000]' : 'bg-[#9E7F40]'}`}
              style={{ width: `${metrics.stressScore}%` }}
            />
          </div>
        </div>

        {/* Vocal Confidence */}
        <div className="bg-white border border-[#E2DDD3] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#555A62] font-mono">
            <span>Vocal Projection</span>
            <span className="text-[#1C1F24] font-bold">Clarity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#1C1F24]">{metrics.confidenceScore}%</span>
            <span className="text-xs text-[#555A62] font-mono">Audible Volume</span>
          </div>
          <div className="w-full bg-[#FAF7F0] h-2 border border-[#E2DDD3]">
            <div className="bg-[#1C1F24] h-full transition-all duration-300" style={{ width: `${metrics.confidenceScore}%` }} />
          </div>
        </div>
      </div>

      {/* Clinical Guidance / Caregiver Alert Banner */}
      {metrics.stressScore > 35 ? (
        <div className="p-3 bg-[#FAF0D9] border border-[#D4B46E] flex items-start gap-3 text-xs text-[#7A612D]">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#7A612D] mt-0.5" />
          <div>
            <p className="font-bold">Acoustic Distress Alert</p>
            <p>Elevated voice tremor and pitch variation detected. Offer a soothing memory exercise or calm tea break.</p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#FAF7F0] border border-[#E2DDD3] flex items-center justify-between gap-4 text-xs text-[#555A62]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9E7F40]" />
            <span>Vocal resonance is stable. Speech pattern reflects steady cognitive comfort.</span>
          </div>
          {showSaveButton && (
            <button
              onClick={handleSaveSnapshot}
              className="px-3 py-1.5 bg-white border border-[#C5A059] hover:bg-[#FAF7F0] text-[#1C1F24] font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#9E7F40]" />
              <span>Log Snapshot</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
