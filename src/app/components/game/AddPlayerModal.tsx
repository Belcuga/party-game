'use client';

import { Drink, Gender, Player } from '@/app/types/player';
import { v4 as uuid } from 'uuid';
import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Switch from '../ui/Switch';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (player: Player) => void;
    /** Existing player names to guard against duplicates (excluding the player being edited). */
    existingNames: string[];
    /** When set, the modal edits this player instead of creating a new one. */
    editingPlayer?: Player | null;
}

export default function AddPlayerModal({ isOpen, onClose, onSubmit, existingNames, editingPlayer }: Props) {
    const isEditing = !!editingPlayer;

    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.Male);
    const [drink, setDrink] = useState<Drink>(Drink.Beer);
    const [single, setSingle] = useState<boolean>(true);

    useEffect(() => {
        if (!isOpen) return;
        if (editingPlayer) {
            setName(editingPlayer.name);
            setGender(editingPlayer.gender === Gender.None ? Gender.Male : editingPlayer.gender);
            setDrink(editingPlayer.drink === Drink.None ? Drink.Beer : editingPlayer.drink);
            setSingle(editingPlayer.single ?? true);
        } else {
            setName('');
            setGender(Gender.Male);
            setDrink(Drink.Beer);
            setSingle(true);
        }
    }, [isOpen, editingPlayer]);

    const trimmedName = name.trim();
    const duplicateName = existingNames.some(
        (n) => n.toLowerCase() === trimmedName.toLowerCase() && n.toLowerCase() !== editingPlayer?.name.toLowerCase()
    );

    const handleSubmit = () => {
        if (!trimmedName || duplicateName) return;
        onSubmit({ id: editingPlayer?.id ?? uuid(), name: trimmedName, gender, drink, single });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">{isEditing ? 'Edit Player' : 'Add a Player'}</h2>

                <div className="space-y-6">
                    {/* Name input */}
                    <div className="relative w-full -mb-0">
                        <label className="block mb-2 text-white">Name</label>
                        <input
                            type="text"
                            maxLength={20}
                            className="w-full px-4 py-2 rounded-lg bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors"
                            placeholder="Enter the player's name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <div className="h-5 relative">
                            <p className={`absolute text-red-500 transition-opacity ${duplicateName ? 'opacity-100' : 'opacity-0'}`}>
                                Name already taken.
                            </p>
                        </div>
                    </div>

                    {/* Gender picker */}
                    <div className="w-full">
                        <label className="block mb-2 text-white">Gender</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setGender(Gender.Male)}
                                className={`flex-1 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-all ${gender === Gender.Male
                                        ? 'bg-gradient-to-r from-[#00E676] to-[#2196F3] text-white'
                                        : 'bg-[#3b1b5e] text-white/70 hover:text-white'
                                    }`}
                            >
                                Male
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender(Gender.Female)}
                                className={`flex-1 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-all ${gender === Gender.Female
                                        ? 'bg-gradient-to-r from-[#00E676] to-[#2196F3] text-white'
                                        : 'bg-[#3b1b5e] text-white/70 hover:text-white'
                                    }`}
                            >
                                Female
                            </button>
                        </div>
                    </div>

                    {/* Drink picker */}
                    <div className="w-full">
                        <label className="block mb-2 text-white">What are you drinking?</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setDrink(Drink.Beer)}
                                className={`flex-1 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-all ${drink === Drink.Beer
                                        ? 'bg-gradient-to-r from-[#00E676] to-[#2196F3] text-white'
                                        : 'bg-[#3b1b5e] text-white/70 hover:text-white'
                                    }`}
                            >
                                Beer
                            </button>
                            <button
                                type="button"
                                onClick={() => setDrink(Drink.Wine)}
                                className={`flex-1 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-all ${drink === Drink.Wine
                                        ? 'bg-gradient-to-r from-[#00E676] to-[#2196F3] text-white'
                                        : 'bg-[#3b1b5e] text-white/70 hover:text-white'
                                    }`}
                            >
                                Wine
                            </button>
                            <button
                                type="button"
                                onClick={() => setDrink(Drink.Strong)}
                                className={`flex-1 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-all ${drink === Drink.Strong
                                        ? 'bg-gradient-to-r from-[#00E676] to-[#2196F3] text-white'
                                        : 'bg-[#3b1b5e] text-white/70 hover:text-white'
                                    }`}
                            >
                                Strong
                            </button>
                        </div>
                    </div>

                    {/* Single status */}
                    <div>
                        <label className="block mb-3 text-white">Are you single?</label>
                        <div className="space-y-3">
                            <Switch
                                type="radio"
                                checked={single}
                                onChange={() => setSingle(true)}
                                label="Yes - You will get spicy challenges with other players"
                                size="large"
                            />
                            <Switch
                                type="radio"
                                checked={!single}
                                onChange={() => setSingle(false)}
                                label="No - You will not get spicy challenges with other players"
                                size="large"
                            />
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!trimmedName || duplicateName}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200  cursor-pointer"
                    >
                        {isEditing ? 'Save' : 'Add'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
