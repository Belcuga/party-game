'use client';

import { useState } from 'react';
import { Bug, Lightbulb } from 'lucide-react';
import { supabase } from '@/app/lib/SupabaseClient';
import Modal from './Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ isOpen, onClose }: Props) {
  const [type, setType] = useState<'bug' | 'improvement'>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    onClose();
    // Reset shortly after the close animation would run, so it doesn't flash empty mid-close.
    setTimeout(() => {
      setType('bug');
      setMessage('');
      setEmail('');
      setSubmitted(false);
    }, 200);
  }

  async function handleSubmit() {
    if (!message.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('feedback').insert([
      {
        type,
        message: message.trim(),
        email: email.trim() || null,
        created_at: new Date().toISOString(),
        read: false,
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error('Failed to submit feedback:', error.message);
      return;
    }

    setSubmitted(true);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {submitted ? (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-3 text-white">Thanks! 🎉</h2>
          <p className="text-gray-300 mb-8">
            Your {type === 'bug' ? 'bug report' : 'suggestion'} was sent - we really appreciate it.
          </p>
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="p-8">
          <h2 className="text-xl font-bold mb-1 text-white text-center">Send Feedback</h2>
          <p className="text-sm text-gray-400 mb-6 text-center">Found a bug or have an idea? Let us know.</p>

          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setType('bug')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm border transition-colors cursor-pointer ${
                type === 'bug'
                  ? 'bg-red-500/20 border-red-400 text-red-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <Bug className="w-4 h-4" />
              Bug Report
            </button>
            <button
              onClick={() => setType('improvement')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm border transition-colors cursor-pointer ${
                type === 'improvement'
                  ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Improvement
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === 'bug'
                ? "What went wrong? What were you doing when it happened?"
                : 'What would make Tipsy Trials better?'
            }
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors mb-2 resize-none"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors mb-1.5"
          />
          <p className="text-xs text-white/40 mb-6">
            This is optional - we&apos;d like to know who tried to help us, and maybe reward them in the future :)
          </p>

          <button
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className="w-full py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
      )}
    </Modal>
  );
}
