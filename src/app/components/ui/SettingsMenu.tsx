import { useState } from 'react';
import { Settings } from 'lucide-react';
import Modal from './Modal';
import FeedbackModal from './FeedbackModal';
import Link from 'next/link';

export default function SettingsMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="flex items-center gap-2 hover:text-gray-300 cursor-pointer text-white"
      >
        <Settings className="w-6 h-6 cursor-pointer" />
      </button>

      {/* Dropdown */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-[#1b003c] rounded-xl border border-[#ffffff20] shadow-[0_0_20px_rgba(157,23,77,0.2)] backdrop-blur-sm z-50">
          <Link
            href="/how-to-play"
            className="block px-4 py-2 hover:bg-[#3b1b5e] transition-colors duration-200 cursor-pointer"
            onClick={() => setShowMenu(false)}
          >
            <div className="text-white font-medium">How to Play</div>
          </Link>
          <div
            className="px-4 py-2 hover:bg-[#3b1b5e] transition-colors duration-200 cursor-pointer"
            onClick={() => {
              setContactOpen(true);
              setShowMenu(false);
            }}
          >
            <div className="text-white font-medium">Contact Us</div>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#3b1b5e] transition-colors duration-200 cursor-pointer"
            onClick={() => {
              setFeedbackOpen(true);
              setShowMenu(false);
            }}
          >
            <div className="text-white font-medium">Send Feedback</div>
          </div>
          <Link
            href="/policy-web"
            className="block px-4 py-2 hover:bg-[#3b1b5e] transition-colors duration-200 cursor-pointer"
            onClick={() => setShowMenu(false)}
          >
            <div className="text-white font-medium">Privacy Policy</div>
          </Link>
        </div>
      )}

      {/* Contact Us Modal */}
      <Modal isOpen={contactOpen} onClose={() => setContactOpen(false)}>
        <div className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Contact Us</h2>
          <div className="space-y-2 mb-8 text-center">
            <p className="text-gray-200">Have questions or need support?</p>
            <p className="text-gray-200">Reach out to us at:</p>
            <a className="text-white font-semibold" href="mailto:hello@tipsytrials.com">hello@tipsytrials.com</a>
            <p className="text-gray-400 text-sm pt-2">
              Got a bug or an idea instead? Use the Send Feedback button to send it straight to us.
            </p>
          </div>
          <button
            onClick={() => setContactOpen(false)}
            className="w-full py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
          >
            Got It
          </button>
        </div>
      </Modal>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}