'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, Hand, Users, Shield, Timer, MessageSquare, MessageCircleQuestion, Dices, Sparkles, Skull, HeartHandshake, MessageCircleHeart, ChevronRight, type LucideIcon } from 'lucide-react';
import { supabase } from '@/app/lib/SupabaseClient';
import Logo from '@/app/components/ui/logo';
import Button from '@/app/components/ui/Button';

type Section = {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: LucideIcon;
    href: string;
    table: string;
    unit: string;
};

const SECTIONS: Section[] = [
    { id: 'classic', name: 'Classic Trials', description: 'Questions and challenges', color: '#00E676', icon: Layers, href: '/admin/questions', table: 'questions', unit: 'questions' },
    { id: 'never', name: 'Never Have I Ever', description: 'Statements', color: '#ff6fd8', icon: Hand, href: '/admin/nhie', table: 'nhie_statements', unit: 'statements' },
    { id: 'mostlikely', name: 'Most Likely To', description: 'Statements', color: '#9156f3', icon: Users, href: '/admin/mostlikely', table: 'most_likely_statements', unit: 'statements' },
    { id: 'truthdare', name: 'Truth or Dare', description: 'Truths and dares', color: '#ffb703', icon: Shield, href: '/admin/truthdare', table: 'truth_dare_prompts', unit: 'prompts' },
    { id: 'category', name: 'Category Countdown', description: 'Categories', color: '#2dd4bf', icon: Timer, href: '/admin/category', table: 'category_prompts', unit: 'categories' },
    { id: 'wasted', name: 'Get Wasted', description: 'Drinking prompts', color: '#ef4444', icon: Skull, href: '/admin/wasted', table: 'wasted_prompts', unit: 'prompts' },
    { id: 'wingman', name: 'Wingman', description: 'Matchmaking prompts', color: '#f472b6', icon: HeartHandshake, href: '/admin/wingman', table: 'wingman_prompts', unit: 'prompts' },
    { id: 'bonding', name: 'Bonding', description: 'Personal questions', color: '#818cf8', icon: MessageCircleHeart, href: '/admin/bonding', table: 'bonding_questions', unit: 'questions' },
    { id: 'feedback', name: 'User Feedback', description: 'Bug reports and suggestions', color: '#fb7185', icon: MessageSquare, href: '/admin/feedback', table: 'feedback', unit: 'submissions' },
    { id: 'question-suggestions', name: 'Question Suggestions', description: 'User-submitted question ideas', color: '#00E676', icon: MessageCircleQuestion, href: '/admin/question-suggestions', table: 'question_suggestions', unit: 'suggestions' },
    { id: 'roulette', name: 'Punishment Roulette', description: 'Roulette rules', color: '#f97316', icon: Dices, href: '/admin/roulette', table: 'roulette_effects', unit: 'rules' },
    { id: 'messages', name: 'Fun Popup Messages', description: 'Milestones, difficulty, stat popups', color: '#38bdf8', icon: Sparkles, href: '/admin/messages', table: 'game_messages', unit: 'messages' },
];

export default function AdminPage() {
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        let cancelled = false;

        async function loadCounts() {
            const entries = await Promise.all(
                SECTIONS.map(async (section) => {
                    const { data, error } = await supabase.from(section.table).select('*').range(0, 999);
                    if (error) return [section.id, 0] as const;
                    return [section.id, data?.length ?? 0] as const;
                })
            );
            if (!cancelled) setCounts(Object.fromEntries(entries));
        }

        loadCounts();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white flex justify-center px-4 py-6 sm:py-10">
            <div className="w-full max-w-md flex flex-col">
                <div className="w-full flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Logo />
                        <h1 className="text-2xl font-extrabold drop-shadow-lg">Tipsy Trials</h1>
                    </div>
                    <Link href="/" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Exit
                    </Link>
                </div>

                <div className="text-center mb-5">
                    <h2 className="text-xl font-semibold">Admin Panel</h2>
                    <p className="text-sm text-white/60 mt-1">Manage content across every mode.</p>
                </div>

                <ul className="space-y-2">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const count = counts[section.id];
                        return (
                            <li key={section.id}>
                                <Link
                                    href={section.href}
                                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-colors"
                                >
                                    <span
                                        className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border bg-white/5"
                                        style={{ borderColor: section.color }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: section.color }} strokeWidth={1.8} />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block font-bold text-sm">{section.name}</span>
                                        <span className="block text-xs text-white/60 mt-0.5">{section.description}</span>
                                    </span>
                                    <span className="flex-shrink-0 text-xs font-semibold text-white/50">
                                        {count === undefined ? '···' : `${count} ${section.unit}`}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="pt-6">
                    <Link href="/">
                        <Button className="w-full">Back to App</Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
