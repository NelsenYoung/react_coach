import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";
import TimePicker  from "../components/TimePicker";
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';

const TABS = ["Morning", "Day", "Evening"];

export default function HabitTrackerPage() {
    const [currentTab, setCurrentTab] = useState(0);
    const [habits, setHabits] = useState([]);
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [tempHabit, setTempHabit] = useState("");
    const [creatingHabit, setCreatingHabit] = useState(false);
    const [habitTime, setHabitTime] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [updatingHabit, setUpdatingHabit] = useState(false);

    useEffect(() => {
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

    function sortHabitsByTime(habits) {
        return [...habits].sort((a, b) => a.time.localeCompare(b.time));
    }

    async function addHabit() {
        if (!tempHabit) return;
        const newEntry = { text: tempHabit, time_of_day: TABS[currentTab], time: habitTime };
        const { data, error } = await supabase.from("habits").insert([newEntry]).select();
        if (error) {
            console.error(error);
            return;
        }
        setHabits(prevHabits => [...prevHabits, ...data]);
        setTempHabit("");
        setHabitTime("");
        setCreatingHabit(false);
        setHabits(prev =>
            sortHabitsByTime(
                prev.map(h => (h.id === data.id ? data : h))
            )
        );
    }

    async function deleteHabit(id) {
        const { error } = await supabase.from("habits").delete().eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    }

    async function editHabit(){
        console.log(updatingId);
        const { data, error } = await supabase.from("habits").update({text: tempHabit, time: habitTime}).select().eq('id', updatingId);

        if(error) {
            console.error(error);
        }
        setHabits(habits.map(h => {
            if(h.id === updatingId){
                return data[0];
            }else{
                return h;
            }
        }));
        setUpdatingHabit(false);
        setHabits(prev =>
            sortHabitsByTime(
                prev.map(h => (h.id === updatingId ? data[0] : h))
            )
        );
    }

    const change = event => {
        setTempHabit(event.target.value);
    }

    const buttonChange = event => {
        if (creatingHabit) {
            setCreatingHabit(false);
        } else {
            setCreatingHabit(true);
        }
    }

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
                            <div className="w-full flex items-center justify-between bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition">
                                {/* Habit with Text, time and edit/delete buttons */}
                                <span
                                    className="flex-1 text-lg text-gray-800 cursor-pointer text-left"
                                    onClick={() => setSelectedHabit(habit.id === selectedHabit ? null : habit.id)}
                                >
                                    {habit.text}
                                    {habit.time && (
                                        <span className="ml-2 px-2 py-1 text-sm text-blue-600 bg-blue-100 rounded">
                                            {habit.time}
                                        </span>
                                    )}
                                </span>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        setUpdatingId(habit.id);
                                        setUpdatingHabit(true);
                                        setTempHabit(habit.text);
                                        setHabitTime(habit.time);
                                    }}
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); deleteHabit(habit.id); }}
                                    className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                                    aria-label="Delete habit"
                                    type="button"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            {/* Extra Information about habit tab, activated when user clicks on habit card */}
                            {selectedHabit === habit.id && (
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-2 rounded">
                                    <p className="text-gray-700">{habit.description || "No description provided."}</p>
                                </div>
                            )}
                            {/* Edit Habit Tab */}
                            {updatingId == habit.id && updatingHabit && (
                                <form
                                    onSubmit={e => {
                                        e.preventDefault();
                                        editHabit();
                                    }}
                                    className="flex items-center gap-2 bg-white rounded shadow border border-blue-200 px-2 py-1 w-full"
                                    style={{ display: 'inline-flex' }}
                                >
                                    <input 
                                        name="myInput" 
                                        type="text"
                                        value={tempHabit}
                                        onChange={change}
                                        className="flex-1 text-lg px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                                        placeholder="Edit habit text..."
                                    />
                                    <TimePicker value={habitTime} onChange={setHabitTime} />
                                    <button
                                        onClick={() => setUpdatingHabit(false)}
                                        type="button"
                                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
                                    >
                                        Save
                                    </button>
                                </form>
                            )}
                        </li>
                    ))}
                    {habits.length === 0 && (
                        <li>
                            <div className="bg-white rounded-lg shadow p-4 text-gray-500 text-center">No habits for this time of day.</div>
                        </li>
                    )}
                </ul>
                <button
                    onClick={buttonChange}
                    className="my-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                >
                    {creatingHabit ? "Cancel" : "Add Habit"}
                </button>

                {creatingHabit && (
                    <form
                        className="w-full flex gap-2 px-2"
                        onSubmit={e => {
                            e.preventDefault();
                            addHabit();
                        }}
                    >
                        <input
                            type="text"
                            value={tempHabit}
                            onChange={change}
                            placeholder="Enter a Habit"
                            autoFocus
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                        />
                        <div className="flex flex-col justify-center items-center px-2">
                            <TimePicker value={habitTime} onChange={setHabitTime} />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                        >
                            Add
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}