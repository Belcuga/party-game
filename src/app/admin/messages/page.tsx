'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { ArrowLeft, Pencil, Trash2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { GameMessage, GameMessageCategory } from '@/app/types/gameMessage';
import AddGameMessageModal, { CATEGORY_OPTIONS } from '@/app/components/admin/AddGameMessageModal';
import Logo from '@/app/components/ui/logo';
import Button from '@/app/components/ui/Button';

const MODE_COLOR = '#38bdf8';

export default function GameMessagesAdminPage() {
    const [messages, setMessages] = useState<GameMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<GameMessage | null>(null);
    const [filter, setFilter] = useState<GameMessageCategory | 'all'>('all');

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('game_messages')
            .select('*')
            .range(0, 999)
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error.message);
        } else {
            setMessages((data as unknown as GameMessage[]) ?? []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        const { error } = await supabase.from('game_messages').delete().eq('id', id);
        if (error) {
            console.error('Error deleting message:', error.message);
        } else {
            fetchMessages();
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filtered = messages.filter((m) => filter === 'all' || m.category === filter);
    const categoryLabel = (cat: GameMessageCategory) => CATEGORY_OPTIONS.find((o) => o.value === cat)?.label ?? cat;

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
                    <Sparkles className="w-3.5 h-3.5" />
                    Fun Popups
                </span>
            </div>

            <div className="w-full max-w-3xl flex-shrink-0 text-center mb-5">
                <h2 className="text-xl font-semibold">Messages</h2>
                <p className="text-sm text-white/60 mt-1">
                    {loading ? 'Loading…' : `${messages.length} message${messages.length === 1 ? '' : 's'}`}
                </p>
            </div>

            <div className="w-full max-w-3xl flex-shrink-0 mb-5">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as GameMessageCategory | 'all')}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors"
                >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="py-20 text-white/50">Loading…</div>
            ) : (
                <div className="w-full max-w-3xl flex-1 min-h-0 overflow-y-auto pr-1">
                    {filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-white/40">
                            <Sparkles className="w-8 h-8" />
                            <p className="text-sm">Nothing in this filter.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {filtered.map((m) => (
                                <div key={m.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <span
                                            className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full"
                                            style={{ backgroundColor: `${MODE_COLOR}22`, color: MODE_COLOR }}
                                        >
                                            {categoryLabel(m.category)}
                                        </span>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                onClick={() => {
                                                    setEditing(m);
                                                    setModalOpen(true);
                                                }}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                                                aria-label="Edit"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/15 hover:bg-red-500/25 text-red-300 transition-colors cursor-pointer"
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm">{m.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="w-full max-w-xs flex-shrink-0 flex flex-col gap-3 mt-6">
                <Button
                    onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                >
                    Add New Message
                </Button>
                <Link
                    href="/admin"
                    className="w-full text-center py-3 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                    Back
                </Link>
            </div>

            <AddGameMessageModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSuccess={() => {
                    setModalOpen(false);
                    fetchMessages();
                }}
                existingMessage={editing || undefined}
                defaultCategory={filter !== 'all' ? filter : undefined}
            />
        </main>
    );
}
