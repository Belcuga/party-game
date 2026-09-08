'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { BondingQuestion } from '@/app/types/bondingQuestion';
import Modal from '@/app/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingQuestion?: BondingQuestion;
};

const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors';

export default function AddBondingQuestionModal({ isOpen, onClose, onSuccess, existingQuestion }: Props) {
    const [text, setText] = useState(existingQuestion?.text || '');
    const [dirty, setDirty] = useState(existingQuestion?.dirty || false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existingQuestion) {
            setText(existingQuestion.text);
            setDirty(existingQuestion.dirty);
        } else {
            setText('');
            setDirty(false);
        }
    }, [existingQuestion]);

    const handleSave = async () => {
        if (!text.trim()) return;

        setSaving(true);

        let error;

        if (existingQuestion) {
            const { error: updateError } = await supabase
                .from('bonding_questions')
                .update({ text: text.trim(), dirty })
                .eq('id', existingQuestion.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('bonding_questions').insert([
                {
                    text: text.trim(),
                    dirty,
                    like_count: 0,
                    dislike_count: 0,
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
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. {player}, what's the happiest memory from your childhood?"
                    rows={3}
                    className={`${inputClass} mb-2 resize-none`}
                />
                <p className="text-xs text-white/40 mb-6">
                    Use <span className="font-mono">{'{player}'}</span> for whoever is answering, and{' '}
                    <span className="font-mono">{'{other}'}</span> only if the question should reference a random third player.
                </p>

                <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer mb-6">
                    <input
                        type="checkbox"
                        checked={dirty}
                        onChange={() => setDirty(!dirty)}
                        className="w-4 h-4 accent-[#818cf8] cursor-pointer"
                    />
                    Dirty (18+)
                </label>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !text.trim()}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
