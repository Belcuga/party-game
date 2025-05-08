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
    const [gender, setGender] = useState<Gender>(Gender.Male);
    const [drink, setDrink] = useState<Drink>(Drink.Beer);
    const [single, setSingle] = useState<boolean>(true);

    const handleSubmit = () => {
        if (name.trim()) {
            onAdd({ id: uuid(), name: name.trim(), gender, drink, single });
            setName('');
            setGender(Gender.Male);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-blue-800 rounded-lg p-6 w-full max-w-sm text-white">
                <h2 className="text-xl font-bold mb-4">Add Player</h2>

                {/* name part */}
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                        type="text"
                        maxLength={20}
                        className="w-full px-4 py-2 rounded border"
                        placeholder="Enter player name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* gender part */}
                <div className="mb-6">
                    <label className="block mb-1 font-medium">Gender</label>
                    <select
                        className="w-full px-4 py-2 rounded border"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                    >
                        <option className="text-black" value={Gender.Male}>Male</option>
                        <option className="text-black" value={Gender.Female}>Female</option>
                    </select>
                </div>

                {/* drink part */}
                <div className="mb-6">
                    <label className="block mb-1 font-medium">What are you drinking?</label>
                    <select
                        className="w-full px-4 py-2 rounded border"
                        value={drink}
                        onChange={(e) => setDrink(e.target.value as Drink)}
                    >
                        <option className="text-black" value={Drink.Beer}>Beer</option>
                        <option className="text-black" value={Drink.Wine}>Wine</option>
                        <option className="text-black" value={Drink.Strong}>Whiskey, Vodka, or other Strong Drinks</option>
                        <option className="text-black" value={Drink.None}>Nothing</option>
                    </select>
                </div>

                {/* single part */}
                <div className="mb-6">
                    <label className="block mb-1 font-medium">Are you single?</label>

                    <div className="flex items-center gap-2 mt-2 group">
                        <input
                            id="singleYes"
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
                            checked={single}
                            onChange={() => setSingle(true)}
                        />
                        <span className="relative">
                            Yes - You will get spicy challenges with other players
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 group">
                        <input
                            id="singleNo"
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
                            checked={!single}
                            onChange={() => setSingle(false)}
                        />
                        <span className="relative">
                            No - You will not get spicy challenges with other players
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-400 rounded hover:bg-red-600 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`px-4 py-2 rounded ${name ? 'bg-green-500 cursor-pointer hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                            } ${!name ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}