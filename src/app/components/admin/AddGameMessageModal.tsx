'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { GameMessage, GameMessageCategory } from '@/app/types/gameMessage';
import Modal from '@/app/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingMessage?: GameMessage;
    defaultCategory?: GameMessageCategory;
};

const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors';

export const CATEGORY_OPTIONS: { value: GameMessageCategory; label: string; placeholders: string }[] = [
    { value: 'milestone_five', label: 'Sip Milestone - 5', placeholders: '{name}, {count}' },
    { value: 'milestone_ten', label: 'Sip Milestone - 10', placeholders: '{name}, {count}' },
    { value: 'milestone_legend', label: 'Sip Milestone - 15+', placeholders: '{name}, {count}' },
    { value: 'difficulty_up', label: 'Classic: Difficulty Up', placeholders: '{level}' },
    { value: 'heat_confirm', label: 'Classic: Turn Up The Heat Confirm', placeholders: 'none' },
    { value: 'stat_top_drinker', label: 'Classic: Top Drinker', placeholders: '{name}, {count}' },
    { value: 'stat_top_answerer', label: 'Classic: Top Answerer', placeholders: '{name}, {count}' },
    { value: 'stat_heavy_drinker', label: 'Classic: Heavy Drinker', placeholders: '{name}, {count}' },
    { value: 'stat_heavy_answerer', label: 'Classic: Heavy Answerer', placeholders: '{name}, {count}' },
];

export default function AddGameMessageModal({ isOpen, onClose, onSuccess, existingMessage, defaultCategory }: Props) {
    const [category, setCategory] = useState<GameMessageCategory>(existingMessage?.category || defaultCategory || 'milestone_five');
    const [text, setText] = useState(existingMessage?.text || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existingMessage) {
            setCategory(existingMessage.category);
            setText(existingMessage.text);
        } else {
            setCategory(defaultCategory || 'milestone_five');
            setText('');
        }
    }, [existingMessage, defaultCategory, isOpen]);

    const activeOption = CATEGORY_OPTIONS.find((o) => o.value === category);

    const handleSave = async () => {
        if (!text.trim()) return;

        setSaving(true);

        let error;

        if (existingMessage) {
            const { error: updateError } = await supabase
                .from('game_messages')
                .update({ category, text: text.trim() })
                .eq('id', existingMessage.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('game_messages').insert([
                { category, text: text.trim() },
            ]);
            error = insertError;
        }

        setSaving(false);

        if (error) {
            console.error('Error saving message:', error.message);
        } else {
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8">
                <h2 className="text-xl font-bold mb-6 text-white text-center">
                    {existingMessage ? 'Edit Message' : 'Add New Message'}
                </h2>

                <div className="mb-4">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as GameMessageCategory)}
                        className={inputClass}
                    >
                        {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">
                        Message - placeholders: {activeOption?.placeholders}
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g. {name} just hit {count} sips - the night is heating up."
                        rows={4}
                        className={`${inputClass} resize-none`}
                    />
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
