'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PolicyPage() {
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#1b003c]">
      <main className="flex flex-col h-screen max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between px-6 py-4">
          <button
            className="flex items-center gap-2 hover:text-gray-300 cursor-pointer text-white"
          >
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.png" width={48} height={48} alt="Logo" />
            <h1 className="text-3xl font-bold text-white">Tipsy Trials</h1>
          </div>
          <div className="w-8" /> {/* Spacer to maintain centering */}
        </div>

        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                🛡️ Privacy Policy
              </h1>
              <p className="text-gray-300">
                Effective Date: {currentDate}
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">1. Information We Do Not Collect</h2>
              <p className="text-gray-300">
                We do not collect, store, or share any personal data. This includes but is not limited to:
              </p>
              <ul className="list-disc text-gray-300 space-y-2 ml-6">
                <li>Names</li>
                <li>Email addresses</li>
                <li>Device identifiers</li>
              </ul>
              <p className="text-gray-300">
                While the game may store local gameplay statistics or progress on your device, this information is kept solely on your device and is not transmitted to us or any third parties.
                The game is played locally on a single device and does not require login or account creation.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">2. Internet Connection Requirement</h2>
              <p className="text-gray-300">
                While the game is played locally and does not require account creation, an internet connection is required to fetch game questions. These requests are made solely to deliver game content and do not transmit personal data or device information to us or any third parties.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">3. Third-Party Services</h2>
              <p className="text-gray-300">
                Our app does not use any third-party services such as analytics tools, ad networks, or external SDKs that could collect user information.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">4. Content Disclaimer</h2>
              <p className="text-gray-300">
                The game may include mature or explicit content not suitable for all audiences. Players must be of legal drinking age in their country or region to use this app.
              </p>
            </div>

            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">5. Changes to This Privacy Policy</h2>
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time. Any changes will be posted here and take effect immediately.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">6. Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions or concerns, feel free to contact us at:
              </p>
              <p className="flex items-center gap-2">
                📧 <a href="mailto:hello@tipsytrials.com" className="text-[#00E676] hover:underline">
                  hello@tipsytrials.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 