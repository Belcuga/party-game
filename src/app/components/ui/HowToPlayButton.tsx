'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import Modal from './Modal';

type Props = {
  modeName: string;
  color: string;
  description: string;
};

export default function HowToPlayButton({ modeName, color, description }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="How to play"
        className="text-white/70 hover:text-white cursor-pointer transition-colors"
      >
        <CircleHelp className="w-6 h-6" />
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <div className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-3" style={{ color }}>{modeName}</h2>
          <p className="text-gray-200 leading-relaxed mb-8">{description}</p>
          <button
            onClick={() => setOpen(false)}
            className="w-full py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </Modal>
    </>
  );
}
