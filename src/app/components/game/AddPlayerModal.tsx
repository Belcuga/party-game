'use client';

import { Drink, Gender, Player } from '@/app/types/player';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (player: Player) => void;
};

export default function AddPlayerModal({ isOpen, onClose, onAdd }: Props) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.None);
    const [drink, setDrink] = useState<Drink>(Drink.None);
    const [single, setSingle] = useState<boolean>(false);

    const handleSubmit = () => {
        if (name.trim()) {
            onAdd({ id: uuid(), name: name.trim(), gender, drink, single, skipCount: 1 });
            setName('');
            setGender(Gender.None);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-blue-800 rounded-lg p-6 w-full max-w-sm text-white">
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
                        <option className="text-black" value={Gender.Female}>Female</option>
                        <option className="text-black" value={Gender.Male}>Male</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block mb-1 font-medium">What are you drinking?</label>
                    <select
                        className="w-full px-4 py-2 rounded border"
                        value={drink}
                        onChange={(e) => setDrink(e.target.value as Drink)}
                    >
                        <option className="text-black" value={Drink.Beer}>Beer</option>
                        <option className="text-black" value={Drink.Wine}>Wine</option>
                        <option className="text-black" value={Drink.Strong}>Strong drink</option>
                        <option className="text-black" value={Drink.None}>Nothing</option>
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block mb-1 font-medium">Are you single?</label>
                    <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-900 dark:focus:ring-blue-900 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                checked={single}
                                onChange={() => setSingle(true)}
                            />
                            Yes
                    </label>
                    <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-900 dark:focus:ring-blue-900 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                checked={!single}
                                onChange={() => setSingle(false)}
                            />
                            No
                    </label>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-400 rounded hover:bg-gray-400"
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