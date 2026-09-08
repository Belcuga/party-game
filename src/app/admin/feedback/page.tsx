'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { ArrowLeft, Bug, Lightbulb, Mail, Trash2, MessageSquare, Check, Circle } from 'lucide-react';
import Link from 'next/link';
import { Feedback } from '@/app/types/feedback';
import Logo from '@/app/components/ui/logo';

const MODE_COLOR = '#fb7185';

export default function FeedbackAdminPage() {
    const [items, setItems] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'bug' | 'improvement'>('all');
    const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

    const fetchFeedback = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .range(0, 999)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching feedback:', error.message);
        } else {
            setItems((data as unknown as Feedback[]) ?? []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this feedback entry?')) return;
        const { error } = await supabase.from('feedback').delete().eq('id', id);
        if (error) {
            console.error('Error deleting feedback:', error.message);
        } else {
            fetchFeedback();
        }
    };

    const handleToggleRead = async (id: number, currentlyRead: boolean) => {
        const { error } = await supabase.from('feedback').update({ read: !currentlyRead }).eq('id', id);
        if (error) {
            console.error('Error updating feedback:', error.message);
        } else {
            fetchFeedback();
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const filtered = items.filter(
        (f) =>
            (filter === 'all' || f.type === filter) &&
            (readFilter === 'all' || (readFilter === 'unread' ? !f.read : f.read))
    );
    const bugCount = items.filter((f) => f.type === 'bug').length;
    const improvementCount = items.filter((f) => f.type === 'improvement').length;
    const unreadCount = items.filter((f) => !f.read).length;
    const readCount = items.length - unreadCount;

    return (
        <main className="h-screen overflow-hidden bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white px-4 py-6 sm:py-10 flex flex-col items-center">
            <div className="w-full max-w-3xl flex-shrink-0 flex items-center justify-between mb-6">
                <Link href="/admin" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Admin
                </Link>
                <div className="flex items-center gap-2">
                    <Logo />
                    <h1 className="text-2xl font-extrabold drop-shadow-lg">Tipsy Trials</h1>
                </div>
                <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{ borderColor: MODE_COLOR, color: MODE_COLOR }}
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    User Feedback
                </span>
            </div>

            <div className="w-full max-w-3xl flex-shrink-0 text-center mb-5">
                <h2 className="text-xl font-semibold">Feedback</h2>
                <p className="text-sm text-white/60 mt-1">
                    {loading
                        ? 'Loading…'
                        : `${items.length} submission${items.length === 1 ? '' : 's'}${unreadCount > 0 ? ` · ${unreadCount} unread` : ''}`}
                </p>
            </div>

            <div className="w-full max-w-3xl flex-shrink-0 flex gap-2 mb-5">
                {([
                    { key: 'all', label: 'All', count: items.length },
                    { key: 'bug', label: 'Bug Reports', count: bugCount },
                    { key: 'improvement', label: 'Improvements', count: improvementCount },
                ] as const).map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors cursor-pointer ${
                            filter === f.key
                                ? 'bg-white/10 border-white/30 text-white'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.08]'
                        }`}
                    >
                        {f.label} <span className="text-white/40">({f.count})</span>
                    </button>
                ))}
            </div>

            <div className="w-full max-w-3xl flex-shrink-0 flex gap-2 mb-5">
                {([
                    { key: 'all', label: 'All', count: items.length },
                    { key: 'unread', label: 'Unread', count: unreadCount },
                    { key: 'read', label: 'Read', count: readCount },
                ] as const).map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setReadFilter(f.key)}
                        className={`flex-1 py-2 rounded-lg font-medium text-xs border transition-colors cursor-pointer ${
                            readFilter === f.key
                                ? 'bg-white/10 border-white/30 text-white'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.08]'
                        }`}
                    >
                        {f.label} <span className="text-white/40">({f.count})</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-20 text-white/50">Loading…</div>
            ) : (
                <div className="w-full max-w-3xl flex-1 min-h-0 overflow-y-auto pr-1">
                    {filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-white/40">
                            <MessageSquare className="w-8 h-8" />
                            <p className="text-sm">
                                {items.length === 0 ? 'No feedback yet.' : 'Nothing in this filter.'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {filtered.map((f) => {
                                const isBug = f.type === 'bug';
                                const typeColor = isBug ? '#ef4444' : '#00E676';
                                const Icon = isBug ? Bug : Lightbulb;
                                return (
                                    <div
                                        key={f.id}
                                        className={`rounded-2xl border p-4 transition-opacity ${
                                            f.read ? 'border-white/10 bg-white/5 opacity-55' : 'border-white/15 bg-white/[0.07]'
                                        }`}
                                        style={!f.read ? { borderLeft: `3px solid ${typeColor}` } : undefined}
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <span
                                                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                                                style={{ backgroundColor: `${typeColor}22`, color: typeColor }}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {isBug ? 'Bug Report' : 'Improvement'}
                                            </span>
                                            <span className="text-xs text-white/40 flex-shrink-0">
                                                {new Date(f.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-white/90 text-sm whitespace-pre-wrap mb-3">{f.message}</p>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-white/50 min-w-0">
                                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{f.email || 'No email provided'}</span>
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <button
                                                    onClick={() => handleToggleRead(f.id, f.read)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                                        f.read
                                                            ? 'bg-[#00E676]/20 text-[#00E676] hover:bg-[#00E676]/30'
                                                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                    }`}
                                                    aria-label={f.read ? 'Mark as unread' : 'Mark as read'}
                                                    title={f.read ? 'Mark as unread' : 'Mark as read'}
                                                >
                                                    {f.read ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(f.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/15 hover:bg-red-500/25 text-red-300 transition-colors cursor-pointer"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className="w-full max-w-xs flex-shrink-0 pt-6">
                <Link
                    href="/admin"
                    className="w-full text-center block py-3 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                    Back
                </Link>
            </div>
        </main>
    );
}
