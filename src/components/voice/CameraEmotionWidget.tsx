import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, ShieldAlert, Sparkles, Eye } from 'lucide-react';
import { cameraMonitorService, type FacialEmotionMetrics, type EmotionState } from '../../services/cameraMonitorService';

interface Props {
  patientId?: string;
}

export const CameraEmotionWidget: React.FC<Props> = ({ patientId: _patientId = 'MC-DEMO-001' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<FacialEmotionMetrics>({
    state: 'calm',
    confidence: 88,
    facialTension: 12,
    smileScore: 72,
    motionLevel: 14,
    timestamp: 'Just now'
  });

  useEffect(() => {
    const unsubscribe = cameraMonitorService.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
      cameraMonitorService.stopCamera();
    };
  }, []);

  const toggleCamera = async () => {
    if (isActive) {
      cameraMonitorService.stopCamera();
      setIsActive(false);
    } else {
      if (videoRef.current) {
        const started = await cameraMonitorService.startCamera(videoRef.current);
        setIsActive(started);
      }
    }
  };

  const getEmotionBadge = (state: EmotionState) => {
    switch (state) {
      case 'distressed':
        return {
          label: '🔴 Distressed / Anxious',
          bg: 'bg-[#8B0000] text-white border-[#8B0000]',
          desc: 'High muscle tension & erratic head motion detected'
        };
      case 'happy':
        return {
          label: '🔵 Happy / Smiling',
          bg: 'bg-[#EBF0EB] text-[#2B352B] border-[#B8CBB8]',
          desc: 'Positive facial alignment & high smile resonance'
        };
      case 'calm':
        return {
          label: '🟢 Calm / Serene',
          bg: 'bg-[#FAF0D9] text-[#7A612D] border-[#D4B46E]',
          desc: 'Relaxed facial cadence & steady posture'
        };
      case 'neutral':
      default:
        return {
          label: '🟡 Neutral / Attentive',
          bg: 'bg-[#FAF7F0] text-[#1C1F24] border-[#E2DDD3]',
          desc: 'Normal baseline cognitive focus'
        };
    }
  };

  const currentBadge = getEmotionBadge(metrics.state);

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD3] p-6 space-y-6 shadow-xs font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2DDD3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2B352B] border border-[#C5A059] text-[#FAF8F5] flex items-center justify-center font-serif text-lg font-bold">
            📷
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-[#1C1F24]">Facial Emotion & Distress Monitor</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#FAF0D9] text-[#7A612D] border border-[#D4B46E] uppercase">
                Vision AI
              </span>
            </div>
            <p className="text-xs text-[#555A62] font-mono">Camera frame luminance & facial muscle tension classifier</p>
          </div>
        </div>

        <button
          onClick={toggleCamera}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
            isActive
              ? 'bg-[#8B0000] text-white border-[#8B0000] animate-pulse'
              : 'bg-[#2B352B] text-[#FAF8F5] border-[#C5A059] hover:bg-[#1E251E]'
          }`}
        >
          {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4 text-[#C5A059]" />}
          <span>{isActive ? 'Stop Camera Feed' : 'Start Camera Monitor'}</span>
        </button>
      </div>

      {/* Live Video Preview & Emotion Badge Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Video Box */}
        <div className="relative bg-[#1C1F24] border-2 border-[#C5A059] overflow-hidden aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
          />

          {!isActive && (
            <div className="text-center p-6 space-y-2 text-[#7E786D]">
              <Eye className="w-8 h-8 mx-auto text-[#C5A059] opacity-70" />
              <p className="font-serif text-base text-[#FAF8F5] font-bold">Camera Feed Offline</p>
              <p className="text-xs font-mono">Click "Start Camera Monitor" to enable live emotion monitoring.</p>
            </div>
          )}

          {isActive && (
            <div className="absolute top-3 left-3 bg-[#1C1F24]/90 text-[#FAF8F5] text-[10px] font-mono font-bold px-2.5 py-1 border border-[#C5A059] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE VISION TRACKING • {metrics.timestamp}</span>
            </div>
          )}
        </div>

        {/* Emotion Metrics Side Box */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#555A62] uppercase tracking-wider block">Detected Facial Affect State</span>
            <div className={`p-4 border font-serif text-2xl font-bold ${currentBadge.bg} flex items-center justify-between`}>
              <span>{currentBadge.label}</span>
              <span className="text-xs font-mono font-semibold">{metrics.confidence}% Conf.</span>
            </div>
            <p className="text-xs text-[#555A62] font-mono pt-1">{currentBadge.desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white border border-[#E2DDD3] p-3 space-y-1">
              <span className="text-[11px] font-mono text-[#555A62]">Facial Tension</span>
              <div className="font-serif text-2xl font-bold text-[#1C1F24]">{metrics.facialTension}%</div>
              <div className="w-full bg-[#FAF7F0] h-1.5 border border-[#E2DDD3]">
                <div className="bg-[#9E7F40] h-full" style={{ width: `${metrics.facialTension}%` }} />
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD3] p-3 space-y-1">
              <span className="text-[11px] font-mono text-[#555A62]">Smile Resonance</span>
              <div className="font-serif text-2xl font-bold text-[#2B352B]">{metrics.smileScore}%</div>
              <div className="w-full bg-[#FAF7F0] h-1.5 border border-[#E2DDD3]">
                <div className="bg-[#2B352B] h-full" style={{ width: `${metrics.smileScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Banner */}
      {metrics.state === 'distressed' ? (
        <div className="p-4 bg-[#8B0000] text-white border border-[#8B0000] flex items-start gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-300 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Patient Facial Distress Flagged</p>
            <p>Camera analysis indicates muscle strain and rapid posture shifts. Caregiver should check on patient comfort and offer a soothing voice story from Memory Lane.</p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#FAF7F0] border border-[#E2DDD3] flex items-center justify-between text-xs text-[#555A62]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9E7F40]" />
            <span>Facial alignment reflects calm cognitive engagement. No physical distress detected.</span>
          </div>
        </div>
      )}
    </div>
  );
};
