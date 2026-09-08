'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/SupabaseClient';
import { RouletteEffect } from '@/app/types/rouletteEffect';
import Modal from '@/app/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingEffect?: RouletteEffect;
};

const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors';

export default function AddRouletteEffectModal({ isOpen, onClose, onSuccess, existingEffect }: Props) {
    const [label, setLabel] = useState(existingEffect?.label || '');
    const [description, setDescription] = useState(existingEffect?.description || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (existingEffect) {
            setLabel(existingEffect.label);
            setDescription(existingEffect.description);
        } else {
            setLabel('');
            setDescription('');
        }
    }, [existingEffect]);

    const handleSave = async () => {
        if (!label.trim() || !description.trim()) return;

        setSaving(true);

        let error;

        if (existingEffect) {
            const { error: updateError } = await supabase
                .from('roulette_effects')
                .update({ label: label.trim(), description: description.trim() })
                .eq('id', existingEffect.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('roulette_effects').insert([
                { label: label.trim(), description: description.trim() },
            ]);
            error = insertError;
        }

        setSaving(false);

        if (error) {
            console.error('Error saving roulette effect:', error.message);
        } else {
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8">
                <h2 className="text-xl font-bold mb-6 text-white text-center">
                    {existingEffect ? 'Edit Roulette Rule' : 'Add New Roulette Rule'}
                </h2>

                <div className="mb-4">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Label (shown while spinning)</label>
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder='e.g. Say "banana" first'
                        className={inputClass}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">
                        Full instruction - use {'{player}'} for the winner&apos;s name
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. {player} must say “banana” before every sentence until their next turn. Forget? Take a sip."
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
                        disabled={saving || !label.trim() || !description.trim()}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
