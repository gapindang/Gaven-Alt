"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RefreshCw, Sliders, Type } from "lucide-react";

export const TEXT_PRESETS = {
  reference: `Gonna be somebody, oh I follow.
Running showers and the mist Oh and it's so cloudy
to know, know nothing at all. You, only. Enough time
there's two lines (walls). You give the lines w
Tell me what you need from me? Casio life and
what I needed to, to be kind water to life and
sheets in Paris. Hope the we've been fine before
It's a rush to the head. We The fire teeth
(It's just like the water). This was enough
not the past time. I ain't felt This time in years
First, I was rushing for a wait off my feet
waiting for a rush (Oh, help me up help me)
Infatuation's your rush (Help me were me?)
help me off my feet, yeah. Do you wish you em to be
Keep pushing on 'em, never let happens peaking but
(Do you wish you were me?). All what now it happens to me, upon his feet. By wheels
highs and lows, we shaded off and down to me)
we're still here, ride around in the sky
I love the way you make me feel (What a like up
Bet you wish you was me (You, just a down
(I need some help on my feet) Yeah, we down )
yeah, yeah. I be up to my feet. I'm down
feeling weak. Wake me up in a week. I'm gone
drivin' round) (Stroke my suck me, piped all
(Two is a crowd, quieting down). (Bite my still
pad me down, do whatever to fly for
It don't matter, pipe it down Two is a star
quieting down. What stays and what what you're here,
and what's here still. And what's here you feel.
Riding my two wheels. They're gone and still
still here, rid. They're gone and you're still
riding my two wheels I love the way you make me`,

  gaven: `GAVEN — a private archive of things I never said.
A digital sanctuary built for the words we chose to keep.
Write it. Keep it. Forget it. Find it again.
Some things are easier to write than to say out loud.
The rain tonight reminds me of the autumn before this one.
I wonder if I'll still remember this feeling one year from now.
A folded letter never sent, resting in the quiet dark.
Pages turning silently when everyone else is asleep.
We leave behind our traces in the margins of old notebooks.
Unspoken thoughts that outlive the passing of the seasons.
This place belongs to you, and only to you.
Enter whenever you are ready to remember what was kept.`,
};

interface KineticWavyTextProps {
  onEnterClick?: () => void;
  showControls?: boolean;
}

export default function KineticWavyText({
  onEnterClick,
  showControls = true,
}: KineticWavyTextProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [presetKey, setPresetKey] = useState<"reference" | "gaven">("reference");
  const [customText, setCustomText] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [intensity, setIntensity] = useState<number>(1.0); // 0.5 to 1.8
  const [speed, setSpeed] = useState<number>(1.0); // 0.5 to 2.0
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Mouse interaction coordinates
  const mouseRef = useRef<{ x: number; y: number; active: boolean; targetX: number; targetY: number }>({
    x: -9999,
    y: -9999,
    active: false,
    targetX: -9999,
    targetY: -9999,
  });

  const activeText = isCustom ? customText || TEXT_PRESETS.reference : TEXT_PRESETS[presetKey];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let lastTimestamp = performance.now();

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const lines = activeText.split("\n");
    const numRows = lines.length;
    const maxCols = Math.max(...lines.map((l) => l.length), 1);

    const render = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        time += delta * 1.5 * speed;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Pitch black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse interpolation
      if (mouseRef.current.active) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
      }

      // Responsive font metrics
      const isMobile = width < 768;
      const fontSize = isMobile ? Math.max(9, Math.min(11, width / 70)) : Math.max(12, Math.min(15, width / 95));
      const charSpacingX = fontSize * 0.62;
      const charSpacingY = fontSize * 1.38;

      const totalBlockWidth = maxCols * charSpacingX;
      const totalBlockHeight = numRows * charSpacingY;

      // Position block centered or slightly offset to left like reference image
      const startX = Math.max(20, (width - totalBlockWidth) * 0.42);
      const startY = Math.max(40, (height - totalBlockHeight) * 0.46);
      const centerX = width * 0.5;
      const centerY = height * 0.5;

      ctx.font = `${fontSize}px "JetBrains Mono", "IBM Plex Mono", Consolas, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Camera parameters
      const camDist = 480;

      // Collect transformed characters for Z-sorting
      interface RenderChar {
        ch: string;
        screenX: number;
        screenY: number;
        scale: number;
        z: number;
        opacity: number;
        angle: number;
      }

      const renderQueue: RenderChar[] = [];

      for (let r = 0; r < numRows; r++) {
        const line = lines[r];
        const v = r / numRows;

        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch === " ") continue;

          const u = c / maxCols;
          const baseX = startX + c * charSpacingX;
          const baseY = startY + r * charSpacingY;

          // Wave envelope: Left side remains flat/quiet, Right side undulates like a silky flag/cloth
          // Smoothstep activation starting at u = 0.38
          const waveStart = 0.38;
          const waveMask = Math.max(0, Math.min(1, (u - waveStart) / (1 - waveStart)));
          const envelope = Math.pow(waveMask, 1.45) * intensity;

          // Wave harmonic frequencies
          const kx = 3.6;
          const ky = 1.9;
          const phase = time;

          // Complex 3D undulation
          const sinWave = Math.sin(u * kx * Math.PI - phase + v * ky);
          const cosHarmonic = Math.cos(u * 7.5 - phase * 1.3 + v * 3.2) * 0.35;
          const waveTotal = sinWave + cosHarmonic;

          // Z-depth displacement
          let z = envelope * waveTotal * 135;

          // Horizontal displacement (cloth folding / foreshortening)
          const dZ_du = envelope * (kx * Math.PI * Math.cos(u * kx * Math.PI - phase + v * ky));
          let xOffset = -dZ_du * 12 * envelope;

          // Vertical drape ripple
          let yOffset = Math.sin(u * 2.8 - phase * 0.85 + v * 4.2) * 14 * envelope;

          // Interactive mouse wake
          if (mouseRef.current.active) {
            const mdx = baseX - mouseRef.current.x;
            const mdy = baseY - mouseRef.current.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);
            const radius = 240;
            if (dist < radius) {
              const falloff = Math.cos((dist / radius) * (Math.PI / 2));
              const ripple = Math.sin(dist * 0.06 - time * 6);
              z += falloff * 90 * ripple;
              xOffset += (mdx / (dist + 1)) * falloff * 24;
              yOffset += (mdy / (dist + 1)) * falloff * 24;
            }
          }

          // Camera perspective projection
          const perspective = camDist / Math.max(60, camDist + z);
          const screenX = (baseX + xOffset - centerX) * perspective + centerX;
          const screenY = (baseY + yOffset - centerY) * perspective + centerY;

          // Dynamic surface normal angle
          const angle = Math.atan2(yOffset, 35) * 0.3 + dZ_du * 0.007;

          // Depth shading: closer letters are bright crisp white, letters deep in folds get subtle shade
          const normalizedZ = (z + 120) / 240;
          const opacity = Math.max(0.35, Math.min(1.0, 0.45 + normalizedZ * 0.55));

          renderQueue.push({
            ch,
            screenX,
            screenY,
            scale: perspective,
            z,
            opacity,
            angle,
          });
        }
      }

      // Draw characters sorted by Z (back to front) for accurate 3D occlusion
      renderQueue.sort((a, b) => a.z - b.z);

      for (let i = 0; i < renderQueue.length; i++) {
        const item = renderQueue[i];
        ctx.save();
        ctx.translate(item.screenX, item.screenY);
        ctx.rotate(item.angle);
        ctx.scale(item.scale, item.scale);

        // Pristine monochromatic typography
        ctx.fillStyle = `rgba(245, 245, 240, ${item.opacity})`;
        ctx.fillText(item.ch, 0, 0);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.targetX = e.touches[0].clientX - rect.left;
        mouseRef.current.targetY = e.touches[0].clientY - rect.top;
        mouseRef.current.active = true;
      }
    };

    const onTouchEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeText, isPlaying, intensity, speed]);

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden select-none">
      {/* 3D Kinetic Typography Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair z-0"
        title="Move your mouse to interact with the wave"
      />

      {/* Subtle vignette border gradient */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_60%,rgba(0,0,0,0.85)_100%] z-10" />

      {/* Cinematic Centerpiece Branding Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-between min-h-screen p-8 pointer-events-none">
        {/* Top Minimal Brand Status */}
        <header className="w-full max-w-5xl flex items-center justify-between text-xs tracking-widest uppercase text-[#9A9892]/70 font-mono pointer-events-auto">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8A96B] animate-pulse" />
            <span>Digital Sanctuary</span>
          </div>
          <div className="hidden sm:block">Archive No. 001 // Est. 2024</div>
        </header>

        {/* Central Title & Enter Callout */}
        <div className="flex flex-col items-center text-center my-auto max-w-xl px-4 pointer-events-auto backdrop-blur-[2px] bg-black/30 p-8 rounded-2xl border border-white/5 shadow-2xl transition-all duration-700">
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-[0.2em] text-[#F2F0EA] mb-3">
            GAVEN
          </h1>
          <p className="font-sans text-sm md:text-base font-light text-[#9A9892] tracking-wide max-w-md leading-relaxed mb-8">
            A private archive of things I never said.
          </p>

          <button
            id="enter-sanctuary-btn"
            onClick={onEnterClick}
            className="group relative inline-flex items-center justify-center px-10 py-3.5 text-xs font-mono tracking-[0.3em] uppercase text-[#F2F0EA] border border-[#C8A96B]/50 hover:border-[#C8A96B] rounded-full transition-all duration-500 overflow-hidden bg-black/40 hover:bg-[#C8A96B]/10 hover:shadow-[0_0_30px_rgba(200,169,107,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              ENTER
              <span className="text-[#C8A96B] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8A96B]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>

          <span className="text-[11px] font-mono tracking-widest text-[#5F5D59] uppercase mt-4">
            private vault
          </span>
        </div>

        {/* Bottom Interactive HUD & Wave Controls */}
        {showControls && (
          <footer className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#9A9892]/80 pointer-events-auto">
            {/* Presets & Custom Text */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Type className="w-3.5 h-3.5 text-[#C8A96B]" />
              <button
                onClick={() => {
                  setIsCustom(false);
                  setPresetKey("reference");
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  !isCustom && presetKey === "reference"
                    ? "bg-white/20 text-[#F2F0EA]"
                    : "text-[#9A9892] hover:text-white"
                }`}
                title="Exact lyrics from reference image"
              >
                Lyrics (Image)
              </button>
              <button
                onClick={() => {
                  setIsCustom(false);
                  setPresetKey("gaven");
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  !isCustom && presetKey === "gaven"
                    ? "bg-white/20 text-[#F2F0EA]"
                    : "text-[#9A9892] hover:text-white"
                }`}
                title="GAVEN Sanctuary Manifesto"
              >
                GAVEN Manifesto
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${
                  showSettings ? "text-[#C8A96B]" : "text-[#9A9892]"
                }`}
                title="Wave and Custom Text Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Animation Play/Pause & Speed */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                title={isPlaying ? "Pause wave animation" : "Play wave animation"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#C8A96B]" />}
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </button>

              <span className="text-white/20">|</span>

              <span className="text-[11px] text-[#5F5D59] hidden sm:inline">
                Move cursor to ripple wave
              </span>
            </div>
          </footer>
        )}
      </div>

      {/* Floating Settings Drawer / Modal for custom text and parameters */}
      {showSettings && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg p-5 bg-[#151515]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-xs font-mono text-[#F2F0EA]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
            <span className="text-sm font-sans tracking-wide text-[#C8A96B]">Wave Parameters & Text</span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-[#9A9892] hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Wave Intensity Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-[#9A9892] mb-1">
              <span>Wave Amplitude</span>
              <span>{Math.round(intensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full accent-[#C8A96B] cursor-pointer"
            />
          </div>

          {/* Wave Speed Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-[#9A9892] mb-1">
              <span>Wave Velocity</span>
              <span>{Math.round(speed * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-[#C8A96B] cursor-pointer"
            />
          </div>

          {/* Custom Text Area */}
          <div>
            <div className="flex justify-between text-[#9A9892] mb-1">
              <span>Write / Paste Custom Text</span>
              <button
                onClick={() => {
                  setIsCustom(false);
                  setCustomText("");
                }}
                className="text-[10px] text-[#C8A96B] hover:underline"
              >
                Reset to Preset
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Type any lines of poetry or lyrics to see them flow in 3D wave..."
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setIsCustom(true);
              }}
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg p-2.5 text-xs text-[#F2F0EA] font-mono focus:outline-none focus:border-[#C8A96B]/60 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
