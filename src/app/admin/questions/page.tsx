'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { Loader2 } from 'lucide-react';
import AddQuestionModal from '@/app/components/admin/AddQuestionModal';
import { useRouter } from 'next/navigation';
import { Question } from '@/app/types/question';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const router = useRouter();

    type SortableHeaderProps = {
        label: string;
        column: string;
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

    function SortableHeader({ label, column }: SortableHeaderProps) {
        return (
            <th
                className="p-3 border-b cursor-pointer select-none"
            >
                <div className="flex items-center gap-1">
                    {label}
                    <div className="flex flex-col text-xs leading-none">
                        <span
                            className={
                                sortColumn === column && sortDirection === 'asc'
                                    ? 'font-bold text-white'
                                    : 'text-gray-400'
                            }
                            onClick={() => handleSort(column, 'asc')}
                        >
                            ▲
                        </span>
                        <span
                            className={
                                sortColumn === column && sortDirection === 'desc'
                                    ? 'font-bold text-white'
                                    : 'text-gray-400'
                            }
                            onClick={() => handleSort(column, 'desc')}
                        >
                            ▼
                        </span>
                    </div>
                </div>
            </th>
        );
    }

    const handleSort = (column: string, sortDirection: 'asc' | 'desc') => {
        setSortDirection(sortDirection);
        setSortColumn(column);
    };

    const fetchQuestions = async () => {
        setLoading(true);
    
        const pageSize = 999;
        let from = 0;
        let moreData = true;
        const uniqueQuestionsMap = new Map(); // <-- Declare it here
    
        while (moreData) {
            const to = from + pageSize - 1;
    
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .range(from, to)
                .order('created_at', { ascending: false }) // Optional tie-breaker
                .order('id', { ascending: false });
    
            if (error) {
                console.error('Error fetching questions:', error.message);
                break;
            }
    
            if (data && data.length > 0) {
                // Add each question by ID (deduplicates)
                data.forEach((q) => uniqueQuestionsMap.set(q.id, q));
                from += pageSize;
            } else {
                moreData = false;
            }
        }
    
        const uniqueQuestions = Array.from(uniqueQuestionsMap.values());
        setQuestions(uniqueQuestions);
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        const { error } = await supabase.from('questions').delete().eq('id', id);

        if (error) {
            console.error('Error deleting question:', error.message);
        } else {
            fetchQuestions(); // Refresh after delete
        }
    };

    const handleEdit = (question: Question) => {
        setEditingQuestion(question);
        setModalOpen(true);
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex justify-center items-center bg-blue-900 text-white">
                <Loader2 className="animate-spin w-10 h-10" />
            </main>
        );
    }

    return (
        <main className="min-h-screen p-6 bg-gradient-to-br from-blue-950 to-blue-900 text-white flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8">All Questions</h1>

            <div className="overflow-y-auto max-h-[600px] w-full overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="sticky top-0 bg-blue-700 z-10">
                        <tr className="bg-blue-700 text-left">
                            <SortableHeader label="Question" column="question" />
                            <SortableHeader label="Dirty" column="dirty" />
                            <SortableHeader label="Challenge" column="challenge" />
                            <SortableHeader label="All Players" column="all_players" />
                            <SortableHeader label="Need opposite gender" column="need_opposite_gender" />
                            <SortableHeader label="Punishment" column="punishment" />
                            <SortableHeader label="Difficulty" column="difficulty" />
                            <SortableHeader label="Likes" column="like_count" />
                            <SortableHeader label="Dislikes" column="dislike_count" />
                            <th className="p-3 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedQuestions.map((q) => (
                            <tr key={q.id} className="hover:bg-purple-800 transition">
                                <td className="p-3 border-b relative group max-w-[200px]">
                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                        {q.question}
                                    </div>

                                    {/* Tooltip on hover */}
                                    <div className="absolute hidden group-hover:block z-20 bg-black text-white text-xs rounded p-2 shadow-lg top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 break-words">
                                        {q.question}
                                    </div>
                                </td>
                                <td className="p-3 border-b">{q.dirty ? 'Yes' : 'No'}</td>
                                <td className="p-3 border-b">{q.challenge ? 'Yes' : 'No'}</td>
                                <td className="p-3 border-b">{q.all_players ? 'Yes' : 'No'}</td>
                                <td className="p-3 border-b">{q.need_opposite_gender === null ? 'NULL' : q.need_opposite_gender ? 'Yes' : 'No'}</td>
                                <td className="p-3 border-b">{q.punishment}</td>
                                <td className="p-3 border-b">{q.difficulty}</td>
                                <td className="p-3 border-b">{q.like_count}</td>
                                <td className="p-3 border-b">{q.dislike_count}</td>
                                <td className="p-3 border-b space-x-2">
                                    <button
                                        onClick={() => handleEdit(q)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={() => setModalOpen(true)}
                className="mt-6 bg-green-500 hover:bg-green-600 py-3 px-6 rounded font-bold"
            >
                Add New Question
            </button>
            <button
                onClick={() => router.push('/admin')}
                className="mb-6 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded font-bold"
            >
                Back
            </button>
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