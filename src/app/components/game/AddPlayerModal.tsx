'use client';

import { Drink, Gender, Player } from '@/app/types/player';
import { v4 as uuid } from 'uuid';
import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Switch from '../ui/Switch';
import { useGame } from '@/app/providers/GameContext';

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
    const { gameState } = useGame();
    let [duplicateName, setDuplicateName] = useState<boolean>(false);

    const handleSubmit = () => {
        if (name.trim()) {
            onAdd({ id: uuid(), name: name.trim(), gender, drink, single });
            setName('');
            setGender(Gender.Male);
            onClose();
        }
    };

    useEffect(() => {
        if (!gameState) return;
        setDuplicateName(!!gameState?.players?.find(p => p.playerInfo.name === name))
    }, [duplicateName, gameState, name]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Add a Player</h2>

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

                    {/* Gender select */}
                    <div className="relative w-full">
                        <label className="block mb-2 text-white">Gender</label>
                        <select
                            className="w-full px-4 py-2 pr-10 rounded-lg bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors cursor-pointer appearance-none"
                            value={gender}
                            onChange={(e) => setGender(e.target.value as Gender)}
                        >
                            <option value={Gender.Male}>Male</option>
                            <option value={Gender.Female}>Female</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center -bottom-8">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* Drink select */}
                    <div className="relative w-full">
                        <label className="block mb-2 text-white">What are you drinking?</label>
                        <select
                            className="w-full px-4 py-2 pr-10 rounded-lg bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors cursor-pointer appearance-none"
                            value={drink}
                            onChange={(e) => setDrink(e.target.value as Drink)}
                        >
                            <option className='cursor-pointer' value={Drink.Beer}>Beer</option>
                            <option className='cursor-pointer' value={Drink.Wine}>Wine</option>
                            <option className='cursor-pointer' value={Drink.Strong}>Whiskey, Vodka, or other Strong Drinks</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center -bottom-8">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
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
                        disabled={!name.trim() || duplicateName}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200  cursor-pointer"
                    >
                        Add
                    </button>
                </div>
            </div>
        </Modal>
    );
}