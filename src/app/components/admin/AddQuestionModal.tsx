'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { Question } from '@/app/types/question';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingQuestion?: Question;
};

export default function AddQuestionModal({ isOpen, onClose, onSuccess, existingQuestion }: Props) {
    const [question, setQuestion] = useState(existingQuestion?.question || '');
    const [dirty, setDirty] = useState(existingQuestion?.dirty || false);
    const [challenge, setChallenge] = useState(existingQuestion?.challenge || false);
    const [allPlayers, setAllPlayers] = useState(existingQuestion?.all_players || false);
    const [punishment, setPunishment] = useState(existingQuestion?.punishment || 0);
    const [difficulty, setDifficulty] = useState(existingQuestion?.difficulty || 1);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existingQuestion) {
            setQuestion(existingQuestion.question);
            setDirty(existingQuestion.dirty);
            setChallenge(existingQuestion.challenge);
            setPunishment(existingQuestion.punishment);
            setDifficulty(existingQuestion.difficulty);
            setAllPlayers(existingQuestion.all_players);
        } else {
            setQuestion('');
            setDirty(false);
            setChallenge(false);
            setPunishment(0);
            setDifficulty(1);
            setAllPlayers(false);
        }
    }, [existingQuestion]);

    const handleSave = async () => {
        if (!question.trim()) return;

        setSaving(true);

        let error;

        if (existingQuestion) {
            // Editing existing
            const { error: updateError } = await supabase
                .from('questions')
                .update({
                    question: question.trim(),
                    dirty,
                    challenge,
                    punishment,
                    difficulty,
                    all_players: allPlayers,
                })
                .eq('id', existingQuestion.id);

            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('questions').insert([
                {
                    question: question.trim(),
                    dirty,
                    challenge,
                    punishment,
                    difficulty,
                    like_count: 0,
                    dislike_count: 0,
                    all_players: allPlayers,
                },
            ]);

            error = insertError;
        }

        setSaving(false);

        if (error) {
            console.error('Error saving question:', error.message);
        } else {
            onSuccess();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-white text-black rounded-xl p-6 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">➕ Add New Question</h2>

                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question..."
                    className="w-full p-3 rounded border mb-4"
                    rows={4}
                />

                <div className="flex flex-col gap-2 mb-4">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={dirty} onChange={() => setDirty(!dirty)} />
                        Dirty
                    </label>

                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={challenge} onChange={() => setChallenge(!challenge)} />
                        Challenge
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={allPlayers} onChange={() => setAllPlayers(!allPlayers)} />
                        All Players
                    </label>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                    <label className="font-semibold">⚡ Punishment</label>
                    <input
                        type="number"
                        value={punishment}
                        onChange={(e) => setPunishment(Number(e.target.value))}
                        className="w-full p-2 rounded border"
                        min={0}
                        placeholder="Enter punishment ID"
                    />
                </div>

                <div className="flex flex-col gap-2 mb-6">
                    <label className="font-semibold">🎚️ Difficulty</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(Number(e.target.value))}
                        className="w-full p-2 rounded border"
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
