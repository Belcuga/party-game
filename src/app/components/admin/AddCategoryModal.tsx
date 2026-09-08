'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { CategoryPrompt } from '@/app/types/categoryPrompt';
import Modal from '@/app/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingPrompt?: CategoryPrompt;
};

const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors';

export default function AddCategoryModal({ isOpen, onClose, onSuccess, existingPrompt }: Props) {
    const [text, setText] = useState(existingPrompt?.text || '');
    const [count, setCount] = useState(existingPrompt?.count || 5);
    const [dirty, setDirty] = useState(existingPrompt?.dirty || false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existingPrompt) {
            setText(existingPrompt.text);
            setCount(existingPrompt.count);
            setDirty(existingPrompt.dirty);
        } else {
            setText('');
            setCount(5);
            setDirty(false);
        }
    }, [existingPrompt]);

    const handleSave = async () => {
        if (!text.trim() || count < 1) return;

        setSaving(true);

        let error;

        if (existingPrompt) {
            const { error: updateError } = await supabase
                .from('category_prompts')
                .update({ text: text.trim(), count, dirty })
                .eq('id', existingPrompt.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('category_prompts').insert([
                {
                    text: text.trim(),
                    count,
                    dirty,
                    like_count: 0,
                    dislike_count: 0,
                },
            ]);
            error = insertError;
        }

        setSaving(false);

        if (error) {
            console.error('Error saving category:', error.message);
        } else {
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8">
                <h2 className="text-xl font-bold mb-6 text-white text-center">
                    {existingPrompt ? 'Edit Category' : 'Add New Category'}
                </h2>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. Name 8 football clubs from England."
                    rows={3}
                    className={`${inputClass} mb-4 resize-none`}
                />

                <div className="mb-5">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">How many items? (5-10)</label>
                    <input
                        type="number"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className={inputClass}
                        min={2}
                        max={15}
                    />
                </div>

                <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer mb-6">
                    <input
                        type="checkbox"
                        checked={dirty}
                        onChange={() => setDirty(!dirty)}
                        className="w-4 h-4 accent-[#2dd4bf] cursor-pointer"
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
                        disabled={saving || !text.trim() || count < 1}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
