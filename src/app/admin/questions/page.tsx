'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown, Pencil, Trash2, Layers } from 'lucide-react';
import AddQuestionModal from '@/app/components/admin/AddQuestionModal';
import Link from 'next/link';
import { Question } from '@/app/types/question';
import Logo from '@/app/components/ui/logo';
import Button from '@/app/components/ui/Button';

const MODE_COLOR = '#00E676';

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

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    type SortableHeaderProps = {
        label: string;
        column: string;
        className?: string;
    };

    const sortedQuestions = [...questions].sort((a, b) => {
        if (!sortColumn) return 0;

        const valueA = a[sortColumn as keyof Question];
        const valueB = b[sortColumn as keyof Question];

        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }

        if (typeof valueA === 'boolean' || valueA === null && typeof valueB === 'boolean' || valueB === null) {
            const rank = (val: string | number | boolean | null, direction: string) => {
                if (direction === 'asc') {
                    return val === true ? 0 : val === false ? 1 : 2;
                } else {
                    return val === null ? 0 : val === false ? 1 : 2;
                }
            };

            return rank(valueA, sortDirection) - rank(valueB, sortDirection);
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortDirection === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }

        return 0;
    });

    function SortableHeader({ label, column, className }: SortableHeaderProps) {
        const active = sortColumn === column;
        const Icon = !active ? ArrowUpDown : sortDirection === 'asc' ? ArrowUp : ArrowDown;
        return (
            <th
                onClick={() => {
                    setSortColumn(column);
                    setSortDirection(active && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
                className={`p-3 border-b border-white/10 cursor-pointer select-none whitespace-nowrap text-left ${className ?? ''}`}
            >
                <div className={`flex items-center gap-1.5 ${active ? 'text-white' : 'text-white/60'}`}>
                    {label}
                    <Icon className="w-3.5 h-3.5" style={active ? { color: MODE_COLOR } : undefined} />
                </div>
            </th>
        );
    }

    const fetchQuestions = async () => {
        setLoading(true);

        const pageSize = 999;
        let from = 0;
        let moreData = true;
        const uniqueQuestionsMap = new Map();

        while (moreData) {
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .range(from, to)
                .order('created_at', { ascending: false })
                .order('id', { ascending: false });

            if (error) {
                console.error('Error fetching questions:', error.message);
                break;
            }

            if (data && data.length > 0) {
                data.forEach((q) => uniqueQuestionsMap.set(q.id, q));
                from += pageSize;
            } else {
                moreData = false;
            }
        }

        setQuestions(Array.from(uniqueQuestionsMap.values()));
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        const { error } = await supabase.from('questions').delete().eq('id', id);

        if (error) {
            console.error('Error deleting question:', error.message);
        } else {
            fetchQuestions();
        }
    };

    const handleEdit = (question: Question) => {
        setEditingQuestion(question);
        setModalOpen(true);
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    return (
        <main className="h-screen overflow-hidden bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white px-4 py-6 sm:py-10 flex flex-col items-center">
            <div className="w-full max-w-[1700px] flex-shrink-0 flex items-center justify-between mb-6">
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
                    <Layers className="w-3.5 h-3.5" />
                    Classic Trials
                </span>
            </div>

            <div className="w-full max-w-[1700px] flex-shrink-0 text-center mb-5">
                <h2 className="text-xl font-semibold">Questions</h2>
                <p className="text-sm text-white/60 mt-1">
                    {loading ? 'Loading…' : `${questions.length} question${questions.length === 1 ? '' : 's'}`}
                </p>
            </div>

            {loading ? (
                <div className="py-20 text-white/50">Loading…</div>
            ) : (
                <div className="w-full max-w-[1700px] flex-1 min-h-0 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="w-full h-full overflow-x-auto overflow-y-auto">
                        <table className="min-w-full border-collapse text-sm">
                            <thead className="sticky top-0 bg-[#1b003c] z-10">
                                <tr>
                                    <SortableHeader label="Question" column="question" className="min-w-[220px]" />
                                    <SortableHeader label="Dirty" column="dirty" />
                                    <SortableHeader label="Challenge" column="challenge" />
                                    <SortableHeader label="All Players" column="all_players" />
                                    <SortableHeader label="Opposite Gender" column="need_opposite_gender" />
                                    <SortableHeader label="Punishment" column="punishment" />
                                    <SortableHeader label="Difficulty" column="difficulty" />
                                    <SortableHeader label="Likes" column="like_count" />
                                    <SortableHeader label="Dislikes" column="dislike_count" />
                                    <th className="p-3 border-b border-white/10 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedQuestions.map((q) => (
                                    <tr key={q.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 border-b border-white/5 relative group max-w-[260px]">
                                            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                                {q.question}
                                            </div>
                                            <div className="absolute hidden group-hover:block z-20 bg-[#1b003c] border border-white/10 text-white text-xs rounded-lg p-3 shadow-xl top-full left-0 mt-2 w-72 break-words">
                                                {q.question}
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-white/5"><Pill value={q.dirty} /></td>
                                        <td className="p-3 border-b border-white/5"><Pill value={q.challenge} /></td>
                                        <td className="p-3 border-b border-white/5"><Pill value={q.all_players} /></td>
                                        <td className="p-3 border-b border-white/5"><Pill value={!!q.need_opposite_gender} /></td>
                                        <td className="p-3 border-b border-white/5 text-white/80">{q.punishment}</td>
                                        <td className="p-3 border-b border-white/5 text-white/80">{q.difficulty}</td>
                                        <td className="p-3 border-b border-white/5 text-white/60">{q.like_count}</td>
                                        <td className="p-3 border-b border-white/5 text-white/60">{q.dislike_count}</td>
                                        <td className="p-3 border-b border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(q)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q.id)}
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
                        setEditingQuestion(null);
                        setModalOpen(true);
                    }}
                >
                    Add New Question
                </Button>
                <Link
                    href="/admin"
                    className="w-full text-center py-3 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                    Back
                </Link>
            </div>

            <AddQuestionModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingQuestion(null)
                }}
                onSuccess={() => {
                    setModalOpen(false);
                    fetchQuestions();
                }}
                existingQuestion={editingQuestion || undefined}
            />
        </main>
    );
}
