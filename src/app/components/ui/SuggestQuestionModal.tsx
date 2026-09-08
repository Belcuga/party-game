'use client';

import { useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import { supabase } from '@/app/lib/SupabaseClient';
import Modal from './Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SuggestQuestionModal({ isOpen, onClose }: Props) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    onClose();
    // Reset shortly after the close animation would run, so it doesn't flash empty mid-close.
    setTimeout(() => {
      setMessage('');
      setEmail('');
      setSubmitted(false);
    }, 200);
  }

  async function handleSubmit() {
    if (!message.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('question_suggestions').insert([
      {
        message: message.trim(),
        email: email.trim() || null,
        created_at: new Date().toISOString(),
        read: false,
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error('Failed to submit question suggestion:', error.message);
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
            Your question idea was sent - we might add it to the game.
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
          <div className="flex justify-center mb-3">
            <MessageCircleQuestion className="w-8 h-8 text-[#00E676]" />
          </div>
          <h2 className="text-xl font-bold mb-1 text-white text-center">Suggest a Question</h2>
          <p className="text-sm text-gray-400 mb-6 text-center">
            Got a great question, dare, or category idea? Send it our way.
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What should we add to the game?"
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
