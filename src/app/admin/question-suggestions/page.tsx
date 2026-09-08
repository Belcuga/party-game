'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { ArrowLeft, Mail, Trash2, MessageCircleQuestion, Check, Circle } from 'lucide-react';
import Link from 'next/link';
import { QuestionSuggestion } from '@/app/types/questionSuggestion';
import Logo from '@/app/components/ui/logo';

const MODE_COLOR = '#00E676';

export default function QuestionSuggestionsAdminPage() {
    const [items, setItems] = useState<QuestionSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

    const fetchSuggestions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('question_suggestions')
            .select('*')
            .range(0, 999)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching question suggestions:', error.message);
        } else {
            setItems((data as unknown as QuestionSuggestion[]) ?? []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this suggestion?')) return;
        const { error } = await supabase.from('question_suggestions').delete().eq('id', id);
        if (error) {
            console.error('Error deleting suggestion:', error.message);
        } else {
            fetchSuggestions();
        }
    };

    const handleToggleRead = async (id: number, currentlyRead: boolean) => {
        const { error } = await supabase.from('question_suggestions').update({ read: !currentlyRead }).eq('id', id);
        if (error) {
            console.error('Error updating suggestion:', error.message);
        } else {
            fetchSuggestions();
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const filtered = items.filter(
        (s) => readFilter === 'all' || (readFilter === 'unread' ? !s.read : s.read)
    );
    const unreadCount = items.filter((s) => !s.read).length;
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
                    <MessageCircleQuestion className="w-3.5 h-3.5" />
                    Question Suggestions
                </span>
            </div>

            <div className="w-full max-w-3xl flex-shrink-0 text-center mb-5">
                <h2 className="text-xl font-semibold">Question Suggestions</h2>
                <p className="text-sm text-white/60 mt-1">
                    {loading
                        ? 'Loading…'
                        : `${items.length} suggestion${items.length === 1 ? '' : 's'}${unreadCount > 0 ? ` · ${unreadCount} unread` : ''}`}
                </p>
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
                        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors cursor-pointer ${
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
                            <MessageCircleQuestion className="w-8 h-8" />
                            <p className="text-sm">
                                {items.length === 0 ? 'No suggestions yet.' : 'Nothing in this filter.'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {filtered.map((s) => (
                                <div
                                    key={s.id}
                                    className={`rounded-2xl border p-4 transition-opacity ${
                                        s.read ? 'border-white/10 bg-white/5 opacity-55' : 'border-white/15 bg-white/[0.07]'
                                    }`}
                                    style={!s.read ? { borderLeft: `3px solid ${MODE_COLOR}` } : undefined}
                                >
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <span
                                            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{ backgroundColor: `${MODE_COLOR}22`, color: MODE_COLOR }}
                                        >
                                            <MessageCircleQuestion className="w-3.5 h-3.5" />
                                            Suggestion
                                        </span>
                                        <span className="text-xs text-white/40 flex-shrink-0">
                                            {new Date(s.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-white/90 text-sm whitespace-pre-wrap mb-3">{s.message}</p>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-white/50 min-w-0">
                                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="truncate">{s.email || 'No email provided'}</span>
                                        </span>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                onClick={() => handleToggleRead(s.id, s.read)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                                    s.read
                                                        ? 'bg-[#00E676]/20 text-[#00E676] hover:bg-[#00E676]/30'
                                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                }`}
                                                aria-label={s.read ? 'Mark as unread' : 'Mark as read'}
                                                title={s.read ? 'Mark as unread' : 'Mark as read'}
                                            >
                                                {s.read ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/15 hover:bg-red-500/25 text-red-300 transition-colors cursor-pointer"
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
