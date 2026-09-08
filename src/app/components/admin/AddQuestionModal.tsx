'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { Question } from '@/app/types/question';
import Modal from '@/app/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingQuestion?: Question;
};

const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors';

export default function AddQuestionModal({ isOpen, onClose, onSuccess, existingQuestion }: Props) {
    const [question, setQuestion] = useState(existingQuestion?.question || '');
    const [dirty, setDirty] = useState(existingQuestion?.dirty || false);
    const [challenge, setChallenge] = useState(existingQuestion?.challenge || false);
    const [allPlayers, setAllPlayers] = useState(existingQuestion?.all_players || false);
    const [needOppositeGender, setNeedOppositeGender] = useState(existingQuestion?.need_opposite_gender || false);
    const [punishment, setPunishment] = useState(existingQuestion?.punishment || 1);
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
            setNeedOppositeGender(existingQuestion.need_opposite_gender || false);
        } else {
            setQuestion('');
            setDirty(false);
            setChallenge(false);
            setPunishment(1);
            setDifficulty(1);
            setAllPlayers(false);
            setNeedOppositeGender(false);
        }
    }, [existingQuestion]);

    const handleSave = async () => {
        if (!question.trim()) return;

        setSaving(true);

        let error;

        if (existingQuestion) {
            const { error: updateError } = await supabase
                .from('questions')
                .update({
                    question: question.trim(),
                    dirty,
                    challenge,
                    punishment,
                    difficulty,
                    all_players: allPlayers,
                    need_opposite_gender: needOppositeGender,
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
                    need_opposite_gender: needOppositeGender,
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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8">
                <h2 className="text-xl font-bold mb-6 text-white text-center">
                    {existingQuestion ? 'Edit Question' : 'Add New Question'}
                </h2>

                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question..."
                    rows={4}
                    className={`${inputClass} mb-4 resize-none`}
                />

                <div className="flex flex-col gap-2.5 mb-5">
                    {[
                        { label: 'Dirty (18+)', checked: dirty, onChange: () => setDirty(!dirty) },
                        { label: 'Challenge (physical dare)', checked: challenge, onChange: () => setChallenge(!challenge) },
                        { label: 'All Players (bonus round)', checked: allPlayers, onChange: () => setAllPlayers(!allPlayers) },
                        {
                            label: 'Needs opposite-gender partner (single players only)',
                            checked: needOppositeGender,
                            onChange: () => setNeedOppositeGender(!needOppositeGender),
                        },
                    ].map((item) => (
                        <label key={item.label} className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={item.onChange}
                                className="w-4 h-4 accent-[#00E676] cursor-pointer"
                            />
                            {item.label}
                        </label>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div>
                        <label className="block text-xs font-semibold text-white/50 mb-1.5">Punishment (sips)</label>
                        <input
                            type="number"
                            value={punishment}
                            onChange={(e) => setPunishment(Number(e.target.value))}
                            className={inputClass}
                            min={1}
                            max={3}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-white/50 mb-1.5">Difficulty</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(Number(e.target.value))}
                            className={inputClass}
                        >
                            <option value={1}>1 - Icebreaker</option>
                            <option value={2}>2 - Personal</option>
                            <option value={3}>3 - Bold</option>
                            <option value={4}>4 - Extreme</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !question.trim()}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
