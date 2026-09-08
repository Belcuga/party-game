'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { ArrowLeft, Pencil, Trash2, Skull } from 'lucide-react';
import Link from 'next/link';
import { WastedPrompt } from '@/app/types/wastedPrompt';
import AddWastedPromptModal from '@/app/components/admin/AddWastedPromptModal';
import Logo from '@/app/components/ui/logo';
import Button from '@/app/components/ui/Button';

const MODE_COLOR = '#ef4444';

function Pill({ value }: { value: boolean }) {
    return (
        <span
            className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={
                value
                    ? { backgroundColor: `${MODE_COLOR}22`, color: MODE_COLOR }
                    : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
            }
        >
            {value ? 'Yes' : 'No'}
        </span>
    );
}

export default function WastedAdminPage() {
    const [prompts, setPrompts] = useState<WastedPrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<WastedPrompt | null>(null);

    const fetchPrompts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('wasted_prompts')
            .select('*')
            .range(0, 999)
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching prompts:', error.message);
        } else {
            setPrompts((data as unknown as WastedPrompt[]) ?? []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this prompt?')) return;
        const { error } = await supabase.from('wasted_prompts').delete().eq('id', id);
        if (error) {
            console.error('Error deleting prompt:', error.message);
        } else {
            fetchPrompts();
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    return (
        <main className="h-screen overflow-hidden bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white px-4 py-6 sm:py-10 flex flex-col items-center">
            <div className="w-full max-w-5xl flex-shrink-0 flex items-center justify-between mb-6">
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
                    <Skull className="w-3.5 h-3.5" />
                    Get Wasted
                </span>
            </div>

            <div className="w-full max-w-5xl flex-shrink-0 text-center mb-5">
                <h2 className="text-xl font-semibold">Prompts</h2>
                <p className="text-sm text-white/60 mt-1">
                    {loading ? 'Loading…' : `${prompts.length} prompt${prompts.length === 1 ? '' : 's'}`}
                </p>
            </div>

            {loading ? (
                <div className="py-20 text-white/50">Loading…</div>
            ) : (
                <div className="w-full max-w-5xl flex-1 min-h-0 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="w-full h-full overflow-x-auto overflow-y-auto">
                        <table className="min-w-full border-collapse text-sm">
                            <thead className="sticky top-0 bg-[#1b003c] z-10">
                                <tr>
                                    <th className="p-3 border-b border-white/10 text-left text-white/60">Text</th>
                                    <th className="p-3 border-b border-white/10 text-left text-white/60">Dirty</th>
                                    <th className="p-3 border-b border-white/10 text-left text-white/60">Likes</th>
                                    <th className="p-3 border-b border-white/10 text-left text-white/60">Dislikes</th>
                                    <th className="p-3 border-b border-white/10 text-left text-white/60">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prompts.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 border-b border-white/5 max-w-[450px]">{p.text}</td>
                                        <td className="p-3 border-b border-white/5"><Pill value={p.dirty} /></td>
                                        <td className="p-3 border-b border-white/5 text-white/60">{p.like_count}</td>
                                        <td className="p-3 border-b border-white/5 text-white/60">{p.dislike_count}</td>
                                        <td className="p-3 border-b border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setEditing(p);
                                                        setModalOpen(true);
                                                    }}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/15 hover:bg-red-500/25 text-red-300 transition-colors cursor-pointer"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="w-full max-w-xs flex-shrink-0 flex flex-col gap-3 mt-6">
                <Button
                    onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                >
                    Add New Prompt
                </Button>
                <Link
                    href="/admin"
                    className="w-full text-center py-3 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                    Back
                </Link>
            </div>

            <AddWastedPromptModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSuccess={() => {
                    setModalOpen(false);
                    fetchPrompts();
                }}
                existingPrompt={editing || undefined}
            />
        </main>
    );
}
