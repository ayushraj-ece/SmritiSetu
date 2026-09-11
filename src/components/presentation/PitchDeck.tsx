import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  Brain,
  ShieldCheck,
  Zap,
  Activity,
  Globe,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Smartphone,
  Info
} from 'lucide-react';

interface PitchDeckProps {
  onClose: () => void;
  onSelectLive: () => void;
  onSelectDemo: () => void;
}

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  speakerNotes: string;
}

export const PitchDeck: React.FC<PitchDeckProps> = ({ onClose, onSelectLive, onSelectDemo }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Auto-play presentation timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const slides: Slide[] = [
    // Slide 1: Title & Executive Summary
    {
      id: 1,
      badge: "SIH 2026 • PS 26003 • MDoNER",
      title: "स्मृतिसेतु (SMRITISETU) Digital Health Platform",
      subtitle: "Cognitive Care & Memory Assistance Continuum for Elderly Patients in North Eastern Region (NER)",
      icon: <Brain className="w-6 h-6 text-[#9E7F40]" />,
      speakerNotes: "Good morning judges. We present स्मृतिसेतु (SMRITISETU), a dignified public-sector digital health platform designed specifically for elderly dementia care in the North Eastern Region of India. It combines ML cognitive scoring, voice accessibility in regional languages, real-time caregiver oversight, and clinical PDF reports.",
      content: (
        <div className="space-y-8 my-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 rounded-none space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-[#2B352B] text-[#FAF8F5] flex items-center justify-center font-bold font-serif text-xl border border-[#C5A059]">
                🎯
              </div>
              <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Core Mission</h4>
              <p className="text-sm text-[#555A62] font-sans">
                Early cognitive assessment and gamified memory preservation tailored to elderly neuro-decline patients across 8 NER states.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 rounded-none space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-[#FAF0D9] text-[#7A612D] flex items-center justify-center font-bold font-serif text-xl border border-[#D4B46E]">
                🤖
              </div>
              <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Real ML Adaptivity</h4>
              <p className="text-sm text-[#555A62] font-sans">
                No scaffolded mock scores. Real reaction time tracking (SF), composite index calculation (CPI), and sigmoidal difficulty progression.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 rounded-none space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-[#2B352B] text-[#FAF8F5] flex items-center justify-center font-bold font-serif text-xl border border-[#C5A059]">
                🗣️
              </div>
              <h4 className="font-serif font-bold text-[#1C1F24] text-xl">NER Language Barrier</h4>
              <p className="text-sm text-[#555A62] font-sans">
                Full UI and Web Speech TTS synthesis across Assamese, Manipuri, Mizo, Khasi, Garo, Bengali, Nagamese, Nepali, and English.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <div className="bg-white border border-[#C5A059] px-5 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#7A612D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9E7F40]" />
              <span>Firebase Auth & Firestore Real-Time Telehealth</span>
            </div>
            <div className="bg-white border border-[#D8CEBE] px-5 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#1C1F24] flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#2B352B]" />
              <span>Native Android APK (4.7 MB)</span>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Problem & Clinical Necessity in NER
    {
      id: 2,
      badge: "Clinical Need & Regional Context",
      title: "The Problem in North Eastern Region",
      subtitle: "Geographic isolation, language diversity, and acute scarcity of neuro-geriatric specialists",
      icon: <Globe className="w-6 h-6 text-[#9E7F40]" />,
      speakerNotes: "Over 2.4 million elderly citizens reside across Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, and Sikkim. Language barriers and geographical terrain make conventional hospital visits challenging. Early cognitive decline goes undetected due to lack of local language clinical tools.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left my-auto">
          <div className="space-y-4">
            <div className="bg-[#FAF7F0] border-l-4 border-[#9E7F40] border-y border-r border-[#E2DDD3] p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h4 className="font-serif font-bold text-[#1C1F24] text-lg">Late Dementia Diagnosis</h4>
              </div>
              <p className="text-xs text-[#555A62] font-sans leading-relaxed">
                78% of dementia cases in rural NER are diagnosed only at moderate-to-severe stages when cognitive therapy effectiveness drops sharply.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border-l-4 border-[#7A612D] border-y border-r border-[#E2DDD3] p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌐</span>
                <h4 className="font-serif font-bold text-[#1C1F24] text-lg">Linguistic Isolation</h4>
              </div>
              <p className="text-xs text-[#555A62] font-sans leading-relaxed">
                Standard English/Hindi cognitive tests fail with non-English elderly speaking Assamese, Manipuri, Khasi, or Mizo dialects.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border-l-4 border-[#2B352B] border-y border-r border-[#E2DDD3] p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🩺</span>
                <h4 className="font-serif font-bold text-[#1C1F24] text-lg">Doctor-Patient Connectivity Gap</h4>
              </div>
              <p className="text-xs text-[#555A62] font-sans leading-relaxed">
                Caregivers need real-time Patient ID tracking (e.g. ASM58291) so doctors can remotely evaluate patient progress via longitudinal PDF metrics.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E2DDD3] p-6 space-y-6 shadow-xs">
            <h4 className="font-serif font-bold text-[#1C1F24] text-xl border-b border-[#E2DDD3] pb-3 flex items-center justify-between">
              <span>NER Target Impact</span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#7A612D] bg-[#FAF0D9] px-3 py-1 border border-[#D4B46E]">8 States</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAF7F0] p-4 border border-[#E2DDD3] text-center space-y-1">
                <p className="font-serif text-3xl font-bold text-[#1C1F24]">2.4M+</p>
                <p className="text-[10px] font-mono text-[#7E786D] uppercase tracking-wider font-semibold">Elderly Population</p>
              </div>
              <div className="bg-[#FAF7F0] p-4 border border-[#E2DDD3] text-center space-y-1">
                <p className="font-serif text-3xl font-bold text-[#9E7F40]">9</p>
                <p className="text-[10px] font-mono text-[#7E786D] uppercase tracking-wider font-semibold">Regional Languages</p>
              </div>
              <div className="bg-[#FAF7F0] p-4 border border-[#E2DDD3] text-center space-y-1">
                <p className="font-serif text-3xl font-bold text-[#2B352B]">4</p>
                <p className="text-[10px] font-mono text-[#7E786D] uppercase tracking-wider font-semibold">Cognitive Suites</p>
              </div>
              <div className="bg-[#FAF7F0] p-4 border border-[#E2DDD3] text-center space-y-1">
                <p className="font-serif text-3xl font-bold text-[#7A612D]">100%</p>
                <p className="text-[10px] font-mono text-[#7E786D] uppercase tracking-wider font-semibold">Live ML Scoring</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3: MindCare Architecture & Tech Stack
    {
      id: 3,
      badge: "Platform Architecture",
      title: "Technical Architecture & Dual-Mode System",
      subtitle: "High-performance React + TypeScript frontend connected to live Firebase & isolated SIH demo storage",
      icon: <ShieldCheck className="w-6 h-6 text-[#9E7F40]" />,
      speakerNotes: "Here is our system architecture. We built a dual-mode system: Live Mode connects directly to Firebase Firestore with unique Patient IDs and authenticated roles, while SIH Demo Mode isolates preloaded evaluation profiles (sih_demo_ namespace) so hackathon testing never corrupts live clinical data.",
      content: (
        <div className="space-y-6 my-auto text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2B352B] text-[#FAF8F5] font-serif font-bold flex items-center justify-center border border-[#C5A059]">1</div>
                <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Frontend & Voice Engine</h4>
              </div>
              <ul className="text-xs text-[#555A62] space-y-2 list-disc list-inside font-sans">
                <li>Vite + React 19 + TypeScript</li>
                <li>Tailwind CSS v4 + Lucide Icons</li>
                <li>Web Speech API for Regional Voice TTS</li>
                <li>Recharts interactive analytics charts</li>
              </ul>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2B352B] text-[#FAF8F5] font-serif font-bold flex items-center justify-center border border-[#C5A059]">2</div>
                <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Backend & Data Routing</h4>
              </div>
              <ul className="text-xs text-[#555A62] space-y-2 list-disc list-inside font-sans">
                <li>Firebase Project: <code className="text-[#9E7F40]">dimentiaapp-2f0fb</code></li>
                <li>Firestore `onSnapshot` real-time sync</li>
                <li>Dual Data Routing (`dataService.ts`)</li>
                <li>Unique Patient ID generator</li>
              </ul>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2B352B] text-[#FAF8F5] font-serif font-bold flex items-center justify-center border border-[#C5A059]">3</div>
                <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Native Mobile & PDF Reports</h4>
              </div>
              <ul className="text-xs text-[#555A62] space-y-2 list-disc list-inside font-sans">
                <li>Capacitor 8 Android Native APK (4.7 MB)</li>
                <li>jsPDF + HTML2Canvas Clinical Exporter</li>
                <li>Low-overhead i3-optimized execution</li>
                <li>High contrast accessibility mode</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-[#C5A059] p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔐</span>
              <div>
                <p className="font-bold text-[#1C1F24]">Isolated Data Namespace</p>
                <p className="text-[#555A62]">Live Firebase DB vs Demo Storage (`sih_demo_*` namespace)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="px-3 py-1 bg-[#FAF0D9] text-[#7A612D] border border-[#D4B46E] font-bold">Firebase Auth Ready</span>
              <span className="px-3 py-1 bg-[#FAF7F0] text-[#1C1F24] border border-[#E2DDD3] font-bold">Demo Sandbox Ready</span>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: ML Adaptive Cognitive Engine & Mathematical Scoring
    {
      id: 4,
      badge: "AI & Machine Learning Engine",
      title: "Real ML Adaptive Scoring Algorithm",
      subtitle: "Mathematical performance scoring without hardcoded fallbacks or redo locks",
      icon: <Zap className="w-6 h-6 text-[#9E7F40]" />,
      speakerNotes: "Unlike simple trivia games, SmritiSetu runs a real-time mathematical ML classifier. It computes speed factor SF, composite performance index CPI, domain sub-scores MRI, APSI, PRE, ERA, and a logistic promotion probability function P_promote to adjust difficulty fluidly without forcing redos on failure.",
      content: (
        <div className="space-y-6 my-auto text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 space-y-4">
              <h4 className="font-serif font-bold text-[#1C1F24] text-xl flex items-center gap-2">
                <span>🧮</span>
                <span>Speed Factor & Composite Index (CPI)</span>
              </h4>
              <div className="space-y-3 font-mono text-xs bg-white p-4 border border-[#E2DDD3] text-[#1C1F24]">
                <p><span className="text-[#7A612D] font-bold">SF</span> = clamp(1.0 - (Time - Baseline) / 10000, 0.2, 1.5)</p>
                <p><span className="text-[#9E7F40] font-bold">CPI</span> = (Accuracy × 70) + (SF × 30)</p>
                <p><span className="text-[#2B352B] font-bold">P_promote</span> = 1 / (1 + e^(-0.1 × (CPI - 65)))</p>
              </div>
              <p className="text-xs text-[#555A62] leading-relaxed font-sans">
                If <code className="text-[#9E7F40]">P_promote &gt; 0.65</code>, difficulty level increases; if below 0.35, it adjusts downward smoothly while preserving patient confidence.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 space-y-4">
              <h4 className="font-serif font-bold text-[#1C1F24] text-xl flex items-center gap-2">
                <span>🧠</span>
                <span>4 Clinical Domain Indices</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 border border-[#E2DDD3] space-y-1">
                  <p className="font-mono font-bold text-[#9E7F40]">MRI</p>
                  <p className="text-[#555A62]">Memory Retention</p>
                </div>
                <div className="bg-white p-3 border border-[#E2DDD3] space-y-1">
                  <p className="font-mono font-bold text-[#2B352B]">APSI</p>
                  <p className="text-[#555A62]">Attention Processing</p>
                </div>
                <div className="bg-white p-3 border border-[#E2DDD3] space-y-1">
                  <p className="font-mono font-bold text-[#7A612D]">PRE</p>
                  <p className="text-[#555A62]">Pattern Recognition</p>
                </div>
                <div className="bg-white p-3 border border-[#E2DDD3] space-y-1">
                  <p className="font-mono font-bold text-[#9E7F40]">ERA</p>
                  <p className="text-[#555A62]">Executive Routine</p>
                </div>
              </div>
              <p className="text-xs text-[#555A62] font-sans">
                All 4 domains feed directly into caregiver alerts and doctor longitudinal progress charts!
              </p>
            </div>
          </div>

          <div className="bg-[#FAF0D9] border border-[#D4B46E] p-4 text-xs text-[#7A612D] font-semibold">
            ✓ Non-blocking Gameplay: Patient is never forced to repeat a level upon failing; ML auto-calculates score and proceeds naturally!
          </div>
        </div>
      )
    },

    // Slide 5: 4 Cognitive Gaming Ecosystem
    {
      id: 5,
      badge: "Gamified Cognitive Therapy",
      title: "The 4-Game Cognitive Ecosystem",
      subtitle: "Neuro-psychologically grounded activities built specifically for elderly interaction",
      icon: <Activity className="w-6 h-6 text-[#9E7F40]" />,
      speakerNotes: "We created 4 targeted cognitive games: Memory Tile Recall, Attention Pattern Matrix, Spatial Navigation Maze, and Daily Routine Clock. Each game is designed with high visual contrast, clear touch targets, and regional voice instructions.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-auto text-left">
          <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🃏</span>
              <span className="text-xs font-mono font-bold text-[#7A612D] bg-[#FAF0D9] px-2 py-0.5 border border-[#D4B46E]">Memory Domain</span>
            </div>
            <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Memory Tile Recall</h4>
            <p className="text-xs text-[#555A62] font-sans leading-relaxed">
              Matching paired regional icons (tea leaf, rhino, bamboo, hornbill) testing short-term visual working memory and retention.
            </p>
          </div>

          <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🧩</span>
              <span className="text-xs font-mono font-bold text-[#2B352B] bg-[#EBF0EB] px-2 py-0.5 border border-[#B8CBB8]">Attention Domain</span>
            </div>
            <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Pattern Matrix</h4>
            <p className="text-xs text-[#555A62] font-sans leading-relaxed">
              Sequence recall and target differentiation to measure processing speed and visual focus under varying visual noise.
            </p>
          </div>

          <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🧭</span>
              <span className="text-xs font-mono font-bold text-[#7A612D] bg-[#FAF0D9] px-2 py-0.5 border border-[#D4B46E]">Spatial Domain</span>
            </div>
            <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Spatial Navigation Maze</h4>
            <p className="text-xs text-[#555A62] font-sans leading-relaxed">
              Navigating familiar household or regional environments to preserve spatial orientation and motor directionality.
            </p>
          </div>

          <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">⏰</span>
              <span className="text-xs font-mono font-bold text-[#1C1F24] bg-white px-2 py-0.5 border border-[#E2DDD3]">Executive Domain</span>
            </div>
            <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Daily Routine Clock</h4>
            <p className="text-xs text-[#555A62] font-sans leading-relaxed">
              Sequencing daily tasks (medication timing, breakfast, evening walk) to reinforce executive planning and daily orientation.
            </p>
          </div>
        </div>
      )
    },

    // Slide 6: Multi-Role Telehealth Ecosystem & Unique Patient ID
    {
      id: 6,
      badge: "Connected Telehealth Ecosystem",
      title: "Patient, Caregiver & Doctor Telehealth Portals",
      subtitle: "Unique Patient ID linkage with real-time risk alerts & automated PDF reports",
      icon: <Stethoscope className="w-6 h-6 text-[#9E7F40]" />,
      speakerNotes: "The platform connects all three key stakeholders. Each patient receives a unique Patient ID formatted like ASM58291. Caregivers search this ID to track daily activity, mood, and cognitive decline alerts. Doctors access full clinical analytics and generate one-click PDF reports.",
      content: (
        <div className="space-y-6 my-auto text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👵</span>
                <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Patient Dashboard</h4>
              </div>
              <p className="text-xs text-[#555A62] font-sans leading-relaxed">
                Simple, distraction-free interface with regional voice prompts, large touch targets, active Patient ID display, and profile editor.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏡</span>
                <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Caregiver Portal</h4>
              </div>
              <p className="text-xs text-[#555A62] font-sans leading-relaxed">
                Search Patient ID (`ASM58291`), real-time notification alerts, task checklist, and cognitive domain index indicators.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👨‍⚕️</span>
                <h4 className="font-serif font-bold text-[#1C1F24] text-xl">Doctor Clinical Portal</h4>
              </div>
              <p className="text-xs text-[#555A62] font-sans leading-relaxed">
                Longitudinal progression charts (Recharts), patient risk stratification, medication notes, and downloadable PDF reports (jsPDF).
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-[#C5A059] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🪪</span>
              <div>
                <p className="text-xs font-mono font-bold text-[#7E786D]">PATIENT IDENTIFICATION STANDARD</p>
                <p className="text-base font-mono font-bold text-[#9E7F40]">ASM58291</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-[#FAF0D9] text-[#7A612D] px-3 py-1.5 border border-[#D4B46E] font-bold">
              Firestore & Local DB Searchable
            </span>
          </div>
        </div>
      )
    },

    // Slide 7: NER Multi-Lingual & Voice TTS Accessibility
    {
      id: 7,
      badge: "Inclusivity & Accessibility",
      title: "9 NER Languages & Web Speech Voice TTS",
      subtitle: "Eliminating language barriers for elderly users across North Eastern India",
      icon: <Globe className="w-6 h-6 text-[#9E7F40]" />,
      speakerNotes: "Accessibility is central to our design. Elderly patients in rural Assam or Nagaland may struggle with reading small text. Our platform integrates native Web Speech API audio synthesis and full UI localization across 9 regional languages.",
      content: (
        <div className="space-y-6 my-auto text-left">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3">
            {[
              { name: "Assamese", code: "as-IN", native: "অসমীয়া" },
              { name: "Manipuri", code: "mni-IN", native: "মৈতৈলোন্" },
              { name: "Mizo", code: "mzo-IN", native: "Mizo ṭawng" },
              { name: "Khasi", code: "kha-IN", native: "Ka Ktien Khasi" },
              { name: "Garo", code: "grt-IN", native: "A·chik ku·sik" },
              { name: "Bengali", code: "bn-IN", native: "বাংলা" },
              { name: "Nagamese", code: "nag-IN", native: "Nagamese" },
              { name: "Nepali", code: "ne-IN", native: "नेपाली" },
              { name: "English", code: "en-US", native: "English" }
            ].map((lang) => (
              <div key={lang.code} className="bg-[#FAF7F0] border border-[#E2DDD3] p-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#1C1F24] text-sm">{lang.name}</p>
                  <p className="text-xs text-[#9E7F40] font-medium">{lang.native}</p>
                </div>
                <span className="text-[10px] font-mono text-[#555A62] bg-white px-2 py-0.5 border border-[#E2DDD3]">
                  {lang.code}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-[#FAF7F0] border border-[#E2DDD3] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-[#9E7F40] border border-[#C5A059] flex items-center justify-center font-bold text-xl">
                🔊
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#1C1F24] text-base">Web Speech API Integration</h4>
                <p className="text-xs text-[#555A62] font-sans">Provides audio voice prompts for all game instructions, level completions, and profile updates.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="bg-white text-[#1C1F24] px-3 py-1.5 border border-[#E2DDD3] font-semibold">High Contrast</span>
              <span className="bg-white text-[#1C1F24] px-3 py-1.5 border border-[#E2DDD3] font-semibold">Large Touch Targets</span>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Implementation Readiness & Gateway
    {
      id: 8,
      badge: "SIH Evaluation & Live Deployment",
      title: "Operational Readiness & Live Gateway",
      subtitle: "Ready for immediate evaluation by SIH judges and live hospital onboarding",
      icon: <Sparkles className="w-6 h-6 text-[#9E7F40]" />,
      speakerNotes: "Thank you for reviewing स्मृतिसेतु (SMRITISETU). The system is fully operational today both as a live platform and as an isolated SIH demo environment for judges. You can test both right now directly from this platform.",
      content: (
        <div className="space-y-8 my-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Live Option */}
            <div className="bg-white border-2 border-[#C5A059] p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">⚡</span>
                  <span className="text-xs font-mono font-bold text-[#2B352B] bg-[#EBF0EB] border border-[#B8CBB8] px-3 py-1 uppercase">
                    Production Live
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1C1F24]">Enter Live Platform</h4>
                <p className="text-xs text-[#555A62] font-sans leading-relaxed">
                  Real Firebase authentication, user registration, real patient IDs (`ASM58291`), live Firestore synchronization, and real caregiver/doctor monitoring.
                </p>
              </div>

              <button
                onClick={onSelectLive}
                className="w-full py-3.5 bg-[#2B352B] hover:bg-[#1E251E] text-[#FAF8F5] border border-[#C5A059] font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
              >
                <span>Launch Live Platform</span>
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>
            </div>

            {/* Demo Option */}
            <div className="bg-white border-2 border-[#D4B46E] p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🏆</span>
                  <span className="text-xs font-mono font-bold text-[#7A612D] bg-[#FAF0D9] border border-[#D4B46E] px-3 py-1 uppercase">
                    SIH Judge Evaluation
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1C1F24]">Enter SIH Demo Sandbox</h4>
                <p className="text-xs text-[#555A62] font-sans leading-relaxed">
                  Pre-populated evaluation profiles (Ramesh Kumar, Anita Sharma, Dr. Arjun Mehta) with longitudinal cognitive performance data for instant testing.
                </p>
              </div>

              <button
                onClick={onSelectDemo}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#9E7F40] text-white font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
              >
                <span>Launch SIH Demo Sandbox</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#7E786D] font-mono">
            <span>APK Build: <code className="text-[#1C1F24]">SmritiSetu-v2.0-debug.apk</code> (4.7 MB)</span>
            <span>•</span>
            <span>Firebase Project: <code className="text-[#9E7F40]">dimentiaapp-2f0fb</code></span>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] text-[#1C1F24] flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-300 font-sans">
      {/* Top Deck Control Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pb-4 border-b border-[#E2DDD3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2B352B] border border-[#C5A059] text-[#FAF8F5] flex items-center justify-center font-serif font-bold text-xl">
            🧠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-[#1C1F24]">SMRITISETU (स्मृतिसेतु) PRESENTATION</span>
              <span className="text-[10px] font-mono font-bold bg-[#FAF0D9] text-[#7A612D] border border-[#D4B46E] px-2 py-0.5 uppercase tracking-widest">
                Interactive PPT
              </span>
            </div>
            <p className="text-xs text-[#555A62] font-mono">SIH 2026 Problem Statement 26003 • Executive Presentation</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showNotes 
                ? 'bg-[#FAF0D9] border-[#D4B46E] text-[#7A612D]' 
                : 'bg-white border-[#E2DDD3] text-[#555A62] hover:text-[#1C1F24]'
            }`}
            title="Toggle Presenter Speaker Notes"
          >
            <Info className="w-4 h-4 text-[#9E7F40]" />
            <span className="hidden sm:inline">Speaker Notes</span>
          </button>

          {/* Auto Play Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying 
                ? 'bg-[#EBF0EB] border-[#B8CBB8] text-[#2B352B]' 
                : 'bg-white border-[#E2DDD3] text-[#555A62] hover:text-[#1C1F24]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white border border-[#E2DDD3] text-[#555A62] hover:text-[#1C1F24] transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close PPT Mode */}
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-[#FAF7F0] border border-[#E2DDD3] text-[#555A62] hover:text-[#1C1F24] transition-all cursor-pointer"
            title="Close Presentation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div className="max-w-6xl mx-auto w-full my-auto flex-1 flex flex-col justify-center py-6">
        {/* Slide Badge & Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 bg-[#FAF7F0] border border-[#D8CEBE] px-4 py-1 text-xs font-mono text-[#555A62]">
            {slide.icon}
            <span className="font-semibold text-[#1C1F24]">{slide.badge}</span>
            <span className="text-[#C5A059]">•</span>
            <span className="text-[#9E7F40] font-bold">Slide {slide.id} of {slides.length}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1F24] tracking-tight">
            {slide.title}
          </h2>

          <p className="text-sm md:text-base text-[#555A62] max-w-2xl mx-auto font-medium">
            {slide.subtitle}
          </p>
        </div>

        {/* Render Active Slide Body */}
        <div className="w-full">
          {slide.content}
        </div>

        {/* Speaker Notes Overlay */}
        {showNotes && (
          <div className="mt-6 bg-[#FAF7F0] border border-[#D4B46E] p-4 text-left space-y-1 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#7A612D] uppercase tracking-widest">
              <Info className="w-3.5 h-3.5 text-[#9E7F40]" />
              <span>Presenter Notes (Speaker Script)</span>
            </div>
            <p className="text-xs text-[#1C1F24] leading-relaxed font-sans">
              "{slide.speakerNotes}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Deck Navigation Bar */}
      <div className="max-w-7xl mx-auto w-full pt-4 border-t border-[#E2DDD3] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Slide Counter & Progress Bar */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-xs font-mono font-bold text-[#555A62]">
            {currentSlide + 1} / {slides.length}
          </span>
          <div className="flex-1 sm:w-48 h-2 bg-[#E2DDD3] overflow-hidden">
            <div
              className="h-full bg-[#C5A059] transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Slide Jump Dots */}
        <div className="hidden md:flex items-center gap-1.5">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 transition-all cursor-pointer ${
                index === currentSlide 
                  ? 'bg-[#C5A059] scale-125 ring-2 ring-[#9E7F40]/40' 
                  : 'bg-[#D8CEBE] hover:bg-[#9E7F40]'
              }`}
              title={`Jump to Slide ${s.id}: ${s.title}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end font-mono text-xs">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-white hover:bg-[#FAF7F0] disabled:opacity-40 border border-[#E2DDD3] text-[#1C1F24] font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-5 py-2 bg-[#2B352B] hover:bg-[#1E251E] disabled:opacity-40 text-[#FAF8F5] border border-[#C5A059] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4 text-[#C5A059]" />
          </button>
        </div>
      </div>
    </div>
  );
};
