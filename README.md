<div align="center">

<img src="assets/logo.svg" alt="HyperAudio" width="88">

# HyperAudio

**Sound, in focus.**  
Measurement-driven DSP correction for specific playback systems.

Built for [RootlessJamesDSP](https://github.com/ThePBone/RootlessJamesDSP).

[![Open the site](https://img.shields.io/badge/OPEN%20THE%20SITE-nmstudioo.github.io%2FHyperAudioo-c5f36b?style=for-the-badge&labelColor=101214)](https://nmstudioo.github.io/HyperAudioo/)

![Speaker](https://img.shields.io/badge/SPEAKER-V6%20FROZEN%20%2B%20PEQ%20V1.0-c5f36b?style=flat-square&labelColor=101214)
![IEM](https://img.shields.io/badge/IEM-v3%20IRS%20%2B%20v5%20EEL-c5f36b?style=flat-square&labelColor=101214)
![Platform](https://img.shields.io/badge/PLATFORM-ROOTLESSJAMESDSP-8a9593?style=flat-square&labelColor=101214)
![Rate](https://img.shields.io/badge/HOST%20RATE-48%20kHz-8a9593?style=flat-square&labelColor=101214)

[Overview](#overview) · [Profiles](#device-profiles) · [Architecture](#processing-architecture) · [Quick start](#quick-start) · [Data](#data-and-targets) · [Add-ons](#add-ons) · [Documentation](#documentation) · [Evidence](#validation-and-evidence) · [Limitations](#known-limitations)

<img src="assets/banner.svg" alt="HyperAudio: Sound, in focus." width="100%">

</div>

---

## Overview

HyperAudio publishes correction kits for two playback systems: the **KZ EDX Pro** IEM and the **Redmi 12** speaker. Each kit is scoped to the hardware and the evidence actually available. This is not a general-purpose preset collection.

The two profiles are deployed differently:

| Profile | Configuration | Load | Guide |
|---|---|---|---|
| KZ EDX Pro | VDC → IRS → EEL2 | `EDX_HD.vdc`, `EDX_HD.irs`, `EDX_HD.eel` | [IEM setup guide](iem/guide.md) |
| Redmi 12 | VDC → IRS → EEL2 (V6 core) | `SPK_v6.vdc`, `SPK_v6.irs`, `SPK_v6.eel` | [V6 technical report](speaker/report.md) |
| Redmi 12 | Standalone PEQ and limiter (alternative) | `SPK_v7c.eel` only, from the library | [Speaker setup guide](speaker/guide.md) |

> [!WARNING]
> The two Speaker configurations are alternatives. Never combine them. The standalone guide excludes the Speaker VDC and IRS.

> [!NOTE]
> **Documentation status.** The IEM guide and report describe the previous v3 core, now in `iem/library/v3/`. The default export is the HD core in `iem/core/`.

| Profiles | Files per chain | Host rate | Tonal stages |
|:--:|:--:|:--:|:--:|
| **2** | **3** | **48 kHz** | **1** |
| KZ EDX Pro, Redmi 12 | VDC, IRS, EEL2 | Verify the running rate | No duplicated EQ |

See the [methodology](docs/methodology.md) for the evidence model and processing rationale.

---

## Device profiles

### Redmi 12 · Speaker

`speaker/` · V6 frozen, standalone PEQ V1.0

- **IRS:** 8192 taps, 48 kHz, float32 stereo.
- **Standalone setup:** Liveprog PEQ plus a stereo-linked look-ahead limiter. Do not load the VDC or IRS with it.
- **Frozen assets:** the V6 VDC and IRS remain in the repository and are documented in the technical report.

[Standalone setup guide](speaker/guide.md) · [V6 technical report](speaker/report.md)

### KZ EDX Pro · IEM

`iem/core/` · HD core

- **IRS:** 4-channel true stereo, 2851 taps, 48 kHz, float32. Driver: 24 Ω, 112 dB/mW.
- **DDC:** 14 biquad sections.
- **EEL:** lookahead limiter.
- **Voicing:** a labelled design choice, not a measurement-derived target.

[Setup guide](iem/guide.md) · [Technical report](iem/report.md)

---

## Processing architecture

The three-file chain below is used by the IEM profile and the frozen Speaker V6 assets. It is not the standalone Speaker PEQ configuration.

```mermaid
flowchart LR
    A[Source] --> B["VDC<br/>Identity filterbank"]
    B --> C["IRS<br/>Minimum-phase FIR<br/>Tonal correction"]
    C --> D["EEL2 Liveprog<br/>Effects / Limiter"]
    D --> E[Output]
```

[!IMPORTANT]
Tonal correction lives in the IRS. The Speaker VDC is an identity filterbank. The IEM HD VDC is a tuned 14-section bank that pairs with its IRS. Never load the same EQ in more than one stage, because it is then applied more than once.

---

Quick start

1. Pick the right guide first. The IEM guide uses the three-file chain. The Speaker guide uses the standalone EEL only.
2. Set the host rate to 48 kHz and verify the running rate. For the IEM chain, set the convolver preamp to 0 dB.
3. Disable other processing: extra EQ, bass enhancement, the app's own crossfeed and OEM sound effects.
4. Load in order. IEM: DDC (.vdc), then Convolver (.irs), then Liveprog (.eel). Speaker: Liveprog only.
5. Start at low volume and confirm the profile and processing mode.

```text
KZ EDX Pro (load all three)         Redmi 12 (load all three)
iem/core/                           speaker/core/
├── EDX_HD.vdc                      ├── SPK_v6.vdc
├── EDX_HD.irs                      ├── SPK_v6.irs
└── EDX_HD.eel                      └── SPK_v6.eel
```

---

The browser site

Open HyperAudio. It is a static site with no build step, and all computation runs locally in the browser.

Feature What it does
Profiles Switches between the KZ EDX Pro and Redmi 12 chains.
Response chart Plots the response of the hosted IRS on a log-frequency axis with 1/6-octave smoothing.
Quality assurance Fetches the hosted VDC, IRS and EEL files and checks them in the browser. Downloads are blocked when a check fails.
Export Downloads the profile files or copies a 127-point GraphicEQ curve derived from the IRS.
Verification harness Runs offline checks. This is not native app, ARM or device validation.
Documentation reader Opens repository documents in the site. Example deep link: #read/docs/methodology.md.

---

Data and targets

The corrections are fitted to measurement data and target curves kept in data/. Both targets are custom and offline-computed. They are not published standards.

File Content
data/Raw/kz_edx_pro_raw.txt KZ EDX Pro raw response, 695 points
data/Raw/redmi12_speaker_raw.txt Redmi 12 speaker raw response, 59 points
data/target/kz_edx_pro_target.txt IEM target, 701 points, dB relative to 1 kHz
data/target/redmi12_speaker_target.txt Speaker target, 701 points, dB relative to 1 kHz

<p align="center">
  <img src="assets/KZ_EDX_Pro_target.png" alt="KZ EDX Pro raw response against target" width="49%">
  <img src="assets/Redmi12_Speaker_target.png" alt="Redmi 12 speaker raw response against target" width="49%">
</p>

Method and principles: Raw and target curves.

---

Add-ons

addons/ holds two optional impulse responses and three EasyEffects reference presets. See the add-on guide.

[!WARNING]
The add-on IRS files are not level-matched to the project gates. Measured maximum gain from 20 Hz to 20 kHz: BBE SonicMax.irs +7.9 dB (left) and +9.8 dB (right); EFOtech MLV 01024 (True Stereo, 48kHz).irs +3.7 to +5.3 dB across its four channels. The project gate is 0 dB. The convolver loads one IRS at a time, so an add-on IRS replaces the tonal-correction IRS rather than adding to it. Lower the volume before trying one.

The three .json files cannot be loaded by RootlessJamesDSP. They are references only.

---

Documentation

Reference Purpose Read
VDC reference Shipped VDC structure and evidence boundaries Site
IRS reference IRS format, metrics and validation Site
EEL2 reference VM syntax, parser constraints and implementation guidance Site
System reference Architecture, profile state, operation, evidence and limitations Site
Methodology Synthesis, gating and evidence method Site
Test report Results, scope and open questions Site
Style guide How every document in this repository is written Site
Repository map Annotated list of every file Site
Speaker setup guide Redmi 12 standalone installation Site
IEM setup guide KZ EDX Pro installation Site
Speaker report Speaker V6 numerical report Site
IEM report IEM numerical report Site
Raw and target curves Measurement and target method Site
Add-on guide Optional IRS files and reference presets Site
Attribution Third-party sources and credits Site
Licence summary Licence scope and notices GitHub

Verification harnesses

<p align="center">
  <img src="assets/Speaker_AB_Harness.svg" alt="Speaker verification harness report" width="49%">
  <img src="assets/IEM_AB_Harness.svg" alt="IEM verification harness report" width="49%">
</p>

---

Validation and evidence

Component Offline / numerical App or device Listening
Speaker VDC PASS identity USER REPORTED USER REPORTED
Speaker IRS PASS USER REPORTED USER REPORTED
Speaker EEL V6 (previous revision) PARTIAL compile, ceiling, bypass; non-finite rerun pending USER REPORTED USER REPORTED
Speaker EEL standalone V1.0 No recorded test NOT RUN NOT RUN
IEM VDC PASS stable USER REPORTED USER REPORTED
IEM IRS PASS USER REPORTED USER REPORTED
IEM EEL effects path Prior v4 checks: effects, ceiling, bypass, non-finite NOT RUN for v5 NOT RUN
IEM EEL v5 mode selector Source review only; VM retest pending NOT RUN NOT RUN

Evidence boundary. Offline checks use a source-built JamesDSP VM on x86_64. They are not native ARM, RootlessJamesDSP app, target-device or listening tests. Numerically qualified does not mean device validated. Full scope and outstanding work: test report. Label definitions: methodology.

---

Known limitations

· Reproducibility: iem_build.py, generate_irs.py and the complete source inputs are not included. The published IRS cannot be regenerated from this repository alone.
· Speaker IRS provenance: the measurement setup is not documented. If a microphone response was part of the source measurement, it is also in the filter.
· IEM voicing: it has no measurement behind it and is a design choice.
· Spatial processing: the IEM surround feature is crossfeed plus width, not HRTF virtualisation.
· ARM: EEL tests ran on x86_64. The v5 processing-mode selector has not been tested in the VM or on a device.
· Limiter scope: sample-peak limiting is not true-peak limiting or driver-excursion protection.
· Sample rate: the IRS assets are 48 kHz only. Another host rate changes timing and frequency behaviour.

---

Integrity

Verify the shipped assets from the repository root:

```bash
sha256sum -c SHA256SUMS
```

SHA256SUMS is the source of truth. The table shows it as of commit 80cd3b6.

<details>
<summary><b>SHA-256 checksums</b></summary>

File SHA-256
speaker/core/SPK_v6.vdc 953227f5aaafabb11694422e81a1968cc2515d7a5fa665a8e9ab2331df25618b
speaker/core/SPK_v6.irs 0ba8da0f4351aca761e3c7e39b37bccf9b61403f7d92ed60ecf1b23cda0c7de4
speaker/core/SPK_v6.eel dfcb7131bb4c1a9e8937e0ef1d86ac05137fb73d272b8e7826f8436d7f023ab7
iem/core/EDX_HD.vdc 827fca7002c1d8a5922c183236314b256c7a4b5837e9a7c2cc88dd910d985e40
iem/core/EDX_HD.irs 2b04189b3a0d9191bde649abdfc838b4df56ff4651f5ccff34f6441ca71d1aa2
iem/core/EDX_HD.eel add51f5d06895f14d1f970753baf86aa85098a3335c40a6e45a547969d11dca1

Library hashes are in SHA256SUMS and on each download card.

</details>

---

Repository structure

The repository map lists every file with its size and purpose.

<details>
<summary><b>Show repository tree</b></summary>

```text
HyperAudioo/
├── README.md · index.html · ATTRIBUTION.md · SHA256SUMS
├── LICENSE · LICENSE.md · LICENSE-MIT · LICENSE-CC-BY-SA-4.0
├── robots.txt · site.webmanifest · sitemap.xml
├── speaker/
│   ├── core/       SPK_v6.vdc · .irs · .eel
│   ├── library/    adv7 · v1 · v5 · v7 · v7c · v8 · v9 · v10 · vdcu
│   ├── guide.md
│   └── report.md
├── iem/
│   ├── core/       EDX_HD.vdc · .irs · .eel
│   ├── library/    v1 · v2-* · v3 · v4 · v5c/g/z · v10 · vdcu
│   ├── guide.md
│   └── report.md
├── data/           assets.json · assets.meta.json · curves
├── tools/          build_assets.py
├── docs/
│   ├── vdc_functions.md · irs_functions.md · eel_functions.md
│   ├── system_full.md · methodology.md · test_report.md
│   └── style_guide.md · repository_map.md
├── data/
│   ├── methodology.md
│   ├── Raw/      kz_edx_pro_raw.txt · redmi12_speaker_raw.txt
│   └── target/   kz_edx_pro_target.txt · redmi12_speaker_target.txt
├── addons/
│   ├── effects.md
│   ├── BBE SonicMax.irs
│   ├── EFOtech MLV 01024 (True Stereo, 48kHz).irs
│   └── Concert Hall.json · GentleDynamics.json · Night Listening.json
└── assets/       site code, images, fonts and harness reports
```

</details>

---

Licence

Scope Licence
EEL2 code (.eel) MIT
Audio artifacts (.irs, .vdc) and reports CC BY-SA 4.0

---

Credits

See ATTRIBUTION.md. Presets derive from AutoEq-format data (jaakkopasanen/AutoEq, MIT) via RikudouGoku's database, corroborated by Speaker Ranking. The EEL2 scripts target the VM in RootlessJamesDSP (ThePBone, Apache 2.0). No third-party code is redistributed.

data/Raw/ contains raw measurement files. Their source and redistribution terms are not documented here. See the attribution notice.

<div align="center">

<sub>Designed &amp; tuned by <b>Noushad M.</b> ~ © 2026</sub>

</div>
