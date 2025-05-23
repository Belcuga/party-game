'use client';

import { Drink, Gender, Player } from '@/app/types/player';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import Modal from '../ui/Modal';
import Switch from '../ui/Switch';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (player: Player) => void;
}

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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Add Player</h2>

                <div className="space-y-6">
                    {/* Name input */}
                    <div>
                        <label className="block mb-2 text-white">Name</label>
                        <input
                            type="text"
                            maxLength={20}
                            className="w-full px-4 py-2 rounded-lg bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors"
                            placeholder="Enter player name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Gender select */}
                    <div>
                        <label className="block mb-2 text-white">Gender</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors cursor-pointer"
                            value={gender}
                            onChange={(e) => setGender(e.target.value as Gender)}
                        >
                            <option className='cursor-pointer' value={Gender.Male}>Male</option>
                            <option className='cursor-pointer' value={Gender.Female}>Female</option>
                        </select>
                    </div>

                    {/* Drink select */}
                    <div>
                        <label className="block mb-2 text-white">What are you drinking?</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors cursor-pointer"
                            value={drink}
                            onChange={(e) => setDrink(e.target.value as Drink)}
                        >
                            <option className='cursor-pointer' value={Drink.Beer}>Beer</option>
                            <option className='cursor-pointer' value={Drink.Wine}>Wine</option>
                            <option className='cursor-pointer' value={Drink.Strong}>Whiskey, Vodka, or other Strong Drinks</option>
                            <option className='cursor-pointer' value={Drink.None}>Nothing</option>
                        </select>
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
                        disabled={!name.trim()}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200  cursor-pointer"
                    >
                        Add
                    </button>
                </div>
            </div>
        </Modal>
    );
}