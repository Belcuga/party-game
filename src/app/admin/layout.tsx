'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import Logo from '@/app/components/ui/logo';

// Simple hardcoded gate - not real auth, just keeps casual visitors out of /admin.
const ADMIN_PASSCODE = 'Bracasupostena123!';
const SESSION_KEY = 'tipsyAdminAuthed';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === 'true');
    setChecked(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSCODE) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!checked) return null;

  if (!authed) {
    return (
      <main className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-3xl flex flex-col items-center gap-5"
        >
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-xl font-extrabold drop-shadow-lg">Tipsy Trials</h1>
          </div>

          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white/5"
            style={{ borderColor: '#00E676', boxShadow: '0 0 24px #00E67655' }}
          >
            <Lock className="w-6 h-6" style={{ color: '#00E676' }} strokeWidth={1.8} />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold">Admin Access</h2>
            <p className="text-sm text-white/50 mt-1">Enter the passcode to manage content.</p>
          </div>

          <div className="w-full">
            <input
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder="Enter passcode"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors"
            />
            <div className="h-5 mt-1">
              {error && <p className="text-red-400 text-xs text-center">Wrong passcode.</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer"
          >
            Enter
          </button>
        </form>
      </main>
    );
  }

  return <>{children}</>;
}
