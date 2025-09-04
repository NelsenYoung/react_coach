import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";
import TimePicker  from "../components/TimePicker";
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';

const TABS = ["Morning", "Day", "Evening"];

export default function HabitTrackerPage() {
    const [goals, setGoals] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [habits, setHabits] = useState([]);
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [tempHabit, setTempHabit] = useState("");
    const [creatingHabit, setCreatingHabit] = useState(false);
    const [habitTime, setHabitTime] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [updatingHabit, setUpdatingHabit] = useState(false);

    useEffect(() => {
        fetchHabits();
        fetchGoals();
        setSelectedHabit(null);
    }, [currentTab]);

    function sortHabitsByTime(habits) {
        return [...habits].sort((a, b) => a.time.localeCompare(b.time));
    }

    async function callOllama(){
        try{
            for(let i = 0; i < habits.length; i++){
                let habit = habits[i];
                if(goals.length == 0){
                    break;
                }
                // THIS IS TEMPORARY AND MUST BE CHANGED IN THE FUTURE
                let goal = goals[0];
                // Using fetch to get the LLM response
                const response = await fetch("http://localhost:11434/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "llama3.2",
                        prompt: `Give me a grade (either a +, an = for neutral, or a -) and a brief explanation for this question: Does this habit: ${habit.text} contribute to my goal of: ${goal.text}? The grade should be the first char in the response. 
                                Remember, the starting character must be a +, =, or -. If the habit aligns with goal give it a +, if it has not impact or is not directly related, give it a =, if it directly goes agaisnt the goal give it a -`,
                        stream: true,
                    }),
                });

                setSelectedHabit(habit.id);
                console.log("Did it get here");

                // Read the response from the LLM (This is needed for streaming the response)
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let done = false;
                let messageContent = "";
                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;
                    
                    const chunkContent = decoder.decode(value, { stream: true });
                    for (const line of chunkContent.split("\n")) {
                        if (!line.trim()) continue;
                        try {
                            const json = JSON.parse(line);
                            if (json.response) {
                                messageContent += json.response;

                                // Update habit state live
                                setHabits(prev =>
                                    prev.map(h => {
                                        if (h.id === habit.id) {
                                            return {
                                                ...h,
                                                grade: messageContent[0],
                                                grade_explanation: messageContent,
                                            };
                                        }
                                        return h;
                                    })
                                );
                            }
                        } catch (err) {
                            console.error("JSON parse error:", err, line);
                        }
                    }
                }
                addHabitGrade(messageContent, habit.id);
            }
        }catch(error){
            console.log(error);
        }
    }

    async function addHabitGrade(explanation, id){
        const {data, error } = await supabase.from("habits").update({grade: explanation[0], grade_explanation: explanation}).select().eq("id", id);
        if(error){
            console.error(error);
            return
        }
        setHabits(habits.map(h => {
            if(h.id === id){
                return data[0];
            }else{
                return h;
            }
        }));
    }

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
        setHabits(sortHabitsByTime(data));
    }

    async function fetchGoals() {
        const { data, error } = await supabase.from("goals").select();
        if(error){
            console.error(error);
            setGoals([]);
            return;
        }
        setGoals(data);
        console.log(data);
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

            <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                onClick={() => callOllama()}
            >
                Grade Habits
            </button>     

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
                                {habit.grade && (
                                    <div
                                        className={`ml-2 mr-2 w-8 h-8 flex items-center justify-center text-xs rounded font-bold border 
                                            ${habit.grade === '+' ? 'bg-green-100 border-green-300 text-green-700' : ''}
                                            ${habit.grade === '=' ? 'bg-gray-100 border-gray-300 text-gray-700' : ''}
                                            ${habit.grade === '-' ? 'bg-red-100 border-red-300 text-red-700' : ''}
                                        `}
                                    >
                                        {habit.grade}
                                    </div>
                                )}
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
                                    <p className="text-gray-700">{habit.grade_explanation || "No description provided."}</p>
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