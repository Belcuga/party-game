'use client';

import { Gender, Player } from '@/app/types/player';
import { useState } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (player: Player) => void;
};

export default function AddPlayerModal({ isOpen, onClose, onAdd }: Props) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.None);

    const handleSubmit = () => {
        if (name.trim()) {
            onAdd({ name: name.trim(), gender });
            setName('');
            setGender(Gender.None);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm text-black">
                <h2 className="text-xl font-bold mb-4">Add Player</h2>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded border"
                        placeholder="Enter player name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-1 font-medium">Gender</label>
                    <select
                        className="w-full px-4 py-2 rounded border"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                    >
                        <option value={Gender.Female}>Female 🚺</option>
                        <option value={Gender.Male}>Male 🚹</option>
                    </select>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
