'use client';

import Link from 'next/link';

export default function AdminPage() {
    return (
        <main className="min-h-screen flex justify-center items-center bg-purple-900 text-white p-4">
            <div className="w-full max-w-3xl bg-purple-800 p-6 rounded-xl shadow-lg flex flex-col gap-8">
                <h1 className="text-3xl font-bold text-center">🔧 Admin Panel</h1>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/admin/questions"
                        className="bg-purple-950 hover:bg-purple-600 py-4 rounded text-center font-bold"
                    >
                        Questions
                    </Link>
                </div>
                <div className="flex flex-col gap-4">
                    <Link
                        href="/"
                        className="bg-gray-950 hover:bg-gray-600 py-4 rounded text-center font-bold"
                    >
                        Back
                    </Link>
                </div>
            </div>
        </main>
    );
}