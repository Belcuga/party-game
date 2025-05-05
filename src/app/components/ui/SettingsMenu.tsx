import { useState } from 'react';
import { Settings } from 'lucide-react';
import Modal from './Modal'; // adjust to your actual modal import

export default function SettingsMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="relative">
      {/* Settings Icon Button */}
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="hover:text-gray-300 cursor-pointer"
      >
        <Settings />
      </button>

      {/* Dropdown */}
      {showMenu && (
        <div className="absolute top-10 right-0 bg-blue-600 text-black shadow-lg rounded-lg p-2 w-48 flex flex-col gap-2 z-10">
          <div
            className="p-2 bg-gray-200 rounded text-sm text-center font-bold cursor-pointer hover:bg-gray-300"
            onClick={() => {
              setHowToPlayOpen(true);
              setShowMenu(false);
            }}
          >
            How to Play
          </div>
          <div
            className="p-2 bg-gray-200 rounded text-sm text-center font-bold cursor-pointer hover:bg-gray-300"
            onClick={() => {
              setContactOpen(true);
              setShowMenu(false);
            }}
          >
            Contact Us
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      <Modal isOpen={howToPlayOpen} onClose={() => setHowToPlayOpen(false)}>
        <div className="p-4 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">How to Play</h2>
          <p className="mb-4 text-sm text-gray-200">
            🎉 Add players and pick your game modes (Dirty, Challenges, etc.).<br /><br />
            🔄 Players take turns completing fun or spicy challenges.<br /><br />
            ✅ Keep playing until you're ready to stop. Have fun!
          </p>
          <button
            onClick={() => setHowToPlayOpen(false)}
            className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Got it!
          </button>
        </div>
      </Modal>

      {/* Contact Us Modal */}
      <Modal isOpen={contactOpen} onClose={() => setContactOpen(false)}>
        <div className="p-4 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Contact Us</h2>
          <p className="mb-4 text-sm text-gray-200 text-center">
            💬 Have questions, feedback, or need support? <br /> Reach out to us at:<br />
            <span className="font-semibold">support@tipsytrials.com</span>
          </p>
          <button
            onClick={() => setContactOpen(false)}
            className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}