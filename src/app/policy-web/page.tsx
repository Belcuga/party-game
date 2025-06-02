'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Logo from '../components/ui/logo';

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
                        onClick={() => router.back()}
                        className="flex items-center gap-2 hover:text-gray-300 cursor-pointer text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Logo />
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
                            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
                            <p className="text-gray-300">
                                We may collect, store, and use certain information to provide and improve our website and services. This includes, but is not limited to:
                            </p>
                            <ul className="list-disc text-gray-300 space-y-2 ml-6">
                                <li>Names</li>
                                <li>Device and browser information</li>
                                <li>Location data</li>
                                <li>Usage data, such as pages visited, time spent, and interactions with website content</li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">2. How We Collect Information</h2>
                            <p className="text-gray-300">
                                We use Google Analytics to understand how visitors use our website. Google Analytics collects information such as your device type, browser, approximate location (based on IP address), pages visited, time spent on each page, and interactions with site features.
                                Google Analytics uses cookies and similar tracking technologies to collect this information. These technologies help us analyze site usage patterns and improve our website. You can control cookies through your browser settings or opt out of Google Analytics tracking by visiting Google’s opt-out page.
                                We do not use our own cookies or tracking technologies.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">3. How We Use Your Information</h2>
                            <p className="text-gray-300">
                                We use the collected information to:
                            </p>
                            <ul className="list-disc text-gray-300 space-y-2 ml-6">
                                <li>Analyze and improve website functionality and user experience</li>
                                <li>Understand visitor preferences and site performance</li>
                                <li>Location data</li>
                                <li>Communicate with you (if you submit a contact form or subscribe to updates)</li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">4. Third-Party Services</h2>
                            <p className="text-gray-300">
                                Our website uses Google Analytics to collect and analyze website usage. Google Analytics may place cookies and use tracking technologies as described above.
                                We may also use other service providers, such as web hosting providers and email marketing services, but these services only access data as needed to perform their functions and are not authorized to use it for other purposes.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">5. Content Disclaimer</h2>
                            <p className="text-gray-300">
                                Our website may include mature or explicit content not suitable for all audiences. Users must be of legal drinking age in their country or region to access this content.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">6. Changes to This Privacy Policy</h2>
                            <p className="text-gray-300">
                                We may update this Privacy Policy from time to time. Any changes will be posted here and take effect immediately.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">7. Contact Us</h2>
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