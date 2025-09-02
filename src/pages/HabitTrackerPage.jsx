import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TABS = ["Morning", "Day", "Evening"];

export default function HabitTrackerPage() {
    const [currentTab, setCurrentTab] = useState(0);
    const [habits, setHabits] = useState([]);
    const [selectedHabit, setSelectedHabit] = useState(null);

    useEffect(() => {
        // Fetch habits for the current tab from supabase
        async function fetchHabits() {
            const { data, error } = await supabase
                .from("habits")
                .select()
                .eq("time_of_day", TABS[currentTab]);
            if (error) {
                console.error(error);
                setHabits([]);
                return;
            }
            setHabits(data);
        }
        fetchHabits();
        setSelectedHabit(null);
    }, [currentTab]);



    // Helper to get tab index with wrap-around
    const getTabIdx = (offset) => (currentTab + offset + TABS.length) % TABS.length;

    return (
        <div className="w-screen min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center p-4">
            {/* Floating/Rotating Carousel Tabs */}
            <div className="relative flex items-center justify-center w-full max-w-md my-12 h-24 select-none">
                <button
                    onClick={() => setCurrentTab(getTabIdx(-1))}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-100 rounded-full z-20"
                >
                    <FaChevronLeft />
                </button>
                {/* Floating tabs */}
                <div className="relative w-full flex items-center justify-center h-24">
                    {/* Previous tab (faded, left, floating) */}
                    <span
                        className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-blue-400 opacity-50 pointer-events-none transition-all duration-300"
                        style={{ zIndex: 5 }}
                    >
                        {TABS[getTabIdx(-1)]}
                    </span>
                    {/* Current tab (center, floating, prominent) */}
                    <span
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-blue-700 bg-white/80 px-8 py-2 rounded-lg shadow-lg opacity-100 transition-all duration-300 z-10"
                        style={{ filter: 'drop-shadow(0 2px 8px rgba(59,130,246,0.15))' }}
                    >
                        {TABS[currentTab]}
                    </span>
                    {/* Next tab (faded, right, floating) */}
                    <span
                        className="absolute left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-blue-400 opacity-50 pointer-events-none transition-all duration-300"
                        style={{ zIndex: 5 }}
                    >
                        {TABS[getTabIdx(1)]}
                    </span>
                </div>
                <button
                    onClick={() => setCurrentTab(getTabIdx(1))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-100 rounded-full z-20"
                >
                    <FaChevronRight />
                </button>
            </div>

            {/* Habits List */}
            <div className="w-full max-w-2xl">
                <ul className="space-y-3">
                    {habits.map((habit) => (
                        <li key={habit.id}>
                            <button
                                className="w-full flex items-center justify-between bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition text-left cursor-pointer"
                                onClick={() => setSelectedHabit(habit.id === selectedHabit ? null : habit.id)}
                                type="button"
                            >
                                <span className="text-lg text-gray-800">{habit.name}</span>
                            </button>
                            {selectedHabit === habit.id && (
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-2 rounded">
                                    <p className="text-gray-700">{habit.description || "No description provided."}</p>
                                </div>
                            )}
                        </li>
                    ))}
                    {habits.length === 0 && (
                        <li>
                            <div className="bg-white rounded-lg shadow p-4 text-gray-500 text-center">No habits for this time of day.</div>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}