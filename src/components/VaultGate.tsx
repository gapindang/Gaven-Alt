"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { sanctuaryAudio } from "@/lib/audio";
import { getSupabaseClient } from "@/lib/supabase";

interface VaultGateProps {
  onUnlock: () => void;
  onBackToOpening: () => void;
}

export default function VaultGate({ onUnlock, onBackToOpening }: VaultGateProps) {
  const [email, setEmail] = useState("gavin.sanctuary@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    sanctuaryAudio.playGentleKeypress();
    setIsVerifying(true);

    const supabase = getSupabaseClient();

    // If Supabase is configured, try real auth login
    if (supabase && email.trim()) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        setIsVerifying(false);

        // Friendly error messages
        if (authError.message.includes("Email not confirmed")) {
          setError(
            "Email belum dikonfirmasi. Buka Supabase Dashboard → Authentication → Providers → Email → matikan 'Confirm email', lalu coba lagi."
          );
        } else if (
          authError.message.includes("Email logins are disabled") ||
          authError.message.includes("provider is not enabled")
        ) {
          setError(
            "Email login belum diaktifkan. Buka Supabase Dashboard → Authentication → Providers → aktifkan 'Email' provider."
          );
        } else if (authError.message.includes("Invalid login credentials") || authError.status === 422) {
          setError("Email atau password salah. Periksa kembali kredensial kamu.");
        } else {
          setError(`${authError.message} (${authError.status ?? 'unknown'})`);
        }
        return;
      }

      // Auth success
      sanctuaryAudio.playEnterChime();
      setIsVerifying(false);
      onUnlock();
      return;
    }

    // Offline / no Supabase: accept any password as owner passphrase
    setTimeout(() => {
      setIsVerifying(false);
      sanctuaryAudio.playEnterChime();
      onUnlock();
    }, 400);
  };

  const handleQuickAccess = () => {
    sanctuaryAudio.playEnterChime();
    onUnlock();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-8 bg-[#0D0D0D] text-[#F2F0EA] font-sans select-none overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(200,169,107,0.03)_0%,transparent_70%] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-md flex justify-between items-center text-xs font-mono text-[#9A9892]">
        <button
          onClick={onBackToOpening}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          ← Return to Ocean
        </button>
        <span className="tracking-widest uppercase text-[#5F5D59]">Enclave 01</span>
      </header>

      {/* Main Lock Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center my-auto">
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-8 text-[#C8A96B] bg-white/[0.02]">
          <Lock className="w-5 h-5 stroke-[1.5]" />
        </div>

        <h1 className="font-serif text-4xl tracking-[0.18em] font-light text-[#F2F0EA] mb-2">
          GAVEN
        </h1>

        <div className="text-xs font-mono tracking-[0.25em] text-[#9A9892] uppercase mb-10">
          Private Vault
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email Field */}
          <div>
            <input
              id="vault-email-input"
              type="email"
              placeholder="Email address..."
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-center text-sm font-mono text-[#F2F0EA] placeholder:text-[#5F5D59] placeholder:font-sans focus:outline-none focus:border-[#C8A96B]/60 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Password Field */}
          <div>
            <input
              id="vault-password-input"
              type="password"
              placeholder="Password..."
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              autoFocus
              className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-center text-sm font-mono tracking-widest text-[#F2F0EA] placeholder:text-[#5F5D59] placeholder:font-sans focus:outline-none focus:border-[#C8A96B]/60 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-sans text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          <button
            id="unlock-vault-btn"
            type="submit"
            disabled={isVerifying}
            className="w-full group py-3.5 px-6 rounded-xl bg-[#F2F0EA] text-[#0D0D0D] font-mono text-xs tracking-[0.25em] uppercase hover:bg-[#C8A96B] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-[0.98] disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Unlocking...</span>
              </>
            ) : (
              <>
                <span>Open Sanctuary</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="font-serif italic text-sm text-[#5F5D59] mt-8 tracking-wide">
          This place belongs to you.
        </p>

        <button
          onClick={handleQuickAccess}
          className="mt-4 text-[11px] font-mono text-[#9A9892]/60 hover:text-[#C8A96B] transition-colors underline cursor-pointer"
        >
          Quick access (skip login)
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-[11px] font-mono text-[#5F5D59]">
        End-to-End Private Session · Supabase Auth
      </footer>
    </div>
  );
}
