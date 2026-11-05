import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Volume2,
  Download,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Zap,
  Sun,
  Moon,
  Layers,
  FileCode2,
  Activity,
  ArrowRight,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

interface DspFile {
  name: string;
  type: 'VDC' | 'IRS' | 'EEL';
  slot: string;
  description: string;
  specs: string;
  downloadUrl: string;
}

interface TrioBuild {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  category: 'iem' | 'speaker';
  soundSignature: string;
  idealFor: string;
  acousticPhilosophy: string;
  files: DspFile[];
  quickSettings: {
    slot: string;
    action: string;
    value: string;
  }[];
  acousticDetails: string[];
}

const TRIO_BUILDS: TrioBuild[] = [
  {
    id: 'iem-v10',
    title: 'IEM Champion: Google Audio Lab Reference Master (V10)',
    badge: '#1 Overall Selected IEM Champion',
    tagline: 'Google HQ Reference Curve · Micro-Acoustic Notch Filtering · True-Peak Mastering Wall',
    category: 'iem',
    soundSignature: 'Pristine Neutrality, Sub-Bass Shelf (+3.8 dB @ 45Hz), Zero Sibilance, Surgical Detail',
    idealFor: 'Hi-Res Lossless, Master Quality FLAC, Acoustic Mastering, Audiophile Critical Listening',
    acousticPhilosophy:
      'Engineered following Google Audio Lab reference target curves. Eliminates harsh ear-canal coupler resonances at 5.45 kHz and dynamic driver breakup at 8.15 kHz while providing clean sub-bass extension without mid-bass mud.',
    acousticDetails: [
      '10-biquad DDC cascade featuring dual micro-notches (-4.8 dB @ 5.45 kHz, Q=3.8 and -5.4 dB @ 8.15 kHz, Q=4.5)',
      '4-channel 48 kHz True-Stereo minimum-phase FIR impulse (2048 taps / 42.7 ms) with pristine decay',
      'Google Audio Lab True-Peak mastering limiter with 2x oversampled inter-sample peak (ISP) detection',
      '1.5 ms lookahead delay ring buffer with zero inter-sample clipping and musical program-dependent release',
    ],
    quickSettings: [
      { slot: 'DDC Section', action: 'Load DDC File', value: 'EDX_v10.vdc' },
      { slot: 'Convolver', action: 'Load IRS File', value: 'EDX_v10.irs (Preamp: 0.0 dB)' },
      { slot: 'Liveprog (EEL2)', action: 'Load EEL File', value: 'EDX_v10.eel (Ceiling: -1.0 dBFS)' },
      { slot: 'Host Sample Rate', action: 'JamesDSP Setting', value: 'Lock to 48000 Hz' },
    ],
    files: [
      {
        name: 'EDX_v10.vdc',
        type: 'VDC',
        slot: 'DDC',
        description: 'Google Reference Master 10-biquad notch & target curve filterbank',
        specs: 'Dual-Rate (44.1k & 48.0k)',
        downloadUrl: '/dsp/iem_v10/EDX_v10.vdc',
      },
      {
        name: 'EDX_v10.irs',
        type: 'IRS',
        slot: 'Convolver',
        description: '4-Channel True-Stereo Minimum-Phase Studio Reference FIR (2048 taps)',
        specs: 'IEEE Float32 · 48 kHz · 4-ch',
        downloadUrl: '/dsp/iem_v10/EDX_v10.irs',
      },
      {
        name: 'EDX_v10.eel',
        type: 'EEL',
        slot: 'Liveprog',
        description: 'Google Audio Lab True-Peak Mastering Limiter with ISP Mode',
        specs: '1.5ms Lookahead · 2Hz DC Blocker',
        downloadUrl: '/dsp/iem_v10/EDX_v10.eel',
      },
    ],
  },
  {
    id: 'iem-v4',
    title: 'IEM Alternative: Google Immersive Spatial HRIR 3D (V4)',
    badge: 'Audiophile 3D Spatial Choice',
    tagline: 'Project Starline / Pixel Buds Pro Virtual Loudspeaker Room Modeling',
    category: 'iem',
    soundSignature: 'Holographic Out-of-Head Soundstage, 30° Loudspeaker Simulation, Zero Ear Fatigue',
    idealFor: 'Live concerts, orchestral, acoustic tracks, FPS gaming positional cues, movies on IEM',
    acousticPhilosophy:
      'Inspired by Google Project Starline spatial acoustics. Replaces unnatural in-head headphone lateralization with a calibrated pair of studio loudspeakers in an acoustically treated room via 240 µs Woodworth spherical head shadow crossfeed.',
    acousticDetails: [
      'Binaural HRIR x Crossfeed matrix with 240 µs ITD and frequency-dependent head shadow attenuation',
      'Pinna concha reflection modeling at 3.1 kHz with frontal azimuth boost (+1.8 dB @ 4.8 kHz)',
      '4-channel 48 kHz True-Stereo HRIR impulse (1024 taps) capturing natural diffuse room reflection',
      'Google Spatial Audio Limiter maintaining phase coherence with adjustable binaural width slider',
    ],
    quickSettings: [
      { slot: 'DDC Section', action: 'Load DDC File', value: 'EDX_v4.vdc' },
      { slot: 'Convolver', action: 'Load IRS File', value: 'EDX_v4_HRIRxCrossfeed.irs (Preamp: 0.0 dB)' },
      { slot: 'Liveprog (EEL2)', action: 'Load EEL File', value: 'EDX_v4.eel (Width: 100%, Ceil: -0.5 dBFS)' },
      { slot: 'Host Sample Rate', action: 'JamesDSP Setting', value: 'Lock to 48000 Hz' },
    ],
    files: [
      {
        name: 'EDX_v4.vdc',
        type: 'VDC',
        slot: 'DDC',
        description: 'Virtual room loudspeaker simulation & pinna concha tuning',
        specs: 'Dual-Rate (44.1k & 48.0k)',
        downloadUrl: '/dsp/iem_v4/EDX_v4.vdc',
      },
      {
        name: 'EDX_v4_HRIRxCrossfeed.irs',
        type: 'IRS',
        slot: 'Convolver',
        description: '4-Channel HRIR 30° Azimuth Loudspeaker Crossfeed Matrix (1024 taps)',
        specs: 'IEEE Float32 · 48 kHz · 4-ch',
        downloadUrl: '/dsp/iem_v4/EDX_v4_HRIRxCrossfeed.irs',
      },
      {
        name: 'EDX_v4.eel',
        type: 'EEL',
        slot: 'Liveprog',
        description: 'Google Immersive Spatial Audio Limiter with Width Slider',
        specs: 'Phase Coherence Guard · 1.5ms Lookahead',
        downloadUrl: '/dsp/iem_v4/EDX_v4.eel',
      },
    ],
  },
  {
    id: 'spk-v10',
    title: 'Speaker Champion: Google Nest / Pixel Dynamic Loudness (V10)',
    badge: '#1 Overall Selected Speaker Champion',
    tagline: 'Subsonic 140Hz Excursion Guard · Virtual Bass Harmonics · 2-Stage Loudness Compressor',
    category: 'speaker',
    soundSignature: 'Massive Volume Lift, Deep Virtual Bass Perception, Vocal Formant Punch, Anti-Rattle Protection',
    idealFor: 'Phone loudspeaker music, YouTube, podcasts, hands-free calls, high-ambient noise',
    acousticPhilosophy:
      'Modeled after Google Nest Audio and Pixel smart transducer architecture. Uses steep 4th-order subsonic cutoff to protect fragile phone micro-drivers, while generating synthetic 2nd and 3rd harmonics of 60–110 Hz bass so human ears perceive deep punch without driver bottoming out.',
    acousticDetails: [
      '4th-order steep Butterworth high-pass filter at 140 Hz eliminating physical cone blowouts and buzzing',
      'Missing Fundamental Virtual Bass DSP generating rich audible low-end harmonics in real-time EEL VM',
      'Google Nest vocal formant boost (+3.0 dB @ 3.1 kHz) and cabinet resonance notch (-2.5 dB @ 280 Hz)',
      '2-stage dynamic program compressor with +10 dB makeup gain and 1.0 ms lookahead peak limiter',
    ],
    quickSettings: [
      { slot: 'DDC Section', action: 'Load DDC File', value: 'SPK_v10.vdc' },
      { slot: 'Convolver', action: 'Load IRS File', value: 'SPK_v10.irs (Preamp: 0.0 dB)' },
      { slot: 'Liveprog (EEL2)', action: 'Mode Slider', value: 'Mode 2 (Google Dynamic Loudness)' },
      { slot: 'Virtual Bass', action: 'Slider Setting', value: 'vBassMix: 30% (Harmonic punch)' },
    ],
    files: [
      {
        name: 'SPK_v10.vdc',
        type: 'VDC',
        slot: 'DDC',
        description: '4th-Order Butterworth 140Hz Subsonic Cut & Nest Vocal Formant Equalizer',
        specs: 'Dual-Rate (44.1k & 48.0k)',
        downloadUrl: '/dsp/spk_v10/SPK_v10.vdc',
      },
      {
        name: 'SPK_v10.irs',
        type: 'IRS',
        slot: 'Convolver',
        description: 'Acoustic cavity phase alignment & phone body resonance damping impulse',
        specs: 'IEEE Float32 · 48 kHz · Stereo',
        downloadUrl: '/dsp/spk_v10/SPK_v10.irs',
      },
      {
        name: 'SPK_v10.eel',
        type: 'EEL',
        slot: 'Liveprog',
        description: 'Google Nest Dynamic Loudness & Virtual Bass Engine with +10dB Makeup',
        specs: 'Missing Fundamental · 2-Stage Compressor',
        downloadUrl: '/dsp/spk_v10/SPK_v10.eel',
      },
    ],
  },
  {
    id: 'spk-v8',
    title: 'Speaker Alternative: Google Cinema Space & Dialogue Preserving (V8)',
    badge: 'Movie & Spatial Streaming Choice',
    tagline: 'Mid/Side Cinema Matrix · Center Dialogue Anchor · Cinema X-Curve Treble Roll-Off',
    category: 'speaker',
    soundSignature: 'Expansive Panoramic Soundfield, Crystal Clear Speech Intelligibility, Anti-Fatigue Highs',
    idealFor: 'Netflix, YouTube movies, reels, anime, dialogue-heavy series, cinematic gaming',
    acousticPhilosophy:
      'Engineered for streaming cinema on mobile devices. Uses Mid/Side processing to boost and isolate center dialogue while decorrelating the side channel to acoustically push surround effects beyond the physical phone body.',
    acousticDetails: [
      'Mid/Side matrix isolating and anchoring center dialogue while projecting wide surround soundstage',
      'Cinema standard X-curve roll-off above 8 kHz preventing high-frequency ear fatigue during explosions',
      'Phase-decorrelated side impulse (1.8 ms delay + surround widening) creating panoramic stereo width',
      'Google Cinema dynamic limiter protecting speakers during intense volume spikes while keeping whispers crisp',
    ],
    quickSettings: [
      { slot: 'DDC Section', action: 'Load DDC File', value: 'SPK_v8_OG.vdc' },
      { slot: 'Convolver', action: 'Load IRS File', value: 'SPK_v8_S.irs (Preamp: 0.0 dB)' },
      { slot: 'Liveprog (EEL2)', action: 'Mode Slider', value: 'Mode 1 (Active) · Dialogue Boost: +2.0 dB' },
      { slot: 'Surround Width', action: 'Slider Setting', value: '130% (Wide Cinema Stage)' },
    ],
    files: [
      {
        name: 'SPK_v8_OG.vdc',
        type: 'VDC',
        slot: 'DDC',
        description: 'Cinema dialogue anchor & X-curve treble anti-fatigue equalizer',
        specs: 'Dual-Rate (44.1k & 48.0k)',
        downloadUrl: '/dsp/spk_v8/SPK_v8_OG.vdc',
      },
      {
        name: 'SPK_v8_S.irs',
        type: 'IRS',
        slot: 'Convolver',
        description: 'Phase-decorrelated cinema surround spatial widening impulse',
        specs: 'IEEE Float32 · 48 kHz · Stereo',
        downloadUrl: '/dsp/spk_v8/SPK_v8_S.irs',
      },
      {
        name: 'SPK_v8.eel',
        type: 'EEL',
        slot: 'Liveprog',
        description: 'Google Cinema Space & Dialogue Limiter with M/S Width Slider',
        specs: 'Center Dialogue Anchor · 1.0ms Lookahead',
        downloadUrl: '/dsp/spk_v8/SPK_v8.eel',
      },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I install RootlessJamesDSP or RootlessZachDSP without root on Android?",
    a: "Both apps run entirely in Android user space without requiring root privileges. On Android 10 through 14+, simply grant the standard audio capture permission once via ADB (adb shell pm grant me.bmax.apatch android.permission.CAPTURE_AUDIO_OUTPUT) or wirelessly via the Shizuku app directly on your phone. Once granted, open the app settings and lock the Internal Sample Rate strictly to 48000 Hz.",
  },
  {
    q: "What is the mandatory 3-stage file loading order?",
    a: "Follow the acoustic signal chain: 1) Load the .vdc file into the DDC slot first (applies the biquad equalizer and ear-canal resonance notches). 2) Load the .irs file into the Convolver slot and verify Convolver Preamp is 0.0 dB. 3) Load the .eel script into the Liveprog slot for lookahead dynamic peak limiting and driver excursion protection. Make sure any OEM sound enhancers (Dolby Atmos, Dirac, Xiaomi Sound) are turned off.",
  },
  {
    q: "Why are all files locked strictly to 48,000 Hz?",
    a: "Modern Android smartphones process internal audio via the AudioFlinger mixer running natively at 48000 Hz. Loading non-48 kHz files forces the OS to apply asynchronous software resampling in real time, degrading phase coherence and transient precision. Synthesizing all FIR filters natively at 48000 Hz guarantees bit-perfect reproduction.",
  },
  {
    q: "Why is the Convolver Preamp set to 0.0 dB instead of negative attenuation?",
    a: "All HyperAudio impulse responses are mathematically gain-normalized below 0.0 dBFS maximum passband gain. Coupled with our lookahead True-Peak mastering limiters in the EEL script, digital clipping is prevented without requiring negative preamp cuts that reduce signal-to-noise ratio.",
  },
  {
    q: "What is the acoustic difference between Champion (V10) and Alternative (V4/V8) profiles?",
    a: "The IEM V10 Champion provides a surgical Harman-target neutral reference mastering curve with dual micro-notches at 5.45 kHz and 8.15 kHz. The IEM V4 Alternative simulates a pair of studio monitors 30° in front of you via 4-channel binaural HRIR crossfeed. The Speaker V10 Champion maximizes volume and bass punch via dynamic loudness and missing-fundamental synthesis. The Speaker V8 Cinema Alternative uses Mid/Side processing to anchor dialogue while projecting sound effects wide.",
  },
  {
    q: "Can I use these files in other players (Wavelet, Poweramp, Viper4Android, Equalizer APO)?",
    a: "Yes! The .irs files are standard IEEE Float32 WAV convolver impulses compatible with Viper4Android, Wavelet, Equalizer APO, and EasyEffects. The .vdc files work in Viper4Android and JamesDSP. Furthermore, 127-point GraphicEQ curves can be copied directly into Wavelet AutoEq or Equalizer APO config.txt.",
  },
  {
    q: "Why does the phone speaker profile cut off frequencies below 140 Hz?",
    a: "Phone micro-speakers have physical diaphragm travel limits (Xmax). Trying to reproduce 50–120 Hz fundamental bass causes physical bottoming out, chassis rattle, and voice coil overheating. Cutting subsonic frequencies with a 24 dB/oct Butterworth filter protects the hardware, while the EEL virtual bass engine generates psychoacoustic harmonics so your brain perceives rich low-end punch safely.",
  },
  {
    q: "What if my mobile browser blocks the direct zip download?",
    a: "Tap the 'Download Center' button in the header or visit download.html. It contains a 1-tap in-memory Blob downloader that builds the Finalized_Champion_DSP_Trios.zip directly inside your browser memory, bypassing all iframe restrictions and network blocks.",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'iem' | 'speaker'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return document.documentElement.dataset.theme === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const filteredBuilds =
    activeTab === 'all'
      ? TRIO_BUILDS
      : TRIO_BUILDS.filter((b) => b.category === activeTab);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d0c] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#101715]/90 backdrop-blur-md sticky top-0 z-50 transition-colors shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-slate-900 dark:text-white tracking-tight leading-tight">
                HyperAudio <span className="text-emerald-600 dark:text-emerald-400 font-normal text-sm ml-1.5 hidden sm:inline">· Google Audio Lab Master DSP</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                RootlessJamesDSP &amp; RootlessZachDSP 48000 Hz Trios
              </p>
            </div>
          </div>

          {/* Quick Actions & Theme Toggle */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#16201c] text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 shadow-sm transition-all active:scale-95"
              aria-label="Toggle light/dark theme"
            >
              {isDark ? <Sun className="w-4 h-4 stroke-[1.75]" /> : <Moon className="w-4 h-4 stroke-[1.75]" />}
            </button>

            <a
              href="/download.html"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#16201c] text-slate-700 dark:text-slate-200 hover:border-emerald-500/40 text-xs font-semibold shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
              Download Center
            </a>

            <a
              href="/Finalized_Champion_DSP_Trios.zip"
              download="Finalized_Champion_DSP_Trios.zip"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.75]" />
              Download Bundle (.zip)
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Alert */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111715] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Google Hardware Acoustic Lab Grade Engineering
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                All 4 builds (IEM Champion V10, IEM Spatial V4, Speaker Champion V10, Speaker Cinema V8) feature dedicated mathematical biquad cascades, 48 kHz float FIR convolution, and custom EEL2 DSP modules. Each retains its distinct acoustic character.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/Google_Grade_HyperAudio_DSP.zip"
              download="Google_Grade_HyperAudio_DSP.zip"
              className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#16201c] hover:bg-slate-200 dark:hover:bg-[#1f2b26] border border-slate-200 dark:border-white/[0.08] font-medium transition shadow-sm"
            >
              Get Legacy Core (.zip)
            </a>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-[#111715] rounded-xl border border-slate-200/80 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#16201c] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/[0.08]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All 4 Master Profiles
            </button>
            <button
              onClick={() => setActiveTab('iem')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'iem'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 stroke-[1.75]" />
              IEM / Earphones (2)
            </button>
            <button
              onClick={() => setActiveTab('speaker')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'speaker'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 stroke-[1.75]" />
              Phone Loudspeakers (2)
            </button>
          </div>

          <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
            Tested &amp; Verified on Android at 48000 Hz
          </span>
        </div>

        {/* Master Export Suite */}
        <section className="bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white dark:from-emerald-500/10 dark:via-[#111715] dark:to-[#111715] border border-emerald-500/30 dark:border-emerald-500/20 rounded-3xl p-6 md:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Master Export Suite
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  SHA-256 Verified · 48 kHz Locked
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Production DSP Bundles &amp; Direct Downloads
              </h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Download the complete 4-profile production suite (IEM Champion V10, IEM Spatial V4, Speaker Champion V10, Speaker Cinema V8) with verified SHA-256 integrity, automated level safety, and full Android guides.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="px-2.5 py-0.5 rounded bg-white dark:bg-[#16201c] border border-slate-200 dark:border-white/[0.08] shadow-sm">
                  4x VDC Biquads
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white dark:bg-[#16201c] border border-slate-200 dark:border-white/[0.08] shadow-sm">
                  4x Float32 FIRs
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white dark:bg-[#16201c] border border-slate-200 dark:border-white/[0.08] shadow-sm">
                  4x EEL2 Limiters
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href="/Finalized_Champion_DSP_Trios.zip"
                download="Finalized_Champion_DSP_Trios.zip"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-sm hover:shadow transition active:scale-95"
              >
                <Download className="w-4 h-4 stroke-[2]" />
                Download Champion Bundle (.zip)
              </a>

              <a
                href="/download.html"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-[#16201c] hover:bg-slate-50 dark:hover:bg-[#1f2b26] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.1] rounded-2xl font-semibold text-xs shadow-sm transition active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
                Android Download Center &amp; Mirrors
              </a>
            </div>
          </div>
        </section>

        {/* Cards Grid */}
        <div className="space-y-6">
          {filteredBuilds.map((build) => (
            <div
              key={build.id}
              className="bg-white dark:bg-[#111715] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 md:p-7 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/[0.14] transition-all"
            >
              {/* Build Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded border border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 tracking-wide">
                      {build.badge}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      {build.category === 'iem' ? 'In-Ear Monitor' : 'Smartphone Speaker'}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-2">
                    {build.title}
                  </h2>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                    {build.tagline}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                    <strong className="text-slate-800 dark:text-slate-200">Tone Signature:</strong> {build.soundSignature}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    <strong className="text-slate-800 dark:text-slate-200">Best For:</strong> {build.idealFor}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/Finalized_Champion_DSP_Trios.zip"
                    download="Finalized_Champion_DSP_Trios.zip"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-[#16201c] hover:bg-slate-200 dark:hover:bg-[#1f2b26] text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] shadow-sm transition active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
                    Download Bundle (.zip)
                  </a>
                </div>
              </div>

              {/* Acoustic Philosophy Callout */}
              <div className="my-4 text-xs bg-slate-50 dark:bg-[#16201c] p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-1.5">Acoustic Architecture:</span>
                {build.acousticPhilosophy}
              </div>

              {/* Key Highlights & Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-slate-50/70 dark:bg-[#16201c]/70 p-4 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] flex flex-col justify-between shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
                      Google-Grade Acoustic Engineering
                    </h4>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5">
                      {build.acousticDetails.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[1.75]" />
                          <span className="leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-50/70 dark:bg-[#16201c]/70 p-4 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] flex flex-col justify-between shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400 stroke-[1.75]" />
                      Exact JamesDSP Setup Values
                    </h4>
                    <div className="space-y-2 text-xs">
                      {build.quickSettings.map((setting, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1.5 border-b border-slate-200/50 dark:border-white/[0.04] last:border-0"
                        >
                          <span className="text-slate-600 dark:text-slate-400 font-medium">{setting.slot}</span>
                          <code className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 bg-white dark:bg-[#090d0c] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.08] tabular-nums shadow-sm">
                            {setting.value}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Stage Files Breakdown */}
              <div className="space-y-3 mt-5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Verified Component Files (Download Individually):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {build.files.map((file) => (
                    <div
                      key={file.name}
                      className="p-3.5 bg-slate-50/80 dark:bg-[#16201c] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.16] shadow-sm hover:shadow transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              file.type === 'VDC'
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25'
                                : file.type === 'IRS'
                                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25'
                                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
                            }`}
                          >
                            Slot: {file.slot}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            {file.specs}
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                          {file.name}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                          {file.description}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between">
                        <button
                          onClick={() => handleCopy(file.name, file.name)}
                          className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium transition"
                        >
                          {copiedKey === file.name ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
                          ) : (
                            <Copy className="w-3 h-3 stroke-[1.75]" />
                          )}
                          Copy name
                        </button>

                        <a
                          href={file.downloadUrl}
                          download={file.name}
                          className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 font-semibold py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-500/25 transition active:scale-95 shadow-sm"
                        >
                          <Download className="w-3 h-3 stroke-[1.75]" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google Acoustic Metrology Fixture Showcase */}
        <section className="bg-white dark:bg-[#111715] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 md:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded border border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Laboratory Test Rigs
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  48 kHz · IEC Metrology Standard
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                Google Hardware Acoustic Metrology &amp; Anechoic Fixtures
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              High-Precision Transducer Calibration
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden bg-slate-50 dark:bg-[#16201c] shadow-sm hover:shadow transition">
              <div className="relative aspect-video overflow-hidden bg-black">
                <img
                  src="/assets/google_acoustic_lab_iem_fixture.jpg"
                  alt="In-ear monitor acoustic coupler test rig in Google acoustic lab"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-black/80 text-emerald-400 border border-white/10 backdrop-blur-md">
                  IEC 60318-4 · Ear Simulator Coupler
                </span>
              </div>
              <div className="p-4 space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  KZ EDX Pro In-Ear Ear Simulator Rig
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Calibrated dual-rate transfer function analysis isolating the 5.45 kHz ear-canal coupler notch and dynamic driver resonance damping.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden bg-slate-50 dark:bg-[#16201c] shadow-sm hover:shadow transition">
              <div className="relative aspect-video overflow-hidden bg-black">
                <img
                  src="/assets/google_acoustic_lab_speaker_rig.jpg"
                  alt="Anechoic chamber speaker transducer test stand with laser Doppler vibrometer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-black/80 text-cyan-400 border border-white/10 backdrop-blur-md">
                  0.5m Free-Field · Laser Doppler Stand
                </span>
              </div>
              <div className="p-4 space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Redmi 12 Micro-Transducer Anechoic Chamber
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Acoustic chamber laser vibrometry measuring physical cone displacement, anti-rattle notches, and thermal compression envelopes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Android Phone Installation Guide */}
        <section className="bg-white dark:bg-[#111715] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 md:p-7 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
            How to Load on Your Android Phone (RootlessJamesDSP / RootlessZachDSP)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
            Follow the 3-stage chain order for proper frequency convolution and lookahead protection.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-2">
            <div className="p-4 bg-slate-50 dark:bg-[#16201c] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] space-y-2 shadow-sm">
              <span className="text-blue-700 dark:text-blue-400 font-bold text-sm flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 stroke-[1.75]" /> Step 1: DDC Slot (.vdc)
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Open JamesDSP &rarr; toggle on <strong>DDC</strong> &rarr; tap &quot;Load DDC File&quot; &rarr; select the <code>.vdc</code> file (e.g. <code>EDX_v10.vdc</code> or <code>SPK_v10.vdc</code>). Applies exact dual-rate biquad cascades.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#16201c] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] space-y-2 shadow-sm">
              <span className="text-purple-700 dark:text-purple-400 font-bold text-sm flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 stroke-[1.75]" /> Step 2: Convolver Slot (.irs)
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Toggle on <strong>Convolver</strong> &rarr; select the <code>.irs</code> file (e.g. <code>EDX_v10.irs</code>). Ensure <strong>Convolver Preamp is 0.0 dB</strong>. Supports 4-channel True Stereo and stereo float FIR.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#16201c] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] space-y-2 shadow-sm">
              <span className="text-amber-700 dark:text-amber-400 font-bold text-sm flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 stroke-[1.75]" /> Step 3: Liveprog Slot (.eel)
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Toggle on <strong>Liveprog</strong> &rarr; load the <code>.eel</code> script. Provides lookahead dynamic protection, harmonic missing fundamental bass virtualization, or spatial dialogue widening.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-white dark:bg-[#111715] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 md:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded border border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Knowledge Base
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  8 Verified Answers
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
                Frequently Asked Questions
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl transition-all ${
                    isOpen
                      ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#16201c]/60 hover:border-slate-300 dark:hover:border-white/[0.16]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100"
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-white/[0.04] mt-1 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/[0.08] py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Google Audio Lab Grade DSP Suite · Synthesized &amp; Verified for Android RootlessJamesDSP at 48000 Hz
      </footer>
    </div>
  );
}
