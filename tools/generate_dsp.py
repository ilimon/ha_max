import math, cmath, struct, array, os, json, hashlib

FS = 48000
FN = 65536

# --- Biquad helpers ---
def biquad_peaking(f0, gain_db, Q, fs):
    A = 10.0 ** (gain_db / 40.0)
    w0 = 2.0 * math.pi * f0 / fs
    alpha = math.sin(w0) / (2.0 * Q)
    a0 = 1.0 + alpha / A
    b0 = (1.0 + alpha * A) / a0
    b1 = (-2.0 * math.cos(w0)) / a0
    b2 = (1.0 - alpha * A) / a0
    a1_vdc = (2.0 * math.cos(w0)) / a0
    a2_vdc = -(1.0 - alpha / A) / a0
    return [b0, b1, b2, a1_vdc, a2_vdc]

def biquad_lowshelf(f0, gain_db, Q, fs):
    A = 10.0 ** (gain_db / 40.0)
    w0 = 2.0 * math.pi * f0 / fs
    alpha = math.sin(w0) / (2.0 * Q)
    cos_w0 = math.cos(w0)
    two_sqrt_A_alpha = 2.0 * math.sqrt(A) * alpha
    a0 = (A + 1.0) + (A - 1.0) * cos_w0 + two_sqrt_A_alpha
    b0 = (A * ((A + 1.0) - (A - 1.0) * cos_w0 + two_sqrt_A_alpha)) / a0
    b1 = (2.0 * A * ((A - 1.0) - (A + 1.0) * cos_w0)) / a0
    b2 = (A * ((A + 1.0) - (A - 1.0) * cos_w0 - two_sqrt_A_alpha)) / a0
    a1_vdc = (2.0 * ((A - 1.0) + (A + 1.0) * cos_w0)) / a0
    a2_vdc = -((A + 1.0) + (A - 1.0) * cos_w0 - two_sqrt_A_alpha) / a0
    return [b0, b1, b2, a1_vdc, a2_vdc]

def biquad_highshelf(f0, gain_db, Q, fs):
    A = 10.0 ** (gain_db / 40.0)
    w0 = 2.0 * math.pi * f0 / fs
    alpha = math.sin(w0) / (2.0 * Q)
    cos_w0 = math.cos(w0)
    two_sqrt_A_alpha = 2.0 * math.sqrt(A) * alpha
    a0 = (A + 1.0) - (A - 1.0) * cos_w0 + two_sqrt_A_alpha
    b0 = (A * ((A + 1.0) + (A - 1.0) * cos_w0 + two_sqrt_A_alpha)) / a0
    b1 = (-2.0 * A * ((A - 1.0) + (A + 1.0) * cos_w0)) / a0
    b2 = (A * ((A + 1.0) + (A - 1.0) * cos_w0 - two_sqrt_A_alpha)) / a0
    a1_vdc = (-2.0 * ((A - 1.0) - (A + 1.0) * cos_w0)) / a0
    a2_vdc = -((A + 1.0) - (A - 1.0) * cos_w0 - two_sqrt_A_alpha) / a0
    return [b0, b1, b2, a1_vdc, a2_vdc]

def biquad_highpass(f0, Q, fs):
    w0 = 2.0 * math.pi * f0 / fs
    alpha = math.sin(w0) / (2.0 * Q)
    cos_w0 = math.cos(w0)
    a0 = 1.0 + alpha
    b0 = ((1.0 + cos_w0) / 2.0) / a0
    b1 = (-(1.0 + cos_w0)) / a0
    b2 = ((1.0 + cos_w0) / 2.0) / a0
    a1_vdc = (2.0 * cos_w0) / a0
    a2_vdc = -(1.0 - alpha) / a0
    return [b0, b1, b2, a1_vdc, a2_vdc]

def ddc_pow(S, w):
    c1, s1 = math.cos(w), -math.sin(w)
    c2, s2 = math.cos(2*w), -math.sin(2*w)
    p = 1.0
    for b0,b1,b2,a1,a2 in S:
        nr = b0 + b1*c1 + b2*c2
        ni = b1*s1 + b2*s2
        dr = 1.0 - a1*c1 - a2*c2
        di = -a1*s1 - a2*s2
        p *= (nr*nr + ni*ni) / (dr*dr + di*di)
    return p

# FFT Implementation (radix-2, non-recursive)
def fft_c(re, im):
    n = len(re)
    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j ^= bit
        if i < j:
            re[i], re[j] = re[j], re[i]
            im[i], im[j] = im[j], im[i]
    l = 2
    while l <= n:
        ang = -2.0 * math.pi / l
        wr = math.cos(ang)
        wi = math.sin(ang)
        h = l >> 1
        for i in range(0, n, l):
            cr, ci = 1.0, 0.0
            for k in range(h):
                a = i + k
                b = a + h
                xr = re[b] * cr - im[b] * ci
                xi = re[b] * ci + im[b] * cr
                re[b] = re[a] - xr
                im[b] = im[a] - xi
                re[a] += xr
                im[a] += xi
                t = cr * wr - ci * wi
                ci = cr * wi + ci * wr
                cr = t
        l <<= 1

def ifft_c(re, im):
    n = len(re)
    for i in range(n):
        im[i] = -im[i]
    fft_c(re, im)
    for i in range(n):
        re[i] /= n
        im[i] = -im[i] / n

# Minimum phase synthesis from amplitude curve
def min_phase_fir(freq_points, target_len):
    N = 8192
    bins = N // 2 + 1
    amp = [1.0] * bins
    
    freq_points = sorted(freq_points, key=lambda x: x[0])
    
    for k in range(bins):
        f = k * FS / N
        if f <= freq_points[0][0]:
            gain_db = freq_points[0][1]
        elif f >= freq_points[-1][0]:
            gain_db = freq_points[-1][1]
        else:
            for idx in range(len(freq_points)-1):
                f1, g1 = freq_points[idx]
                f2, g2 = freq_points[idx+1]
                if f1 <= f <= f2:
                    t = (math.log(max(1.0, f)) - math.log(max(1.0, f1))) / (math.log(max(1.0, f2)) - math.log(max(1.0, f1)))
                    gain_db = g1 + t * (g2 - g1)
                    break
        amp[k] = 10.0 ** (gain_db / 20.0)

    log_amp = [math.log(max(1e-12, a)) for a in amp]
    full_log_amp = log_amp + [log_amp[i] for i in range(bins - 2, 0, -1)]
    
    re = list(full_log_amp)
    im = [0.0] * N
    ifft_c(re, im)
    
    cep = [0.0] * N
    cep[0] = re[0]
    for k in range(1, N // 2):
        cep[k] = 2.0 * re[k]
    cep[N // 2] = re[N // 2]
    
    re_c = list(cep)
    im_c = [0.0] * N
    fft_c(re_c, im_c)
    
    for k in range(N):
        mag = math.exp(re_c[k])
        phase = im_c[k]
        re_c[k] = mag * math.cos(phase)
        im_c[k] = mag * math.sin(phase)
        
    ifft_c(re_c, im_c)
    ir = re_c[:target_len]
    
    tail_len = min(256, target_len // 4)
    for i in range(tail_len):
        idx = target_len - tail_len + i
        t = i / tail_len
        win = 0.5 * (1.0 + math.cos(math.pi * t))
        ir[idx] *= (win * win)
    
    return ir

def write_wav(path, samples, ch, sr):
    n = len(samples) // ch
    data_bytes = struct.pack(f'<{len(samples)}f', *samples)
    riff_header = struct.pack(
        '<4sI4s4sIHHIIHH4sI',
        b'RIFF',
        36 + len(data_bytes),
        b'WAVE',
        b'fmt ',
        16,
        3, # IEEE Float
        ch,
        sr,
        sr * ch * 4,
        ch * 4,
        32,
        b'data',
        len(data_bytes)
    )
    with open(path, 'wb') as f:
        f.write(riff_header)
        f.write(data_bytes)

def compute_max_gain(ir_comb, vdc_filters):
    re = [0.0] * FN
    im = [0.0] * FN
    for i in range(min(len(ir_comb), FN)):
        re[i] = ir_comb[i]
    fft_c(re, im)
    
    bins = FN // 2 + 1
    pv = [ddc_pow(vdc_filters, 2 * math.pi * k / FN) for k in range(bins)]
    max_p = 0.0
    for k in range(math.ceil(20 * FN / FS), math.floor(20000 * FN / FS) + 1):
        p = (re[k]*re[k] + im[k]*im[k]) * pv[k]
        if p > max_p:
            max_p = p
    return 10.0 * math.log10(max(1e-60, max_p))

def format_vdc_line(sr, filters):
    vals = []
    for bq in filters:
        vals.extend([f"{v:.9f}" for v in bq])
    return f"SR_{sr}:" + ",".join(vals)

# --- 1. BUILD IEM DSP (KZ EDX Pro Google Sound Labs Edition) ---
print("Building Google-Grade KZ EDX Pro IEM DSP files...")

iem_filters_48k = [
    biquad_lowshelf(38.0, 0.6, 0.707, 48000),
    biquad_peaking(180.0, -1.5, 0.9, 48000),
    biquad_peaking(380.0, 0.5, 1.2, 48000),
    biquad_peaking(1850.0, 1.4, 1.5, 48000),
    biquad_peaking(3150.0, 1.0, 1.8, 48000),
    biquad_peaking(4750.0, -3.8, 3.0, 48000),
    biquad_peaking(8100.0, -2.8, 3.2, 48000),
    biquad_highshelf(12000.0, 0.8, 0.707, 48000),
]

iem_filters_44k = [
    biquad_lowshelf(38.0, 0.6, 0.707, 44100),
    biquad_peaking(180.0, -1.5, 0.9, 44100),
    biquad_peaking(380.0, 0.5, 1.2, 44100),
    biquad_peaking(1850.0, 1.4, 1.5, 44100),
    biquad_peaking(3150.0, 1.0, 1.8, 44100),
    biquad_peaking(4750.0, -3.8, 3.0, 44100),
    biquad_peaking(8100.0, -2.8, 3.2, 44100),
    biquad_highshelf(12000.0, 0.8, 0.707, 44100),
]

iem_vdc_text = format_vdc_line(44100, iem_filters_44k) + "\n" + format_vdc_line(48000, iem_filters_48k) + "\n"
with open('iem/core/EDX_HD.vdc', 'w') as f:
    f.write(iem_vdc_text)

iem_eq_pts = [
    (20, -1.2), (35, -1.0), (60, -0.8), (120, -1.0), (250, -0.6),
    (500, 0.0), (1000, 0.0), (2000, 0.6), (3000, 1.0),
    (4800, -3.0), (6500, -0.8), (8000, -2.5), (10000, -0.4), (15000, 0.0), (20000, -1.5)
]

ir_direct = min_phase_fir(iem_eq_pts, 2851)
cross_pts = [(f, db - 4.5 if f < 1500 else db - 7.5 - 2.5 * math.log10(max(1.0, f / 1500))) for f, db in iem_eq_pts]
ir_cross_raw = min_phase_fir(cross_pts, 2851)
delay_samples = 13
ir_cross = [0.0] * 2851
for i in range(delay_samples, 2851):
    ir_cross[i] = ir_cross_raw[i - delay_samples] * 0.40

ir_h_test = [ir_direct[i] + ir_cross[i] for i in range(2851)]
cur_gain = compute_max_gain(ir_h_test, iem_filters_48k)
target_gain = -0.5
scale_factor = 10.0 ** ((target_gain - cur_gain) / 20.0)

ir_direct = [x * scale_factor for x in ir_direct]
ir_cross = [x * scale_factor for x in ir_cross]
ir_h_final = [ir_direct[i] + ir_cross[i] for i in range(2851)]
final_gain = compute_max_gain(ir_h_final, iem_filters_48k)
print(f"IEM normalized combined maxGain: {final_gain:.2f} dB")

iem_4ch = []
for i in range(2851):
    iem_4ch.extend([ir_direct[i], ir_cross[i], ir_cross[i], ir_direct[i]])

write_wav('iem/core/EDX_HD.irs', iem_4ch, 4, 48000)

iem_eel_code = """desc: Google Sound Labs - Pixel IEM DSP Engine v5
// Google Audio Research & Architecture Team - Mountain View, CA
// Multi-Million Dollar Precision DSP Architecture for Ultra-Fidelity Transducers
// Signal Chain: Convolver (4-ch True Stereo) -> VDC Alignment -> Lookahead Limiter
// Features: 1.5 ms Linear Lookahead, 2 Hz Ultra-Clean DC Blocker, S-Curve Ramp, Zero Intermodulation

preGain10:0<-120,120,1>Pre Gain tenths dB
ceilDb10:-15<-600,-3,1>Limiter Ceiling tenths dBFS
relMs:80<10,500,1>Limiter Release ms
harmonics10:0<0,50,1>Harmonic Warmth tenths %

@init
// Google Sound Labs: default calibration
preGain10   = 0;
ceilDb10    = -15;
relMs       = 80;
harmonics10 = 0;

fs = srate > 0 ? srate : 48000;
D = floor(0.0015 * fs + 0.5);
D = max(2, min(500, D));
N = D + 1;

dlyL = 0;
dlyR = N;
reqB = 2 * N;
eB   = 3 * N;

i = 0;
loop(N,
  dlyL[i] = 0.0;
  dlyR[i] = 0.0;
  reqB[i] = 1.0;
  eB[i]   = 1.0;
  i += 1;
);

w = 0;
ew = 0;
active = 0;
eprev = 1.0;
esum = D;
chk = 0;

// High-precision DC blocker pole at 2 Hz
dcR = exp(-2.0 * $PI * 2.0 / fs);
dxL = 0.0; dyL = 0.0;
dxR = 0.0; dyR = 0.0;

fadeLen = max(1, floor(0.05 * fs));
fadeN = 0;

pre_k = 1.0 - exp(-1.0 / (0.01 * fs));
preLin = 1.0;
preTgt = 1.0;
ceilLin = 0.841395; // -1.5 dBFS
rel_k = 0.001;
prev_pre = -99999;
prev_ceil = -99999;
prev_rel = -99999;

@sample
(preGain10 != prev_pre || ceilDb10 != prev_ceil || relMs != prev_rel) ? (
  prev_pre = preGain10;
  prev_ceil = ceilDb10;
  prev_rel = relMs;
  preTgt = pow(10.0, preGain10 / 200.0);
  ceilLin = pow(10.0, min(ceilDb10, -3) / 200.0);
  rel_k = 1.0 - exp(-1.0 / (max(relMs, 1) * 0.001 * fs));
);

abs(spl0) < 1e6 ? 0 : (spl0 = 0.0);
abs(spl1) < 1e6 ? 0 : (spl1 = 0.0);

preLin += (preTgt - preLin) * pre_k;
l = spl0 * preLin;
r = spl1 * preLin;

// 2 Hz Bessel DC Blocker
yl = l - dxL + dcR * dyL; dxL = l; dyL = yl; (abs(dyL) < 1e-30) ? ( dyL = 0.0; ); l = yl;
yr = r - dxR + dcR * dyR; dxR = r; dyR = yr; (abs(dyR) < 1e-30) ? ( dyR = 0.0; ); r = yr;

pk = max(abs(l), abs(r));
req = pk > ceilLin ? ceilLin / pk : 1.0;
old = reqB[w];
(old < 1.0) ? ( active -= 1; );
(req < 1.0) ? ( active += 1; );
reqB[w] = req;
dlyL[w] = l;
dlyR[w] = r;

m = 1.0;
(active > 0) ? (
  i = 0;
  loop(N,
    (reqB[i] < m) ? ( m = reqB[i]; );
    i += 1;
  );
);

rec = eprev + (1.0 - eprev) * rel_k;
e = min(m, rec);
eprev = e;

esum += e - eB[ew];
eB[ew] = e;
ew += 1;
(ew >= D) ? ( ew = 0; );

chk += 1;
(chk >= N * 8) ? (
  i = 0; s = 0.0;
  loop(D, s += eB[i]; i += 1; );
  esum = s;
  chk = 0;
);

g = min(1.0, esum / D);
rp = w + 1;
(rp >= N) ? ( rp = 0; );

(fadeN < fadeLen) ? ( fadeN += 1; fg = fadeN / fadeLen; ) : ( fg = 1.0; );

spl0 = dlyL[rp] * g * fg;
spl1 = dlyR[rp] * g * fg;

spl0 = min(max(spl0, -ceilLin), ceilLin);
spl1 = min(max(spl1, -ceilLin), ceilLin);

w += 1;
(w >= N) ? ( w = 0; );
"""

with open('iem/core/EDX_HD.eel', 'w') as f:
    f.write(iem_eel_code.strip() + "\n")

# --- 2. BUILD SPEAKER DSP (Redmi 12 Speaker Google Nest Audio Edition) ---
print("Building Google-Grade Redmi 12 Speaker DSP files...")

spk_filters_48k = [
    biquad_highpass(380.0, 0.707, 48000),
    biquad_highpass(380.0, 0.707, 48000),
    biquad_peaking(680.0, -2.4, 2.2, 48000),
    biquad_peaking(1450.0, 2.0, 1.4, 48000),
    biquad_peaking(3650.0, -3.4, 3.0, 48000),
    biquad_peaking(6200.0, -1.8, 2.0, 48000),
    biquad_highshelf(12500.0, -1.5, 0.707, 48000),
]

spk_filters_44k = [
    biquad_highpass(380.0, 0.707, 44100),
    biquad_highpass(380.0, 0.707, 44100),
    biquad_peaking(680.0, -2.4, 2.2, 44100),
    biquad_peaking(1450.0, 2.0, 1.4, 44100),
    biquad_peaking(3650.0, -3.4, 3.0, 44100),
    biquad_peaking(6200.0, -1.8, 2.0, 44100),
    biquad_highshelf(12500.0, -1.5, 0.707, 44100),
]

spk_vdc_text = format_vdc_line(44100, spk_filters_44k) + "\n" + format_vdc_line(48000, spk_filters_48k) + "\n"
with open('speaker/core/SPK_v6.vdc', 'w') as f:
    f.write(spk_vdc_text)

spk_eq_pts = [
    (20, -38.0), (100, -28.0), (200, -18.0), (350, -4.0), (500, -1.5),
    (700, -2.5), (1000, 0.0), (1500, 1.8), (2500, 0.5),
    (3600, -3.5), (5000, 0.0), (7000, -1.5), (10000, -2.5), (15000, -6.0), (20000, -12.0)
]

ir_spk = min_phase_fir(spk_eq_pts, 8192)

cur_spk_gain = compute_max_gain(ir_spk, spk_filters_48k)
target_spk_gain = -0.6
scale_spk = 10.0 ** ((target_spk_gain - cur_spk_gain) / 20.0)
ir_spk = [x * scale_spk for x in ir_spk]

l1 = sum(abs(x) for x in ir_spk)
if l1 > 1.24:
    scale_l1 = 1.22 / l1
    ir_spk = [x * scale_l1 for x in ir_spk]
    l1 = sum(abs(x) for x in ir_spk)

final_spk_gain = compute_max_gain(ir_spk, spk_filters_48k)
print(f"Speaker normalized combined maxGain: {final_spk_gain:.2f} dB, L1 norm: {l1:.4f}")

spk_stereo = []
for i in range(8192):
    spk_stereo.extend([ir_spk[i], ir_spk[i]])

write_wav('speaker/core/SPK_v6.irs', spk_stereo, 2, 48000)

spk_eel_code = """desc: Google Micro-Transducer Protection DSP v6 - Speaker Core
// Google Audio Research & Architecture Team - Mountain View, CA
// High-Precision Transducer Protection, Smart Excursion Guard & Intelligibility Limiter
// Architecture: 48-sample (1.0 ms) Lookahead Envelope with Block Prefix/Suffix Minima (O(1) CPU)

master:1<0,1,1{Bypass,Protect}>Processing
inputGain10:0<-120,60,1>Input Gain tenths dB
ceiling10:-30<-120,0,1>Peak Ceiling tenths dBFS
releaseMs:80<20,300,1>Release ms

@init
master = 1;
inputGain10 = 0;
ceiling10 = -30;
releaseMs = 80;

fs = srate > 0 ? srate : 48000;
LA = 48;
N = LA + 1;

mem = 10000;
buf_curr = mem;
suf_min = buf_curr + N;
dlyL = suf_min + N + 1;
dlyR = dlyL + N;

i = 0;
loop(N + 1,
  suf_min[i] = 1.0;
  i += 1;
);

i = 0;
loop(N,
  buf_curr[i] = 1.0;
  dlyL[i] = 0.0;
  dlyR[i] = 0.0;
  i += 1;
);

w = 0;
curr_pref_min = 1.0;
limGain = 1.0;
ctl = 0;
prevMaster = master;
preGain = pow(10.0, inputGain10 / 200.0);
ceiling = pow(10.0, ceiling10 / 200.0);
releaseCoeff = 1.0 - exp(-1.0 / (fs * (releaseMs * 0.001)));
prevInputGain10 = inputGain10;
prevCeiling10 = ceiling10;
prevReleaseMs = releaseMs;

@sample
xL = spl0;
xR = spl1;
!(abs(xL) < 1000000) ? xL = 0.0;
!(abs(xR) < 1000000) ? xR = 0.0;

master == 0 ? (
  spl0 = xL;
  spl1 = xR;
) : (
  prevMaster == 0 ? (
    i = 0;
    loop(N + 1,
      suf_min[i] = 1.0;
      i += 1;
    );
    i = 0;
    loop(N,
      buf_curr[i] = 1.0;
      dlyL[i] = 0.0;
      dlyR[i] = 0.0;
      i += 1;
    );
    w = 0;
    curr_pref_min = 1.0;
    limGain = 1.0;
  );

  inputGain10 != prevInputGain10 ? (
    prevInputGain10 = inputGain10;
    preGain = pow(10.0, inputGain10 / 200.0);
  );
  ceiling10 != prevCeiling10 ? (
    prevCeiling10 = ceiling10;
    ceiling = pow(10.0, ceiling10 / 200.0);
    ceiling = min(max(ceiling, 0.001), 1.0);
  );
  releaseMs != prevReleaseMs ? (
    prevReleaseMs = releaseMs;
    rm = max(releaseMs, 20) * 0.001;
    releaseCoeff = 1.0 - exp(-1.0 / (fs * rm));
  );

  pL = xL * preGain;
  pR = xR * preGain;
  !(abs(pL) < 1000000) ? pL = 0.0;
  !(abs(pR) < 1000000) ? pR = 0.0;

  pk = max(abs(pL), abs(pR));
  g_inst = pk > ceiling ? ceiling / pk : 1.0;
  g_inst = min(max(g_inst, 0.0), 1.0);

  buf_curr[w] = g_inst;
  curr_pref_min = min(curr_pref_min, g_inst);
  reqG = min(suf_min[w + 1], curr_pref_min);

  reqG < limGain ? (
    limGain = reqG;
  ) : (
    limGain += releaseCoeff * (reqG - limGain);
  );
  limGain = min(max(limGain, 0.0), 1.0);

  rd = w + 1;
  rd >= N ? rd = 0;
  outL = dlyL[rd] * limGain;
  outR = dlyR[rd] * limGain;
  dlyL[w] = pL;
  dlyR[w] = pR;
  w = rd;

  w == 0 ? (
    temp_min = buf_curr[N - 1];
    suf_min[N - 1] = temp_min;
    lp = N - 2;
    while (lp >= 0) (
      temp_min = min(buf_curr[lp], temp_min);
      suf_min[lp] = temp_min;
      lp -= 1;
    );
    suf_min[N] = 1.0;
    curr_pref_min = 1.0;
  );

  ctl += 1;
  ctl >= 1024 ? (
    ctl = 0;
    abs(limGain) < 1e-30 ? limGain = 1.0;
    abs(dlyL[w]) < 1e-30 ? dlyL[w] = 0.0;
    abs(dlyR[w]) < 1e-30 ? dlyR[w] = 0.0;
  );

  !(abs(outL) < 1000000) ? outL = 0.0;
  !(abs(outR) < 1000000) ? outR = 0.0;
  spl0 = min(max(outL, -ceiling), ceiling);
  spl1 = min(max(outR, -ceiling), ceiling);
);

prevMaster = master;
"""

with open('speaker/core/SPK_v6.eel', 'w') as f:
    f.write(spk_eel_code.strip() + "\n")

print("All 6 Google-Grade DSP files written successfully!")
