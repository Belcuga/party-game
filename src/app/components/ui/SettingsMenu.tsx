import { useState } from 'react';
import { Settings } from 'lucide-react';
import Modal from './Modal';

export default function SettingsMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="p-2 rounded-full bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white transition-colors duration-200"
      >
        <Settings className="w-6 h-6 cursor-pointer" />
      </button>

      {/* Dropdown */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-[#1b003c] rounded-xl border border-[#ffffff20] shadow-[0_0_20px_rgba(157,23,77,0.2)] backdrop-blur-sm z-50">
          <div
            className="px-4 py-2 hover:bg-[#3b1b5e] transition-colors duration-200 cursor-pointer"
            onClick={() => {
              setHowToPlayOpen(true);
              setShowMenu(false);
            }}
          >
            <div className="text-white font-medium">How to Play</div>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#3b1b5e] transition-colors duration-200 cursor-pointer"
            onClick={() => {
              setContactOpen(true);
              setShowMenu(false);
            }}
          >
            <div className="text-white font-medium">Contact Us</div>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      <Modal isOpen={howToPlayOpen} onClose={() => setHowToPlayOpen(false)}>
        <div className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">How to Play</h2>
          <div className="space-y-4 mb-8 text-gray-200 text-center">
            <p>Add players and pick your game modes (Spicy, Challenges, etc.)</p>
            <p>Then take turns completing fun or spicy challenges.</p>
            <p>Keep playing as long as you want or until you get black out drunk. Have fun!</p>
          </div>
          <button
            onClick={() => setHowToPlayOpen(false)}
            className="w-full py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
          >
            Got it!
          </button>
        </div>
      </Modal>

      {/* Contact Us Modal */}
      <Modal isOpen={contactOpen} onClose={() => setContactOpen(false)}>
        <div className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Contact Us</h2>
          <div className="space-y-2 mb-8 text-center">
            <p className="text-gray-200">Have questions, feedback, or need support?</p>
            <p className="text-gray-200">Reach out to us at:</p>
            <p className="text-white font-semibold">hello@tipsytrials.com</p>
          </div>
          <button
            onClick={() => setContactOpen(false)}
            className="w-full py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}