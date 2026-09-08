'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { TruthDarePrompt } from '@/app/types/truthDarePrompt';
import Modal from '@/app/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingPrompt?: TruthDarePrompt;
};

const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors';

export default function AddTruthDareModal({ isOpen, onClose, onSuccess, existingPrompt }: Props) {
    const [type, setType] = useState<'truth' | 'dare'>(existingPrompt?.type || 'truth');
    const [text, setText] = useState(existingPrompt?.text || '');
    const [dirty, setDirty] = useState(existingPrompt?.dirty || false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existingPrompt) {
            setType(existingPrompt.type);
            setText(existingPrompt.text);
            setDirty(existingPrompt.dirty);
        } else {
            setType('truth');
            setText('');
            setDirty(false);
        }
    }, [existingPrompt]);

    const handleSave = async () => {
        if (!text.trim()) return;

        setSaving(true);

        let error;

        if (existingPrompt) {
            const { error: updateError } = await supabase
                .from('truth_dare_prompts')
                .update({ type, text: text.trim(), dirty })
                .eq('id', existingPrompt.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('truth_dare_prompts').insert([
                {
                    type,
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
            console.error('Error saving prompt:', error.message);
        } else {
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8">
                <h2 className="text-xl font-bold mb-6 text-white text-center">
                    {existingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
                </h2>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setType('truth')}
                        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors cursor-pointer ${
                            type === 'truth'
                                ? 'bg-[#2196F3]/20 border-[#2196F3] text-[#7ec4fb]'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                    >
                        Truth
                    </button>
                    <button
                        onClick={() => setType('dare')}
                        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors cursor-pointer ${
                            type === 'dare'
                                ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                    >
                        Dare
                    </button>
                </div>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={type === 'truth' ? "e.g. What's your biggest fear?" : 'e.g. Do 10 pushups right now.'}
                    rows={4}
                    className={`${inputClass} mb-5 resize-none`}
                />

                <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer mb-6">
                    <input
                        type="checkbox"
                        checked={dirty}
                        onChange={() => setDirty(!dirty)}
                        className="w-4 h-4 accent-[#ffb703] cursor-pointer"
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
