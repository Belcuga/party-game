'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { MostLikelyStatement } from '@/app/types/mostLikelyStatement';
import Modal from '@/app/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingStatement?: MostLikelyStatement;
};

const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors';

export default function AddMostLikelyModal({ isOpen, onClose, onSuccess, existingStatement }: Props) {
    const [statement, setStatement] = useState(existingStatement?.statement || '');
    const [dirty, setDirty] = useState(existingStatement?.dirty || false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existingStatement) {
            setStatement(existingStatement.statement);
            setDirty(existingStatement.dirty);
        } else {
            setStatement('');
            setDirty(false);
        }
    }, [existingStatement]);

    const handleSave = async () => {
        if (!statement.trim()) return;

        setSaving(true);

        let error;

        if (existingStatement) {
            const { error: updateError } = await supabase
                .from('most_likely_statements')
                .update({ statement: statement.trim(), dirty })
                .eq('id', existingStatement.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('most_likely_statements').insert([
                {
                    statement: statement.trim(),
                    dirty,
                    like_count: 0,
                    dislike_count: 0,
                },
            ]);
            error = insertError;
        }

        setSaving(false);

        if (error) {
            console.error('Error saving statement:', error.message);
        } else {
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8">
                <h2 className="text-xl font-bold mb-1 text-white text-center">
                    {existingStatement ? 'Edit Statement' : 'Add New Statement'}
                </h2>
                <p className="text-xs text-white/40 mb-5 text-center">&quot;Most likely to...&quot;</p>

                <textarea
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="e.g. become famous"
                    rows={4}
                    className={`${inputClass} mb-5 resize-none`}
                />

                <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer mb-6">
                    <input
                        type="checkbox"
                        checked={dirty}
                        onChange={() => setDirty(!dirty)}
                        className="w-4 h-4 accent-[#9156f3] cursor-pointer"
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
                        disabled={saving || !statement.trim()}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
